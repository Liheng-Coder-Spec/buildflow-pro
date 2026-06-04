
-- =========================================================
-- Security hardening:
--  1. profiles: hide bank / emergency / telegram personal columns from
--     non-admin coworkers (column-level SELECT) and expose them only
--     through SECURITY DEFINER RPCs to the owner or admin/accountant.
--  2. project-scoped engineering tables: limit SELECT to project members.
--  3. report_schedules: limit SELECT to admins and project managers.
-- =========================================================

-- ---------- 1. profiles column-level SELECT hardening ----------
REVOKE SELECT ON public.profiles FROM authenticated;
REVOKE SELECT ON public.profiles FROM anon;

-- Non-sensitive columns remain readable subject to existing RLS policies.
GRANT SELECT (
  id, full_name, employee_id, phone, avatar_url, job_title,
  created_at, updated_at, company_id, hire_date, employment_status,
  department, report_to_employee_id, level, reports_to, email,
  telegram_linked_at, eleave_department_id, supervisor_id, gender,
  years_of_service, probation_end_date
) ON public.profiles TO authenticated;

-- Helper: admin or accountant.
CREATE OR REPLACE FUNCTION public.is_admin_or_accountant(_uid uuid)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT public.has_role(_uid, 'admin'::app_role)
      OR public.has_role(_uid, 'accountant'::app_role)
$$;
GRANT EXECUTE ON FUNCTION public.is_admin_or_accountant(uuid) TO authenticated;

-- Caller's own full row (all columns, including sensitive fields).
CREATE OR REPLACE FUNCTION public.get_my_profile()
RETURNS SETOF public.profiles
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.profiles WHERE id = auth.uid();
$$;
GRANT EXECUTE ON FUNCTION public.get_my_profile() TO authenticated;

-- Full row for self, admin, or accountant.
CREATE OR REPLACE FUNCTION public.get_profile_full(target uuid)
RETURNS SETOF public.profiles
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.profiles
   WHERE id = target
     AND (auth.uid() = target OR public.is_admin_or_accountant(auth.uid()));
$$;
GRANT EXECUTE ON FUNCTION public.get_profile_full(uuid) TO authenticated;

-- Full directory listing, admin/accountant only.
CREATE OR REPLACE FUNCTION public.list_profiles_full()
RETURNS SETOF public.profiles
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT * FROM public.profiles
   WHERE public.is_admin_or_accountant(auth.uid())
   ORDER BY full_name;
$$;
GRANT EXECUTE ON FUNCTION public.list_profiles_full() TO authenticated;


-- ---------- 2. Project-scoped engineering tables ----------
-- Replace company-wide SELECT with project-membership scoped SELECT.

DROP POLICY IF EXISTS "Users can view architecture_material_boards for their projects"
  ON public.architecture_material_boards;
CREATE POLICY "Project members view architecture_material_boards"
  ON public.architecture_material_boards
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = architecture_material_boards.project_id
        AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view mep_load_schedules for their projects"
  ON public.mep_load_schedules;
CREATE POLICY "Project members view mep_load_schedules"
  ON public.mep_load_schedules
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = mep_load_schedules.project_id
        AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view mep_system_schematics for their projects"
  ON public.mep_system_schematics;
CREATE POLICY "Project members view mep_system_schematics"
  ON public.mep_system_schematics
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = mep_system_schematics.project_id
        AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view structural_calculation_notes for their projects"
  ON public.structural_calculation_notes;
CREATE POLICY "Project members view structural_calculation_notes"
  ON public.structural_calculation_notes
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = structural_calculation_notes.project_id
        AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view structural_model_register for their projects"
  ON public.structural_model_register;
CREATE POLICY "Project members view structural_model_register"
  ON public.structural_model_register
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = structural_model_register.project_id
        AND pm.user_id = auth.uid()
    )
  );

DROP POLICY IF EXISTS "Users can view structural_technical_queries for their projects"
  ON public.structural_technical_queries;
CREATE POLICY "Project members view structural_technical_queries"
  ON public.structural_technical_queries
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
    OR EXISTS (
      SELECT 1 FROM public.project_members pm
      WHERE pm.project_id = structural_technical_queries.project_id
        AND pm.user_id = auth.uid()
    )
  );


-- ---------- 3. report_schedules SELECT restriction ----------
DROP POLICY IF EXISTS "Authenticated can view report schedules"
  ON public.report_schedules;
CREATE POLICY "Admins and PMs view report schedules"
  ON public.report_schedules
  FOR SELECT TO authenticated
  USING (
    has_role(auth.uid(), 'admin'::app_role)
    OR has_role(auth.uid(), 'project_manager'::app_role)
  );
