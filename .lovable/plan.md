# Department Test-Data Seed Plan

Goal: every department feature (member assignment, approver-only transitions, hard/soft dependency blocking, WBS ACL, dept chips/filters) is testable end-to-end with one click.

---

## 1. Current gaps (audited)

| Area | Now | Needed |
|---|---|---|
| Demo users | 7 (1 per app_role) | + 5 dept approvers (one per dept) |
| `department_members` | 1 row | ~17 rows covering all 5 depts × member/reviewer/approver |
| `project_members` | **0** ⚠ | Add all 7 base users to both projects |
| `wbs_nodes` | 8 (Hattha only, partial) | Full Building → Level → Zone → Sub-zone for **both** projects |
| `wbs_assignments` | 1 row | Per-zone view/edit grants to specific demo users |
| Tasks with `department` / `dept_status` | **0 / 10** ⚠ | ~30 tasks at varied dept stages, each linked to a WBS node |
| `task_predecessors` | **0** ⚠ | A cross-dept chain (Arch → Struct → Procurement → Construction) with both hard and soft blocks |
| `task_assignments` linking dept members | sparse | Each new task assigned to the matching dept user(s) |

---

## 2. New demo users (5, dept approvers)

Created via the edge function (needs `auth.users` write):

| Email | Name | app_role | Dept membership |
|---|---|---|---|
| `aria.architect@demo.test` | Aria Architect | engineer | architecture / **approver** |
| `stella.struct@demo.test` | Stella Struct | engineer | structure / **approver** |
| `marco.mep@demo.test` | Marco MEP | engineer | mep / **approver** |
| `pierre.proc@demo.test` | Pierre Procurement | project_manager | procurement / **approver** |
| `connor.constr@demo.test` | Connor Construction | supervisor | construction / **approver** |

Password for all: `Demo1234!` (matches existing `seed-demo-users` convention). All auto-confirmed.

Existing users get filled in as members/reviewers so cross-dept access can be tested:

| User | Department roles added |
|---|---|
| Erin Engineer | architecture (member), structure (member, *kept*), mep (reviewer) |
| Pat Planner (PM) | procurement (reviewer), construction (reviewer) |
| Sam Supervisor | construction (member), structure (reviewer) |
| Quinn Inspector | construction (reviewer), mep (member) |
| Wes Worker | construction (member) |

Result: every dept has ≥1 member, ≥1 reviewer, exactly 1 approver. Wes can act on construction tasks but not approve; Erin can edit Architecture but not approve, etc.

---

## 3. WBS expansion (idempotent migration)

**Riverside Tower (PRJ-001)** — currently empty:
```
RT-A  Tower Building (building)
  L01 Ground Floor (level)
     Z01 Lobby Zone (zone)
     Z02 Retail Zone (zone)
  L02 Office Level 1 (level)
     Z01 Open Office (zone)
     Z02 Meeting Rooms (zone)
  L03 Office Level 2 (level)
     Z01 Open Office (zone)
RT-B  Annex Building (building)
  L01 Service Level (level)
     Z01 MEP Plant Room (zone)
```

**Hattha Bank Tower (PRJ-002)** — extend existing tree:
```
BA > 01-GF > Z01 Lobby (new sub-zone)
BA > 01-GF > Z02 Banking Hall (new sub-zone)
BA > 02-L1 > Z01 Office East (new sub-zone)
BA > 02-L1 > Z02 Office West (new sub-zone)
BA > 03-L2 > Z01 Trading Floor (new sub-zone)
BB Parking Building > L01 Basement P1 > Z01 Parking Bay A (new level + zone)
```

Insert with `ON CONFLICT (project_id, code, parent_id) DO NOTHING` so re-runs are safe. The existing `wbs_compute_path` trigger fills `path` / `path_text` / `depth` automatically.

### WBS assignments

Grant per-zone access so we can prove the WBS ACL works alongside dept ACL:

