
-- ============================================================
-- E-LEAVE MODULE: Standalone parallel schema for HR/E-Leave.
-- All tables prefixed with eleave_ to avoid colliding with the
-- existing leave_requests / leave_balances / notifications.
-- Reuses existing app_role enum and has_role(uuid, app_role).
-- ============================================================

-- Enums (idempotent)
DO $$ BEGIN
  CREATE TYPE public.eleave_status AS ENUM ('pending','approved','rejected','withdrawn','pending_cancellation');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.eleave_gender AS ENUM ('male','female','any');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.eleave_deduct_from AS ENUM ('balance','none');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.eleave_notif_type AS ENUM (
    'new_request','approved','rejected','withdrawn',
    'cancellation_requested','cancellation_approved','cancellation_denied'
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE public.eleave_replacement_period AS ENUM ('full','am','pm');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Extend profiles with E-Leave columns (nullable, additive only)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS eleave_department_id UUID,
  ADD COLUMN IF NOT EXISTS supervisor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS gender public.eleave_gender NOT NULL DEFAULT 'any',
  ADD COLUMN IF NOT EXISTS years_of_service NUMERIC NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS probation_end_date DATE;

-- ============================================================
-- Departments (E-Leave scoped)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_departments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.eleave_departments TO authenticated;
GRANT ALL ON public.eleave_departments TO service_role;

ALTER TABLE public.eleave_departments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_dept read" ON public.eleave_departments
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_dept admin" ON public.eleave_departments
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Leave types
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_leave_types (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  color TEXT NOT NULL DEFAULT 'blue',
  days_per_year NUMERIC NOT NULL DEFAULT 0,
  carry_forward_max NUMERIC NOT NULL DEFAULT 0,
  expiry_month INTEGER,
  probation_required BOOLEAN NOT NULL DEFAULT false,
  doc_required BOOLEAN NOT NULL DEFAULT false,
  half_day_allowed BOOLEAN NOT NULL DEFAULT true,
  skip_capacity_check BOOLEAN NOT NULL DEFAULT false,
  max_days_per_request NUMERIC,
  advance_notice_days INTEGER NOT NULL DEFAULT 0,
  gender_restriction public.eleave_gender NOT NULL DEFAULT 'any',
  monthly_accrual BOOLEAN NOT NULL DEFAULT false,
  seniority_based BOOLEAN NOT NULL DEFAULT false,
  deduct_from public.eleave_deduct_from NOT NULL DEFAULT 'balance',
  is_replacement BOOLEAN NOT NULL DEFAULT false,
  paid BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  cancel_cutoff_days INTEGER NOT NULL DEFAULT 2,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT ON public.eleave_leave_types TO authenticated;
GRANT ALL ON public.eleave_leave_types TO service_role;

ALTER TABLE public.eleave_leave_types ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_lt read" ON public.eleave_leave_types
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_lt admin" ON public.eleave_leave_types
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Seniority rules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_seniority_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  leave_type_id UUID NOT NULL REFERENCES public.eleave_leave_types(id) ON DELETE CASCADE,
  min_years NUMERIC NOT NULL DEFAULT 0,
  days NUMERIC NOT NULL DEFAULT 0
);

GRANT SELECT ON public.eleave_seniority_rules TO authenticated;
GRANT ALL ON public.eleave_seniority_rules TO service_role;

ALTER TABLE public.eleave_seniority_rules ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_sr read" ON public.eleave_seniority_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_sr admin" ON public.eleave_seniority_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Leave balances
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_leave_balances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.eleave_leave_types(id) ON DELETE CASCADE,
  year INTEGER NOT NULL,
  yearly_allowance NUMERIC NOT NULL DEFAULT 0,
  carried_over NUMERIC NOT NULL DEFAULT 0,
  used NUMERIC NOT NULL DEFAULT 0,
  expired NUMERIC NOT NULL DEFAULT 0,
  adjustments NUMERIC NOT NULL DEFAULT 0,
  UNIQUE(user_id, leave_type_id, year)
);

GRANT SELECT, INSERT, UPDATE ON public.eleave_leave_balances TO authenticated;
GRANT ALL ON public.eleave_leave_balances TO service_role;

ALTER TABLE public.eleave_leave_balances ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_bal self read" ON public.eleave_leave_balances
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR public.has_role(auth.uid(),'admin')
         OR public.has_role(auth.uid(),'supervisor')
         OR public.has_role(auth.uid(),'project_manager'));
