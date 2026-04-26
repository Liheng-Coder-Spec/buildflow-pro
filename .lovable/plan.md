## WBS V1 — Implementation Plan

A flexible Work Breakdown Structure that anchors every new task to a precise location in the project, with full WBS-based access control and a dedicated management page.

---

### 1. Data model (new tables)

**`wbs_node_type` enum**
`building`, `level`, `zone`, `sub_zone`, `area`, `system`, `package`, `other` — extensible later.

**`wbs_nodes`** (self-referencing tree)
- `id uuid pk`
- `project_id uuid` (FK → projects)
- `parent_id uuid null` (self-FK; null = project root child)
- `node_type wbs_node_type`
- `name text`
- `code text` — **manual, required**, validated unique per project
- `path text[]` — denormalized array of ancestor codes for fast filter/breadcrumb (`{PRJ-A, BLDG-1, L05, Z03}`), maintained by trigger
- `path_text text` — flattened display path (`PRJ-A > BLDG-1 > L05 > Z03`), trigger-maintained
- `depth int` — trigger-maintained
- `sort_order int` — for drag-reorder within siblings
- `description text null`
- `created_by`, `created_at`, `updated_at`
- Constraints: `UNIQUE(project_id, code)`; trigger blocks cycles (parent cannot be a descendant) and enforces `parent_id` belongs to the same `project_id`.
- Indexes: `(project_id, parent_id, sort_order)`, GIN on `path`.

**`wbs_assignments`** (full ACL — view + edit + assign)
- `id`, `wbs_node_id`, `user_id`, `permission` enum (`view` | `edit` | `manage`), `created_at`, `created_by`
- `UNIQUE(wbs_node_id, user_id, permission)`
- `manage` ⇒ can assign others to this subtree.

**Tasks change**
- Add `wbs_node_id uuid null` to `tasks` (FK → wbs_nodes, ON DELETE RESTRICT).
- Existing rows stay null → keep their `location_zone` text as-is (no risky backfill).
- New tasks created via the UI **require** `wbs_node_id` (UI-enforced; DB stays nullable for backward compat).
- Index `(wbs_node_id)`, `(project_id, wbs_node_id)`.

**Audit**
- Attach existing `log_audit_event()` trigger to `wbs_nodes` and `wbs_assignments` (re-parenting, code edits, ACL changes are auto-logged into `audit_log`).

---

### 2. Security definer helpers + RLS

New functions (SECURITY DEFINER, `search_path=public`):
- `wbs_user_can(_user_id uuid, _node_id uuid, _perm text) returns boolean` — returns true if the user has `_perm` (or higher) on the node OR any ancestor (inherited down). Admin always true.
- `wbs_visible_node_ids(_user_id uuid, _project_id uuid) returns setof uuid` — used by RLS for fast subtree filtering.
- `wbs_compute_path(_node_id uuid)` — used by trigger to recompute `path` / `path_text` / `depth` on insert, update of `parent_id`, and on rename.

**RLS on `wbs_nodes`**
- SELECT: admin OR PM OR `wbs_user_can(auth.uid(), id, 'view')`.
- INSERT/UPDATE/DELETE: admin OR PM OR `wbs_user_can(auth.uid(), parent_id, 'edit')`.

**RLS on `wbs_assignments`**
- SELECT: admin OR PM OR `wbs_user_can(auth.uid(), wbs_node_id, 'view')`.
- INSERT/DELETE: admin OR PM OR `wbs_user_can(auth.uid(), wbs_node_id, 'manage')`.

**Tasks RLS extension**
- Add an extra clause to the existing SELECT/UPDATE policies on `tasks`: when `wbs_node_id` is set, also require `wbs_user_can(auth.uid(), wbs_node_id, 'view'|'edit')`. Tasks without a WBS node fall back to the current role checks (preserves existing data).
- Same extension on `task_updates`, `task_assignments`, `task_attachments` (subtree-scoped visibility).

> Recursion safety: every check goes through SECURITY DEFINER functions — no policy queries the table it protects.

---

### 3. Triggers

- `wbs_nodes_path_trg` (BEFORE INSERT/UPDATE OF parent_id, code, name): recomputes `path`, `path_text`, `depth`; cascades to descendants on parent/code changes.
- `wbs_nodes_no_cycle_trg` (BEFORE UPDATE OF parent_id): rejects if new parent is self or a descendant.
- `wbs_nodes_same_project_trg` (BEFORE INSERT/UPDATE): enforces parent shares `project_id`.
- `audit_log_wbs_trg` on both new tables (re-uses `log_audit_event()`).
- Optional: BEFORE DELETE on `wbs_nodes` rejects deletion if any task points at the node or its descendants (force re-link first).

---

### 4. Edge function — `wbs-import-xlsx`

Server-side parser (xlsx lib) for bulk import:
- Accepts an uploaded `.xlsx` / `.csv` with columns: `code`, `name`, `node_type`, `parent_code` (blank for root), `description`.
- Validates: codes unique within the file + project, parents resolve, no cycles, types are valid enum values.
- Returns dry-run report `{ rows, errors, willInsert, willUpdate }`; second call with `{confirm:true}` performs the insert in a transaction with service-role client.
- Auth: requires admin / PM via `has_role`.

