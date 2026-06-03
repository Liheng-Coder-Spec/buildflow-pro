// E-Leave atomic action engine
// Actions: submit | approve | reject | withdraw | request_cancel | approve_cancel | deny_cancel
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

function admin() {
  return createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
}

async function getUser(req: Request) {
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");
  const c = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data } = await c.auth.getUser();
  return data.user;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });
}

async function notify(db: ReturnType<typeof admin>, user_id: string, type: string, title: string, body: string, request_id?: string) {
  await db.from("eleave_notifications").insert({
    user_id, type, title, body, request_id,
    expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });
}

async function adjustBalance(db: ReturnType<typeof admin>, user_id: string, leave_type_id: string, year: number, days: number) {
  const { data: bal } = await db.from("eleave_leave_balances")
    .select("*").eq("user_id", user_id).eq("leave_type_id", leave_type_id).eq("year", year).maybeSingle();
  if (!bal) {
    await db.from("eleave_leave_balances").insert({ user_id, leave_type_id, year, used: days });
    return;
  }
  await db.from("eleave_leave_balances").update({ used: Number(bal.used) + days }).eq("id", bal.id);
}

async function resolveApprovers(db: ReturnType<typeof admin>, user_id: string): Promise<string[]> {
  const { data: personal } = await db.from("eleave_approval_chains")
    .select("approver_id,level").eq("scope", "personal").eq("user_id", user_id).order("level");
  if (personal && personal.length) return personal.map((x: any) => x.approver_id);

  const { data: prof } = await db.from("profiles")
    .select("eleave_department_id,supervisor_id").eq("id", user_id).maybeSingle();
  if (prof?.eleave_department_id) {
    const { data: dept } = await db.from("eleave_approval_chains")
      .select("approver_id,level").eq("scope", "department").eq("department_id", prof.eleave_department_id).order("level");
    if (dept && dept.length) return dept.map((x: any) => x.approver_id);
  }
  const { data: comp } = await db.from("eleave_approval_chains")
    .select("approver_id,level").eq("scope", "company").order("level");
  if (comp && comp.length) return comp.map((x: any) => x.approver_id);
  if (prof?.supervisor_id) return [prof.supervisor_id];
  const { data: admins } = await db.from("user_roles").select("user_id").eq("role", "admin").limit(1);
  return admins?.map((x: any) => x.user_id) ?? [];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: "unauthorized" }, 401);
    const db = admin();
    const { action, request_id, payload } = await req.json();

    if (action === "submit") {
      const { leave_type_id, start_date, end_date, half_day, reason, attachment_url, attachment_urls, day_selections, cc_user_ids, cc_emails } = payload;
      const attUrls: string[] = Array.isArray(attachment_urls)
        ? attachment_urls.filter((s: any) => typeof s === "string" && s.length)
        : (attachment_url ? [attachment_url] : []);
      const ccUserIds: string[] = Array.isArray(cc_user_ids)
        ? Array.from(new Set(cc_user_ids.filter((s: any) => typeof s === "string" && s.length)))
        : [];
      const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      const ccEmails: string[] = Array.isArray(cc_emails)
        ? Array.from(new Set(cc_emails.map((s: any) => String(s).trim().toLowerCase()).filter((s: string) => emailRe.test(s))))
        : [];
      const start = new Date(start_date);
      const end = new Date(end_date);
      let days: number;
      let anyHalf = false;
      if (Array.isArray(day_selections) && day_selections.length) {
        days = 0;
        for (const sel of day_selections) {
          if (sel.type === "full") days += 1;
          else if (sel.type === "am" || sel.type === "pm") { days += 0.5; anyHalf = true; }
        }
        if (days <= 0) return json({ error: "Please select at least one day to take leave." });
      } else {
        days = half_day ? 0.5 : Math.max(1, Math.round((end.getTime() - start.getTime()) / 86400000) + 1);
        anyHalf = !!half_day;
      }

      const { data: lt } = await db.from("eleave_leave_types").select("*").eq("id", leave_type_id).single();
      if (!lt) return json({ error: "Invalid leave type" });

      const { data: prof } = await db.from("profiles").select("*").eq("id", user.id).single();
      if (lt.gender_restriction !== "any" && prof?.gender !== lt.gender_restriction)
        return json({ error: `This leave type is restricted to ${lt.gender_restriction} employees.` });
      if (lt.probation_required && prof?.probation_end_date && new Date(prof.probation_end_date) > new Date())
        return json({ error: "You are still on probation for this leave type." });
      if (lt.max_days_per_request && days > Number(lt.max_days_per_request))
        return json({ error: `Maximum ${lt.max_days_per_request} days per request.` });
      if (lt.advance_notice_days) {
        const noticeMs = (start.getTime() - Date.now());
        if (noticeMs < Number(lt.advance_notice_days) * 86400000)
          return json({ error: `Requires ${lt.advance_notice_days} days advance notice.` });
      }
      if (anyHalf && !lt.half_day_allowed) return json({ error: "Half-day not allowed for this leave type." });

      const { data: overlap } = await db.from("eleave_leave_requests").select("id")
        .eq("user_id", user.id).in("status", ["pending", "approved", "pending_cancellation"])
        .lte("start_date", end_date).gte("end_date", start_date);
      if (overlap && overlap.length) return json({ error: "You already have a request that overlaps these dates." });

      if (lt.deduct_from === "balance") {
        const year = start.getFullYear();
        const { data: bal } = await db.from("eleave_leave_balances").select("*").eq("user_id", user.id).eq("leave_type_id", leave_type_id).eq("year", year).maybeSingle();
        const remaining = bal ? Number(bal.carried_over) + Number(bal.yearly_allowance) + Number(bal.adjustments) - Number(bal.used) - Number(bal.expired) : Number(lt.days_per_year);
        if (days > remaining) return json({ error: `Insufficient balance. Remaining: ${remaining} days.` });
      }

      if (!lt.skip_capacity_check && prof?.eleave_department_id) {
        const { data: cap } = await db.from("eleave_team_capacity_rules").select("max_percent")
          .or(`department_id.eq.${prof.eleave_department_id},department_id.is.null`)
          .order("department_id", { ascending: false }).limit(1).maybeSingle();
        if (cap) {
          const { data: deptUsers } = await db.from("profiles").select("id").eq("eleave_department_id", prof.eleave_department_id);
          const total = deptUsers?.length ?? 1;
          const { data: onLeave } = await db.from("eleave_leave_requests").select("id,user_id").eq("status", "approved")
            .lte("start_date", end_date).gte("end_date", start_date);
          const deptIds = new Set(deptUsers?.map((u: any) => u.id));
          const overlapping = (onLeave ?? []).filter((r: any) => deptIds.has(r.user_id)).length;
          const pct = ((overlapping + 1) / total) * 100;
          if (pct > Number(cap.max_percent))
            return json({ error: `Team capacity exceeded (${pct.toFixed(0)}% > ${cap.max_percent}%). Please pick another date.` });
        }
      }

      const approvers = await resolveApprovers(db, user.id);
      if (!approvers.length) return json({ error: "No approver configured. Contact admin." });

      const breakdownText = Array.isArray(day_selections) && day_selections.length
        ? "\n\n[Day breakdown]\n" + day_selections.map((s: any) => `${s.date}: ${String(s.type).toUpperCase()}`).join("\n")
        : "";
      const { data: reqRow, error } = await db.from("eleave_leave_requests").insert({
        user_id: user.id, leave_type_id, start_date, end_date, half_day: anyHalf, days,
        reason: (reason ?? "") + breakdownText,
        attachment_url: attUrls[0] ?? null,
        attachment_urls: attUrls,
        cc_user_ids: ccUserIds,
        cc_emails: ccEmails,
        status: "pending", current_level: 1, total_levels: approvers.length,
      }).select().single();
      if (error) return json({ error: error.message });

      await db.from("eleave_request_approvals").insert(
        approvers.map((a, i) => ({ request_id: reqRow.id, approver_id: a, level: i + 1 }))
      );
      await notify(db, approvers[0], "new_request", "New leave request",
        `${prof?.full_name || user.email} requested ${days} day(s) of ${lt.name}.`, reqRow.id);
      for (const ccId of ccUserIds) {
        if (ccId === user.id) continue;
        await notify(db, ccId, "new_request", "You were CC'd on a leave request",
          `${prof?.full_name || user.email} CC'd you on a ${lt.name} request (${days} day(s)).`, reqRow.id);
      }
      await db.from("eleave_audit_log").insert({
        actor_id: user.id, action: "submit", entity: "eleave_leave_request", entity_id: reqRow.id,
        details: { cc_user_ids: ccUserIds, cc_emails: ccEmails, attachments: attUrls.length },
      });
      return json({ ok: true, request: reqRow });
    }

    const { data: reqRow } = await db.from("eleave_leave_requests").select("*").eq("id", request_id).single();
    if (!reqRow) return json({ error: "Request not found" }, 404);
    const { data: lt } = await db.from("eleave_leave_types").select("*").eq("id", reqRow.leave_type_id).single();

    if (action === "approve" || action === "reject") {
      const comment = (payload?.comment ?? "").toString().trim();
      if (!comment) {
        return json({ error: action === "reject" ? "A rejection reason is required." : "An approval comment is required." });
      }
      const { data: appr } = await db.from("eleave_request_approvals").select("*")
        .eq("request_id", request_id).eq("level", reqRow.current_level).is("decision", null).maybeSingle();
      if (!appr || appr.approver_id !== user.id) return json({ error: "Not your approval to make." }, 403);
      await db.from("eleave_request_approvals").update({
        decision: action === "approve" ? "approved" : "rejected",
        comment, decided_at: new Date().toISOString(),
      }).eq("id", appr.id);

      if (action === "reject") {
        await db.from("eleave_leave_requests").update({ status: "rejected", decided_at: new Date().toISOString() }).eq("id", request_id);
        await notify(db, reqRow.user_id, "rejected", "Leave rejected",
          `Your ${lt?.name} request was rejected.\n\nReason: ${comment}`, request_id);
      } else if (reqRow.current_level < reqRow.total_levels) {
        await db.from("eleave_leave_requests").update({ current_level: reqRow.current_level + 1 }).eq("id", request_id);
        const { data: next } = await db.from("eleave_request_approvals").select("approver_id")
          .eq("request_id", request_id).eq("level", reqRow.current_level + 1).maybeSingle();
        if (next) await notify(db, next.approver_id, "new_request", "Leave needs your approval",
          `Forwarded for level ${reqRow.current_level + 1}.`, request_id);
      } else {
        await db.from("eleave_leave_requests").update({ status: "approved", decided_at: new Date().toISOString() }).eq("id", request_id);
        if (lt?.deduct_from === "balance") {
          await adjustBalance(db, reqRow.user_id, reqRow.leave_type_id, new Date(reqRow.start_date).getFullYear(), Number(reqRow.days));
        }
        await notify(db, reqRow.user_id, "approved", "Leave approved",
          `Your ${lt?.name} request was approved.\n\nApprover note: ${comment}`, request_id);
      }
      await db.from("eleave_audit_log").insert({
        actor_id: user.id, action, entity: "eleave_leave_request", entity_id: request_id, details: { comment },
      });
      return json({ ok: true });
    }

    if (action === "withdraw") {
      if (reqRow.user_id !== user.id) return json({ error: "Not your request." }, 403);
      if (reqRow.status !== "pending") return json({ error: "Only pending requests can be withdrawn." });
      await db.from("eleave_leave_requests").update({ status: "withdrawn", decided_at: new Date().toISOString() }).eq("id", request_id);
      await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "withdraw", entity: "eleave_leave_request", entity_id: request_id });
      return json({ ok: true });
    }

    if (action === "request_cancel") {
      if (reqRow.user_id !== user.id) return json({ error: "Not your request." }, 403);
      if (reqRow.status !== "approved") return json({ error: "Only approved requests can be cancelled." });
      const reason = (payload?.reason ?? "").toString().trim();
      if (!reason) return json({ error: "A cancellation reason is required." });

      const cutoff = Number((lt as any)?.cancel_cutoff_days ?? 0);
      if (cutoff <= 0) return json({ error: "Cancellation is disabled for this leave type." }, 400);
      const cutoffDate = new Date(reqRow.created_at);
      cutoffDate.setDate(cutoffDate.getDate() + cutoff);
      cutoffDate.setHours(23, 59, 59, 999);
      if (Date.now() > cutoffDate.getTime()) {
        const y = cutoffDate.getFullYear();
        const m = String(cutoffDate.getMonth() + 1).padStart(2, "0");
        const d = String(cutoffDate.getDate()).padStart(2, "0");
        return json({ error: `Cancel Request closed on ${y}/${m}/${d}. Contact HR for Cancel.` }, 400);
      }

      const { data: existingChain } = await db.from("eleave_request_approvals")
        .select("approver_id, level").eq("request_id", request_id).order("level", { ascending: true });

      const seen = new Set<string>();
      const orderedApprovers: { approver_id: string; level: number }[] = [];
      for (const row of (existingChain ?? [])) {
        if (!seen.has(row.approver_id)) {
          seen.add(row.approver_id);
          orderedApprovers.push({ approver_id: row.approver_id, level: orderedApprovers.length + 1 });
        }
      }

      let chainToUse = orderedApprovers;
      if (!chainToUse.length) {
        const fresh = await resolveApprovers(db, reqRow.user_id);
        chainToUse = fresh.map((a, i) => ({ approver_id: a, level: i + 1 }));
      }
      if (!chainToUse.length) return json({ error: "No approver configured. Contact admin." });

      await db.from("eleave_request_approvals").delete().eq("request_id", request_id);
      await db.from("eleave_request_approvals").insert(
        chainToUse.map((c) => ({ request_id, approver_id: c.approver_id, level: c.level }))
      );

      await db.from("eleave_leave_requests").update({
        status: "pending_cancellation",
        cancellation_reason: reason,
        current_level: 1,
        total_levels: chainToUse.length,
      }).eq("id", request_id);

      const { data: prof } = await db.from("profiles").select("full_name,email").eq("id", reqRow.user_id).maybeSingle();
      await notify(db, chainToUse[0].approver_id, "cancellation_requested", "Cancellation requested",
        `${prof?.full_name || prof?.email || "An employee"} asked to cancel an approved ${lt?.name ?? "leave"} (${reqRow.start_date} → ${reqRow.end_date}).\n\nReason: ${reason}`,
        request_id);
      await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "request_cancel", entity: "eleave_leave_request", entity_id: request_id, details: { reason } });
      return json({ ok: true });
    }

    if (action === "approve_cancel" || action === "deny_cancel") {
      const comment = (payload?.comment ?? "").toString().trim();
      if (!comment) {
        return json({ error: action === "deny_cancel" ? "A reason is required to deny cancellation." : "A comment is required to approve cancellation." });
      }
      if (reqRow.status !== "pending_cancellation") return json({ error: "Not in cancellation state." });

      const { data: appr } = await db.from("eleave_request_approvals").select("*")
        .eq("request_id", request_id).eq("level", reqRow.current_level).is("decision", null).maybeSingle();
      if (!appr || appr.approver_id !== user.id) return json({ error: "Not your approval to make." }, 403);

      await db.from("eleave_request_approvals").update({
        decision: action === "approve_cancel" ? "approved" : "rejected",
        comment, decided_at: new Date().toISOString(),
      }).eq("id", appr.id);

      if (action === "deny_cancel") {
        await db.from("eleave_leave_requests").update({ status: "approved" }).eq("id", request_id);
        await notify(db, reqRow.user_id, "cancellation_denied", "Cancellation denied",
          `Your cancellation request was denied.\n\nReason: ${comment}`, request_id);
      } else if (reqRow.current_level < reqRow.total_levels) {
        await db.from("eleave_leave_requests").update({ current_level: reqRow.current_level + 1 }).eq("id", request_id);
        const { data: next } = await db.from("eleave_request_approvals").select("approver_id")
          .eq("request_id", request_id).eq("level", reqRow.current_level + 1).maybeSingle();
        if (next) await notify(db, next.approver_id, "cancellation_requested", "Cancellation needs your approval",
          `Forwarded cancellation for level ${reqRow.current_level + 1}.`, request_id);
      } else {
        await db.from("eleave_leave_requests").update({ status: "withdrawn", decided_at: new Date().toISOString() }).eq("id", request_id);
        if (lt?.deduct_from === "balance") {
          await adjustBalance(db, reqRow.user_id, reqRow.leave_type_id, new Date(reqRow.start_date).getFullYear(), -Number(reqRow.days));
        }
        await notify(db, reqRow.user_id, "cancellation_approved", "Cancellation approved",
          `Your leave was cancelled and the days were restored to your balance.\n\nApprover note: ${comment}`, request_id);
      }
      await db.from("eleave_audit_log").insert({ actor_id: user.id, action, entity: "eleave_leave_request", entity_id: request_id, details: { comment } });
      return json({ ok: true });
    }

    return json({ error: "Unknown action" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
