-- ============================================================
-- DEPARTMENTS V1
-- ============================================================

-- 1. Enums --------------------------------------------------
CREATE TYPE public.department AS ENUM (
  'architecture', 'structure', 'mep', 'procurement', 'construction'
);

CREATE TYPE public.dept_status AS ENUM (
  -- Design (arch/structure/mep)
  'draft','internal_review','coordination','dept_approved','issued',
  -- Procurement
  'request','rfq','quotation_received','evaluation','po_issued','delivered',
  -- Construction
  'assigned','in_progress','inspection','site_approved','completed',
  -- Shared
  'rejected','cancelled'
);

CREATE TYPE public.dept_role AS ENUM ('member','reviewer','approver');

-- 2. department_members ------------------------------------
CREATE TABLE public.department_members (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      uuid NOT NULL,
  department   public.department NOT NULL,
  role_in_dept public.dept_role NOT NULL DEFAULT 'member',
  created_by   uuid,
  created_at   timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, department, role_in_dept)
);
CREATE INDEX idx_dept_members_dept_role ON public.department_members(department, role_in_dept);
CREATE INDEX idx_dept_members_user ON public.department_members(user_id);

ALTER TABLE public.department_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone signed in can view department members"
  ON public.department_members FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins manage department members - insert"
  ON public.department_members FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins manage department members - delete"
  ON public.department_members FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Audit trigger
CREATE TRIGGER audit_department_members
  AFTER INSERT OR UPDATE OR DELETE ON public.department_members
  FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

-- 3. Helper function ---------------------------------------
CREATE OR REPLACE FUNCTION public.is_dept_member(_user_id uuid, _dept public.department, _min_role public.dept_role DEFAULT 'member')
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.department_members
    WHERE user_id = _user_id
      AND department = _dept
      AND CASE _min_role
            WHEN 'member'   THEN role_in_dept IN ('member','reviewer','approver')
            WHEN 'reviewer' THEN role_in_dept IN ('reviewer','approver')
            WHEN 'approver' THEN role_in_dept = 'approver'
          END
  );
$$;

-- 4. Tasks columns -----------------------------------------
ALTER TABLE public.tasks
  ADD COLUMN department public.department NULL,
  ADD COLUMN dept_status public.dept_status NULL,
  ADD COLUMN discipline_meta jsonb NOT NULL DEFAULT '{}'::jsonb;

CREATE INDEX idx_tasks_department ON public.tasks(department);
CREATE INDEX idx_tasks_dept_status ON public.tasks(dept_status);

-- 5. Task predecessors columns -----------------------------
ALTER TABLE public.task_predecessors
  ADD COLUMN is_hard_block boolean NOT NULL DEFAULT false,
  ADD COLUMN note text NULL;

-- 6. Workflow validation trigger ---------------------------
CREATE OR REPLACE FUNCTION public.validate_dept_status_transition()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_dept public.department;
  v_old  public.dept_status;
  v_new  public.dept_status;
  v_allowed boolean := false;
  v_needs_approver boolean := false;
