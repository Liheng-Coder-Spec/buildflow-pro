## Goal
Enrich the Reports page with two new dimensions:
1. **By-department status breakdown** (stacked bars per department).
2. **Per-member table grouped by department** with full lifecycle status counts (Open / In Progress / Pending / Approved / Rejected / Completed / Closed / Overdue).
3. **Excel export** updated to mirror these views.

---

## 1. Data shape (in `src/pages/Reports.tsx`)

Extend the existing single-pass aggregation that already loads `tasks`, `task_assignments`, `timesheet_entries`, `profiles`, and `project_members`.

**Additionally fetch:** `department_members (user_id, department, role_in_dept)` so each member can be grouped under their department(s). Tasks already carry a `department` column — use that for the dept-level breakdown.

**New aggregate maps:**
- `deptAgg: Map<Department, { total, open, assigned, in_progress, pending_approval, approved, rejected, completed, closed, overdue, hours, members:Set<string> }>` — driven by `tasks.department` plus assignments + timesheets.
- Per-member rows extended with full status counters: `open, assigned, in_progress, pending_approval, approved, rejected, completed, closed, overdue` and a `department: Department | null` (first dept membership, or null if none).

Members with multiple departments → show under each department group (duplicate row) so totals reconcile, with a footnote.

---

## 2. New components

### `src/components/reports/DepartmentBreakdown.tsx` (new)
- One row per department from `DEPARTMENT_LABELS`.
- Left: `<DepartmentBadge>` + member count + total tasks.
- Middle: horizontal **stacked bar** built with flex `<div>`s using existing tone tokens (`bg-info`, `bg-warning`, `bg-success`, `bg-destructive`, `bg-muted`) — segments for Open, In Progress, Pending, Approved/Completed, Overdue. Tooltip on each segment with count.
- Right: completion %, overdue badge (if >0), total hours.
- Empty departments rendered greyed-out for completeness.

### `src/components/reports/MemberPerformanceTable.tsx` (modify)
- Add `department: Department | null` to `MemberRow`.
- Replace flat table with **grouped sections by department** using a collapsible/section header per dept showing dept subtotals (tasks, done, overdue, hours).
- Add columns: **Open · In Prog · Pending · Approved · Rejected · Done · Closed · Overdue · On-time % · Hours**. Use compact tabular-nums; allow horizontal scroll on narrow viewports.
- Search box filters across all groups; sort still works within each group.
- Members with no department → "Unassigned" group at bottom.

### `src/components/reports/MemberDetailSheet.tsx` (small tweak)
- Show department badge(s) next to the member name (read from new `member.department`).

---

## 3. Reports page wiring (`src/pages/Reports.tsx`)
- Render new `<DepartmentBreakdown data={deptRows} />` between `<OrgKpis>` and the per-member card.
- Pass extended `MemberRow[]` (with department + full status counts) into `<MemberPerformanceTable>`.
- Existing project/date filters continue to constrain everything.

---

## 4. Excel export (`supabase/functions/export-member-report-xlsx/index.ts`)
- **New sheet** "By Department": Department | Members | Tasks | Open | In Prog | Pending | Approved | Rejected | Done | Closed | Overdue | Completion % | Hours. Same header styling as existing sheets, totals row at bottom, `0.0%` format, frozen header.
- **Member Performance sheet**: insert new columns `Open / In Progress / Pending / Approved / Rejected / Closed` between existing Completed and Overdue. Keep totals formulas, expand column letters accordingly. Add `Department` column right after `Job Title`.
- Tasks sheet: add `Department` and `Dept Status` columns (already on `tasks`).
- Re-deploy the function after edits (auto-deploys).

---

## 5. Notes / edge cases
- `tasks.department` is nullable — bucket those into an "Unassigned" dept row in the breakdown.
- A member may belong to multiple departments → counted in each group; org-wide member count still uses unique IDs.
- Status counts in the breakdown bar use the same `today < planned_end && status not closed` rule for overdue, identical to existing logic.
- All-new logic stays client-side (no schema changes, no migrations).

---

## Files touched
- **New**: `src/components/reports/DepartmentBreakdown.tsx`
- **Edit**: `src/pages/Reports.tsx`, `src/components/reports/MemberPerformanceTable.tsx`, `src/components/reports/MemberDetailSheet.tsx`
- **Edit**: `supabase/functions/export-member-report-xlsx/index.ts`