// Telegram briefs dispatcher (every 15 min via pg_cron).
// Flows:
// - morning           : Morning Brief (Due Today) — all linked members, admin time, skip Sunday
// - evening_reminder  : 5PM-ish reminder if user has no task_updates today, skip Sunday
// - missed_report     : At local 00:00 — alert admins+managers+task owner of users who missed yesterday
// - evening (legacy)  : opt-in Daily Wrap from telegram_brief_prefs
import { createClient } from "npm:@supabase/supabase-js@2";

function botUrl(method: string): string {
  return `https://api.telegram.org/bot${Deno.env.get("TELEGRAM_API_KEY")!}/${method}`;
}

async function tgSend(chatId: number, text: string) {
  try {
    await fetch(botUrl("sendMessage"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e) {
    console.error("tgSend failed:", e);
  }
}

function localParts(tz: string, now: Date) {
  try {
    const fmt = new Intl.DateTimeFormat("en-CA", {
      timeZone: tz,
      year: "numeric", month: "2-digit", day: "2-digit",
      hour: "2-digit", minute: "2-digit", second: "2-digit",
      weekday: "short", hour12: false,
    });
    const parts = Object.fromEntries(fmt.formatToParts(now).map((p) => [p.type, p.value]));
    return {
      hh: Number(parts.hour),
      mm: Number(parts.minute),
      dateISO: `${parts.year}-${parts.month}-${parts.day}`,
      weekday: parts.weekday as string, // "Sun","Mon",...
    };
  } catch {
    return null;
  }
}

function withinSlot(targetHHMM: string | null, hh: number, mm: number): boolean {
  if (!targetHHMM) return false;
  const [th, tm] = targetHHMM.split(":").map(Number);
  const slotMin = Math.floor((hh * 60 + mm) / 15) * 15;
  const targetSlot = Math.floor((th * 60 + tm) / 15) * 15;
  return slotMin === targetSlot;
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Returns yesterday's dateISO and weekday in the given TZ.
function yesterdayLocal(tz: string, now: Date) {
  const d = new Date(now.getTime() - 24 * 3600_000);
  return localParts(tz, d);
}

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!TELEGRAM_API_KEY || !SUPABASE_URL || !SERVICE_KEY) return new Response("Misconfigured", { status: 500 });
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const now = new Date();
  const url = new URL(req.url);
  const force = url.searchParams.get("force"); // morning | evening_reminder | missed_report | evening

  const { data: adminCfg } = await db
    .from("telegram_admin_config")
    .select("morning_default, evening_default")
    .maybeSingle();
  const adminMorning = adminCfg?.morning_default?.slice(0, 5) ?? "08:00";
  const adminEvening = adminCfg?.evening_default?.slice(0, 5) ?? "17:00";

  const { data: linkedMembers } = await db
    .from("profiles")
    .select("id, full_name, telegram_chat_id, reports_to")
    .not("telegram_chat_id", "is", null);

  let sentMorning = 0;
  let sentEveningReminder = 0;
  let sentMissedReport = 0;

  // Pre-fetch per-user timezone preferences
  const { data: allPrefs } = await db
    .from("telegram_brief_prefs")
    .select("user_id, timezone, evening_at");
  const tzByUser = new Map<string, string>();
  const eveningAtByUser = new Map<string, string | null>();
  for (const p of allPrefs ?? []) {
    tzByUser.set(p.user_id, p.timezone || "UTC");
    eveningAtByUser.set(p.user_id, p.evening_at);
  }

  // ============ MORNING + EVENING_REMINDER per linked member ============
  for (const prof of linkedMembers ?? []) {
    const tz = tzByUser.get(prof.id) || "UTC";
    const lp = localParts(tz, now);
    if (!lp) continue;
    const isSunday = lp.weekday === "Sun";

    // ----- MORNING -----
    if (!isSunday) {
      const fireMorning = force === "morning" || withinSlot(adminMorning, lp.hh, lp.mm);
      if (fireMorning) {
        const claimed = force === "morning" ? true : await tryClaim(db, prof.id, "morning", lp.dateISO);
        if (claimed) {
          await sendMorningDueToday(db, prof, lp.dateISO);
          sentMorning++;
        }
      }
    }

    // ----- EVENING_REMINDER -----
    if (!isSunday) {
      const fireEveningReminder = force === "evening_reminder" || withinSlot(adminEvening, lp.hh, lp.mm);
      if (fireEveningReminder) {
        const claimed = force === "evening_reminder" ? true : await tryClaim(db, prof.id, "evening_reminder", lp.dateISO);
        if (claimed) {
          // Only remind users who have at least one open assignment today AND have not updated today
          const hasOpen = await hasOpenAssignmentsToday(db, prof.id, lp.dateISO);
          const updated = await userUpdatedToday(db, prof.id, lp.dateISO, tz);
          if (hasOpen && !updated) {
            await tgSend(prof.telegram_chat_id, [
              `⏰ <b>Daily Update Reminder</b>`,
              ``,
              `You are not update task status, Please update.`,
              ``,
              `👉 Tap <b>📋 My Tasks</b> below.`,
            ].join("\n"));
            sentEveningReminder++;
          }
        }
      }
    }
  }

  // ============ MISSED REPORT — fires at local 00:00 (slot 00:00–00:14) ============
  // We bucket users by TZ so we trigger once per TZ per yesterday-local-date.
  const tzBuckets = new Map<string, { yesterdayISO: string; yesterdayWeekday: string }>();
  for (const prof of linkedMembers ?? []) {
    const tz = tzByUser.get(prof.id) || "UTC";
    const lp = localParts(tz, now);
    if (!lp) continue;
    const fireMidnight = force === "missed_report" || (lp.hh === 0 && lp.mm < 15);
    if (!fireMidnight) continue;
    const y = yesterdayLocal(tz, now);
    if (!y) continue;
    if (y.weekday === "Sun") continue; // don't report on Sunday's activity
    if (!tzBuckets.has(tz)) tzBuckets.set(tz, { yesterdayISO: y.dateISO, yesterdayWeekday: y.weekday });
  }

  if (tzBuckets.size > 0) {
    // Get admin recipients once
    const adminIds = await getAdmins(db);

    for (const [tz, { yesterdayISO }] of tzBuckets) {
      // Find linked users in this TZ
      const usersInTz = (linkedMembers ?? []).filter((p: any) => (tzByUser.get(p.id) || "UTC") === tz);

      // Identify missed users: had open assignment for yesterday, no task_updates yesterday
      const missed: { id: string; name: string; taskOwnerIds: Set<string>; managerIds: Set<string> }[] = [];
      for (const u of usersInTz) {
        const hadTasks = await hadAssignmentsOnOrBefore(db, u.id, yesterdayISO);
        if (!hadTasks) continue;
        const updated = await userUpdatedOnDate(db, u.id, yesterdayISO, tz);
        if (updated) continue;
        const taskOwnerIds = await getTaskOwnersForUserOn(db, u.id, yesterdayISO);
        const managerIds = await getManagerChain(db, u.id);
        missed.push({ id: u.id, name: u.full_name || "Unknown", taskOwnerIds, managerIds });
      }

      if (missed.length === 0) continue;

      // Build recipient → list-of-missed-user-names map
      const recipientMap = new Map<string, Set<string>>();
      for (const m of missed) {
        const recipients = new Set<string>([...adminIds, ...m.managerIds, ...m.taskOwnerIds]);
        for (const r of recipients) {
          if (!recipientMap.has(r)) recipientMap.set(r, new Set());
          recipientMap.get(r)!.add(m.name);
        }
      }

      // Fetch chat_ids for recipients
      const recipientIds = Array.from(recipientMap.keys());
      if (recipientIds.length === 0) continue;
      const { data: recipProfiles } = await db
        .from("profiles")
        .select("id, telegram_chat_id, full_name")
        .in("id", recipientIds)
        .not("telegram_chat_id", "is", null);

      for (const rp of recipProfiles ?? []) {
        const names = Array.from(recipientMap.get(rp.id) || []);
        if (names.length === 0) continue;

        const claimKey = `missed_report:${tz}`;
        const claimed = force === "missed_report"
          ? true
          : await tryClaim(db, rp.id, claimKey, yesterdayISO);
        if (!claimed) continue;

        const text = [
          `🚨 <b>Missed Report Alert</b>`,
          `📅 ${yesterdayISO}`,
          ``,
          `<b>${names.length}</b> user${names.length === 1 ? "" : "s"} not update report:`,
          ...names.map((n) => `• ${escapeHtml(n)}`),
        ].join("\n");
        await tgSend(rp.telegram_chat_id, text);
        sentMissedReport++;
      }
    }
  }

  // ============ LEGACY EVENING (opt-in Daily Wrap) ============
  let sentEvening = 0;
  for (const p of allPrefs ?? []) {
    const tz = p.timezone || "UTC";
    const lp = localParts(tz, now);
    if (!lp) continue;
    const fire = force === "evening" || withinSlot(p.evening_at, lp.hh, lp.mm);
    if (!fire) continue;
    const prof = (linkedMembers ?? []).find((m: any) => m.id === p.user_id);
    if (!prof?.telegram_chat_id) continue;
    const claimed = force === "evening" ? true : await tryClaim(db, p.user_id, "evening", lp.dateISO);
    if (!claimed) continue;
    await sendEvening(db, prof);
    sentEvening++;
  }

  return new Response(JSON.stringify({
    ok: true, sentMorning, sentEveningReminder, sentMissedReport, sentEvening,
  }), { headers: { "Content-Type": "application/json" } });
});

