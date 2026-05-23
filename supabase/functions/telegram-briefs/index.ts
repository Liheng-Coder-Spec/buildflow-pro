// Telegram morning + evening briefs dispatcher.
// Triggered every 15 minutes by pg_cron.
// - Morning Brief (Due Today): sent to ALL linked members at admin-configured time, Sundays skipped.
// - Evening Brief: opt-in via telegram_brief_prefs.
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
      weekday: parts.weekday, // "Sun","Mon",...
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

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });
  const TELEGRAM_API_KEY = Deno.env.get("TELEGRAM_API_KEY");
  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!TELEGRAM_API_KEY || !SUPABASE_URL || !SERVICE_KEY) return new Response("Misconfigured", { status: 500 });
  const db = createClient(SUPABASE_URL, SERVICE_KEY);

  const now = new Date();
  const url = new URL(req.url);
  const force = url.searchParams.get("force"); // "morning" | "evening" | null for testing

  // Load admin-configured morning send time
  const { data: adminCfg } = await db
    .from("telegram_admin_config")
    .select("morning_default")
    .maybeSingle();
  const adminMorning = adminCfg?.morning_default?.slice(0, 5) ?? "08:00";

  // ---- MORNING BRIEF: all linked members ----
  const { data: linkedMembers } = await db
    .from("profiles")
    .select("id, full_name, telegram_chat_id")
    .not("telegram_chat_id", "is", null);

  let sentMorning = 0;
  for (const prof of linkedMembers ?? []) {
    // Use user pref TZ if present, fallback UTC
    const { data: pref } = await db
      .from("telegram_brief_prefs")
      .select("timezone")
      .eq("user_id", prof.id)
      .maybeSingle();
    const tz = pref?.timezone || "UTC";
    const lp = localParts(tz, now);
    if (!lp) continue;

    // Skip Sunday
    if (lp.weekday === "Sun") continue;

    const shouldSend = force === "morning" || withinSlot(adminMorning, lp.hh, lp.mm);
    if (!shouldSend) continue;

    // Idempotency claim
    if (force !== "morning") {
      const ok = await tryClaim(db, prof.id, "morning", lp.dateISO);
      if (!ok) continue;
    }

    await sendMorningDueToday(db, prof, lp.dateISO);
    sentMorning++;
  }

  // ---- EVENING BRIEF: opt-in via prefs (unchanged behavior) ----
  const { data: prefs } = await db
    .from("telegram_brief_prefs")
    .select("user_id, evening_at, timezone");

  let sentEvening = 0;
  for (const p of prefs ?? []) {
    const lp = localParts(p.timezone || "UTC", now);
    if (!lp) continue;
    const shouldSend = force === "evening" || withinSlot(p.evening_at, lp.hh, lp.mm);
    if (!shouldSend) continue;

    const { data: prof } = await db
      .from("profiles")
      .select("id, full_name, telegram_chat_id")
      .eq("id", p.user_id)
      .maybeSingle();
    if (!prof?.telegram_chat_id) continue;

    if (force !== "evening") {
      const ok = await tryClaim(db, p.user_id, "evening", lp.dateISO);
      if (!ok) continue;
    }
    await sendEvening(db, prof);
    sentEvening++;
  }

  return new Response(JSON.stringify({ ok: true, sentMorning, sentEvening }), {
    headers: { "Content-Type": "application/json" },
  });
});

async function tryClaim(db: any, userId: string, kind: string, dateISO: string): Promise<boolean> {
  const { error } = await db
    .from("telegram_brief_log")
    .insert({ user_id: userId, brief_kind: kind, local_date: dateISO });
  return !error;
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
