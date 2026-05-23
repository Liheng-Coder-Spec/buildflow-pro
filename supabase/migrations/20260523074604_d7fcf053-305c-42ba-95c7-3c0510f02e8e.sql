
-- ============================================================
-- Helper: role check for "planner-like" roles
-- ============================================================

-- ============================================================
-- 1) PAY RATES — company-scoped read
-- ============================================================
DROP POLICY IF EXISTS "Payroll managers view all pay rates" ON public.pay_rates;
CREATE POLICY "Payroll managers view company pay rates"
ON public.pay_rates FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  OR (
    (has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'project_manager'))
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      JOIN public.profiles tgt ON tgt.id = pay_rates.user_id
      WHERE me.id = auth.uid()
        AND me.company_id IS NOT NULL
        AND me.company_id = tgt.company_id
    )
  )
);

-- ============================================================
-- 2) PAYROLL LINES — company-scoped read
-- ============================================================
DROP POLICY IF EXISTS "Payroll managers view all lines" ON public.payroll_lines;
CREATE POLICY "Payroll managers view company lines"
ON public.payroll_lines FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  OR (
    (has_role(auth.uid(), 'accountant') OR has_role(auth.uid(), 'project_manager'))
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      JOIN public.profiles tgt ON tgt.id = payroll_lines.user_id
      WHERE me.id = auth.uid()
        AND me.company_id IS NOT NULL
        AND me.company_id = tgt.company_id
    )
  )
);

-- ============================================================
-- 3) SUBCONTRACTORS — role-scoped read
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view subcontractors" ON public.subcontractors;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.subcontractors;
CREATE POLICY "Privileged roles view subcontractors"
ON public.subcontractors FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'project_manager')
  OR has_role(auth.uid(), 'accountant')
  OR has_role(auth.uid(), 'engineer')
);

-- ============================================================
-- 4) SUPPLIERS — role-scoped read
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view suppliers" ON public.suppliers;
DROP POLICY IF EXISTS "Allow authenticated access" ON public.suppliers;
CREATE POLICY "Privileged roles view suppliers"
ON public.suppliers FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'project_manager')
  OR has_role(auth.uid(), 'accountant')
  OR has_role(auth.uid(), 'engineer')
);

-- ============================================================
-- 5) STAKEHOLDER CONTACTS — admin/PM only
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view stakeholder contacts" ON public.stakeholder_contacts;
CREATE POLICY "Admins and PMs view stakeholder contacts"
ON public.stakeholder_contacts FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  OR has_role(auth.uid(), 'project_manager')
);

-- ============================================================
-- 6) PROJECTS — company/member-scoped read
-- ============================================================
DROP POLICY IF EXISTS "Authenticated users can view projects" ON public.projects;
CREATE POLICY "Members and same-company users view projects"
ON public.projects FOR SELECT
USING (
  has_role(auth.uid(), 'admin')
  OR EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
  )
  OR (
    projects.company_id IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles me
      WHERE me.id = auth.uid() AND me.company_id = projects.company_id
    )
  )
);

-- ============================================================
-- 7) Generic helper: replace blanket "all authenticated" policies
--    on project-scoped tables.
-- ============================================================

-- architecture_drawings
DROP POLICY IF EXISTS "Allow authenticated access" ON public.architecture_drawings;
CREATE POLICY "Project members view architecture_drawings"
ON public.architecture_drawings FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = architecture_drawings.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Engineers manage architecture_drawings"
ON public.architecture_drawings FOR ALL
USING (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer')
)
WITH CHECK (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer')
);

-- architecture_material_boards
DROP POLICY IF EXISTS "Authenticated users can manage architecture_material_boards" ON public.architecture_material_boards;
CREATE POLICY "Engineers manage architecture_material_boards"
ON public.architecture_material_boards FOR ALL
USING (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer')
)
WITH CHECK (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer')
);

-- design_review_comments
DROP POLICY IF EXISTS "Allow authenticated access" ON public.design_review_comments;
CREATE POLICY "Project members view design_review_comments"
ON public.design_review_comments FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = design_review_comments.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Engineers manage design_review_comments"
ON public.design_review_comments FOR ALL
USING (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer') OR has_role(auth.uid(),'supervisor')
)
WITH CHECK (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer') OR has_role(auth.uid(),'supervisor')
);

-- dlp_defects
DROP POLICY IF EXISTS "Allow authenticated access" ON public.dlp_defects;
CREATE POLICY "Project members view dlp_defects"
ON public.dlp_defects FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = dlp_defects.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Site roles manage dlp_defects"
ON public.dlp_defects FOR ALL
USING (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer') OR has_role(auth.uid(),'supervisor') OR has_role(auth.uid(),'qaqc_inspector')
)
WITH CHECK (
  has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer') OR has_role(auth.uid(),'supervisor') OR has_role(auth.uid(),'qaqc_inspector')
);

