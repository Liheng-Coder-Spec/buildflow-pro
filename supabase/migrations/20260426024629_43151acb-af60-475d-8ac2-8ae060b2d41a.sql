-- ============================================================
-- WBS V1 — Schema, helpers, triggers, RLS
-- ============================================================

-- 1. Enums ----------------------------------------------------
create type public.wbs_node_type as enum (
  'building','level','zone','sub_zone','area','system','package','other'
);

create type public.wbs_permission as enum ('view','edit','manage');

-- 2. wbs_nodes table -----------------------------------------
create table public.wbs_nodes (
  id           uuid primary key default gen_random_uuid(),
  project_id   uuid not null references public.projects(id) on delete cascade,
  parent_id    uuid null references public.wbs_nodes(id) on delete restrict,
  node_type    public.wbs_node_type not null default 'zone',
  name         text not null,
  code         text not null,
  description  text null,
  path         text[] not null default '{}',
  path_text    text not null default '',
  depth        int  not null default 0,
  sort_order   int  not null default 0,
  created_by   uuid null,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  constraint wbs_nodes_code_per_project_unique unique (project_id, code),
  constraint wbs_nodes_code_chk check (length(trim(code)) between 1 and 60),
  constraint wbs_nodes_name_chk check (length(trim(name)) between 1 and 200)
);

create index wbs_nodes_project_parent_idx
  on public.wbs_nodes (project_id, parent_id, sort_order);
create index wbs_nodes_parent_idx on public.wbs_nodes (parent_id);
create index wbs_nodes_path_gin on public.wbs_nodes using gin (path);

alter table public.wbs_nodes enable row level security;

-- 3. wbs_assignments table -----------------------------------
create table public.wbs_assignments (
  id            uuid primary key default gen_random_uuid(),
  wbs_node_id   uuid not null references public.wbs_nodes(id) on delete cascade,
  user_id       uuid not null,
  permission    public.wbs_permission not null,
  created_by    uuid null,
  created_at    timestamptz not null default now(),
  unique (wbs_node_id, user_id, permission)
);

create index wbs_assignments_user_idx on public.wbs_assignments (user_id);
create index wbs_assignments_node_idx on public.wbs_assignments (wbs_node_id);

alter table public.wbs_assignments enable row level security;

-- 4. tasks.wbs_node_id ---------------------------------------
alter table public.tasks
  add column wbs_node_id uuid null references public.wbs_nodes(id) on delete restrict;

create index tasks_wbs_node_idx on public.tasks (wbs_node_id);
create index tasks_project_wbs_idx on public.tasks (project_id, wbs_node_id);

-- 5. updated_at trigger reuse --------------------------------
create trigger wbs_nodes_set_updated_at
before update on public.wbs_nodes
for each row execute function public.update_updated_at_column();

-- 6. Cycle / same-project / path maintenance -----------------

create or replace function public.wbs_check_parent()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_project uuid;
  v_cursor uuid;
  v_steps int := 0;
begin
  if NEW.parent_id is null then
    return NEW;
  end if;

  -- Same project as parent
  select project_id into v_parent_project
  from public.wbs_nodes where id = NEW.parent_id;

  if v_parent_project is null then
    raise exception 'Parent WBS node % not found', NEW.parent_id;
  end if;

  if v_parent_project <> NEW.project_id then
    raise exception 'Parent WBS node belongs to a different project';
  end if;

  -- Cycle check: walk up from parent, ensure we never see NEW.id
  v_cursor := NEW.parent_id;
  while v_cursor is not null and v_steps < 200 loop
    if v_cursor = NEW.id then
      raise exception 'Cannot move WBS node into its own subtree (cycle)';
    end if;
    select parent_id into v_cursor from public.wbs_nodes where id = v_cursor;
    v_steps := v_steps + 1;
  end loop;

  return NEW;
end;
$$;

create trigger wbs_nodes_check_parent_trg
before insert or update of parent_id, project_id on public.wbs_nodes
for each row execute function public.wbs_check_parent();

-- Recompute path / path_text / depth for one node from its parent
create or replace function public.wbs_compute_path()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_parent_path text[];
  v_parent_depth int;
begin
  if NEW.parent_id is null then
    NEW.path := array[NEW.code];
    NEW.path_text := NEW.code;
    NEW.depth := 0;
  else
    select path, depth into v_parent_path, v_parent_depth
    from public.wbs_nodes where id = NEW.parent_id;

    NEW.path := coalesce(v_parent_path, '{}') || NEW.code;
    NEW.path_text := array_to_string(NEW.path, ' > ');
    NEW.depth := coalesce(v_parent_depth, 0) + 1;
  end if;
  return NEW;
end;
$$;

create trigger wbs_nodes_compute_path_trg
before insert or update of parent_id, code on public.wbs_nodes
for each row execute function public.wbs_compute_path();

