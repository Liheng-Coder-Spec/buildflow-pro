-- ============================================================
-- TELEGRAM ADMIN CONFIGURATION
-- Store system-wide default brief times set by admins
-- ============================================================

CREATE TABLE IF NOT EXISTS public.telegram_admin_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  morning_default TIME NOT NULL DEFAULT '08:00:00',
  evening_default TIME NOT NULL DEFAULT '18:00:00',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  CONSTRAINT single_row CHECK (id = '00000000-0000-0000-0000-000000000000'::uuid OR true)
);

-- Enable RLS
ALTER TABLE public.telegram_admin_config ENABLE ROW LEVEL SECURITY;

-- Policy: Admins can read and update
CREATE POLICY "Admins can manage telegram config"
  ON public.telegram_admin_config
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND 'admin' = ANY(roles)
    )
  );

-- Policy: Users can read (to get defaults)
CREATE POLICY "Users can read telegram config"
  ON public.telegram_admin_config
  FOR SELECT
  USING (true);

-- Insert default row
INSERT INTO public.telegram_admin_config (id, morning_default, evening_default)
VALUES ('00000000-0000-0000-0000-000000000000'::uuid, '08:00:00', '18:00:00')
ON CONFLICT DO NOTHING;