-- handover_packages
DROP POLICY IF EXISTS "Allow authenticated access" ON public.handover_packages;
CREATE POLICY "Project members view handover_packages"
ON public.handover_packages FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = handover_packages.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Admins and PMs manage handover_packages"
ON public.handover_packages FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));

-- handover_items
DROP POLICY IF EXISTS "Allow authenticated access" ON public.handover_items;
CREATE POLICY "Project members view handover_items"
ON public.handover_items FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (
    SELECT 1 FROM public.handover_packages hp
    JOIN public.project_members pm ON pm.project_id = hp.project_id
    WHERE hp.id = handover_items.package_id AND pm.user_id = auth.uid()
  )
);
CREATE POLICY "Admins and PMs manage handover_items"
ON public.handover_items FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));

-- kpi_alert_events
DROP POLICY IF EXISTS "Authenticated can insert kpi events" ON public.kpi_alert_events;
DROP POLICY IF EXISTS "Authenticated can update kpi events" ON public.kpi_alert_events;
CREATE POLICY "Admins and PMs insert kpi events"
ON public.kpi_alert_events FOR INSERT
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));
CREATE POLICY "Admins and PMs update kpi events"
ON public.kpi_alert_events FOR UPDATE
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));

-- master_task_template_documents
DROP POLICY IF EXISTS "Planners can manage task template documents" ON public.master_task_template_documents;
DROP POLICY IF EXISTS "Planners can update task template documents" ON public.master_task_template_documents;
DROP POLICY IF EXISTS "Planners can delete task template documents" ON public.master_task_template_documents;
CREATE POLICY "Planners insert task template documents"
ON public.master_task_template_documents FOR INSERT
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));
CREATE POLICY "Planners update task template documents"
ON public.master_task_template_documents FOR UPDATE
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));
CREATE POLICY "Planners delete task template documents"
ON public.master_task_template_documents FOR DELETE
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- mep_load_schedules
DROP POLICY IF EXISTS "Allow authenticated access" ON public.mep_load_schedules;
DROP POLICY IF EXISTS "Authenticated users can manage mep_load_schedules" ON public.mep_load_schedules;
CREATE POLICY "Engineers manage mep_load_schedules"
ON public.mep_load_schedules FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- mep_system_schematics
DROP POLICY IF EXISTS "Allow authenticated access" ON public.mep_system_schematics;
DROP POLICY IF EXISTS "Authenticated users can manage mep_system_schematics" ON public.mep_system_schematics;
CREATE POLICY "Engineers manage mep_system_schematics"
ON public.mep_system_schematics FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- mep_material_submittals
DROP POLICY IF EXISTS "Allow authenticated access" ON public.mep_material_submittals;
CREATE POLICY "Project members view mep_material_submittals"
ON public.mep_material_submittals FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = mep_material_submittals.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Engineers manage mep_material_submittals"
ON public.mep_material_submittals FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- structural_calculation_notes
DROP POLICY IF EXISTS "Authenticated users can manage structural_calculation_notes" ON public.structural_calculation_notes;
CREATE POLICY "Engineers manage structural_calculation_notes"
ON public.structural_calculation_notes FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- structural_model_register
DROP POLICY IF EXISTS "Authenticated users can manage structural_model_register" ON public.structural_model_register;
CREATE POLICY "Engineers manage structural_model_register"
ON public.structural_model_register FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- structural_technical_queries
DROP POLICY IF EXISTS "Authenticated users can manage structural_technical_queries" ON public.structural_technical_queries;
CREATE POLICY "Engineers manage structural_technical_queries"
ON public.structural_technical_queries FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- structural_design_criteria
DROP POLICY IF EXISTS "Allow authenticated access" ON public.structural_design_criteria;
CREATE POLICY "Project members view structural_design_criteria"
ON public.structural_design_criteria FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = structural_design_criteria.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Engineers manage structural_design_criteria"
ON public.structural_design_criteria FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- structural_load_summaries
DROP POLICY IF EXISTS "Allow authenticated access" ON public.structural_load_summaries;
CREATE POLICY "Project members view structural_load_summaries"
ON public.structural_load_summaries FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = structural_load_summaries.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Engineers manage structural_load_summaries"
ON public.structural_load_summaries FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer'));

-- structural_rebar_reviews
DROP POLICY IF EXISTS "Allow authenticated access" ON public.structural_rebar_reviews;
CREATE POLICY "Project members view structural_rebar_reviews"
ON public.structural_rebar_reviews FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = structural_rebar_reviews.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Engineers manage structural_rebar_reviews"
ON public.structural_rebar_reviews FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer') OR has_role(auth.uid(),'qaqc_inspector'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'engineer') OR has_role(auth.uid(),'qaqc_inspector'));

