
## Goal

Clone the full `leave-management-system` project (UI + DB schema + business logic) from your workspace into this DCOS app, mounted under the **HR Management → E-Leave** group, replacing the existing minimal Leave pages. All user-visible wording "Leave" becomes **"E-Leave"** (page titles, sidebar, breadcrumbs).

## Source vs. target

Source project: `leave-management-system` (ID `7668dacf-5151-41e7-9704-4c87e47b3c2b`) — same workspace, readable.

Source includes:
- 12 user pages: Dashboard, ApplyLeave, MyRequests, TeamCalendar, WhosOnLeave, Replacement, Approvals, Notifications, PublicHolidays, MyApprovalChain + Auth, NotFound
- 9 admin pages: AdminLeaveTypes, AdminApprovalChains, AdminCapacity, AdminSeniority, AdminAllowances, AdminYearEnd, AdminUsers, AdminReports, AdminPublicHolidays
- Components: ApprovalChainTimeline, StatusPill, NavLink, reports/
- Libs: leave.ts, replacement.ts, exportReport.ts
- 8 SQL migrations defining: `leave_types`, `leave_balances`, `leave_requests`, `approval_chains`, `request_approvals`, `seniority_rules`, `team_capacity_rules`, `capacity_overrides`, `replacement_credits`, `notifications`, `audit_log`, plus enums (`leave_status`, `gender`, `deduct_from`, `notification_type`) and RPCs (`has_role`, `current_user_role`, balance/expiry helpers).

## Plan

### 1. Database migration (single migration file)
- Add new enums: `leave_status`, `gender`, `deduct_from`, `notification_type` (skip `app_role` — this app already has its own roles system; map `supervisor`/`admin` to existing roles).
- Drop legacy tables that the new system replaces and that aren't used elsewhere: `leave_balances`, `leave_requests`, `leave_types` (current schema is incompatible).
- Create the new tables: `leave_types`, `seniority_rules`, `leave_balances`, `leave_requests` (with `current_level`, `total_levels`, half-day, attachment, cancellation_reason…), `approval_chains`, `request_approvals`, `team_capacity_rules`, `capacity_overrides`, `replacement_credits`, plus an `e_leave_notifications` table (suffixed to avoid colliding with the existing global `notifications` table).
- Reuse this app's existing `profiles` and `departments`, adding columns the source expects (`gender`, `hire_date`, `probation_end_date`, `years_of_service`, `supervisor_id`) if missing.
- GRANTs to `authenticated` + `service_role` for every new table, RLS enabled, policies ported (self-read, supervisor/admin read-all, admin manage). Role checks use the existing `has_role(uuid, app_role)` already in this project (mapping `supervisor` → `project_manager`/`supervisor`).
- Port supporting SQL from the other 7 migrations (capacity functions, seniority resolver, year-end carry-over, balance ledger triggers, notification creators).

### 2. Code port

Copy source files into a new namespace so nothing clashes:

```text
src/pages/hr/eleave/
  EleaveDashboard.tsx         (← Dashboard.tsx)
  ApplyEleave.tsx             (← ApplyLeave.tsx)
  MyEleaveRequests.tsx        (← MyRequests.tsx)
  EleaveTeamCalendar.tsx
  WhosOnEleave.tsx
  EleaveReplacement.tsx
  EleaveApprovals.tsx
  EleaveNotifications.tsx
  EleavePublicHolidays.tsx
  MyEleaveApprovalChain.tsx
  admin/
    AdminEleaveTypes.tsx
    AdminEleaveApprovalChains.tsx
    AdminEleaveCapacity.tsx
    AdminEleaveSeniority.tsx
    AdminEleaveAllowances.tsx
    AdminEleaveYearEnd.tsx
    AdminEleaveUsers.tsx
    AdminEleaveReports.tsx
    AdminEleavePublicHolidays.tsx
src/components/eleave/
  ApprovalChainTimeline.tsx
  StatusPill.tsx
  reports/...
src/lib/eleave/
  leave.ts
  replacement.ts
  exportReport.ts
```

All "Leave" wording in headings, buttons, toasts, page titles → **"E-Leave"** (keep DB table names as `leave_*` to match the ported SQL — these are not user-visible).