- Erin → `view` on RT-A (subtree inherits)
- Sam → `edit` on BA > 02-L1 (and all its zones via ancestor walk in `wbs_user_can`)
- Marco MEP → `edit` on RT-B > L01 (MEP plant room subtree)
- Pierre → `manage` on BA > 02-L1 > Z01 (so he can also reassign WBS there)
- Wes → `view` only on BA > 01-GF (cannot edit even though he's a construction member elsewhere)

---

## 4. Task seeding (~30 tasks)

For **each project** × **each department** = 6 tasks per dept (3 per project):

### Architecture (6 tasks across both projects)
- 1 task at `draft`
- 1 at `internal_review` (assigned to Erin, awaiting Aria's approval)
- 1 at `dept_approved` (already approved by Aria, ready to issue)
- `discipline_meta`: `{ drawing_no: "A-101", revision: "Rev. 0" }`

### Structure (6)
- 1 `draft`, 1 `coordination`, 1 `issued`
- `discipline_meta`: `{ drawing_no: "S-201", revision: "Rev. 0" }`

### MEP (6)
- 1 `draft`, 1 `internal_review`, 1 `coordination`
- `discipline_meta`: `{ drawing_no: "M-301", revision: "Rev. 0" }`

### Procurement (6)
- 1 `request`, 1 `rfq`, 1 `po_issued`
- `discipline_meta`: `{ supplier: "Acme Steel Co.", po_number: "PO-0001", rfq_due: "2026-05-15" }`

### Construction (6)
- 1 `assigned`, 1 `in_progress`, 1 `inspection`
- `discipline_meta`: `{ inspection_ref: "INS-0001", lot_no: "Lot-12" }`

Every task:
- Has a `code` like `T-ARCH-001` (we currently leave code null — fix that here for readability)
- Is anchored to a **WBS node** (`wbs_node_id` required)
- Is assigned to the matching dept member via `task_assignments`
- Tasks at end-states (`dept_approved`, `issued`, `po_issued`, `site_approved`, `completed`) bypass the trigger by being inserted with the final `dept_status` directly **and** `bypass_validation` is not possible — so seed will insert at the *initial* stage and then run UPDATEs in the right approver session. To keep this purely server-side we'll use `SECURITY DEFINER` functions: a one-off `seed_advance_task(task_id, target_stage, approver_id)` helper that temporarily uses the approver's id (since the trigger checks `auth.uid()`, we'll instead loosen the check by adding a `seed_mode` GUC for the duration of the seed, then unset).

> **Cleaner alternative**: temporarily DISABLE the `trg_validate_dept_status` trigger inside the seed transaction, do all the inserts, then re-enable. Same for `trg_validate_dependencies`. This is the standard "seed bypass" pattern and avoids new SECURITY DEFINER helpers.

### Cross-dept dependency chain (one canonical example per project)

In Hattha BA > 02-L1 > Z01 Office East:
1. `T-ARCH-002` (Architecture, `dept_approved` → will be `issued`)
2. `T-STRUCT-002` (Structure) — predecessor: ARCH-002, **hard block**
3. `T-PROC-002` (Procurement) — predecessor: STRUCT-002, **hard block**
4. `T-CONSTR-002` (Construction) — predecessors: STRUCT-002 (hard), PROC-002 (soft)

Test cases this enables:
- Try to start CONSTR-002 while STRUCT-002 is `coordination` → blocked (hard)
- Move STRUCT to `issued` then start CONSTR while PROC-002 still `rfq` → succeeds (soft warning only)
- Approver gating: only Aria can move ARCH-002 → `issued`; Erin (member) gets the trigger error

In Riverside RT-A > L01 > Z02 Retail Zone we'll seed a parallel but simpler chain (Arch → Construction only) with a soft block, so QA can compare.

---

## 5. Delivery — split between migration and edge function

### Migration (`*_seed_departments_full.sql`)
1. Insert WBS nodes for both projects (idempotent).
2. Insert `wbs_assignments` (idempotent on `(user_id, wbs_node_id, permission)`).
3. Insert `project_members` for the 7 base users in both projects.
4. Wrap in a single transaction that:
   - `ALTER TABLE tasks DISABLE TRIGGER trg_validate_dept_status, trg_validate_dependencies;` (re-enable in same tx)
   - Inserts the ~30 dept tasks with target `dept_status`, `discipline_meta`, `wbs_node_id`, `code`.
   - Inserts `task_assignments` linking each task to its dept member(s).
   - Inserts `task_predecessors` (with `is_hard_block` flag) for the dependency chain.
   - Re-enables the triggers.
5. **Note**: dept_member rows for the 5 NEW approvers are inserted by the edge function once those auth.users exist; dept_member rows for existing users are added in the migration.

### Edge function `seed-departments-demo` (admin-only, JWT-validated)
- Calls `supabase.auth.admin.createUser` for each of the 5 new dept approvers (skips if email already exists).
- Inserts their `profiles`, `user_roles`, and `department_members` rows.
- Re-runnable: every step uses `upsert` / `ON CONFLICT DO NOTHING`.
- Returns a JSON summary (created/skipped per user) so we can log it in the UI.

### UI hook
Add a "Seed department test data" button to **Settings → Departments tab** (admin-only). Calls the edge function then refreshes the table. No production risk because the function only operates on the `*.demo.test` email domain.

---

## 6. Files to create / edit

**New**
- `supabase/migrations/<timestamp>_seed_departments_full.sql`
- `supabase/functions/seed-departments-demo/index.ts`
- (optional) `supabase/functions/seed-departments-demo/index.test.ts` — smoke test

**Edited**
- `src/components/settings/DepartmentMembersTab.tsx` — add the "Seed demo data" button + toast feedback
- (no schema changes — existing types are sufficient)

---

## 7. Acceptance checklist after seed runs

- Settings → Departments shows 17 rows across all 5 depts with 1 approver each.
- WBS page for both projects shows Building → Level → Zone tree (~14 nodes total).
- Tasks list filtered by Department=Architecture shows 6 rows with colored chips and dept stages.
- Logging in as **Erin** (Architecture member, not approver): can edit ARCH-001 (`draft`) but moving ARCH-002 to `issued` returns the trigger error "Only architecture approvers can move task to issued".
- Logging in as **Aria**: same transition succeeds.
- Logging in as **Connor**: starting CONSTR-002 while STRUCT-002 is `coordination` returns "Blocked by T-STRUCT-002 — … (structure)". After moving STRUCT-002 to `issued` (as Stella), CONSTR-002 starts successfully but logs a soft warning because PROC-002 is still `rfq`.
- Logging in as **Wes**: cannot edit any Architecture task (dept-membership RLS), can post updates on his assigned construction task.
- Audit log (admin) shows the dept_status transitions and member grants from the seed.

---

## 8. Out of scope

- Seeding `task_updates`, `timesheet_entries`, `documents` for dept tasks — easy to add later if you want richer reports.
- Per-project department scoping (still org-wide in V1, per the earlier dept plan).
- Removing seed data via a "Reset demo" button — can be added once you confirm the seed works.
