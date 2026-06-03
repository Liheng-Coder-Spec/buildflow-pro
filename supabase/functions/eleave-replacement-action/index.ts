// E-Leave Replacement Leave action engine: submit | approve | reject
// Two-step sequential approval: Supervisor (level 1) -> Admin (level 2)
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

async function notify(db: ReturnType<typeof admin>, user_id: string, type: string, title: string, body: string) {
  await db.from("eleave_notifications").insert({
    user_id, type, title, body,
    expires_at: new Date(Date.now() + 72 * 3600 * 1000).toISOString(),
  });
}

function periodToDays(period: string): number {
  return period === "full" ? 1 : 0.5;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  try {
    const user = await getUser(req);
    if (!user) return json({ error: "unauthorized" }, 401);
    const db = admin();
    const { action, claim_id, payload } = await req.json();

    if (action === "submit") {
      const { worked_date, target_date, period, reason } = payload ?? {};
      if (!worked_date) return json({ error: "Worked date is required." });
      if (!target_date) return json({ error: "Target replacement date is required." });
      if (target_date <= worked_date) return json({ error: "Target date must be after the worked date." });
      if (!["full", "am", "pm"].includes(period)) return json({ error: "Please choose Full, AM, or PM." });
      const cleanReason = (reason ?? "").toString().trim();
      if (!cleanReason) return json({ error: "A reason is required." });

      const { data: prof } = await db.from("profiles").select("full_name, email, supervisor_id").eq("id", user.id).maybeSingle();
      let supervisorId: string | null = prof?.supervisor_id ?? null;
      if (!supervisorId) {
        const { data: sup } = await db.from("user_roles").select("user_id").in("role", ["supervisor", "project_manager"]).limit(1).maybeSingle();
        supervisorId = sup?.user_id ?? null;
      }
      if (!supervisorId) return json({ error: "No supervisor configured. Contact admin." });

      const days = periodToDays(period);

      const { data: row, error } = await db.from("eleave_replacement_credits").insert({
        user_id: user.id,
        worked_date, target_date, period, days,
        reason: cleanReason,
        status: "pending",
        current_level: 1,
        total_levels: 2,
        supervisor_id: supervisorId,
      }).select().single();
      if (error) return json({ error: error.message });

      await notify(db, supervisorId, "new_request", "New replacement claim",
        `${prof?.full_name || user.email} claimed ${days} day(s) of replacement leave for working on ${worked_date} (${period.toUpperCase()}), to take off on ${target_date}.\n\nReason: ${cleanReason}`);
      await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "submit", entity: "eleave_replacement_credit", entity_id: row.id });
      return json({ ok: true, claim: row });
    }

    if (!claim_id) return json({ error: "claim_id required" });
    const { data: claim } = await db.from("eleave_replacement_credits").select("*").eq("id", claim_id).maybeSingle();
    if (!claim) return json({ error: "Claim not found" }, 404);

    const comment = (payload?.comment ?? "").toString().trim();
    if (!comment) {
      return json({ error: action === "reject" ? "A rejection reason is required." : "An approval comment is required." });
    }
    if (claim.status !== "pending") return json({ error: "This claim is no longer pending." });

    const { data: empProf } = await db.from("profiles").select("full_name, email").eq("id", claim.user_id).maybeSingle();
    const empName = empProf?.full_name || empProf?.email || "Employee";

    if (claim.current_level === 1) {
      if (claim.supervisor_id !== user.id) return json({ error: "Not your claim to approve." }, 403);
      if (action === "approve") {
        await db.from("eleave_replacement_credits").update({
          supervisor_decision: "approved", supervisor_comment: comment,
          supervisor_decided_at: new Date().toISOString(), current_level: 2,
        }).eq("id", claim.id);
        const { data: admins } = await db.from("user_roles").select("user_id").eq("role", "admin");
        for (const a of admins ?? []) {
          await notify(db, a.user_id, "new_request", "Replacement claim needs admin approval",
            `${empName} — ${claim.days} day(s) for working on ${claim.worked_date} (${String(claim.period).toUpperCase()}), to take off on ${claim.target_date}.\n\nReason: ${claim.reason}\n\nSupervisor note: ${comment}`);
        }
        await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "approve", entity: "eleave_replacement_credit", entity_id: claim.id, details: { level: 1, comment } });
        return json({ ok: true });
      } else if (action === "reject") {
        await db.from("eleave_replacement_credits").update({
          status: "rejected", supervisor_decision: "rejected", supervisor_comment: comment,
          supervisor_decided_at: new Date().toISOString(), rejection_reason: comment,
        }).eq("id", claim.id);
        await notify(db, claim.user_id, "rejected", "Replacement claim rejected",
          `Your replacement claim for ${claim.worked_date} was rejected by your supervisor.\n\nReason: ${comment}`);
        await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "reject", entity: "eleave_replacement_credit", entity_id: claim.id, details: { level: 1, comment } });
        return json({ ok: true });
      }
    } else if (claim.current_level === 2) {
      const { data: isAdmin } = await db.from("user_roles").select("user_id").eq("user_id", user.id).eq("role", "admin").maybeSingle();
      if (!isAdmin) return json({ error: "Only an admin can take this decision." }, 403);

      if (action === "approve") {
        const year = new Date(claim.target_date ?? claim.worked_date).getFullYear();
        const { data: rep } = await db.from("eleave_leave_types").select("id")
          .eq("is_replacement", true).eq("active", true)
          .order("created_at", { ascending: true }).limit(1).maybeSingle();
        if (rep) {
          const { data: bal } = await db.from("eleave_leave_balances").select("*")
            .eq("user_id", claim.user_id).eq("leave_type_id", rep.id).eq("year", year).maybeSingle();
          if (bal) {
            await db.from("eleave_leave_balances").update({ adjustments: Number(bal.adjustments) + Number(claim.days) }).eq("id", bal.id);
          } else {
            await db.from("eleave_leave_balances").insert({ user_id: claim.user_id, leave_type_id: rep.id, year, adjustments: Number(claim.days) });
          }
        }
        await db.from("eleave_replacement_credits").update({
          status: "approved", admin_id: user.id, admin_decision: "approved",
          admin_comment: comment, admin_decided_at: new Date().toISOString(),
          credited_at: new Date().toISOString(),
        }).eq("id", claim.id);
        await notify(db, claim.user_id, "approved", "Replacement claim approved",
          `Your replacement claim was approved. ${claim.days} day(s) added to your Replacement Leave balance for ${claim.target_date}.\n\nAdmin note: ${comment}`);
        await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "approve", entity: "eleave_replacement_credit", entity_id: claim.id, details: { level: 2, comment, credited: claim.days, target_date: claim.target_date } });
        return json({ ok: true });
      } else if (action === "reject") {
        await db.from("eleave_replacement_credits").update({
          status: "rejected", admin_id: user.id, admin_decision: "rejected",
          admin_comment: comment, admin_decided_at: new Date().toISOString(),
          rejection_reason: comment,
        }).eq("id", claim.id);
        await notify(db, claim.user_id, "rejected", "Replacement claim rejected",
          `Your replacement claim for ${claim.worked_date} was rejected by admin.\n\nReason: ${comment}`);
        await db.from("eleave_audit_log").insert({ actor_id: user.id, action: "reject", entity: "eleave_replacement_credit", entity_id: claim.id, details: { level: 2, comment } });
        return json({ ok: true });
      }
    }

    return json({ error: "Unknown action" });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});
