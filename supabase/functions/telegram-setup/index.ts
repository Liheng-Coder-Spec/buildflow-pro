import { createClient } from "npm:@supabase/supabase-js@2";

const migrations = [
  // 1. Core tables — profiles columns, telegram_link_codes, telegram_outbox
  {
    name: "01_core_tables",
    sql: `
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS telegram_chat_id BIGINT,
  ADD COLUMN IF NOT EXISTS telegram_username TEXT,
  ADD COLUMN IF NOT EXISTS telegram_linked_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS profiles_telegram_chat_id_key
  ON public.profiles (telegram_chat_id) WHERE telegram_chat_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS public.telegram_link_codes (
  code TEXT PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS telegram_link_codes_user_idx
  ON public.telegram_link_codes (user_id);

ALTER TABLE public.telegram_link_codes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage own link codes"
  ON public.telegram_link_codes
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.telegram_outbox (
  notification_id UUID PRIMARY KEY,
  user_id UUID,
  chat_id BIGINT,
  status TEXT NOT NULL DEFAULT 'pending',
  error TEXT,
  sent_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_outbox ENABLE ROW LEVEL SECURITY;
`,
  },
  // 2. Conversation state table
  {
    name: "02_conversation_state",
    sql: `
CREATE TABLE IF NOT EXISTS public.telegram_conversation_state (
  chat_id bigint PRIMARY KEY,
  user_id uuid NOT NULL,
  task_id uuid NOT NULL,
  step text NOT NULL CHECK (step IN ('awaiting_progress','awaiting_status','awaiting_note')),
  progress_pct integer,
  status text,
  expires_at timestamptz NOT NULL DEFAULT (now() + interval '15 minutes'),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_conversation_state ENABLE ROW LEVEL SECURITY;
`,
  },
  // 3. notify_task_status_change + card_message_id
  {
    name: "03_status_change_trigger",
    sql: `
CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_assignee uuid;
  v_planner uuid;
  v_title text;
  v_body text;
  v_type public.notification_type;
  v_priority public.notification_priority := 'normal';
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  v_body := COALESCE(NEW.code || ' — ', '') || NEW.title;

  CASE NEW.status
    WHEN 'assigned' THEN
      NULL;

    WHEN 'in_progress' THEN
      IF OLD.status = 'rejected' THEN
        v_type := 'task_reopened';
        v_title := 'Task reopened';
      ELSE
        v_type := 'task_started';
        v_title := 'Task started';
      END IF;
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'pending_approval' THEN
      v_type := 'task_submitted_for_approval';
      v_title := 'Task awaiting approval';
      v_priority := 'high';
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, v_priority, v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'approved' THEN
      v_type := 'task_approved';
      v_title := 'Task approved';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        PERFORM public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);

    WHEN 'rejected' THEN
      v_type := 'task_rejected';
      v_title := 'Task rejected';
      v_priority := 'high';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        PERFORM public.create_notification(
          v_assignee, v_type, v_title,
          COALESCE('Reason: ' || NEW.rejection_reason || E'\n', '') || v_body,
          'task', NEW.id, NEW.project_id, v_priority, v_actor,
          jsonb_build_object('rejection_reason', NEW.rejection_reason));
      END LOOP;

    WHEN 'completed' THEN
      v_type := 'task_completed';
      v_title := 'Task completed';
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'closed' THEN
      v_type := 'task_closed';
      v_title := 'Task closed';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        PERFORM public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'low', v_actor, '{}'::jsonb);
      END LOOP;
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'low', v_actor, '{}'::jsonb);

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;

ALTER TABLE public.telegram_conversation_state
  ADD COLUMN IF NOT EXISTS card_message_id BIGINT;
`,
  },
  // 4. Outbox additional columns
  {
    name: "04_outbox_columns",
    sql: `
ALTER TABLE public.telegram_outbox
  ADD COLUMN IF NOT EXISTS message_id BIGINT,
  ADD COLUMN IF NOT EXISTS message_text TEXT,
  ADD COLUMN IF NOT EXISTS entity_type TEXT,
  ADD COLUMN IF NOT EXISTS entity_id UUID;

CREATE INDEX IF NOT EXISTS idx_telegram_outbox_entity
  ON public.telegram_outbox(entity_type, entity_id, chat_id);
`,
  },
  // 5. Telegram username in notification triggers
  {
    name: "05_telegram_username_triggers",
    sql: `
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS telegram_username TEXT;

CREATE OR REPLACE FUNCTION public.notify_task_assignment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_task record;
  v_body text;
  v_telegram text;
  v_metadata jsonb;
BEGIN
  SELECT id, code, title, project_id INTO v_task FROM public.tasks WHERE id = COALESCE(NEW.task_id, OLD.task_id);
  v_body := COALESCE(v_task.code || ' — ', '') || v_task.title;

  SELECT telegram_username INTO v_telegram FROM public.profiles WHERE id = NEW.user_id;

  IF v_telegram IS NOT NULL AND v_telegram <> '' THEN
    IF left(v_telegram, 1) <> '@' THEN
      v_telegram := '@' || v_telegram;
    END IF;
    v_body := v_body || E'\n' || v_telegram;
    v_metadata := jsonb_build_object('assignee_telegram', v_telegram);
  ELSE
    v_metadata := '{}'::jsonb;
  END IF;

  IF TG_OP = 'INSERT' THEN
    PERFORM public.create_notification(
      NEW.user_id, 'task_assigned', 'You were assigned a task', v_body,
      'task', v_task.id, v_task.project_id, 'normal', v_actor, v_metadata);
  ELSIF TG_OP = 'UPDATE' AND OLD.unassigned_at IS NULL AND NEW.unassigned_at IS NOT NULL THEN
    PERFORM public.create_notification(
      NEW.user_id, 'task_unassigned', 'You were unassigned from a task', v_body,
      'task', v_task.id, v_task.project_id, 'low', v_actor, '{}'::jsonb);
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.notify_task_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_actor uuid := auth.uid();
  v_assignee uuid;
  v_planner uuid;
  v_title text;
  v_body text;
  v_body_tg text;
  v_telegram text;
  v_metadata jsonb;
  v_type public.notification_type;
  v_priority public.notification_priority := 'normal';
BEGIN
  IF NEW.status = OLD.status THEN
    RETURN NEW;
  END IF;

  v_body := COALESCE(NEW.code || ' — ', '') || NEW.title;

  CASE NEW.status
    WHEN 'assigned' THEN
      v_type := 'task_assigned';
      v_title := 'Task assigned';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        SELECT telegram_username INTO v_telegram FROM public.profiles WHERE id = v_assignee;

        IF v_telegram IS NOT NULL AND v_telegram <> '' THEN
          IF left(v_telegram, 1) <> '@' THEN
            v_telegram := '@' || v_telegram;
          END IF;
          v_body_tg := v_body || E'\n' || v_telegram;
          v_metadata := jsonb_build_object('assignee_telegram', v_telegram);
        ELSE
          v_body_tg := v_body;
          v_metadata := '{}'::jsonb;
        END IF;

        PERFORM public.create_notification(
          v_assignee, v_type, v_title, v_body_tg, 'task', NEW.id, NEW.project_id, 'normal', v_actor, v_metadata);
      END LOOP;

    WHEN 'in_progress' THEN
      IF OLD.status = 'rejected' THEN
        v_type := 'task_reopened';
        v_title := 'Task reopened';
      ELSE
        v_type := 'task_started';
        v_title := 'Task started';
      END IF;
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'pending_approval' THEN
      v_type := 'task_submitted_for_approval';
      v_title := 'Task awaiting approval';
      v_priority := 'high';
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, v_priority, v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'approved' THEN
      v_type := 'task_approved';
      v_title := 'Task approved';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        PERFORM public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);

    WHEN 'rejected' THEN
      v_type := 'task_rejected';
      v_title := 'Task rejected';
      v_priority := 'high';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        PERFORM public.create_notification(
          v_assignee, v_type, v_title,
          COALESCE('Reason: ' || NEW.rejection_reason || E'\n', '') || v_body,
          'task', NEW.id, NEW.project_id, v_priority, v_actor,
          jsonb_build_object('rejection_reason', NEW.rejection_reason));
      END LOOP;

    WHEN 'completed' THEN
      v_type := 'task_completed';
      v_title := 'Task completed';
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'completed' THEN
      v_type := 'task_completed';
      v_title := 'Task completed';
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      FOR v_planner IN SELECT * FROM public.get_project_planners(NEW.project_id) LOOP
        PERFORM public.create_notification(
          v_planner, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'normal', v_actor, '{}'::jsonb);
      END LOOP;

    WHEN 'closed' THEN
      v_type := 'task_closed';
      v_title := 'Task closed';
      FOR v_assignee IN
        SELECT user_id FROM public.task_assignments
        WHERE task_id = NEW.id AND unassigned_at IS NULL
      LOOP
        PERFORM public.create_notification(
          v_assignee, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'low', v_actor, '{}'::jsonb);
      END LOOP;
      PERFORM public.create_notification(
        NEW.created_by, v_type, v_title, v_body, 'task', NEW.id, NEW.project_id, 'low', v_actor, '{}'::jsonb);

    ELSE
      NULL;
  END CASE;

  RETURN NEW;
END;
$$;
`,
  },
  // 6. Brief prefs + pg_cron
  {
    name: "06_brief_prefs",
    sql: `
CREATE TABLE IF NOT EXISTS public.telegram_brief_prefs (
  user_id      uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  morning_at   time,
  evening_at   time,
  timezone     text NOT NULL DEFAULT 'UTC',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.telegram_brief_prefs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own brief prefs"
  ON public.telegram_brief_prefs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users insert own brief prefs"
  ON public.telegram_brief_prefs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users update own brief prefs"
  ON public.telegram_brief_prefs FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users delete own brief prefs"
  ON public.telegram_brief_prefs FOR DELETE
  USING (auth.uid() = user_id);

CREATE OR REPLACE FUNCTION public._tg_brief_prefs_touch()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

DROP TRIGGER IF EXISTS trg_tg_brief_prefs_touch ON public.telegram_brief_prefs;
CREATE TRIGGER trg_tg_brief_prefs_touch
  BEFORE UPDATE ON public.telegram_brief_prefs
  FOR EACH ROW EXECUTE FUNCTION public._tg_brief_prefs_touch();

CREATE TABLE IF NOT EXISTS public.telegram_brief_log (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  brief_kind  text NOT NULL CHECK (brief_kind IN ('morning','evening')),
  local_date  date NOT NULL,
  sent_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, brief_kind, local_date)
);

ALTER TABLE public.telegram_brief_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own brief log"
  ON public.telegram_brief_log FOR SELECT
  USING (auth.uid() = user_id);

CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;
`,
  },
];

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
  const SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const MGMT_API_KEY = Deno.env.get("SUPABASE_MGMT_API_KEY");

  if (!SUPABASE_URL || !SERVICE_KEY || !MGMT_API_KEY) {
    return new Response(
      JSON.stringify({
        ok: false,
        error: "Missing required env vars: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SUPABASE_MGMT_API_KEY",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }

  const projectRef = SUPABASE_URL.replace("https://", "").split(".")[0];

  async function runSql(sql: string): Promise<{ ok: boolean; detail?: string }> {
    const res = await fetch(
      `https://api.supabase.com/v1/projects/${projectRef}/sql/query`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${MGMT_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query: sql }),
      },
    );
    if (!res.ok) {
      const body = await res.text();
      return { ok: false, detail: `[${res.status}] ${body.slice(0, 500)}` };
    }
    return { ok: true };
  }

  const results: { name: string; status: string; detail?: string }[] = [];

  for (const m of migrations) {
    const r = await runSql(m.sql);
    results.push({ name: m.name, status: r.ok ? "ok" : "error", detail: r.detail });
  }

  // Register pg_cron schedule for briefs
  const cronSql = `SELECT cron.schedule(
    'telegram-briefs',
    '*/15 * * * *',
    'SELECT net.http_post(
      url:=''${SUPABASE_URL}/functions/v1/telegram-briefs'',
      headers:=''{"Content-Type": "application/json"}''
    )'
  );`;

  const cronR = await runSql(cronSql);
  results.push({
    name: "07_pg_cron_schedule",
    status: cronR.ok ? "ok" : "warning",
    detail: cronR.detail,
  });

  const allOk = results.every((r) => r.status === "ok" || r.status === "warning");

  return new Response(JSON.stringify({ ok: allOk, results }), {
    headers: { "Content-Type": "application/json" },
  });
});