// ===================== Helpers =====================

async function tryClaim(db: any, userId: string, kind: string, dateISO: string): Promise<boolean> {
  const { error } = await db
    .from("telegram_brief_log")
    .insert({ user_id: userId, brief_kind: kind, local_date: dateISO });
  return !error;
}

async function hasOpenAssignmentsToday(db: any, userId: string, todayISO: string): Promise<boolean> {
  const { data } = await db
    .from("task_assignments")
    .select("task_id, tasks!inner(status, planned_end)")
    .eq("user_id", userId)
    .is("unassigned_at", null)
    .eq("tasks.planned_end", todayISO)
    .limit(1);
  return (data ?? []).some((a: any) =>
    a.tasks && !["completed", "closed", "approved"].includes(a.tasks.status));
}

async function hadAssignmentsOnOrBefore(db: any, userId: string, dateISO: string): Promise<boolean> {
  const { data } = await db
    .from("task_assignments")
    .select("task_id, tasks!inner(status, planned_end)")
    .eq("user_id", userId)
    .is("unassigned_at", null)
    .lte("tasks.planned_end", dateISO)
    .limit(1);
  return (data ?? []).some((a: any) =>
    a.tasks && !["completed", "closed", "approved"].includes(a.tasks.status));
}

// Returns true if the user posted any task_update whose created_at falls on dateISO in tz.
async function userUpdatedOnDate(db: any, userId: string, dateISO: string, tz: string): Promise<boolean> {
  // Pull updates from a generous window (±2 days UTC) and filter by local date
  const since = new Date(`${dateISO}T00:00:00Z`).getTime() - 36 * 3600_000;
  const until = new Date(`${dateISO}T00:00:00Z`).getTime() + 60 * 3600_000;
  const { data } = await db
    .from("task_updates")
    .select("id, created_at")
    .eq("user_id", userId)
    .gte("created_at", new Date(since).toISOString())
    .lte("created_at", new Date(until).toISOString());
  for (const row of data ?? []) {
    const lp = localParts(tz, new Date(row.created_at));
    if (lp?.dateISO === dateISO) return true;
  }
  return false;
}

