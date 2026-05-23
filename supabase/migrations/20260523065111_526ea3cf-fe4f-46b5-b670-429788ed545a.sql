CREATE TABLE IF NOT EXISTS public.telegram_menu_state (
  chat_id BIGINT PRIMARY KEY,
  message_id BIGINT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_menu_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service role only" ON public.telegram_menu_state
  FOR ALL USING (false) WITH CHECK (false);