CREATE POLICY "eleave_bal admin manage" ON public.eleave_leave_balances
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Leave requests
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_leave_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  leave_type_id UUID NOT NULL REFERENCES public.eleave_leave_types(id),
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  half_day BOOLEAN NOT NULL DEFAULT false,
  days NUMERIC NOT NULL,
  reason TEXT NOT NULL DEFAULT '',
  attachment_url TEXT,
  attachment_urls TEXT[] NOT NULL DEFAULT '{}',
  cc_user_ids UUID[] NOT NULL DEFAULT '{}',
  cc_emails TEXT[] NOT NULL DEFAULT '{}',
  status public.eleave_status NOT NULL DEFAULT 'pending',
  current_level INTEGER NOT NULL DEFAULT 1,
  total_levels INTEGER NOT NULL DEFAULT 1,
  decided_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eleave_req_user ON public.eleave_leave_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_eleave_req_status ON public.eleave_leave_requests(status);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.eleave_leave_requests TO authenticated;
GRANT ALL ON public.eleave_leave_requests TO service_role;

ALTER TABLE public.eleave_leave_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_req read" ON public.eleave_leave_requests
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR public.has_role(auth.uid(),'admin')
         OR public.has_role(auth.uid(),'supervisor')
         OR public.has_role(auth.uid(),'project_manager'));