async function userUpdatedToday(db: any, userId: string, todayISO: string, tz: string): Promise<boolean> {
  return userUpdatedOnDate(db, userId, todayISO, tz);
}

async function getAdmins(db: any): Promise<string[]> {
  const { data } = await db.from("user_roles").select("user_id").eq("role", "admin");
  return (data ?? []).map((r: any) => r.user_id);
}

async function getManagerChain(db: any, userId: string): Promise<Set<string>> {
  const chain = new Set<string>();
  let current = userId;
  for (let i = 0; i < 8; i++) {
    const { data } = await db.from("profiles").select("reports_to").eq("id", current).maybeSingle();
    const next = data?.reports_to;
    if (!next || chain.has(next)) break;
    chain.add(next);
    current = next;
  }
  return chain;
}

async function getTaskOwnersForUserOn(db: any, userId: string, dateISO: string): Promise<Set<string>> {
  const { data } = await db
    .from("task_assignments")
    .select("tasks!inner(created_by, planned_end, status)")
    .eq("user_id", userId)
    .is("unassigned_at", null)
    .lte("tasks.planned_end", dateISO);
  const owners = new Set<string>();
  for (const r of data ?? []) {
    const t = r.tasks;
    if (!t) continue;
    if (["completed", "closed", "approved"].includes(t.status)) continue;
    if (t.created_by && t.created_by !== userId) owners.add(t.created_by);
  }
  return owners;
}

