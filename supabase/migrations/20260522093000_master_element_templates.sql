-- Master Libraries: Element Templates
-- Run this file in Supabase SQL Editor to create storage for the Elements Template form.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'element_template_category') THEN
    CREATE TYPE public.element_template_category AS ENUM ('Structure', 'Archiecture', 'MEP');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.master_element_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  element_code text NOT NULL,
  category public.element_template_category NOT NULL,
  element_name text NOT NULL,
  note text,
  is_active boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT master_element_templates_element_code_key UNIQUE (element_code)
);

CREATE INDEX IF NOT EXISTS idx_master_element_templates_category
  ON public.master_element_templates(category);

CREATE INDEX IF NOT EXISTS idx_master_element_templates_active
  ON public.master_element_templates(is_active);

DROP TRIGGER IF EXISTS update_master_element_templates_updated_at ON public.master_element_templates;
CREATE TRIGGER update_master_element_templates_updated_at
  BEFORE UPDATE ON public.master_element_templates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.master_element_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view master element templates" ON public.master_element_templates;
CREATE POLICY "Authenticated can view master element templates"
  ON public.master_element_templates
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Planners can create master element templates" ON public.master_element_templates;
CREATE POLICY "Planners can create master element templates"
  ON public.master_element_templates
  FOR INSERT
  TO authenticated
  WITH CHECK (
    created_by = auth.uid()
    AND (
      public.has_role(auth.uid(), 'admin')
      OR public.has_role(auth.uid(), 'project_manager')
      OR public.has_role(auth.uid(), 'engineer')
    )
  );

DROP POLICY IF EXISTS "Planners can update master element templates" ON public.master_element_templates;
CREATE POLICY "Planners can update master element templates"
  ON public.master_element_templates
  FOR UPDATE
  TO authenticated
  USING (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'project_manager')
    OR public.has_role(auth.uid(), 'engineer')
  )
  WITH CHECK (
    public.has_role(auth.uid(), 'admin')
    OR public.has_role(auth.uid(), 'project_manager')
    OR public.has_role(auth.uid(), 'engineer')
  );

DROP POLICY IF EXISTS "Admins can delete master element templates" ON public.master_element_templates;
CREATE POLICY "Admins can delete master element templates"
  ON public.master_element_templates
  FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));
