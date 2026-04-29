
-- =====================================================
-- DOCUMENTS MODULE
-- =====================================================

CREATE TABLE public.documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  category text NOT NULL DEFAULT 'general',
  current_version int NOT NULL DEFAULT 1,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_documents_project ON public.documents(project_id);

CREATE TABLE public.document_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  document_id uuid NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  version int NOT NULL,
  storage_path text NOT NULL,
  file_name text NOT NULL,
  mime_type text,
  size_bytes bigint,
  change_note text,
  uploaded_by uuid,
  uploaded_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (document_id, version)
);

CREATE INDEX idx_document_versions_doc ON public.document_versions(document_id);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_versions ENABLE ROW LEVEL SECURITY;

-- Documents policies
CREATE POLICY "Authenticated can view documents"
  ON public.documents FOR SELECT TO authenticated USING (true);

CREATE POLICY "Planners can create documents"
  ON public.documents FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'engineer') OR
    has_role(auth.uid(),'supervisor')
  );

CREATE POLICY "Planners can update documents"
  ON public.documents FOR UPDATE TO authenticated
  USING (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'engineer') OR
    has_role(auth.uid(),'supervisor')
  );

CREATE POLICY "Admins and PMs delete documents"
  ON public.documents FOR DELETE TO authenticated
  USING (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager')
  );

-- Document versions policies
CREATE POLICY "Authenticated can view doc versions"
  ON public.document_versions FOR SELECT TO authenticated USING (true);

CREATE POLICY "Planners can add versions"
  ON public.document_versions FOR INSERT TO authenticated
  WITH CHECK (
    has_role(auth.uid(),'admin') OR
    has_role(auth.uid(),'project_manager') OR
    has_role(auth.uid(),'engineer') OR
    has_role(auth.uid(),'supervisor')
  );

CREATE POLICY "Admins delete doc versions"
  ON public.document_versions FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin'));

-- Updated_at trigger for documents
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- STORAGE BUCKET (private)
-- =====================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('project-documents','project-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Authenticated read project documents"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'project-documents');

CREATE POLICY "Planners upload project documents"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (
    bucket_id = 'project-documents' AND (
      has_role(auth.uid(),'admin') OR
      has_role(auth.uid(),'project_manager') OR
      has_role(auth.uid(),'engineer') OR
      has_role(auth.uid(),'supervisor')
    )
  );

CREATE POLICY "Planners update project documents"
  ON storage.objects FOR UPDATE TO authenticated
  USING (
    bucket_id = 'project-documents' AND (
      has_role(auth.uid(),'admin') OR
      has_role(auth.uid(),'project_manager')
    )
  );

CREATE POLICY "Admins delete project documents"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'project-documents' AND has_role(auth.uid(),'admin'));

-- =====================================================
-- AUDIT TRAIL — generic logger
-- =====================================================
CREATE OR REPLACE FUNCTION public.log_audit_event()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_id uuid;
  v_action text;
  v_before jsonb;
  v_after jsonb;
BEGIN
  IF TG_OP = 'INSERT' THEN
    v_action := 'create';
    v_before := NULL;
    v_after := to_jsonb(NEW);
    v_id := (NEW).id;
  ELSIF TG_OP = 'UPDATE' THEN
    v_action := 'update';
    v_before := to_jsonb(OLD);
    v_after := to_jsonb(NEW);
    v_id := (NEW).id;
  ELSIF TG_OP = 'DELETE' THEN
    v_action := 'delete';
    v_before := to_jsonb(OLD);
    v_after := NULL;
    v_id := (OLD).id;
  END IF;

  INSERT INTO public.audit_log (entity_type, entity_id, action, user_id, before_data, after_data)
  VALUES (TG_TABLE_NAME, v_id, v_action, auth.uid(), v_before, v_after);

  RETURN COALESCE(NEW, OLD);
END;
$$;

-- Attach to key tables
CREATE TRIGGER trg_audit_projects
AFTER INSERT OR UPDATE OR DELETE ON public.projects
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_tasks
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_timesheets
AFTER INSERT OR UPDATE OR DELETE ON public.timesheet_entries
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_payroll_periods
AFTER INSERT OR UPDATE OR DELETE ON public.payroll_periods
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_pay_rates
AFTER INSERT OR UPDATE OR DELETE ON public.pay_rates
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_user_roles
AFTER INSERT OR UPDATE OR DELETE ON public.user_roles
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_documents
AFTER INSERT OR UPDATE OR DELETE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();

CREATE TRIGGER trg_audit_document_versions
AFTER INSERT OR UPDATE OR DELETE ON public.document_versions
FOR EACH ROW EXECUTE FUNCTION public.log_audit_event();