async function sendMorningDueToday(db: any, prof: any, todayISO: string) {
  const { data: assigns } = await db
    .from("task_assignments")
    .select("tasks!inner(id, code, title, status, planned_end, progress_pct, projects(name))")
    .eq("user_id", prof.id)
    .is("unassigned_at", null)
    .eq("tasks.planned_end", todayISO)
    .lt("tasks.progress_pct", 100);

  const open = (assigns ?? []).filter((a: any) =>
    a.tasks && !["completed", "closed", "approved"].includes(a.tasks.status));

  const name = prof.full_name?.split(" ")[0] ?? "";
  const header = `🌅 <b>Morning Brief (Due Today)</b>${name ? " — " + escapeHtml(name) : ""}`;

  let text: string;
  if (open.length === 0) {
    text = [
      header,
      "",
      `📭 You have no task due today. Contact your manager for task assignment! 📋`,
    ].join("\n");
  } else {
    const lines = open.map((a: any, i: number) => {
      const t = a.tasks;
      const proj = t.projects?.name ? ` · <i>${escapeHtml(t.projects.name)}</i>` : "";
      const code = t.code ? `[${escapeHtml(t.code)}] ` : "";
      return `${i + 1}. ${code}${escapeHtml(t.title)}${proj} — <b>${t.progress_pct ?? 0}%</b>`;
    });
    text = [
      header,
      "",
      `📌 You have <b>${open.length}</b> task${open.length === 1 ? "" : "s"} due today:`,
      "",
      ...lines,
      "",
      `👉 Tap <b>📋 My Tasks</b> below to update progress.`,
    ].join("\n");
  }
  await tgSend(prof.telegram_chat_id, text);
}

async function sendEvening(db: any, prof: any) {
  const since = new Date(Date.now() - 12 * 3600_000).toISOString();
  const { data: updates } = await db
    .from("task_updates")
    .select("task_id, progress_pct, created_at, tasks!inner(status)")
    .eq("user_id", prof.id)
    .gte("created_at", since);

  const total = updates?.length ?? 0;
  const completed = (updates ?? []).filter((u: any) =>
    u.tasks?.status === "completed" || u.progress_pct === 100).length;

  const text = [
    `🌙 <b>Daily Wrap</b>`,
    "",
    `✅ Completed today: <b>${completed}</b>`,
    `📈 Progress updates: <b>${total}</b>`,
    "",
    `Keep pushing. 💪`,
  ].join("\n");
  await tgSend(prof.telegram_chat_id, text);
}
