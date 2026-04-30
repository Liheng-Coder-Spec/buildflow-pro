## WBS / Gantt — UX & Layout Improvements

### 1. Flatten task-level rows
In `WbsGanttTree.tsx` and `WbsGantt.tsx`:
- When walking the WBS tree, if a node is a **leaf node** (no child nodes — only tasks), skip rendering its row and render its tasks directly under the parent at the same depth.
- Task rows show task code + title only (no repeated `Building > Level > Zone >` breadcrumb prefix, since the visual hierarchy already conveys it).
- Container nodes (Building / Level / Zone with children) remain as collapsible header rows.

### 2. Add data columns to the left tree pane
Convert the left "WBS / Task" pane in `WbsGanttTree.tsx` from a single-column tree into a compact table with sticky header and these columns:

| Column | Content | Width |
|---|---|---|
| Name | Code + name (indented tree) | flex |
| Duration | Working-day count between planned_start/end (uses `workingDaysBetween` from `scheduleMeta.ts`, excludes holidays) | 70px |
| Start | `planned_start` formatted `MMM d` | 80px |
| Finish | `planned_end` formatted `MMM d` | 80px |
| Status | Status dot + label (On Track / At Risk / Late / Done) using `taskStatus()` + `SCHEDULE_STATUS_DOT` | 90px |
| % | Progress bar + `progress_pct` number | 80px |

For container node rows, columns show **rolled-up values** from `useWbsSchedule` (`rollupByNode`): min start, max finish, sum of durations, weighted progress, worst status.

### 3. Full-width layout with small side gaps
In `src/pages/Wbs.tsx`:
- When `mainView === "gantt"`, render the Gantt outside the standard page `Card` wrapper and stretch it edge-to-edge with only `px-2` (≈8px) gutters left/right and a slim top gap.
- Adjust the parent container (`space-y-4 h-[calc(100vh-9rem)]`) so the Gantt can use the full available width — keep the page header compact.
- Default split between left (tree+columns) and right (timeline) panels: 45% / 55% (currently 50/50).

### 4. "Today" jump button
In the Gantt toolbar (`WbsGantt.tsx`):
- Add a **Today** button next to the Day/Week/Month zoom buttons.
- Clicking it scrolls the timeline horizontally so today's date is centered in the visible area. Uses a ref on the scrollable container and computes `scrollLeft = todayX - container.clientWidth / 2`.
- Today line and dot remain as-is.

### Files to edit
- `src/components/wbs/WbsGanttTree.tsx` — flatten leaf nodes, convert to multi-column table layout, add column header row aligned with timeline header height.
- `src/components/wbs/WbsGantt.tsx` — flatten leaf nodes (mirror logic), add Today button + scroll ref.
- `src/pages/Wbs.tsx` — full-bleed layout for Gantt view, adjust default panel sizes.
- `src/lib/scheduleMeta.ts` — reuse existing `workingDaysBetween`, `taskStatus`, rollup helpers; no schema changes.

### Out of scope
No DB changes. No edits to dependency arrows logic, zoom levels, or holiday calendar.
