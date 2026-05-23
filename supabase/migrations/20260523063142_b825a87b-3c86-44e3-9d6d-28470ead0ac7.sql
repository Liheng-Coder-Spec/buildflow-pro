
-- 1) approval_instances: fix broken approver policy
DROP POLICY IF EXISTS "Assigned approvers can update approval_instances" ON public.approval_instances;
CREATE POLICY "Assigned approvers can update approval_instances"
ON public.approval_instances FOR UPDATE
USING (EXISTS (
  SELECT 1 FROM public.approval_steps s
  WHERE s.approval_instance_id = approval_instances.id
    AND s.assignee_user_id = auth.uid()
));

DROP POLICY IF EXISTS "Users can view related approval_instances" ON public.approval_instances;
CREATE POLICY "Users can view related approval_instances"
ON public.approval_instances FOR SELECT
USING (
  requested_by = auth.uid()
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.approval_steps s
    WHERE s.approval_instance_id = approval_instances.id
      AND s.assignee_user_id = auth.uid()
  )
);

-- 2) attendance_records: own-only, plus admin policy
DROP POLICY IF EXISTS "Allow read own attendance" ON public.attendance_records;
DROP POLICY IF EXISTS "Allow update own attendance" ON public.attendance_records;
CREATE POLICY "Users read own attendance"
ON public.attendance_records FOR SELECT
USING (auth.uid() = user_id);
CREATE POLICY "Users update own attendance"
ON public.attendance_records FOR UPDATE
USING (auth.uid() = user_id);
CREATE POLICY "Admins manage all attendance"
ON public.attendance_records FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

-- 3) companies: scope to company members
DROP POLICY IF EXISTS "Authenticated users can view their own company" ON public.companies;
CREATE POLICY "Members view their company"
ON public.companies FOR SELECT
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.profiles p
    WHERE p.id = auth.uid() AND p.company_id = companies.id
  )
);

-- 4) leave_balances: own + admin
DROP POLICY IF EXISTS "Allow read own leave_balances" ON public.leave_balances;
DROP POLICY IF EXISTS "Allow admin insert leave_balances" ON public.leave_balances;
DROP POLICY IF EXISTS "Allow admin update leave_balances" ON public.leave_balances;
CREATE POLICY "Users read own leave_balances"
ON public.leave_balances FOR SELECT
USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins insert leave_balances"
ON public.leave_balances FOR INSERT
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Admins update leave_balances"
ON public.leave_balances FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role));

-- 5) leave_requests: own + admin/PM
DROP POLICY IF EXISTS "Allow read own leave_requests" ON public.leave_requests;
DROP POLICY IF EXISTS "Allow update own draft leave_requests" ON public.leave_requests;
CREATE POLICY "Users read own leave_requests"
ON public.leave_requests FOR SELECT
USING (
  auth.uid() = user_id
  OR has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
);
CREATE POLICY "Users update own draft leave_requests"
ON public.leave_requests FOR UPDATE
USING (auth.uid() = user_id AND status IN ('draft'::leave_status, 'rejected'::leave_status));
CREATE POLICY "Admins and PMs manage leave_requests"
ON public.leave_requests FOR UPDATE
USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'project_manager'::app_role));

-- 6) master_task_template_checklist
DROP POLICY IF EXISTS "Planners can manage task template checklist" ON public.master_task_template_checklist;
DROP POLICY IF EXISTS "Planners can update task template checklist" ON public.master_task_template_checklist;
DROP POLICY IF EXISTS "Planners can delete task template checklist" ON public.master_task_template_checklist;
CREATE POLICY "Planners insert task template checklist"
ON public.master_task_template_checklist FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);
CREATE POLICY "Planners update task template checklist"
ON public.master_task_template_checklist FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);
CREATE POLICY "Planners delete task template checklist"
ON public.master_task_template_checklist FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);

-- 7) master_task_template_dependencies
DROP POLICY IF EXISTS "Planners can manage task template dependencies" ON public.master_task_template_dependencies;
DROP POLICY IF EXISTS "Planners can update task template dependencies" ON public.master_task_template_dependencies;
DROP POLICY IF EXISTS "Planners can delete task template dependencies" ON public.master_task_template_dependencies;
CREATE POLICY "Planners insert task template dependencies"
ON public.master_task_template_dependencies FOR INSERT
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);
CREATE POLICY "Planners update task template dependencies"
ON public.master_task_template_dependencies FOR UPDATE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);
CREATE POLICY "Planners delete task template dependencies"
ON public.master_task_template_dependencies FOR DELETE
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);

-- 8) pr_items
DROP POLICY IF EXISTS "Authorized users can manage PR items" ON public.pr_items;
CREATE POLICY "Procurement users manage PR items"
ON public.pr_items FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
  OR has_role(auth.uid(), 'accountant'::app_role)
);

-- 9) profiles: restrict sensitive fields via view + tightened policy
DROP POLICY IF EXISTS "Authenticated users can view all profiles" ON public.profiles;
CREATE POLICY "Users view own full profile"
ON public.profiles FOR SELECT
USING (auth.uid() = id OR has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Users view coworker basic profile"
ON public.profiles FOR SELECT
USING (
  auth.uid() IS NOT NULL
  AND EXISTS (
    SELECT 1 FROM public.profiles me
    WHERE me.id = auth.uid()
      AND me.company_id IS NOT NULL
      AND me.company_id = profiles.company_id
  )
);

-- Public-safe view (no bank/emergency/phone/telegram)
CREATE OR REPLACE VIEW public.profiles_public
WITH (security_invoker = true) AS
SELECT id, full_name, avatar_url, job_title, department, employee_id, company_id
FROM public.profiles;
GRANT SELECT ON public.profiles_public TO authenticated;

-- 10) rds_material_takeoffs
DROP POLICY IF EXISTS "Authorized users can manage MTOs" ON public.rds_material_takeoffs;
CREATE POLICY "Authorized roles manage MTOs"
ON public.rds_material_takeoffs FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);

-- 11) safety_incidents
DROP POLICY IF EXISTS "Authorized users can report incidents" ON public.safety_incidents;
CREATE POLICY "Authorized roles manage safety incidents"
ON public.safety_incidents FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
  OR has_role(auth.uid(), 'qaqc_inspector'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
  OR has_role(auth.uid(), 'qaqc_inspector'::app_role)
);

-- 12) safety_toolbox_talks
DROP POLICY IF EXISTS "Authorized users can log toolbox talks" ON public.safety_toolbox_talks;
CREATE POLICY "Authorized roles manage toolbox talks"
ON public.safety_toolbox_talks FOR ALL
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
  OR has_role(auth.uid(), 'qaqc_inspector'::app_role)
)
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
  OR has_role(auth.uid(), 'supervisor'::app_role)
  OR has_role(auth.uid(), 'qaqc_inspector'::app_role)
);
