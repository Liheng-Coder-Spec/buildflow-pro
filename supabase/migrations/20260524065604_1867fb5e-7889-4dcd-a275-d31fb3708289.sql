CREATE TABLE public.master_procurement_task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  package_number TEXT NOT NULL UNIQUE,
  package_description TEXT NOT NULL,
  trade TEXT,
  brief_scope TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

ALTER TABLE public.master_procurement_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view procurement task templates"
ON public.master_procurement_task_templates FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Authenticated users can insert procurement task templates"
ON public.master_procurement_task_templates FOR INSERT
TO authenticated WITH CHECK (true);

CREATE POLICY "Authenticated users can update procurement task templates"
ON public.master_procurement_task_templates FOR UPDATE
TO authenticated USING (true);

CREATE TRIGGER update_master_procurement_task_templates_updated_at
BEFORE UPDATE ON public.master_procurement_task_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();