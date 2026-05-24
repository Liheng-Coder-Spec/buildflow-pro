# Plan: Import Tasks from Master Task Template

Add a second action button on **Work / Tasks** (next to the existing "New Task") that lets users instantiate a saved template from **Master Libraries / Task Template** into the active project.

## UI

**Tasks page header** — add `<ImportFromTemplateDialog />` button beside `<CreateTaskDialog />`. Label: "From Template", icon `FolderInput`, variant `outline`.

**New dialog** `src/components/tasks/ImportFromTemplateDialog.tsx`:

1. **Template picker** — Select dropdown loading active rows from `master_task_templates` (code · name · discipline · phase). Shows description + grouping method preview when selected.
2. **WBS location** — required, reuse `<WbsNodePicker />`.
3. **Grouping inputs** — driven by template's `grouping_method`:
   - *Generate by Quantity* → number input "Quantity" + unit (read-only, from template) → creates N task-groups
   - *Generate by Location* → free-text list (one location per line) → one task-group per location
   - *Generate by Floor / Level* → free-text list (e.g. "L1, L2, L3") → one task-group per floor
   - *Single Task Package* → no extra input, one task-group
4. **Planned start date** — optional date input; used to compute each step's `planned_start`/`planned_end` from `duration`.
5. Footer: Cancel / Import.

## Import logic

For each generated **group** (qty index, location, floor, or just 1):

1. Load template steps from `master_task_template_steps` (ordered by `sort_order`).
2. For each step, insert one row into `tasks` with:
   - `project_id` = active project, `wbs_node_id` = picked node, `location_zone` = wbs path (+ suffix like ` · Loc: A` or ` · Qty 3 of 10` when grouping applies)
   - `title` = `${step.step_name}` (prefixed with template name when single-step or suffixed with group label)
   - `description` = template description + step code
   - `task_type` = `"other"`, `priority` = `"medium"`, `status` = template `default_task_status` mapped to TaskStatus (`Open`→`open`, `Assigned`→`assigned`, `On Hold`→`on_hold`)
   - `department` = derived from template `discipline` prefix (STR→structural, ARC→architecture, MEP→mep), with sensible `dept_status`
   - `workflow_type` / `category` = best-effort default (`construction` / first category) — user can refine later
   - `estimated_hours` = parsed from `step.duration` (e.g. "1 day" → 8h, "2 days" → 16h)
   - `planned_start`, `planned_end` rolling forward from the optional start date using the parsed duration
   - `created_by` = current user
3. Show progress toast; on success: close dialog, refresh task list, audit-log a `TASK_TEMPLATE_IMPORT` event.

## Files

- **New** `src/components/tasks/ImportFromTemplateDialog.tsx`
- **Edit** `src/pages/Tasks.tsx` — render the new dialog button beside `CreateTaskDialog` and pass `onCreated` to refetch.

## Out of scope

- Template **dependencies** between steps (would need new task_dependencies inserts) — defer to v2; show a one-line note in the dialog.
- Template **checklist/documents** — not copied in v1 (no per-task tables exist for these yet).
- Editing templates from this dialog — users go to Master Libraries as before.