-- warranty_register
DROP POLICY IF EXISTS "Allow authenticated access" ON public.warranty_register;
CREATE POLICY "Project members view warranty_register"
ON public.warranty_register FOR SELECT
USING (
  has_role(auth.uid(),'admin')
  OR EXISTS (SELECT 1 FROM public.project_members pm WHERE pm.project_id = warranty_register.project_id AND pm.user_id = auth.uid())
);
CREATE POLICY "Admins and PMs manage warranty_register"
ON public.warranty_register FOR ALL
USING (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'))
WITH CHECK (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager'));

-- ============================================================
-- 8) HOLIDAYS — admin-only writes
-- ============================================================
DROP POLICY IF EXISTS "Allow admin insert holidays" ON public.holidays;
DROP POLICY IF EXISTS "Allow admin update holidays" ON public.holidays;
DROP POLICY IF EXISTS "Allow admin delete holidays" ON public.holidays;
CREATE POLICY "Admins insert holidays" ON public.holidays FOR INSERT
WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update holidays" ON public.holidays FOR UPDATE
USING (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete holidays" ON public.holidays FOR DELETE
USING (has_role(auth.uid(),'admin'));

-- ============================================================
-- 9) LEAVE TYPES — admin-only writes
-- ============================================================
DROP POLICY IF EXISTS "Allow admin insert leave_types" ON public.leave_types;
DROP POLICY IF EXISTS "Allow admin update leave_types" ON public.leave_types;
CREATE POLICY "Admins insert leave_types" ON public.leave_types FOR INSERT
WITH CHECK (has_role(auth.uid(),'admin'));
CREATE POLICY "Admins update leave_types" ON public.leave_types FOR UPDATE
USING (has_role(auth.uid(),'admin'));

-- ============================================================
-- 10) RFI ATTACHMENTS / RESPONSES — restrict writes
-- ============================================================
DROP POLICY IF EXISTS "Authorized users can upload RFI attachments" ON public.rfi_attachments;
CREATE POLICY "Project members upload RFI attachments"
ON public.rfi_attachments FOR INSERT
WITH CHECK (
  uploaded_by = auth.uid()
  AND (
    has_role(auth.uid(),'admin')
    OR EXISTS (
      SELECT 1 FROM public.rfis r
      JOIN public.project_members pm ON pm.project_id = r.project_id
      WHERE r.id = rfi_attachments.rfi_id AND pm.user_id = auth.uid()
    )
  )
);

DROP POLICY IF EXISTS "Authorized users can add responses" ON public.rfi_responses;
CREATE POLICY "Project members add RFI responses"
ON public.rfi_responses FOR INSERT
WITH CHECK (
  responded_by = auth.uid()
  AND (
    has_role(auth.uid(),'admin')
    OR EXISTS (
      SELECT 1 FROM public.rfis r
      JOIN public.project_members pm ON pm.project_id = r.project_id
      WHERE r.id = rfi_responses.rfi_id AND pm.user_id = auth.uid()
    )
  )
);

-- ============================================================
-- 11) Convert project_cost_summaries view to security_invoker
-- ============================================================
ALTER VIEW IF EXISTS public.project_cost_summaries SET (security_invoker = true);

-- ============================================================
-- 12) Fix mutable search_path on trigger/helper functions
-- ============================================================
ALTER FUNCTION public.update_updated_at_column() SET search_path = public;
ALTER FUNCTION public.handle_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_suppliers_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_po_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_invoice_updated_at() SET search_path = public;
ALTER FUNCTION public.handle_budget_updated_at() SET search_path = public;
ALTER FUNCTION public.update_budget_commitment() SET search_path = public;
ALTER FUNCTION public.update_po_delivery_status() SET search_path = public;
ALTER FUNCTION public.validate_invoice_match() SET search_path = public;
ALTER FUNCTION public.validate_construction_task_status_transition() SET search_path = public;
ALTER FUNCTION public.auto_allocate_leave_balance() SET search_path = public;
ALTER FUNCTION public.check_budget_available(text, uuid, numeric) SET search_path = public;
ALTER FUNCTION public.generate_document_number(uuid, text, text, text, integer) SET search_path = public;

-- ============================================================
-- 13) Revoke SECURITY DEFINER function EXECUTE from anon
-- ============================================================
DO $$
DECLARE r record;
BEGIN
  FOR r IN
    SELECT format('%I.%I(%s)', n.nspname, p.proname, pg_get_function_identity_arguments(p.oid)) AS sig
    FROM pg_proc p
    JOIN pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname = 'public' AND p.prosecdef = true
  LOOP
    EXECUTE format('REVOKE EXECUTE ON FUNCTION %s FROM anon', r.sig);
  END LOOP;
END $$;