---

### 5. UI — WBS Manager page (`/projects/:projectId/wbs`)

Reachable from a new "WBS" tab on the project header (visible to admin/PM; read-only tree visible to anyone with `view` on a node).

**Layout** (resizable, persisted in localStorage)
- Left: **WBS Tree** panel (shadcn `ResizablePanelGroup` + custom virtualized tree, collapsible/expandable, search box, "focus mode" toggle to hide tree).
- Right: **Detail / Editor** panel — node form (name, type, code, parent picker), assignments tab (users + permission), tasks-in-subtree tab (read-only count + link to filtered Tasks page).
- Top breadcrumb showing `path_text` of selected node.

**Interactions**
- Inline create (`+ Add child`) on any tree row.
- Drag-and-drop re-parenting (`@dnd-kit/core`) — fires single UPDATE on `parent_id`; trigger recomputes paths.
- Rename in place; code edit dialog with uniqueness validator.
- Delete with confirmation; blocked by trigger if tasks attached.
- "Import from Excel" button → upload sheet → preview dry-run → Confirm → progress toast.
- "Download template" link generates a small starter `.xlsx` client-side via existing `xlsxDownload` helper.
- Permissions tab on node detail: pick user + permission, list/remove existing grants. Notes inheritance (e.g. "Inherits view from parent BLDG-1").

**Performance**
- Tree fetch: single query of `wbs_nodes` for the project (typical < 2k rows). Build tree client-side, memoize.
- Use `react-window` (or simple windowing) only when project exceeds 500 nodes.
- Selected node detail loaded on demand.

---

### 6. Task ↔ WBS integration (minimal V1 surface)

- **CreateTaskDialog**: replace free-text `location_zone` with a required **WBS node picker** (search-as-you-type combobox showing `path_text`). Selected node's `id` saved to `wbs_node_id`; its `path_text` mirrored into `location_zone` for backward display compatibility.
- **TaskDetail**: show full WBS path as a breadcrumb above the title when `wbs_node_id` is set; falls back to `location_zone` otherwise.
- **Tasks list**: keep existing filters; add a small "WBS" filter chip (one-level picker) — full tree-filter view comes in V2.

> Existing tasks render exactly as today — no migration of `location_zone` text in V1.

---

### 7. Files

**New**
- `supabase/functions/wbs-import-xlsx/index.ts`
- `src/pages/Wbs.tsx` (route shell)
- `src/components/wbs/WbsTree.tsx` (virtualized tree + DnD)
- `src/components/wbs/WbsNodeEditor.tsx` (right panel form)
- `src/components/wbs/WbsAssignmentsTab.tsx`
- `src/components/wbs/WbsImportDialog.tsx`
- `src/components/wbs/WbsNodePicker.tsx` (combobox used by tasks)
- `src/lib/wbsMeta.ts` (types, node-type labels, permission labels)
- `src/hooks/useWbsTree.ts` (load + cache + realtime invalidate)

**Edited**
- `src/App.tsx` — add `/projects/:projectId/wbs` route.
- `src/components/AppLayout.tsx` — add "WBS" sidebar entry under the active project (shown when `activeProject` set).
- `src/components/tasks/CreateTaskDialog.tsx` — swap `location_zone` input for `WbsNodePicker`, write `wbs_node_id`.
- `src/pages/TaskDetail.tsx` — show WBS breadcrumb.
- `src/pages/Tasks.tsx` — add WBS filter chip.

**DB migration**
- New enum, two tables, indexes, triggers, RLS policies, helper functions, audit trigger attachments.

---

### 8. Out of scope for V1 (acknowledged from the master prompt)

- Auto-generated WBS codes (toggle deferred).
- Task ↔ task dependency engine across WBS (start-blocking) — current `task_predecessors` table stays as informational only.
- WBS rollup KPIs in Reports / delay heatmap — planned for V2 once data exists.
- BIM / Revit zone mapping, cost per WBS — V3+.
- Hard DB-level NOT NULL on `tasks.wbs_node_id` — to be flipped after a future backfill.

---

### 9. Risks & mitigations

- **Path recomputation on big subtree re-parent** — done in a single recursive CTE inside the trigger; benchmarks fine up to ~10k nodes.
- **Permission inheritance perf** — `wbs_user_can` walks ancestors via recursive CTE; cached per request via STABLE function. Add covering index `(project_id, parent_id)`.
- **Existing tasks without WBS** — RLS branch keeps current behavior so nothing breaks for current data.
- **Drag-reorder race** — single UPDATE per drop, optimistic UI rolled back on error toast.

---

### 10. Acceptance checklist

- Admin can create a 4-level tree, codes validated unique per project.
- Re-parenting a node updates `path_text` everywhere instantly.
- Excel import dry-run shows errors before commit.
- Non-admin user with `view` on `BLDG-1 > L05` sees only that subtree's nodes and only tasks under it.
- New task creation requires picking a WBS node; task detail shows the breadcrumb.
- Audit log records every create / re-parent / code change / ACL grant.