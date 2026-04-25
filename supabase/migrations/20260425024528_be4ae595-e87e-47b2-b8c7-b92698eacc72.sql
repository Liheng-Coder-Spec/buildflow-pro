
-- ENUMS
CREATE TYPE public.task_status AS ENUM (
  'open',
  'assigned',
  'in_progress',
  'pending_approval',
  'approved',
  'rejected',
  'completed',
  'closed'
);

CREATE TYPE public.task_priority AS ENUM ('low','medium','high','critical');

CREATE TYPE public.task_type AS ENUM (
  'concrete','steel','mep','finishing','excavation','inspection','other'
);

-- TASKS
CREATE TABLE public.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  code text,
  title text NOT NULL,
  description text,
  task_type public.task_type NOT NULL DEFAULT 'other',
  priority public.task_priority NOT NULL DEFAULT 'medium',
  status public.task_status NOT NULL DEFAULT 'open',
  location_zone text,
  planned_start date,
  planned_end date,
  actual_start timestamptz,
  actual_end timestamptz,
  estimated_hours numeric(8,2) DEFAULT 0,
  actual_hours numeric(8,2) DEFAULT 0,
  progress_pct integer NOT NULL DEFAULT 0 CHECK (progress_pct BETWEEN 0 AND 100),
  created_by uuid,
  approved_by uuid,
  approved_at timestamptz,
  rejection_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_tasks_project ON public.tasks(project_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view tasks"
  ON public.tasks FOR SELECT TO authenticated USING (true);

CREATE POLICY "Planners can create tasks"
  ON public.tasks FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'engineer') OR
    has_role(auth.uid(),'supervisor')
  );

CREATE POLICY "Planners can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'engineer') OR
    has_role(auth.uid(),'supervisor')
  );

CREATE POLICY "Admins and PMs can delete tasks"
  ON public.tasks FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));

CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ASSIGNMENTS
CREATE TABLE public.task_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  assigned_by uuid,
  assigned_at timestamptz NOT NULL DEFAULT now(),
  unassigned_at timestamptz,
  reason text,
  UNIQUE (task_id, user_id, assigned_at)
);
CREATE INDEX idx_task_assignments_task ON public.task_assignments(task_id);
CREATE INDEX idx_task_assignments_user ON public.task_assignments(user_id);

ALTER TABLE public.task_assignments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view assignments"
  ON public.task_assignments FOR SELECT TO authenticated USING (true);

CREATE POLICY "Planners can assign"
  ON public.task_assignments FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'supervisor')
  );

CREATE POLICY "Planners can remove assignments"
  ON public.task_assignments FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'supervisor')
  );

-- PREDECESSORS
CREATE TABLE public.task_predecessors (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  predecessor_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  UNIQUE (task_id, predecessor_id),
  CHECK (task_id <> predecessor_id)
);
ALTER TABLE public.task_predecessors ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view predecessors"
  ON public.task_predecessors FOR SELECT TO authenticated USING (true);
CREATE POLICY "Planners manage predecessors insert"
  ON public.task_predecessors FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));
CREATE POLICY "Planners manage predecessors delete"
  ON public.task_predecessors FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- UPDATES
CREATE TABLE public.task_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  progress_pct integer CHECK (progress_pct BETWEEN 0 AND 100),
  hours_worked numeric(6,2) DEFAULT 0,
  note text,
  is_blocker boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_updates_task ON public.task_updates(task_id);

ALTER TABLE public.task_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view updates"
  ON public.task_updates FOR SELECT TO authenticated USING (true);

CREATE POLICY "Assignees and supervisors can post updates"
  ON public.task_updates FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      has_role(auth.uid(),'admin') OR
      has_role(auth.uid(),'project_manager') OR
      has_role(auth.uid(),'supervisor') OR
      EXISTS (
        SELECT 1 FROM public.task_assignments a
        WHERE a.task_id = task_updates.task_id
          AND a.user_id = auth.uid()
          AND a.unassigned_at IS NULL
      )
    )
  );

-- ATTACHMENTS (metadata only, files in storage)
CREATE TABLE public.task_attachments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  uploaded_by uuid,
  file_name text NOT NULL,
  storage_path text NOT NULL,
  mime_type text,
  size_bytes integer,
  created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.task_attachments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view attachments"
  ON public.task_attachments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can upload attachments"
  ON public.task_attachments FOR INSERT TO authenticated
  WITH CHECK (uploaded_by = auth.uid());
CREATE POLICY "Owners and admins delete attachments"
  ON public.task_attachments FOR DELETE TO authenticated
  USING (uploaded_by = auth.uid() OR has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));

-- STATUS HISTORY
CREATE TABLE public.task_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id uuid NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  from_status public.task_status,
  to_status public.task_status NOT NULL,
  changed_by uuid,
  reason text,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_task_status_history_task ON public.task_status_history(task_id);
ALTER TABLE public.task_status_history ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authenticated can view status history"
  ON public.task_status_history FOR SELECT TO authenticated USING (true);
-- writes only via trigger (no insert policy needed; SECURITY DEFINER trigger inserts)

-- STATE MACHINE: validate transitions + write history
CREATE OR REPLACE FUNCTION public.validate_task_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  allowed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- New tasks must start at 'open' or 'assigned'
    IF NEW.status NOT IN ('open','assigned') THEN
      RAISE EXCEPTION 'New tasks must start as open or assigned (got %)', NEW.status;
    END IF;
    INSERT INTO public.task_status_history(task_id, from_status, to_status, changed_by)
    VALUES (NEW.id, NULL, NEW.status, NEW.created_by);
    RETURN NEW;
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  -- Allowed transitions
  allowed := CASE
    WHEN OLD.status = 'open' AND NEW.status IN ('assigned','closed') THEN true
    WHEN OLD.status = 'assigned' AND NEW.status IN ('in_progress','open','closed') THEN true
    WHEN OLD.status = 'in_progress' AND NEW.status IN ('pending_approval','assigned','closed') THEN true
    WHEN OLD.status = 'pending_approval' AND NEW.status IN ('approved','rejected') THEN true
    WHEN OLD.status = 'approved' AND NEW.status IN ('completed','closed') THEN true
    WHEN OLD.status = 'rejected' AND NEW.status IN ('in_progress','assigned') THEN true
    WHEN OLD.status = 'completed' AND NEW.status IN ('closed') THEN true
    ELSE false
  END;

  IF NOT allowed THEN
    RAISE EXCEPTION 'Invalid status transition: % -> %', OLD.status, NEW.status;
  END IF;

  -- Approval guard
  IF NEW.status IN ('approved','rejected') THEN
    IF NOT (
      has_role(auth.uid(),'admin') OR
      has_role(auth.uid(),'project_manager') OR
      has_role(auth.uid(),'supervisor') OR
      has_role(auth.uid(),'qaqc_inspector')
    ) THEN
      RAISE EXCEPTION 'Only supervisors/PMs/admins/QA can approve or reject';
    END IF;
    NEW.approved_by := auth.uid();
    NEW.approved_at := now();
  END IF;

  INSERT INTO public.task_status_history(task_id, from_status, to_status, changed_by)
  VALUES (NEW.id, OLD.status, NEW.status, auth.uid());

  RETURN NEW;
END;
$$;

CREATE TRIGGER tasks_status_machine
  BEFORE INSERT OR UPDATE OF status ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.validate_task_status_transition();
