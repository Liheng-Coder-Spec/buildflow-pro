
-- =========================
-- ENUMS
-- =========================
create type public.notification_priority as enum ('low','normal','high','critical');

create type public.notification_type as enum (
  'task_assigned','task_unassigned','task_started','task_submitted_for_approval',
  'task_approved','task_rejected','task_completed','task_closed','task_reopened',
  'task_blocker_reported',
  'timesheet_submitted','timesheet_approved','timesheet_rejected','timesheet_flagged'
);

-- =========================
-- TABLE
-- =========================
create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  actor_id uuid,
  type public.notification_type not null,
  priority public.notification_priority not null default 'normal',
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  project_id uuid,
  metadata jsonb not null default '{}'::jsonb,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index idx_notifications_user_unread
  on public.notifications (user_id, read_at, created_at desc);

create index idx_notifications_user_created
  on public.notifications (user_id, created_at desc);

alter table public.notifications enable row level security;

create policy "Users view own notifications"
  on public.notifications for select to authenticated
  using (user_id = auth.uid());

create policy "Users mark own notifications"
  on public.notifications for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create policy "Users delete own notifications"
  on public.notifications for delete to authenticated
  using (user_id = auth.uid());

-- No INSERT policy: only SECURITY DEFINER functions write rows.

alter publication supabase_realtime add table public.notifications;

-- =========================
-- HELPER: create_notification
-- =========================
create or replace function public.create_notification(
  _user_id uuid,
  _type public.notification_type,
  _title text,
  _body text,
  _entity_type text,
  _entity_id uuid,
  _project_id uuid,
  _priority public.notification_priority default 'normal',
  _actor_id uuid default null,
  _metadata jsonb default '{}'::jsonb
) returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if _user_id is null then return; end if;
  if _actor_id is not null and _user_id = _actor_id then return; end if;

  insert into public.notifications
    (user_id, actor_id, type, priority, title, body, entity_type, entity_id, project_id, metadata)
  values
    (_user_id, _actor_id, _type, _priority, _title, _body, _entity_type, _entity_id, _project_id, _metadata);
end;
$$;

-- =========================
-- HELPER: project supervisors / planners
-- =========================
create or replace function public.get_project_planners(_project_id uuid)
returns setof uuid
language sql
stable
security definer
set search_path = public
as $$
  -- Admins (any), and project_managers / supervisors / qaqc_inspectors that are members of the project
  select distinct ur.user_id
  from public.user_roles ur
  where ur.role = 'admin'
  union
  select distinct pm.user_id
  from public.project_members pm
  join public.user_roles ur on ur.user_id = pm.user_id
  where pm.project_id = _project_id
    and ur.role in ('project_manager','supervisor','qaqc_inspector');
$$;

-- =========================
-- TRIGGER: tasks status changes
-- =========================
create or replace function public.notify_task_status_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_assignee uuid;
  v_planner uuid;
  v_title text;
  v_body text;
  v_type public.notification_type;
  v_priority public.notification_priority := 'normal';
begin
  if NEW.status = OLD.status then
    return NEW;
  end if;

  v_body := coalesce(NEW.code || ' — ', '') || NEW.title;

  case NEW.status
    when 'assigned' then
      v_type := 'task_assigned';
      v_title := 'Task assigned';
      for v_assignee in
        select user_id from public.task_assignments
        where task_id = NEW.id and unassigned_at is null
      loop
        perform public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      end loop;

    when 'in_progress' then
      if OLD.status = 'rejected' then
        v_type := 'task_reopened';
        v_title := 'Task reopened';
      else
        v_type := 'task_started';
        v_title := 'Task started';
      end if;
      perform public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      for v_planner in select * from public.get_project_planners(NEW.project_id) loop
        perform public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      end loop;

    when 'pending_approval' then
      v_type := 'task_submitted_for_approval';
      v_title := 'Task awaiting approval';
      v_priority := 'high';
      for v_planner in select * from public.get_project_planners(NEW.project_id) loop
        perform public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, v_priority, v_actor, '{}'::jsonb);
      end loop;

    when 'approved' then
      v_type := 'task_approved';
      v_title := 'Task approved';
      for v_assignee in
        select user_id from public.task_assignments
        where task_id = NEW.id and unassigned_at is null
      loop
        perform public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      end loop;
      perform public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);

    when 'rejected' then
      v_type := 'task_rejected';
      v_title := 'Task rejected';
      v_priority := 'high';
      for v_assignee in
        select user_id from public.task_assignments
        where task_id = NEW.id and unassigned_at is null
      loop
        perform public.create_notification(
          v_assignee, v_type, v_title,
          coalesce('Reason: ' || NEW.rejection_reason || E'\n', '') || v_body,
          'task', NEW.id, NEW.project_id, v_priority, v_actor,
          jsonb_build_object('rejection_reason', NEW.rejection_reason));
      end loop;

    when 'completed' then
      v_type := 'task_completed';
      v_title := 'Task completed';
      perform public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      for v_planner in select * from public.get_project_planners(NEW.project_id) loop
        perform public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      end loop;

    when 'closed' then
      v_type := 'task_closed';
      v_title := 'Task closed';
      for v_assignee in
        select user_id from public.task_assignments
        where task_id = NEW.id and unassigned_at is null
      loop
        perform public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'low', v_actor, '{}'::jsonb);
      end loop;
      perform public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'low', v_actor, '{}'::jsonb);

    else
      null;
  end case;

  return NEW;
