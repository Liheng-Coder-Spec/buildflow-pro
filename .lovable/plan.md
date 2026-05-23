
# Morning Brief System — Plan

## Goal
Send a Telegram "Morning Brief (Due Today)" to every linked member every day at the admin-configured time (default 08:00, Sunday excluded), listing each user's tasks due today with progress < 100%. If none, send a friendly empty-state message.

## Scope

### 1. Admin time config (Settings → Telegram → Admin tab)
- Reuse existing `telegram_admin_config.morning_default` (already exists, already editable in `TelegramAdminTab.tsx`).
- This value becomes the **system-wide send time** for the Morning Brief (no per-user override for this brief — spec says "send to all members" at admin time).
- Add a short helper note in the UI clarifying: "Morning Brief is sent to all linked members at this time. Sundays are skipped."

### 2. Cron schedule
- Schedule `telegram-briefs` edge function to run every 15 minutes via `pg_cron` + `pg_net` (insert via supabase insert tool, not migration, since URL/anon key are project-specific).
- Verify `pg_cron` and `pg_net` extensions enabled.

### 3. Edge function: rewrite morning logic in `supabase/functions/telegram-briefs/index.ts`
- Load `telegram_admin_config.morning_default` once per invocation.
- Compute current time in **company timezone** (use first profile's timezone or default `Asia/Phnom_Penh` / configurable; for v1 use each user's `telegram_brief_prefs.timezone` or `UTC` fallback, matching existing pattern).
- **Skip Sunday** (`localDate.getDay() === 0` in user TZ).
- For each profile with `telegram_chat_id IS NOT NULL`:
  - Check if current 15-min slot matches `morning_default` in user's TZ.
  - Idempotency: claim via `telegram_brief_log` (`user_id`, `brief_kind='morning'`, `local_date`).
  - Query tasks: `task_assignments` join `tasks` where `user_id = profile.id`, `unassigned_at IS NULL`, `planned_end = today`, `progress_pct < 100`, status not in (`completed`,`closed`,`approved`).
  - Build message:
    - Title: `🌅 <b>Morning Brief (Due Today)</b>`
    - If tasks: numbered list with task title, project, progress %, status.
    - If none: `You have no task due today. Contact your manager for task assignment! 📋`
- Keep evening logic untouched.

### 4. Coverage for ALL members (not only those with prefs)
- Current code iterates `telegram_brief_prefs` only. Change morning loop to iterate **all profiles with `telegram_chat_id`** so every linked user receives it regardless of personal prefs.
- Evening brief stays opt-in via prefs (unchanged).

### 5. Manual test path
- After deploy, invoke via `curl_edge_functions` to confirm message rendering for the current user.

## Technical Details

**Files touched:**
- `supabase/functions/telegram-briefs/index.ts` — new morning logic, admin-config-driven time, Sunday skip, all-members iteration, due-today filter, empty-state message.
- `src/components/admin/TelegramAdminTab.tsx` — small descriptive helper text (optional).
- DB: `pg_cron` schedule insert (via supabase insert tool, not migration).

**No schema changes** — `telegram_admin_config`, `telegram_brief_log`, `task_assignments`, `tasks`, `profiles` all already exist.

**Query shape:**
```ts
db.from("task_assignments")
  .select("task_id, tasks!inner(id, title, status, planned_end, progress_pct, project_id, projects(name))")
  .eq("user_id", profile.id)
  .is("unassigned_at", null)
  .eq("tasks.planned_end", todayISO)
  .lt("tasks.progress_pct", 100)
  .not("tasks.status", "in", "(completed,closed,approved)");
```

## Todos
1. Update `telegram-briefs/index.ts`: load admin morning time, skip Sunday, iterate all linked profiles, fetch due-today open tasks, format brief, send.
2. Add small helper text in `TelegramAdminTab.tsx` describing Morning Brief behavior.
3. Insert pg_cron job (every 15 min) calling `telegram-briefs`.
4. Deploy `telegram-briefs` and test invocation manually.