BEGIN
  v_dept := NEW.department;
  v_old  := COALESCE(OLD.dept_status, NULL);
  v_new  := NEW.dept_status;

  -- Nothing to do
  IF v_new IS NULL OR v_dept IS NULL THEN
    RETURN NEW;
  END IF;

  -- INSERT: must be a valid starting stage for the department
  IF TG_OP = 'INSERT' THEN
    v_allowed := CASE v_dept
      WHEN 'architecture' THEN v_new IN ('draft','internal_review')
      WHEN 'structure'    THEN v_new IN ('draft','internal_review')
      WHEN 'mep'          THEN v_new IN ('draft','internal_review')
      WHEN 'procurement'  THEN v_new = 'request'
      WHEN 'construction' THEN v_new IN ('assigned','in_progress')
    END;
    IF NOT v_allowed THEN
      RAISE EXCEPTION 'Invalid starting stage % for department %', v_new, v_dept;
    END IF;
  ELSE
    -- UPDATE: no change is fine
    IF v_old IS NOT DISTINCT FROM v_new THEN
      RETURN NEW;
    END IF;

    v_allowed := CASE v_dept
      WHEN 'architecture' THEN
        (v_old='draft'           AND v_new IN ('internal_review','cancelled')) OR
        (v_old='internal_review' AND v_new IN ('coordination','rejected','cancelled')) OR
        (v_old='coordination'    AND v_new IN ('dept_approved','rejected','cancelled')) OR
        (v_old='dept_approved'   AND v_new IN ('issued','cancelled')) OR
        (v_old='rejected'        AND v_new IN ('draft','internal_review'))
      WHEN 'structure' THEN
        (v_old='draft'           AND v_new IN ('internal_review','cancelled')) OR
        (v_old='internal_review' AND v_new IN ('coordination','rejected','cancelled')) OR
        (v_old='coordination'    AND v_new IN ('dept_approved','rejected','cancelled')) OR
        (v_old='dept_approved'   AND v_new IN ('issued','cancelled')) OR
        (v_old='rejected'        AND v_new IN ('draft','internal_review'))
      WHEN 'mep' THEN
        (v_old='draft'           AND v_new IN ('internal_review','cancelled')) OR
        (v_old='internal_review' AND v_new IN ('coordination','rejected','cancelled')) OR
        (v_old='coordination'    AND v_new IN ('dept_approved','rejected','cancelled')) OR
        (v_old='dept_approved'   AND v_new IN ('issued','cancelled')) OR
        (v_old='rejected'        AND v_new IN ('draft','internal_review'))
      WHEN 'procurement' THEN
        (v_old='request'            AND v_new IN ('rfq','cancelled')) OR
        (v_old='rfq'                AND v_new IN ('quotation_received','cancelled')) OR
        (v_old='quotation_received' AND v_new IN ('evaluation','cancelled')) OR
        (v_old='evaluation'         AND v_new IN ('po_issued','rejected','cancelled')) OR
        (v_old='po_issued'          AND v_new IN ('delivered','cancelled')) OR
        (v_old='rejected'           AND v_new IN ('rfq','evaluation'))
      WHEN 'construction' THEN
        (v_old='assigned'      AND v_new IN ('in_progress','cancelled')) OR
        (v_old='in_progress'   AND v_new IN ('inspection','cancelled')) OR
        (v_old='inspection'    AND v_new IN ('site_approved','rejected','cancelled')) OR
        (v_old='site_approved' AND v_new IN ('completed','cancelled')) OR
        (v_old='rejected'      AND v_new IN ('in_progress','assigned'))
    END;

    IF NOT v_allowed THEN
      RAISE EXCEPTION 'Invalid % stage transition: % -> %', v_dept, v_old, v_new;
    END IF;
  END IF;

  -- Approver-only transitions
  v_needs_approver := v_new IN ('dept_approved','issued','po_issued','site_approved');
  IF v_needs_approver THEN
    IF NOT (public.has_role(auth.uid(), 'admin')
            OR public.is_dept_member(auth.uid(), v_dept, 'approver')) THEN
      RAISE EXCEPTION 'Only % approvers can move task to %', v_dept, v_new;
    END IF;
  END IF;

  -- Mirror dept_status -> high-level status (does not run extra triggers since it's the same row)
  NEW.status := CASE v_new
    WHEN 'draft'              THEN 'open'::public.task_status
    WHEN 'request'            THEN 'open'::public.task_status
    WHEN 'assigned'           THEN 'assigned'::public.task_status
    WHEN 'in_progress'        THEN 'in_progress'::public.task_status
    WHEN 'rfq'                THEN 'in_progress'::public.task_status
    WHEN 'quotation_received' THEN 'in_progress'::public.task_status
    WHEN 'coordination'       THEN 'in_progress'::public.task_status
    WHEN 'internal_review'    THEN 'pending_approval'::public.task_status
    WHEN 'evaluation'         THEN 'pending_approval'::public.task_status
    WHEN 'inspection'         THEN 'pending_approval'::public.task_status
    WHEN 'dept_approved'      THEN 'approved'::public.task_status
    WHEN 'site_approved'      THEN 'approved'::public.task_status
    WHEN 'po_issued'          THEN 'approved'::public.task_status
    WHEN 'issued'             THEN 'completed'::public.task_status
    WHEN 'delivered'          THEN 'completed'::public.task_status
    WHEN 'completed'          THEN 'completed'::public.task_status
    WHEN 'rejected'           THEN 'rejected'::public.task_status
    WHEN 'cancelled'          THEN 'closed'::public.task_status
    ELSE NEW.status
  END;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_dept_status
  BEFORE INSERT OR UPDATE OF dept_status, department ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.validate_dept_status_transition();

-- 7. Dependency hard-block trigger -------------------------
CREATE OR REPLACE FUNCTION public.validate_task_start_against_predecessors()
RETURNS trigger
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  v_blocker record;
  v_started boolean := false;
BEGIN
  -- Detect "starting" transitions
  IF NEW.dept_status IS NOT NULL
     AND NEW.dept_status IS DISTINCT FROM COALESCE(OLD.dept_status, NULL)
     AND NEW.dept_status IN ('in_progress','internal_review','rfq','inspection') THEN
    v_started := true;
  END IF;

  IF NOT v_started THEN
    RETURN NEW;
  END IF;

  FOR v_blocker IN
    SELECT t.id, t.code, t.title, t.department, t.dept_status, t.status, p.is_hard_block
    FROM public.task_predecessors p
    JOIN public.tasks t ON t.id = p.predecessor_id
    WHERE p.task_id = NEW.id
  LOOP
    -- End-states are OK
    IF v_blocker.dept_status IN ('issued','po_issued','delivered','completed','site_approved','dept_approved')
       OR v_blocker.status IN ('completed','approved','closed') THEN
      CONTINUE;
    END IF;

    IF v_blocker.is_hard_block THEN
      RAISE EXCEPTION 'Blocked by % — % (%): predecessor not yet completed',
        COALESCE(v_blocker.code, v_blocker.id::text),
        v_blocker.title,
        COALESCE(v_blocker.department::text, 'no dept');
    END IF;
    -- Soft block: allow, no notification here (UI surfaces it)
  END LOOP;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_dependencies
  BEFORE UPDATE OF dept_status, status ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION public.validate_task_start_against_predecessors();

-- 8. Tasks UPDATE policy: dept membership scope ------------
DROP POLICY IF EXISTS "Planners can update tasks" ON public.tasks;

CREATE POLICY "Planners can update tasks"
  ON public.tasks FOR UPDATE TO authenticated
  USING (
    (
      public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'project_manager'::app_role)
      OR public.has_role(auth.uid(), 'engineer'::app_role)
      OR public.has_role(auth.uid(), 'supervisor'::app_role)
    )
    AND (
      department IS NULL
      OR public.has_role(auth.uid(), 'admin'::app_role)
      OR public.has_role(auth.uid(), 'project_manager'::app_role)
      OR public.is_dept_member(auth.uid(), department, 'member')
    )
  );
