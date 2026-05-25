
-- Remove overly permissive policy on architecture_window_schedule
DROP POLICY IF EXISTS "Authenticated users can manage architecture_window_schedule" ON public.architecture_window_schedule;

-- Tighten procurement task templates write policies
DROP POLICY IF EXISTS "Authenticated users can insert procurement task templates" ON public.master_procurement_task_templates;
DROP POLICY IF EXISTS "Authenticated users can update procurement task templates" ON public.master_procurement_task_templates;

CREATE POLICY "Privileged roles can insert procurement task templates"
ON public.master_procurement_task_templates
FOR INSERT
TO authenticated
WITH CHECK (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);

CREATE POLICY "Privileged roles can update procurement task templates"
ON public.master_procurement_task_templates
FOR UPDATE
TO authenticated
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

CREATE POLICY "Privileged roles can delete procurement task templates"
ON public.master_procurement_task_templates
FOR DELETE
TO authenticated
USING (
  has_role(auth.uid(), 'admin'::app_role)
  OR has_role(auth.uid(), 'project_manager'::app_role)
  OR has_role(auth.uid(), 'engineer'::app_role)
);
