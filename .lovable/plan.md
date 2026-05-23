
# Evening Update Reminder + Missed Report Alert — Plan

## Goal
Two new Telegram alert flows on top of the existing brief dispatcher:

1. **Evening Reminder** — every day at admin-configured evening time (default 17:00 / 5:00 PM), Sunday excluded. Send to every linked user who has **no `task_updates` row today** (in their TZ): _"You are not update task status, Please update"_.
2. **Midnight Missed-Report Alert** — at 00:00 (end of day) Sunday excluded. For every user who never updated today, send a per-task alert to **Admins + Managers (reports_to chain) + Task Owner (created_by)**: _"{userName} not update report"_ with the count of missed users.

## Scope

### 1. Admin time config
Reuse existing `telegram_admin_config.evening_default` (already editable in `TelegramAdminTab.tsx`) as the Evening Reminder send time. Update helper text on that field to say: _"Evening Reminder is sent to users who haven't updated any task today. Sundays are skipped."_

### 2. Cron schedule
The existing `telegram-briefs-15min` pg_cron (every 15 min) already covers the evening slot. Add a second cron `telegram-missed-report-midnight` running hourly (or every 15 min) so it fires once per local-midnight slot across timezones; idempotency comes from `telegram_brief_log`.

### 3. Edge function changes — `telegram-briefs/index.ts`
Add two new brief kinds alongside existing `morning` / `evening`:

- **`evening_reminder`**: at admin `evening_default` time per user TZ, skip Sunday.
  - Skip if any `task_updates.user_id = user AND created_at::date (in TZ) = today`.
  - Skip if user has no assigned open tasks today (nothing to update).
  - Idempotency claim: `telegram_brief_log(user, 'evening_reminder', local_date)`.
  - Message: `⏰ <b>Daily Update Reminder</b>\n\nYou are not update task status, Please update.`

- **`missed_report`**: at local 00:00 (covers previous day = `yesterday`), skip if yesterday was Sunday.
  - Compute `missedUsers` = linked profiles with no `task_updates` row on yesterday in their TZ AND had at least one open assignment due ≤ yesterday.
  - For each missed user, find recipients:
    - All users with role `admin` (via `user_roles` + `has_role`).
    - The user's manager chain (`profiles.reports_to`).
    - Task owner = `tasks.created_by` of each missed task assigned to that user yesterday.
  - Dedupe recipients (must have `telegram_chat_id`).
  - Send: `🚨 <b>Missed Report Alert</b>\n\n<b>{count}</b> user(s) not update report:\n• {name1}\n• {name2}\n...`
  - Idempotency claim: `telegram_brief_log(recipient_id, 'missed_report', yesterday_dateISO)`.

### 4. Helpers
Add inside `telegram-briefs/index.ts`:
- `userUpdatedToday(db, userId, dateISO, tz)` — checks `task_updates`.
- `getAdmins(db)` — pulls user_ids from `user_roles` where role='admin'.
- `getManagerChain(db, userId)` — walks `profiles.reports_to`.

### 5. No schema changes
`telegram_brief_log.brief_kind` is text so new kinds `evening_reminder` and `missed_report` are accepted as-is.

## Technical Details

**Files touched:**
- `supabase/functions/telegram-briefs/index.ts` — add `evening_reminder` + `missed_report` logic; keep morning + legacy evening intact.
- `src/components/admin/TelegramAdminTab.tsx` — update evening helper text.

**Cron:**
- Existing `telegram-briefs-15min` (every 15 min) handles the evening reminder.
- New `telegram-missed-report-hourly` (top of every hour) handles the midnight pass per-TZ.

**Recipient query sketch:**
```sql
-- admins
select user_id from user_roles where role='admin';
-- managers chain (walk in code)
select reports_to from profiles where id = $user_id;
-- task owners
select distinct t.created_by
from task_assignments ta join tasks t on t.id=ta.task_id
where ta.user_id=$user_id and ta.unassigned_at is null
  and t.planned_end <= $yesterday;
```

## Todos
1. Add `evening_reminder` logic to `telegram-briefs/index.ts` (per-user TZ, skip Sunday, skip if updated, claim log, send message).
2. Add `missed_report` logic: compute missed users for yesterday, build recipient set (admins + managers + task owners), send dedup'd alert per recipient.
3. Update `TelegramAdminTab.tsx` evening helper text.
4. Schedule new pg_cron `telegram-missed-report-hourly` calling the same edge function (function detects local midnight per TZ internally).
5. Deploy `telegram-briefs` and smoke-test with `?force=evening_reminder` and `?force=missed_report`.