CREATE POLICY "eleave_req insert self" ON public.eleave_leave_requests
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "eleave_req update self" ON public.eleave_leave_requests
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "eleave_req admin all" ON public.eleave_leave_requests
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Approval chains
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_approval_chains (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  scope TEXT NOT NULL DEFAULT 'company',
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  department_id UUID REFERENCES public.eleave_departments(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  level INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eleave_approval_chains TO authenticated;
GRANT ALL ON public.eleave_approval_chains TO service_role;
ALTER TABLE public.eleave_approval_chains ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_ac read" ON public.eleave_approval_chains
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_ac admin" ON public.eleave_approval_chains
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Request approvals
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_request_approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id UUID NOT NULL REFERENCES public.eleave_leave_requests(id) ON DELETE CASCADE,
  approver_id UUID NOT NULL REFERENCES auth.users(id),
  level INTEGER NOT NULL,
  decision TEXT,
  comment TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eleave_ra_approver ON public.eleave_request_approvals(approver_id, decision);
GRANT SELECT, UPDATE ON public.eleave_request_approvals TO authenticated;
GRANT ALL ON public.eleave_request_approvals TO service_role;
ALTER TABLE public.eleave_request_approvals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_ra read" ON public.eleave_request_approvals
  FOR SELECT TO authenticated
  USING (approver_id = auth.uid()
         OR public.has_role(auth.uid(),'admin')
         OR public.has_role(auth.uid(),'supervisor')
         OR public.has_role(auth.uid(),'project_manager')
         OR EXISTS (SELECT 1 FROM public.eleave_leave_requests r
                    WHERE r.id = request_id AND r.user_id = auth.uid()));
CREATE POLICY "eleave_ra admin" ON public.eleave_request_approvals
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Capacity rules / overrides
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_team_capacity_rules (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.eleave_departments(id) ON DELETE CASCADE,
  max_percent NUMERIC NOT NULL DEFAULT 50
);
CREATE TABLE IF NOT EXISTS public.eleave_capacity_overrides (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id UUID REFERENCES public.eleave_departments(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  max_percent NUMERIC NOT NULL
);
GRANT SELECT ON public.eleave_team_capacity_rules TO authenticated;
GRANT ALL ON public.eleave_team_capacity_rules TO service_role;
GRANT SELECT ON public.eleave_capacity_overrides TO authenticated;
GRANT ALL ON public.eleave_capacity_overrides TO service_role;
ALTER TABLE public.eleave_team_capacity_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.eleave_capacity_overrides ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_cap read" ON public.eleave_team_capacity_rules
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_cap admin" ON public.eleave_team_capacity_rules
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY "eleave_capo read" ON public.eleave_capacity_overrides
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_capo admin" ON public.eleave_capacity_overrides
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Replacement credits
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_replacement_credits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  worked_date DATE NOT NULL,
  target_date DATE,
  period public.eleave_replacement_period NOT NULL DEFAULT 'full',
  days NUMERIC NOT NULL DEFAULT 1,
  status public.eleave_status NOT NULL DEFAULT 'pending',
  reason TEXT,
  current_level INTEGER NOT NULL DEFAULT 1,
  total_levels INTEGER NOT NULL DEFAULT 2,
  supervisor_id UUID,
  supervisor_decision TEXT,
  supervisor_comment TEXT,
  supervisor_decided_at TIMESTAMPTZ,
  admin_id UUID,
  admin_decision TEXT,
  admin_comment TEXT,
  admin_decided_at TIMESTAMPTZ,
  rejection_reason TEXT,
  credited_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.eleave_replacement_credits TO authenticated;
GRANT ALL ON public.eleave_replacement_credits TO service_role;
ALTER TABLE public.eleave_replacement_credits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_rc self read" ON public.eleave_replacement_credits
  FOR SELECT TO authenticated
  USING (user_id = auth.uid()
         OR public.has_role(auth.uid(),'admin')
         OR public.has_role(auth.uid(),'supervisor')
         OR public.has_role(auth.uid(),'project_manager'));
CREATE POLICY "eleave_rc self insert" ON public.eleave_replacement_credits
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "eleave_rc admin" ON public.eleave_replacement_credits
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Notifications (E-Leave scoped)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type public.eleave_notif_type NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL DEFAULT '',
  request_id UUID REFERENCES public.eleave_leave_requests(id) ON DELETE CASCADE,
  read BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_eleave_notif_user ON public.eleave_notifications(user_id, read);
GRANT SELECT, UPDATE ON public.eleave_notifications TO authenticated;
GRANT ALL ON public.eleave_notifications TO service_role;
ALTER TABLE public.eleave_notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_notif self read" ON public.eleave_notifications
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "eleave_notif self update" ON public.eleave_notifications
  FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "eleave_notif admin" ON public.eleave_notifications
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Audit log (E-Leave scoped)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_audit_log (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  entity TEXT NOT NULL,
  entity_id UUID,
  details JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eleave_audit_log TO authenticated;
GRANT ALL ON public.eleave_audit_log TO service_role;
ALTER TABLE public.eleave_audit_log ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_audit admin read" ON public.eleave_audit_log
  FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));

-- ============================================================
-- Public holidays
-- ============================================================
CREATE TABLE IF NOT EXISTS public.eleave_public_holidays (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_date DATE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.eleave_public_holidays TO authenticated;
GRANT ALL ON public.eleave_public_holidays TO service_role;
ALTER TABLE public.eleave_public_holidays ENABLE ROW LEVEL SECURITY;
CREATE POLICY "eleave_ph read" ON public.eleave_public_holidays
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "eleave_ph admin" ON public.eleave_public_holidays
  FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin'))
  WITH CHECK (public.has_role(auth.uid(),'admin'));

-- Update_at triggers (reuse existing update_updated_at_column())
DROP TRIGGER IF EXISTS trg_eleave_req_updated ON public.eleave_leave_requests;
CREATE TRIGGER trg_eleave_req_updated
  BEFORE UPDATE ON public.eleave_leave_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_eleave_ph_updated ON public.eleave_public_holidays;
CREATE TRIGGER trg_eleave_ph_updated
  BEFORE UPDATE ON public.eleave_public_holidays
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed Cambodia 2026 holidays
INSERT INTO public.eleave_public_holidays (holiday_date, name) VALUES
  ('2026-01-01','International New Year Day'),
  ('2026-01-07','Victory Day over the Genocidal Regime'),
  ('2026-03-08','International Women''s Day'),
  ('2026-04-14','Khmer New Year Day'),
  ('2026-04-15','Khmer New Year Day'),
  ('2026-04-16','Khmer New Year Day'),
  ('2026-05-01','International Labor Day'),
  ('2026-05-05','Royal Plowing Ceremony'),
  ('2026-05-14','King Norodom Sihamoni''s Birthday'),
  ('2026-05-20','Peace Day in Cambodia'),
  ('2026-06-18','Queen Mother Norodom Monineath''s Birthday'),
  ('2026-09-24','Constitutional Day'),
  ('2026-10-09','Pchum Ben Day'),
  ('2026-10-10','Pchum Ben Day'),
  ('2026-10-11','Pchum Ben Day'),
  ('2026-10-15','Commemoration Day of King''s Father'),
  ('2026-10-29','Coronation Day of King Norodom Sihamoni'),
  ('2026-11-09','National Independence Day'),
  ('2026-11-23','Water Festival'),
  ('2026-11-24','Water Festival'),
  ('2026-11-25','Water Festival')
ON CONFLICT (holiday_date) DO NOTHING;

-- Seed a default "Replacement" leave type
INSERT INTO public.eleave_leave_types (name, color, is_replacement, days_per_year, deduct_from, half_day_allowed, paid, active)
SELECT 'Replacement','green', true, 0, 'balance', true, true, true
WHERE NOT EXISTS (SELECT 1 FROM public.eleave_leave_types WHERE name = 'Replacement');

-- Seed common leave types
INSERT INTO public.eleave_leave_types (name, color, days_per_year, paid, active)
VALUES
  ('Annual Leave','blue', 18, true, true),
  ('Sick Leave','red', 7, true, true),
  ('Personal Leave','purple', 3, true, true)
ON CONFLICT (name) DO NOTHING;
