# WBS Scheduling — Phase 1

Add a time-enabled scheduling layer on top of the existing WBS + tasks, so every WBS node shows its schedule rolled up from the tasks underneath. Dependencies stay at the task level, with a relation type and lag. A Gantt view is added alongside the existing tree.

Out of scope for Phase 1 (can be added later): CPM critical path, baselines, auto-scheduling, per-task calendars, Zone Timeline view, delay risk reports, drag-to-reschedule.

## What changes for the user

**WBS page**
- Each tree row gets a small inline schedule strip: planned start → finish, % complete, and a colored dot for status (on track / at risk / late / done). All computed from descendant tasks.
- Detail panel adds a **Schedule** card: planned window, actual window, duration in working days, total tasks, % complete, count of late tasks. All read-only — to change dates you edit the underlying task.
- A new top-level tab on the WBS page: **Gantt**.

**Tasks**
- Existing fields used as-is: `planned_start`, `planned_end`, `actual_start`, `actual_end`, `progress_pct`. No schema change to dates.
- Task edit/create dialog gets a clearer **Schedule** section (start, finish, duration auto-fill) and a **Dependencies** section with predecessor picker, relation type (FS/SS/FF/SF), and lag in days.
- Soft warning shown if a task starts before its FS predecessor finishes (we already surface flags; this just adds a new one). No hard block in Phase 1 beyond the existing `is_hard_block` flag.

**Gantt view (new)**
- Grouped by WBS node (Building → Level → Zone → Task), collapsible.
- Bars for each task using planned dates; lighter overlay for actual progress.
- Dependency arrows between task bars (FS/SS/FF/SF rendered with the right anchor points).
- Zoom: day / week / month. Today marker. Horizontal scroll, sticky left column with task name + WBS path.
- Read-only in Phase 1 (no drag). Click a bar opens the task detail.
- Project holiday list shaded as non-working columns.

**Project holidays (new, lightweight)**
- Settings → Project gets a small "Holidays" list (date + label). Used to skip days when computing working-day duration in the Gantt and in WBS roll-ups.

## Technical plan

### DB changes (migration)

1. `task_predecessors` — extend:
   - `relation_type` enum `('FS','SS','FF','SF')` default `'FS'`.
   - `lag_days` integer default `0` (can be negative for lead).
   - Keep `is_hard_block` and `note`.

2. New table `project_holidays`:
   - `id uuid pk`, `project_id uuid not null`, `holiday_date date not null`, `label text`, `created_by uuid`, `created_at timestamptz`.
   - Unique `(project_id, holiday_date)`.
   - RLS: SELECT for any authenticated project viewer; INSERT/UPDATE/DELETE for admin or project_manager.

3. Optional view `wbs_node_schedule` (read-only) that aggregates per node from descendants:
   - `min(planned_start)`, `max(planned_end)`, `min(actual_start)`, `max(actual_end)`, `avg(progress_pct)` weighted by `estimated_hours`, count of tasks, count of late tasks (`actual_end is null and planned_end < current_date`), earliest critical issue.
   - Implemented with a recursive CTE over `wbs_nodes`.

No changes to `tasks`, `wbs_nodes`, calendars, or RLS for tasks.

### Frontend

- `src/lib/scheduleMeta.ts` — types for relation kinds, status enum (`on_track | at_risk | late | done | not_started`), helpers: `workingDaysBetween(start, end, holidays)`, `taskStatus(task, today)`, `rollupNode(node, tasks)`.
- `src/hooks/useWbsSchedule.ts` — fetches all tasks for the active project once, builds a `Map<wbsNodeId, Rollup>` for instant lookup in the tree and detail panel.
- `src/hooks/useProjectHolidays.ts` — fetch + cache holiday dates.
- `src/components/wbs/WbsScheduleStrip.tsx` — inline strip used inside `WbsTree` rows.
- `src/components/wbs/WbsScheduleCard.tsx` — detail panel card on `Wbs.tsx`.
- `src/components/wbs/WbsGantt.tsx` — Gantt view. Rendered with HTML/CSS grid (no heavy chart lib). Day/week/month zoom via column width. Dependency arrows drawn with absolutely-positioned SVG overlay.
- `src/components/tasks/TaskScheduleSection.tsx` — schedule fields inside `CreateTaskDialog` and task edit. Auto-fills `planned_end` from start + duration and vice versa.
- `src/components/tasks/TaskDependenciesSection.tsx` — list + add/remove predecessors with relation/lag, used in task edit.
- `src/components/settings/ProjectHolidaysTab.tsx` — small CRUD list of holidays, added under Settings.
- `src/pages/Wbs.tsx` — wrap existing content in tabs: `Tree` (current) + `Gantt` (new). Wire schedule strip into tree rows and the Schedule card into the detail panel.

### Status logic

Per task, given today:
- `done` — `actual_end` set.
- `late` — `planned_end < today` and not done.
- `at_risk` — in progress and `progress_pct < expected_pct` (expected = elapsed working days / total working days × 100).
- `on_track` — in progress and meeting expected.
- `not_started` — no `actual_start`.

Per WBS node: worst status of descendants wins (late > at_risk > on_track > done > not_started).

### Roll-up

For each WBS node, walk descendants once on the client (we already load all nodes + we'll load all tasks for the project):
- `planned_start = min(task.planned_start)`
- `planned_end   = max(task.planned_end)`
- `progress_pct  = sum(task.progress * task.estimated_hours) / sum(task.estimated_hours)` (fallback to plain mean if no estimates)
- `late_count`, `total_count`

### Dependency rendering in Gantt

For each predecessor link, anchor source/target on the bar according to relation:
- FS: source right → target left
- SS: source left → target left
- FF: source right → target right
- SF: source left → target right
Apply `lag_days` as a horizontal offset on the target anchor.

## File list

Created:
- `supabase/migrations/<ts>_wbs_scheduling_phase1.sql`
- `src/lib/scheduleMeta.ts`
- `src/hooks/useWbsSchedule.ts`
- `src/hooks/useProjectHolidays.ts`
- `src/components/wbs/WbsScheduleStrip.tsx`
- `src/components/wbs/WbsScheduleCard.tsx`
- `src/components/wbs/WbsGantt.tsx`
- `src/components/tasks/TaskScheduleSection.tsx`
- `src/components/tasks/TaskDependenciesSection.tsx`
- `src/components/settings/ProjectHolidaysTab.tsx`

Edited:
- `src/pages/Wbs.tsx` — add Gantt tab, schedule strip, schedule card.
- `src/components/wbs/WbsTree.tsx` — render `WbsScheduleStrip` per row.
- `src/components/tasks/CreateTaskDialog.tsx` — embed schedule + dependency sections.
- `src/pages/TaskDetail.tsx` — show dependencies + schedule.
- `src/pages/Settings.tsx` — add Holidays tab.

## What you'll be able to do after Phase 1

- See planned vs actual schedule and % complete on every Building / Level / Zone, computed live from tasks.
- Manage task dependencies with FS/SS/FF/SF + lag, with a visible warning when a task starts before its predecessor finishes.
- Open a Gantt that groups by WBS, shows dependency arrows, supports day/week/month zoom, and shades project holidays.
- Maintain a per-project holiday list that feeds working-day math.

When you're happy with Phase 1, the natural Phase 2 is: server-side CPM + critical path highlighting + delay flags, then baselines, then drag-to-reschedule and auto-schedule.