Replace source-specific shells with this app's shared infra:
- Drop the source `AppLayout`, `ProtectedRoute`, `AuthContext`, `NavLink`, `use-toast`, `useSEO` — reuse the existing ones already in this project.
- Source uses `supabase/client` import — already compatible.
- Source uses roles `admin`/`supervisor`/`employee` — remap to this app's `AppRole` (`admin`, `project_manager`/`supervisor`, default).
- Replace any `useNavigate("/apply")` etc. with the new routes below.

### 3. Routing (src/App.tsx)

Replace existing HR Leave routes with the new E-Leave routes:

```text
/hr/eleave                        EleaveDashboard
/hr/eleave/apply                  ApplyEleave
/hr/eleave/requests               MyEleaveRequests
/hr/eleave/calendar               EleaveTeamCalendar
/hr/eleave/whos-on-leave          WhosOnEleave
/hr/eleave/replacement            EleaveReplacement
/hr/eleave/approvals              EleaveApprovals          (project_manager / supervisor / admin)
/hr/eleave/notifications          EleaveNotifications
/hr/eleave/holidays               EleavePublicHolidays
/hr/eleave/my-approval-chain      MyEleaveApprovalChain
/hr/eleave/admin/leave-types      AdminEleaveTypes         (admin)
/hr/eleave/admin/approval-chains  AdminEleaveApprovalChains (admin)
/hr/eleave/admin/capacity         AdminEleaveCapacity      (admin)
/hr/eleave/admin/seniority        AdminEleaveSeniority     (admin)
/hr/eleave/admin/allowances       AdminEleaveAllowances    (admin)
/hr/eleave/admin/year-end         AdminEleaveYearEnd       (admin)
/hr/eleave/admin/users            AdminEleaveUsers         (admin)
/hr/eleave/admin/reports          AdminEleaveReports       (admin)
/hr/eleave/admin/holidays         AdminEleavePublicHolidays (admin)
```

Delete the routes `/hr/leave`, `/hr/leave/new`, `/hr/leave/types` and remove the now-unused `LeaveList.tsx`, `LeaveRequestForm.tsx`, `LeaveTypesAdmin.tsx`, plus `services/leaveService.ts` and any consumers (will refactor or delete; `lib/hrMeta.ts` leave-related types removed).

### 4. Sidebar (src/components/AppLayout.tsx — HR Management group)

Replace the single "Leave" item with E-Leave entries:

```text
HR Management
  HR Dashboard
  E-Leave                  → /hr/eleave
  Apply E-Leave            → /hr/eleave/apply
  My E-Leave Requests      → /hr/eleave/requests
  Team Calendar            → /hr/eleave/calendar
  Who's on E-Leave         → /hr/eleave/whos-on-leave
  E-Leave Approvals        → /hr/eleave/approvals     (supervisor/admin only)
  E-Leave Admin            → /hr/eleave/admin/leave-types (admin only, expands to admin sub-pages)
  Attendance
  People
```

(Exact sidebar grouping kept flat to match existing pattern; admin sub-pages reached from the E-Leave Admin landing page rather than each in the sidebar to avoid clutter.)

### 5. Cleanup
- Delete legacy `LeaveList.tsx`, `LeaveRequestForm.tsx`, `LeaveTypesAdmin.tsx`, `services/leaveService.ts`.
- Strip leave-related types/labels from `src/lib/hrMeta.ts`.
- Keep `HRDashboard`, `Attendance`, `People` untouched.

## Open trade-offs to flag

- **Roles**: source uses `employee/supervisor/admin`; this app uses a richer role set. I'll map `supervisor` → this app's `supervisor`+`project_manager`, `admin` → `admin`. Any non-mapped user becomes a regular employee.
- **Profiles columns**: the source expects `hire_date`, `gender`, `years_of_service`, `supervisor_id` on `profiles`. I'll add them as nullable to avoid disturbing existing data.
- **Notifications**: source has its own `notifications` table. This app already has a global notifications table, so the ported one will be renamed to `eleave_notifications` and a small adapter rewrites the source's queries.
- **Data loss**: existing rows in current `leave_requests` / `leave_balances` / `leave_types` will be **dropped** (per "Replace with E-Leave"). If you want me to migrate any current data first, say so before approving.

## Deliverables order

1. Run the database migration (requires your approval).
2. Port code files + adapters in one pass.
3. Update `App.tsx` routes + sidebar.
4. Remove legacy leave files.
5. Smoke-check build, fix any type/import errors surfaced by the new schema.
