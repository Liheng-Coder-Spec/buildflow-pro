## Goal

Today, unread notification badges only show on the **Tasks** sidebar item (and per-task rows). Users approving work have no at-a-glance signal that something needs their attention from the **Approvals** entry. We'll extend the existing notification system so that:

1. The **Approvals** sidebar nav item shows a red unread-count badge.
2. The **Tasks** and **Timesheets** tabs *inside* the Approvals page show unread-count badges (in addition to / replacing the current "total pending rows" badge).
3. Opening an item or marking it read clears the badge automatically — no new schema or backend work needed.

This is purely a frontend change layered on top of the existing `notifications` table, `useNotifications` cache, and `useTaskUnread` pattern.

---

## Which notification types feed the Approvals badge

From `src/lib/notificationMeta.ts`, the relevant types are already defined:

- **Tasks tab badge** → unread `task_submitted_for_approval` (these are the ones that land in an approver's inbox when a worker submits a task).
- **Timesheets tab badge** → unread `timesheet_submitted` + `timesheet_flagged` (both require approver attention).
- **Sidebar Approvals badge** → sum of both groups above.

Only users who can actually approve will ever receive these notifications (the DB-side notification fan-out already targets approvers), so we don't need extra role-gating in the UI — if there are unread approval notifications for the current user, they're an approver.

---

## Implementation

### 1. New hook: `src/hooks/useApprovalUnread.ts` (new file)

Mirror the structure of `useTaskUnread.ts`. It will:

- Read from the same React Query cache key `["notifications", user?.id, 50]` that `useNotifications` already populates and keeps live via realtime — **no new realtime channel**.
- Filter unread notifications into two buckets:
  - `taskApprovalUnread`: `!read_at && type === "task_submitted_for_approval"`
  - `timesheetApprovalUnread`: `!read_at && (type === "timesheet_submitted" || type === "timesheet_flagged")`
- Expose:
  - `taskApprovalCount: number`
  - `timesheetApprovalCount: number`
  - `totalApprovalUnread: number` (sum of the two)
  - `markTaskApprovalsRead()` — bulk-marks all `task_submitted_for_approval` unread rows as read (used when user opens the Tasks tab).
  - `markTimesheetApprovalsRead()` — bulk-marks `timesheet_submitted` + `timesheet_flagged` unread rows as read (used when user opens the Timesheets tab).
  - `markAllApprovalsRead()` — convenience that calls both.

The `mark*` functions follow the same pattern already used in `useTaskUnread.markTaskRead`: `update({ read_at: now }).in("id", ids).is("read_at", null)`, then invalidate the `["notifications"]` query key.

### 2. Update `src/components/AppLayout.tsx`

In `AppSidebar`:

- Also call `useApprovalUnread()` alongside `useTaskUnread()`.
- Extend `badgeFor(to)`:
  ```ts
  const badgeFor = (to: string): number => {
    if (to === "/tasks") return totalTaskUnread;
    if (to === "/approvals") return totalApprovalUnread;
    return 0;
  };
  ```
- Everything else (the existing red dot in collapsed mode, the rounded count pill in expanded mode, the tooltip) already works generically off `badgeFor`, so no further markup changes are needed.

### 3. Update `src/pages/Approvals.tsx`

- Import the new `useApprovalUnread` hook.
- Replace the current tab counter (which counts loaded `items.length` / `tsItems.length`) with the **unread-notification** counts:
  ```tsx
  <TabsTrigger value="tasks">
    Tasks {taskApprovalCount > 0 && (
      <span className="ml-2 rounded-full bg-destructive text-destructive-foreground px-1.5 text-[10px]">
        {taskApprovalCount > 9 ? "9+" : taskApprovalCount}
      </span>
    )}
  </TabsTrigger>
  ```
  Same for Timesheets using `timesheetApprovalCount`. Color shifts from `bg-warning` to `bg-destructive` to match the rest of the unread system (matches sidebar + bell).
- Auto-clear unread when the user actually views a tab:
  - On mount, if the initial `tab` is `"tasks"`, call `markTaskApprovalsRead()`. If `"timesheets"`, call `markTimesheetApprovalsRead()`.
  - Wrap `setTab` in a handler that also fires the matching `mark*` function on switch.
  - This keeps the sidebar Approvals badge and the in-page tab badges perfectly in sync — the moment a user opens a tab, the related notifications are read, badges drop, and realtime invalidation propagates everywhere instantly.

### 4. No DB / backend / schema changes

- No new tables, RLS policies, edge functions, migrations, or notification types.
- No new realtime subscriptions (we reuse the cache from `useNotifications`).
- All gating happens implicitly via who receives which notifications server-side.

---

## Files touched

- **New**: `src/hooks/useApprovalUnread.ts`
- **Edit**: `src/components/AppLayout.tsx` (wire `totalApprovalUnread` into `badgeFor`)
- **Edit**: `src/pages/Approvals.tsx` (notification-driven tab counts + auto-mark-read on tab view)

## Out of scope (can follow in a later pass if desired)

- Per-row "new" highlighting inside the Approvals tables.
- Adding a Timesheets sidebar badge (the user chose Approvals-only; can be added later by extending the same hook).
- Changing what triggers `task_submitted_for_approval` / `timesheet_submitted` notifications server-side — the existing fan-out is reused as-is.