-- After update of parent_id or code, cascade path/depth to descendants
create or replace function public.wbs_cascade_paths()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if TG_OP = 'UPDATE'
     and NEW.path is distinct from OLD.path then
    -- Recursive update: every descendant's path = NEW.path || tail-of-old-path
    with recursive sub as (
      select id, parent_id, code, NEW.path as new_path, NEW.depth as new_depth
      from public.wbs_nodes
      where parent_id = NEW.id
      union all
      select c.id, c.parent_id, c.code,
             s.new_path || c.code,
             s.new_depth + 1
      from public.wbs_nodes c
      join sub s on c.parent_id = s.id
    )
    update public.wbs_nodes w
       set path = s.new_path,
           path_text = array_to_string(s.new_path, ' > '),
           depth = s.new_depth
      from sub s
     where w.id = s.id;
  end if;
  return NEW;
end;
$$;

create trigger wbs_nodes_cascade_paths_trg
after update of parent_id, code on public.wbs_nodes
for each row execute function public.wbs_cascade_paths();

-- Block delete when tasks still reference the node or any descendant
create or replace function public.wbs_block_delete_if_tasks()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_count int;
begin
  with recursive sub as (
    select OLD.id as id
    union all
    select c.id from public.wbs_nodes c join sub s on c.parent_id = s.id
  )
  select count(*) into v_count
  from public.tasks t
  where t.wbs_node_id in (select id from sub);

  if v_count > 0 then
    raise exception 'Cannot delete WBS node: % task(s) still linked. Re-link or delete tasks first.', v_count;
  end if;
  return OLD;
end;
$$;

create trigger wbs_nodes_block_delete_trg
before delete on public.wbs_nodes
for each row execute function public.wbs_block_delete_if_tasks();

-- 7. Permission helper (subtree-inherited) -------------------
create or replace function public.wbs_user_can(_user_id uuid, _node_id uuid, _perm public.wbs_permission)
returns boolean
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_ok boolean := false;
  v_required text[];
begin
  if _user_id is null or _node_id is null then
    return false;
  end if;

  if public.has_role(_user_id, 'admin') then
    return true;
  end if;

  -- Permission ranking: manage > edit > view
  v_required := case _perm
    when 'view'   then array['view','edit','manage']
    when 'edit'   then array['edit','manage']
    when 'manage' then array['manage']
  end;

  -- Walk node + ancestors and check assignments
  with recursive anc as (
    select id, parent_id from public.wbs_nodes where id = _node_id
    union all
    select n.id, n.parent_id
    from public.wbs_nodes n
    join anc a on n.id = a.parent_id
  )
  select exists (
    select 1
    from public.wbs_assignments wa
    where wa.user_id = _user_id
      and wa.wbs_node_id in (select id from anc)
      and wa.permission::text = any (v_required)
  ) into v_ok;

  return coalesce(v_ok, false);
end;
$$;

-- 8. RLS — wbs_nodes -----------------------------------------
create policy "WBS view: admin/PM or assigned"
on public.wbs_nodes for select
to authenticated
using (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or wbs_user_can(auth.uid(), id, 'view')
);

create policy "WBS insert: admin/PM or edit on parent"
on public.wbs_nodes for insert
to authenticated
with check (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or (parent_id is not null and wbs_user_can(auth.uid(), parent_id, 'edit'))
);

create policy "WBS update: admin/PM or edit on node"
on public.wbs_nodes for update
to authenticated
using (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or wbs_user_can(auth.uid(), id, 'edit')
);

create policy "WBS delete: admin/PM or manage on node"
on public.wbs_nodes for delete
to authenticated
using (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or wbs_user_can(auth.uid(), id, 'manage')
);

-- 9. RLS — wbs_assignments -----------------------------------
create policy "WBS assignments view: admin/PM or view on node"
on public.wbs_assignments for select
to authenticated
using (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or user_id = auth.uid()
  or wbs_user_can(auth.uid(), wbs_node_id, 'view')
);

create policy "WBS assignments insert: admin/PM or manage on node"
on public.wbs_assignments for insert
to authenticated
with check (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or wbs_user_can(auth.uid(), wbs_node_id, 'manage')
);

create policy "WBS assignments delete: admin/PM or manage on node"
on public.wbs_assignments for delete
to authenticated
using (
  has_role(auth.uid(),'admin')
  or has_role(auth.uid(),'project_manager')
  or wbs_user_can(auth.uid(), wbs_node_id, 'manage')
);

-- 10. Audit log triggers (reuse existing log_audit_event) ----
create trigger wbs_nodes_audit_trg
after insert or update or delete on public.wbs_nodes
for each row execute function public.log_audit_event();

create trigger wbs_assignments_audit_trg
after insert or update or delete on public.wbs_assignments
for each row execute function public.log_audit_event();
