-- 1. Add baseline columns to tasks
ALTER TABLE public.tasks
  ADD COLUMN IF NOT EXISTS baseline_start date,
  ADD COLUMN IF NOT EXISTS baseline_end date;

-- 2. Add 'blocked' to task_status enum
ALTER TYPE public.task_status ADD VALUE IF NOT EXISTS 'blocked';

-- 3. Schedule calculation log table
CREATE TABLE IF NOT EXISTS public.schedule_calculation_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  triggered_by_task_id uuid,
  triggered_by_user uuid,
  trigger_reason text,
  affected_count integer NOT NULL DEFAULT 0,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.schedule_calculation_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view schedule logs"
  ON public.schedule_calculation_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Planners insert schedule logs"
  ON public.schedule_calculation_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR has_role(auth.uid(), 'engineer'::app_role)
    OR has_role(auth.uid(), 'supervisor'::app_role)
  );

CREATE INDEX IF NOT EXISTS idx_schedule_logs_project ON public.schedule_calculation_logs(project_id, created_at DESC);

-- 4. Unique predecessor pair (no duplicates)
DO $$ BEGIN
  ALTER TABLE public.task_predecessors
    ADD CONSTRAINT task_predecessors_unique_pair UNIQUE (task_id, predecessor_id);
EXCEPTION WHEN duplicate_table OR duplicate_object THEN NULL; END $$;

-- 5. Predecessor validation: no self, same project, no cycle
CREATE OR REPLACE FUNCTION public.validate_task_predecessor()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p1 uuid;
  p2 uuid;
  has_cycle boolean;
BEGIN
  IF NEW.task_id = NEW.predecessor_id THEN
    RAISE EXCEPTION 'A task cannot depend on itself';
  END IF;

  SELECT project_id INTO p1 FROM public.tasks WHERE id = NEW.task_id;
  SELECT project_id INTO p2 FROM public.tasks WHERE id = NEW.predecessor_id;
  IF p1 IS NULL OR p2 IS NULL THEN
    RAISE EXCEPTION 'Task or predecessor not found';
  END IF;
  IF p1 <> p2 THEN
    RAISE EXCEPTION 'Predecessor must belong to the same project';
  END IF;

  -- Cycle detection: walk predecessors of NEW.predecessor_id, fail if NEW.task_id appears
  WITH RECURSIVE chain AS (
    SELECT predecessor_id AS node FROM public.task_predecessors WHERE task_id = NEW.predecessor_id
    UNION
    SELECT tp.predecessor_id
    FROM public.task_predecessors tp
    JOIN chain c ON tp.task_id = c.node
  )
  SELECT EXISTS (SELECT 1 FROM chain WHERE node = NEW.task_id) INTO has_cycle;

  IF has_cycle THEN
    RAISE EXCEPTION 'Adding this dependency would create a circular chain';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_task_predecessor ON public.task_predecessors;
CREATE TRIGGER trg_validate_task_predecessor
  BEFORE INSERT OR UPDATE ON public.task_predecessors
  FOR EACH ROW EXECUTE FUNCTION public.validate_task_predecessor();