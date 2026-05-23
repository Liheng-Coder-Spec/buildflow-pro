ALTER TABLE public.telegram_menu_state
  ADD COLUMN IF NOT EXISTS view text,
  ADD COLUMN IF NOT EXISTS filter text,
  ADD COLUMN IF NOT EXISTS page integer;