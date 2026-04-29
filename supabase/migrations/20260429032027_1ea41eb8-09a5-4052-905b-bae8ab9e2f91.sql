-- 1. Relation type enum + columns on task_predecessors
DO $$ BEGIN
  CREATE TYPE public.dep_relation_type AS ENUM ('FS','SS','FF','SF');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.task_predecessors
  ADD COLUMN IF NOT EXISTS relation_type public.dep_relation_type NOT NULL DEFAULT 'FS',
  ADD COLUMN IF NOT EXISTS lag_days integer NOT NULL DEFAULT 0;

-- 2. project_holidays table
CREATE TABLE IF NOT EXISTS public.project_holidays (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL,
  holiday_date date NOT NULL,
  label text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (project_id, holiday_date)
);

CREATE INDEX IF NOT EXISTS idx_project_holidays_project
  ON public.project_holidays(project_id);

ALTER TABLE public.project_holidays ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view project holidays" ON public.project_holidays;
CREATE POLICY "Authenticated can view project holidays"
  ON public.project_holidays
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins and PMs insert project holidays" ON public.project_holidays;
CREATE POLICY "Admins and PMs insert project holidays"
  ON public.project_holidays
  FOR INSERT
  TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'admin'::app_role)
    OR has_role(auth.uid(),'project_manager'::app_role)
  );

DROP POLICY IF EXISTS "Admins and PMs update project holidays" ON public.project_holidays;
CREATE POLICY "Admins and PMs update project holidays"
  ON public.project_holidays
  FOR UPDATE
  TO authenticated
  USING (
    has_role(auth.uid(),'admin'::app_role)
    OR has_role(auth.uid(),'project_manager'::app_role)
  );

DROP POLICY IF EXISTS "Admins and PMs delete project holidays" ON public.project_holidays;
CREATE POLICY "Admins and PMs delete project holidays"
  ON public.project_holidays
  FOR DELETE
  TO authenticated
  USING (
    has_role(auth.uid(),'admin'::app_role)
    OR has_role(auth.uid(),'project_manager'::app_role)
  );