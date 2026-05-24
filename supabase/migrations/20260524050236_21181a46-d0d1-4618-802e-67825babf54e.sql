CREATE TABLE public.design_stages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.design_stages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated users can view design stages"
  ON public.design_stages FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert design stages"
  ON public.design_stages FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update design stages"
  ON public.design_stages FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete design stages"
  ON public.design_stages FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER update_design_stages_updated_at
  BEFORE UPDATE ON public.design_stages
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

INSERT INTO public.design_stages (code, name, sort_order) VALUES
  ('CONCEPT', 'Concept Design', 10),
  ('SD', 'Schematic Design', 20),
  ('DD', 'Design Development', 30),
  ('CD', 'Construction Documents', 40),
  ('TENDER', 'Tender', 50),
  ('CA', 'Construction Administration', 60);