end;
$$;

create trigger trg_notify_task_status_change
  after update on public.tasks
  for each row execute function public.notify_task_status_change();

-- =========================
-- TRIGGER: task_assignments insert / unassign
-- =========================
create or replace function public.notify_task_assignment()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task record;
  v_body text;
begin
  select id, code, title, project_id into v_task from public.tasks where id = coalesce(NEW.task_id, OLD.task_id);
  v_body := coalesce(v_task.code || ' — ', '') || v_task.title;

  if TG_OP = 'INSERT' then
    perform public.create_notification(
      NEW.user_id, 'task_assigned', 'You were assigned a task', v_body,
      'task', v_task.id, v_task.project_id, 'normal', v_actor, '{}'::jsonb);
  elsif TG_OP = 'UPDATE' and OLD.unassigned_at is null and NEW.unassigned_at is not null then
    perform public.create_notification(
      NEW.user_id, 'task_unassigned', 'You were unassigned from a task', v_body,
      'task', v_task.id, v_task.project_id, 'low', v_actor, '{}'::jsonb);
  end if;

  return NEW;
end;
$$;

create trigger trg_notify_task_assignment_insert
  after insert on public.task_assignments
  for each row execute function public.notify_task_assignment();

create trigger trg_notify_task_assignment_update
  after update on public.task_assignments
  for each row execute function public.notify_task_assignment();

-- =========================
-- TRIGGER: task_updates blocker
-- =========================
create or replace function public.notify_task_blocker()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_task record;
  v_body text;
  v_planner uuid;
begin
  if NEW.is_blocker is not true then
    return NEW;
  end if;

  select id, code, title, project_id into v_task from public.tasks where id = NEW.task_id;
  v_body := coalesce(v_task.code || ' — ', '') || v_task.title
            || coalesce(E'\n' || NEW.note, '');

  for v_planner in select * from public.get_project_planners(v_task.project_id) loop
    perform public.create_notification(
      v_planner, 'task_blocker_reported', 'Blocker reported', v_body,
      'task', v_task.id, v_task.project_id, 'critical', v_actor,
      jsonb_build_object('task_update_id', NEW.id));
  end loop;

  return NEW;
end;
$$;

create trigger trg_notify_task_blocker
  after insert on public.task_updates
  for each row execute function public.notify_task_blocker();

-- =========================
-- TRIGGER: timesheet status changes
-- =========================
create or replace function public.notify_timesheet_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor uuid := auth.uid();
  v_planner uuid;
  v_body text;
  v_owner_name text;
begin
  select coalesce(full_name, 'A team member') into v_owner_name
  from public.profiles where id = NEW.user_id;

  v_body := v_owner_name || ' — ' || to_char(NEW.work_date, 'YYYY-MM-DD')
            || ' (' || (NEW.regular_hours + NEW.overtime_hours)::text || 'h)';

  if TG_OP = 'UPDATE' then
    if OLD.status = 'draft' and NEW.status = 'submitted' then
      for v_planner in select * from public.get_project_planners(NEW.project_id) loop
        perform public.create_notification(
          v_planner, 'timesheet_submitted', 'Timesheet submitted', v_body,
          'timesheet_entry', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      end loop;
    elsif OLD.status = 'submitted' and NEW.status = 'approved' then
      perform public.create_notification(
        NEW.user_id, 'timesheet_approved', 'Timesheet approved',
        to_char(NEW.work_date, 'YYYY-MM-DD') || ' (' || (NEW.regular_hours + NEW.overtime_hours)::text || 'h)',
        'timesheet_entry', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
    elsif OLD.status = 'submitted' and NEW.status = 'rejected' then
      perform public.create_notification(
        NEW.user_id, 'timesheet_rejected', 'Timesheet rejected',
        coalesce('Reason: ' || NEW.rejection_reason || E'\n', '')
          || to_char(NEW.work_date, 'YYYY-MM-DD'),
        'timesheet_entry', NEW.id, NEW.project_id, 'high', v_actor,
        jsonb_build_object('rejection_reason', NEW.rejection_reason));
    end if;

    -- Flagged on submission (only when transitioning into submitted with flags)
    if NEW.status = 'submitted' and OLD.status <> 'submitted'
       and NEW.flags is not null and jsonb_array_length(NEW.flags) > 0 then
      for v_planner in select * from public.get_project_planners(NEW.project_id) loop
        perform public.create_notification(
          v_planner, 'timesheet_flagged', 'Flagged timesheet entry', v_body,
          'timesheet_entry', NEW.id, NEW.project_id, 'normal', v_actor,
          jsonb_build_object('flags', NEW.flags));
      end loop;
    end if;
  end if;

  return NEW;
end;
$$;

create trigger trg_notify_timesheet_change
  after update on public.timesheet_entries
  for each row execute function public.notify_timesheet_change();
