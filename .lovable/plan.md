## Dependency & Scheduling Module — Plan

Builds on what already exists (`task_predecessors`, `tasks.planned_start/planned_end/actual_*/progress_pct/status`, `WbsGantt`, `TaskDependenciesSection`, holidays). No renames, no breaking changes.

---

### 1. Database (migration)

**`tasks` — add columns**
- `baseline_start date`, `baseline_end date` (nullable)
- `planned_duration_days int generated always as (...) stored` — working-day count helper, computed in app instead if generated columns get tricky with holidays. Decision: compute in app, do NOT add a generated column (holidays vary by project).
- Add `'blocked'` to `task_status` enum.
- Allow status transition `assigned ↔ blocked`, `open ↔ blocked` in `validate_task_status_transition()`.

**`schedule_calculation_logs` (new)**
```
id, project_id, triggered_by_task_id, triggered_by_user, trigger_reason text,
affected_count int, payload jsonb, -- {before:[{id,start,end}], after:[...]}
created_at
```
RLS: anyone authenticated can SELECT; INSERT only by admin/PM/engineer/supervisor.

**`task_predecessors` — add validation trigger**
- No self-dependency (`task_id != predecessor_id`)
- No duplicate (already enforced by intended unique key — add `unique(task_id, predecessor_id)`)
- Same project (join check)
- No cycle: recursive CTE walking predecessors, raise on `task_id` reappearing.

**Skip** new `task_dependencies`, `task_schedule_snapshots(_items)` tables — using baseline columns + log table covers the requirement.

### 2. Scheduling utility (`src/lib/schedule.ts`)
Pure functions, unit-testable:
- `computeFinish(start, durationDays, holidays) → date`
- `computeStart(predEnd, relation, lagDays, holidays) → date` for FS/SS/FF/SF
- `cascade({tasks, deps, changedTaskId, holidays}) → Map<id, {newStart, newEnd}>` — BFS over successors, applies max constraint when multiple predecessors, stops when no further shift needed.
- `taskBlockedStatus(task, predecessors, predTasks) → 'blocked' | null` — blocked if any hard-block predecessor not in `completed/approved/closed`.

### 3. Status logic
- New hook `useTaskBlockedness(projectId)` returns Map<taskId, 'blocked' | 'ready' | null>.
- TaskDetail "Start task" button disabled when blocked (with tooltip listing blocking predecessors).
- StatusBadge gets `blocked` variant (destructive tone).
- Background: when a predecessor moves to completed/approved, dependent tasks recompute on next load (no trigger needed for v1).

### 4. Cascade preview UI
New component `ScheduleCascadeDialog`:
- Triggered when user edits `planned_end` (or duration) in TaskDetail / inline-edit / Gantt drag.
- Calls `cascade()` client-side using already-loaded tasks + `task_predecessors`.
- Shows table: code | title | old start→new start | old end→new end | shift days.
- "Apply" → batch `update tasks` + insert `schedule_calculation_logs` row with before/after payload.
- "Cancel" → revert local state.

### 5. Gantt drag-to-adjust (`WbsGantt.tsx`)
- Add pointer handlers on each task bar:
  - drag body = move (shift start & end equally)
  - drag left edge = change start
  - drag right edge = change end
- Snap to day grid (`dayWidth`).
- On drop: open ScheduleCascadeDialog with proposed change.
- Permission gate: only admin / project_manager / engineer / supervisor; others get read-only bars.
- Visual: blocked tasks render with diagonal-stripe pattern + destructive border; baseline shown as thin gray bar behind planned bar when baseline_* present.

### 6. Task Detail — Dependencies tab improvements
`TaskDependenciesSection.tsx` already covers predecessors. Add:
- Successors list (query `task_predecessors where predecessor_id = taskId`).
- Per-row status badge: ✓ satisfied / ⚠ pending / ⛔ blocking.
- Cycle/duplicate errors surfaced from new DB trigger as friendly toasts.

### 7. Schedule Management screen
Reuse existing `/wbs` Gantt tab — add a third tab **"Schedule"** with:
- Filters: discipline (department), status, WBS subtree, search.
- Dense task table with all columns from spec (code, name, WBS path, discipline, status, planned start/finish, duration, actual start/finish, predecessor/successor counts, delay days, progress %).
- Click row → opens TaskDetail drawer.
- "Set baseline" button (admin/PM): copies current planned_start/end into baseline_start/end for all project tasks, with confirm.

### 8. Permissions
- Edit dependencies / dates: admin, project_manager, engineer, supervisor (matches existing `task_predecessors` insert policy).
- Set/clear baseline: admin, project_manager only.
- Everyone authenticated: view.

### 9. Files

**New**
- `supabase/migrations/<ts>_dependency_scheduling.sql`
- `src/lib/schedule.ts` (cascade + blocked logic)
- `src/components/schedule/ScheduleCascadeDialog.tsx`
- `src/components/schedule/ScheduleTable.tsx`
- `src/components/schedule/SetBaselineButton.tsx`
- `src/hooks/useTaskBlockedness.ts`

**Edited**
- `src/components/wbs/WbsGantt.tsx` — drag handlers, baseline bars, blocked styling
- `src/components/wbs/WbsGanttTree.tsx` — add Successors/Predecessors count columns (optional, behind toggle)
- `src/components/tasks/TaskDependenciesSection.tsx` — add successors panel, status badges
- `src/pages/Wbs.tsx` — add "Schedule" tab
- `src/pages/TaskDetail.tsx` — disable Start when blocked, show baseline vs planned variance
- `src/components/StatusBadge.tsx` + `src/lib/taskMeta.ts` — `blocked` status
- `src/hooks/useWbsGantt.ts` — fetch baseline_* + dep counts
- `src/lib/scheduleMeta.ts` — extend `taskStatus()` with blocked input

### 10. Out of scope (this round)
- Multiple named snapshots (only single baseline).
- Server-side recompute trigger (cascade is client-driven with audit log).
- Resource leveling / critical path highlighting (can be a follow-up).

---

### Open assumption
Adding `'blocked'` to the `task_status` enum is safe because nothing currently produces it. If you'd rather keep it as a *derived* state (computed in UI only, not stored), say so before I implement and I'll skip the enum change and the DB transitions.