## Departments V1 — Implementation Plan

A construction-aware department layer that runs *alongside* existing WBS, roles, and tasks. Each department gets its own status workflow, its own membership table (orthogonal to `app_role`), and a hybrid soft/hard dependency model.

---

### 1. Data model

**`department` enum**
`architecture`, `structure`, `mep`, `procurement`, `construction`. Extensible later.

**`dept_status` enum (single, namespaced)**
One enum holding every status across departments — keeps Postgres simple and lets the trigger validate per-dept transitions in code.
Values: `draft`, `internal_review`, `coordination`, `dept_approved`, `issued`, `request`, `rfq`, `quotation_received`, `evaluation`, `po_issued`, `delivered`, `assigned`, `in_progress`, `inspection`, `site_approved`, `completed`, `rejected`, `cancelled`.

**`tasks` extension**
- Add `department department NULL` (kept nullable so legacy rows survive; UI requires it for new tasks).
- Add `dept_status dept_status NULL` — the per-department stage. The existing `status` column stays as the high-level lifecycle (open/in_progress/approved/etc.) so notifications, kanban, and reports keep working unchanged.
- Add `discipline_meta jsonb DEFAULT '{}'` — discipline-specific fields:
  - Design depts → `{ drawing_no, revision }`
  - Procurement → `{ supplier, po_number, rfq_due }`
  - Construction → `{ inspection_ref, lot_no }`

**`department_members`** (orthogonal to `user_roles`)
- `id uuid pk`
- `user_id uuid` (FK → auth.users)
- `department department`
- `role_in_dept` enum (`member` | `reviewer` | `approver`)
- `created_at`, `created_by`
- `UNIQUE(user_id, department, role_in_dept)`
- Index `(department, role_in_dept)` for fast approver lookups.

**`task_predecessors` extension**
- Add `is_hard_block boolean DEFAULT false` and `note text NULL`.

**Audit**
- Attach existing `log_audit_event()` to `department_members` and to `discipline_meta`/`department`/`dept_status` columns (already covered by table-level audit on `tasks`).

---

### 2. Workflow logic per department (DB trigger)

New `validate_dept_status_transition()` trigger on `tasks` (BEFORE INSERT/UPDATE OF dept_status):

```
ARCHITECTURE / STRUCTURE / MEP:
  draft → internal_review → coordination → dept_approved → issued
  internal_review|coordination → rejected → draft

PROCUREMENT:
  request → rfq → quotation_received → evaluation → po_issued → delivered
  any → cancelled

CONSTRUCTION:
  assigned → in_progress → inspection → site_approved → completed
  inspection → rejected → in_progress
```

Trigger also:
- Enforces approval roles using `department_members.role_in_dept = 'approver'` for `dept_approved | issued | po_issued | site_approved`.
- Mirrors `dept_status` → high-level `status` (e.g. `issued | po_issued | completed | site_approved` → `completed`; `internal_review | inspection | evaluation` → `pending_approval`; `rejected` → `rejected`). Keeps all current notifications/kanban code working.

---

### 3. Cross-department dependency blocking (hybrid)

New `validate_task_start_against_predecessors()` trigger:
- On UPDATE of `dept_status` or `status`, if new value moves the task into a "started" state (`in_progress`, `internal_review`, `rfq`, `inspection`), look up `task_predecessors`.
- For each predecessor:
  - **`is_hard_block = true`** → predecessor must be in an end-state (`issued | po_issued | delivered | completed | site_approved`). Otherwise raise exception with message `Blocked by <CODE> — <title> (<dept>)`.
  - **`is_hard_block = false`** → no exception; UI shows yellow chip.
- Soft warnings are returned via the existing audit log (`log_audit_event` already running) so admins can review overrides.

---

### 4. RLS adjustments

**`department_members`**
- SELECT: any authenticated.
- INSERT/DELETE: admin only (PMs can manage members of their own projects in V2).

**Tasks (extend existing policies)**
- UPDATE policy gets an extra OR clause: caller must be admin / PM / engineer / supervisor **AND** (a) task has no department, OR (b) caller is in `department_members` for `tasks.department`.
- SELECT stays open (current behavior — anyone in the project can read).
- Result: cross-department tasks become read-only unless you're a member of that department.

**Approvals**
- The dept-status trigger enforces `role_in_dept='approver'` for the relevant transitions, regardless of `app_role` (admin still bypasses everything).

> All checks go through `SECURITY DEFINER` helper `is_dept_member(_user, _dept, _role text DEFAULT NULL)` so policies never query the table they protect.

---

### 5. Notifications

Extend `notify_task_status_change()`:
- When `dept_status` becomes `dept_approved` / `issued` / `po_issued` / `site_approved`, look up successor tasks (rows in `task_predecessors` where `predecessor_id = NEW.id`) and notify their assignees + dept approvers with type `task_handoff` (new value in `notification_type` enum).
- When a hard-block exception fires, no notification (the action failed). When soft-block: post notification `task_dependency_warning` to PM/supervisor.

