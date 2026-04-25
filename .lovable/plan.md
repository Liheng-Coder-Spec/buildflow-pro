## Module 10 — In-app Notifications V1

Scope: **Tasks + Timesheets**, channel: **in-app only** (bell + toast + Realtime), coverage: **all task-workflow events** + timesheet submit/approve/reject/flag.

---

### 1. Database (single migration)

**Enums**
```sql
create type notification_priority as enum ('low','normal','high','critical');
create type notification_type as enum (
  'task_assigned','task_unassigned','task_started','task_submitted_for_approval',
  'task_approved','task_rejected','task_completed','task_closed','task_reopened',
  'task_blocker_reported',
  'timesheet_submitted','timesheet_approved','timesheet_rejected','timesheet_flagged'
);
```

**Table: `notifications`**
- `id uuid pk`, `user_id uuid not null` (recipient), `actor_id uuid` (who caused it)
- `type notification_type`, `priority notification_priority default 'normal'`
- `title text`, `body text`
- `entity_type text` (`task` | `timesheet_entry` | `task_update`), `entity_id uuid`
- `project_id uuid` (for filtering), `metadata jsonb default '{}'`
- `read_at timestamptz`, `created_at timestamptz default now()`
- Indexes: `(user_id, read_at, created_at desc)`, `(user_id, created_at desc)`

**RLS**
- SELECT/UPDATE: `user_id = auth.uid()` (users only see/mark their own)
- DELETE: own rows only
- INSERT: blocked from clients — only `SECURITY DEFINER` functions insert

**Helper function** `create_notification(_user_id, _type, _title, _body, _entity_type, _entity_id, _project_id, _priority, _actor_id, _metadata)` — `SECURITY DEFINER`, skips when `_user_id = _actor_id` (don't notify yourself).

**Recipient resolver** `get_task_recipients(_task_id, _exclude_user)`:
- All active assignees from `task_assignments` (where `unassigned_at is null`)
- Task `created_by`
- All admins/PMs/supervisors on the project (via `project_members` + `user_roles`)

**Triggers (all `AFTER`, `SECURITY DEFINER`)**

1. `notify_task_status_change` — on `tasks` AFTER UPDATE when status changes:
   - `assigned`: notify all current assignees (`task_assigned`)
   - `in_progress`: notify creator + supervisors (`task_started`)
   - `pending_approval`: notify supervisors/PMs/QA on project (`task_submitted_for_approval`, priority high)
   - `approved`: notify assignees (`task_approved`)
   - `rejected`: notify assignees with `rejection_reason` in body (`task_rejected`, priority high)
   - `completed`: notify creator + supervisors
   - `closed`: notify assignees + creator
   - back to `assigned`/`in_progress` from `rejected`: `task_reopened`

2. `notify_task_assignment` — on `task_assignments` AFTER INSERT: notify the new assignee (`task_assigned`). On UPDATE setting `unassigned_at`: notify them (`task_unassigned`).

3. `notify_task_blocker` — on `task_updates` AFTER INSERT when `is_blocker = true`: notify supervisors/PMs on project (`task_blocker_reported`, priority critical).

4. `notify_timesheet_change` — on `timesheet_entries`:
   - AFTER UPDATE `draft → submitted`: notify supervisors/PMs on project (`timesheet_submitted`)
   - AFTER UPDATE `submitted → approved`: notify owner (`timesheet_approved`)
   - AFTER UPDATE `submitted → rejected`: notify owner with reason (`timesheet_rejected`, high)
   - AFTER INSERT/UPDATE when `flags <> '[]'::jsonb` and old flags differed: notify supervisors on project (`timesheet_flagged`, normal)

**Realtime**: `alter publication supabase_realtime add table public.notifications;`

---

### 2. Frontend

**New file `src/lib/notificationMeta.ts`**
- Type/priority labels, icon map (lucide), color tokens, route resolver:
  - `task*` → `/tasks/{entity_id}`
  - `timesheet_*` → `/timesheets`

**New hook `src/hooks/useNotifications.ts`**
- React Query: `notifications` list (last 50), unread count
- Realtime channel subscribed to `postgres_changes` on `notifications` filtered by `user_id=eq.{auth.uid()}`
- On INSERT event: invalidate query + fire `sonner` toast with title/body and click action that navigates to entity
- Mutations: `markRead(id)`, `markAllRead()`, `delete(id)`

**New component `src/components/NotificationBell.tsx`**
- Bell icon button with unread count badge (red dot if >0, number if ≤9, "9+" otherwise)
- DropdownMenu (or Popover) showing latest 20:
  - Each row: icon, title, body (2-line clamp), relative time, unread dot
  - Click → mark read + navigate to entity
  - Footer: "Mark all read" + "View all" → `/notifications`

**New page `src/pages/Notifications.tsx`**
- Full list with tabs: All / Unread / Tasks / Timesheets
- Same row design, paginated (20/page)
- Bulk "Mark all read", individual delete

**Edits**
- `src/components/AppLayout.tsx`: render `<NotificationBell />` in header (left of avatar dropdown)
- `src/App.tsx`: add `/notifications` protected route

---

### 3. Files

**New**
- `supabase/migrations/<timestamp>_notifications.sql`
- `src/lib/notificationMeta.ts`
- `src/hooks/useNotifications.ts`
- `src/components/NotificationBell.tsx`
- `src/pages/Notifications.tsx`

**Modified**
- `src/components/AppLayout.tsx` (mount bell)
- `src/App.tsx` (route)

---

### 4. Out of scope (V1)
- Email delivery
- Per-user notification preferences
- Documents / Project-level activity feed events
- Push / mobile

I'll implement in this order: migration → meta lib → hook → bell → page → header/route wiring → smoke test.