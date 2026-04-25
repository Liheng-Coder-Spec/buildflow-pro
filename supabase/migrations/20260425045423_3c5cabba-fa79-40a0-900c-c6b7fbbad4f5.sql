-- Fix: task_status_history insert must happen AFTER the task row exists,
-- otherwise the FK (task_status_history.task_id -> tasks.id) is violated on INSERT.
-- Split the status-machine trigger into BEFORE (validation) and AFTER (history).

CREATE OR REPLACE FUNCTION public.validate_task_status_transition()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  allowed boolean := false;
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.status NOT IN ('open','assigned') THEN
      RAISE EXCEPTION 'New tasks must start as open or assigned (got %)', NEW.status;
    END IF;
    -- History row will be written by the AFTER INSERT trigger.
    RETURN NEW;
  END IF;

  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

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

  -- For UPDATE, the row already exists, so FK is satisfied.
  INSERT INTO public.task_status_history(task_id, from_status, to_status, changed_by)
  VALUES (NEW.id, OLD.status, NEW.status, auth.uid());

  RETURN NEW;
END;
$function$;

-- New AFTER INSERT trigger function: writes initial history row safely.
CREATE OR REPLACE FUNCTION public.log_task_initial_status()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  INSERT INTO public.task_status_history(task_id, from_status, to_status, changed_by)
  VALUES (NEW.id, NULL, NEW.status, COALESCE(NEW.created_by, auth.uid()));
  RETURN NEW;
END;
$function$;

DROP TRIGGER IF EXISTS tasks_status_initial_history ON public.tasks;
CREATE TRIGGER tasks_status_initial_history
AFTER INSERT ON public.tasks
FOR EACH ROW
EXECUTE FUNCTION public.log_task_initial_status();