---

### 6. UI changes (V1 scope = picker + chips)

**`src/lib/departmentMeta.ts`** (new)
- `DEPARTMENT_LABELS`, `DEPARTMENT_TONE` (color per dept), `DEPT_WORKFLOW` map (allowed transitions, end-states, mirrored high-level status), `DISCIPLINE_FIELDS` definition.

**`src/components/DepartmentBadge.tsx`** (new)
- Colored pill with dept icon + label, mirrors `StatusBadge` styling.

**`src/components/tasks/CreateTaskDialog.tsx`** (edit)
- Add **Department \*** select (required). On change, replace the free-text `task_type` row with the dept-specific discipline fields rendered from `DISCIPLINE_FIELDS[department]` (drawing_no for design, supplier for procurement, etc.).
- Save `department`, initial `dept_status` (first stage of the chosen workflow), and `discipline_meta`.

**`src/pages/TaskDetail.tsx`** (edit)
- Header: add `<DepartmentBadge>` next to the existing `StatusBadge`.
- Replace the high-level status select with a **two-row control**: dept stage select (driven by `DEPT_WORKFLOW[department].next(current)`) on top, read-only mirror of the high-level `status` underneath.
- New **"Discipline" card** rendering `discipline_meta` keys for that dept.
- New **"Dependencies" card**: list predecessors with status dot + dept badge; `is_hard_block` rows show a 🔒 icon. "Add predecessor" picker (admin/PM only) with a `Hard block` checkbox. Soft-blocked successors show a yellow warning banner above the stage select.

**`src/pages/Tasks.tsx`** (edit)
- Add **Department filter** chip row (multi-select).
- Add `<DepartmentBadge>` in list rows and a small dept dot on Kanban cards.
- Sort/filter by `department` available in URL query so deep-links from notifications work.

**Settings → Department members** (new tab in `src/pages/Settings.tsx`, admin-only)
- Table of `department_members` with add/remove, role_in_dept select. Inline search by user.

> Out of V1 (deferred): swimlane Kanban per department, dependency graph SVG, Reports dept tab. All three are explicitly listed as V2 because the user picked only the picker + chip option.

---

### 7. Migration steps

1. Create `department` and `dept_status` enums.
2. Create `department_members` table + RLS + audit trigger.
3. ALTER `tasks` add `department`, `dept_status`, `discipline_meta`.
4. ALTER `task_predecessors` add `is_hard_block`, `note`.
5. Create helper `is_dept_member(uuid, department, text)` (SECURITY DEFINER).
6. Create triggers `validate_dept_status_transition`, `validate_task_start_against_predecessors`.
7. Extend tasks UPDATE policy with department-membership clause.
8. Extend `notify_task_status_change` with handoff notifications; add new notification_type values.

Existing tasks (with NULL `department`) stay editable by current planners — nothing breaks. New tasks created in the UI must pick a department.

---

### 8. Files

**New**
- `src/lib/departmentMeta.ts`
- `src/components/DepartmentBadge.tsx`
- `src/components/tasks/DisciplineMetaFields.tsx` (renders the dept-specific JSON form)
- `src/components/tasks/TaskDependenciesCard.tsx`
- `src/components/settings/DepartmentMembersTab.tsx`

**Edited**
- `src/components/tasks/CreateTaskDialog.tsx` — dept picker + discipline fields + initial dept_status
- `src/pages/TaskDetail.tsx` — dept badge, dept-stage select, discipline card, dependencies card
- `src/pages/Tasks.tsx` — dept filter chip, badge in rows
- `src/pages/Settings.tsx` — new admin tab
- `src/integrations/supabase/types.ts` — auto-regenerated after migration

**DB migration**
- Single migration creating enums, tables, columns, helper function, triggers, RLS, audit.

---

### 9. Acceptance checklist

- Admin can add a user as `architecture/approver` and that user can move an Architecture task into `dept_approved`; a non-member cannot.
- Procurement task moves through `request → rfq → po_issued → delivered`; trigger blocks `po_issued → delivered` if no `po_number` in `discipline_meta` (validated by trigger).
- Construction task with a hard-block predecessor cannot transition to `in_progress` until predecessor is `dept_approved`/`issued`. Same setup with `is_hard_block=false` succeeds but logs a warning + sends `task_dependency_warning` notification.
- Cross-department user (e.g. MEP-only member) sees a Construction task as read-only — no Edit button on TaskDetail.
- Tasks list filter by Department returns the right rows; dept chips render with the correct color tokens.
- Audit log records department changes, dept_status transitions, member grants.

---

### 10. Out of scope for V1 (acknowledged)

- Per-department Kanban swimlanes.
- Dependency graph visualization on TaskDetail.
- Department dashboard / KPI tab in Reports.
- Department-aware document categories (Design/Procurement/Construction docs) — current `documents.category` text field stays as-is.
- Project-scoped department membership (every grant is org-wide in V1).
