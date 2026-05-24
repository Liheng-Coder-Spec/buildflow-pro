CREATE TABLE public.master_design_task_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  task_code TEXT NOT NULL UNIQUE,
  task_name TEXT NOT NULL,
  design_stage_id UUID REFERENCES public.design_stages(id) ON DELETE SET NULL,
  note TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.master_design_task_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated can view design task templates"
ON public.master_design_task_templates FOR SELECT
TO authenticated USING (true);

CREATE POLICY "Admins can insert design task templates"
ON public.master_design_task_templates FOR INSERT
TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update design task templates"
ON public.master_design_task_templates FOR UPDATE
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete design task templates"
ON public.master_design_task_templates FOR DELETE
TO authenticated USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_master_design_task_templates_updated_at
BEFORE UPDATE ON public.master_design_task_templates
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();