
-- ENUMS
CREATE TYPE public.timesheet_status AS ENUM ('draft','submitted','approved','rejected');
CREATE TYPE public.payroll_period_status AS ENUM ('open','locked','paid');

-- PAY RATES
CREATE TABLE public.pay_rates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  hourly_rate numeric(10,2) NOT NULL CHECK (hourly_rate >= 0),
  overtime_multiplier numeric(4,2) NOT NULL DEFAULT 1.5 CHECK (overtime_multiplier >= 1),
  currency text NOT NULL DEFAULT 'USD',
  effective_from date NOT NULL DEFAULT CURRENT_DATE,
  effective_to date,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_pay_rates_user ON public.pay_rates(user_id, effective_from DESC);

ALTER TABLE public.pay_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own pay rate" ON public.pay_rates
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Payroll managers view all pay rates" ON public.pay_rates
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'project_manager')
  );
CREATE POLICY "Payroll managers insert pay rates" ON public.pay_rates
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Payroll managers update pay rates" ON public.pay_rates
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Admins delete pay rates" ON public.pay_rates
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_pay_rates_updated
  BEFORE UPDATE ON public.pay_rates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- TIMESHEET ENTRIES
CREATE TABLE public.timesheet_entries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,
  task_id uuid REFERENCES public.tasks(id) ON DELETE SET NULL,
  work_date date NOT NULL,
  start_time time,
  end_time time,
  regular_hours numeric(5,2) NOT NULL DEFAULT 0 CHECK (regular_hours >= 0 AND regular_hours <= 24),
  overtime_hours numeric(5,2) NOT NULL DEFAULT 0 CHECK (overtime_hours >= 0 AND overtime_hours <= 24),
  notes text,
  status public.timesheet_status NOT NULL DEFAULT 'draft',
  submitted_at timestamptz,
  reviewed_by uuid,
  reviewed_at timestamptz,
  rejection_reason text,
  flags jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_timesheet_user_date ON public.timesheet_entries(user_id, work_date DESC);
CREATE INDEX idx_timesheet_status ON public.timesheet_entries(status);
CREATE INDEX idx_timesheet_project ON public.timesheet_entries(project_id);

ALTER TABLE public.timesheet_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own timesheets" ON public.timesheet_entries
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Approvers view all timesheets" ON public.timesheet_entries
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager')
    OR has_role(auth.uid(),'supervisor') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Users insert own timesheets" ON public.timesheet_entries
  FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users update own draft/rejected" ON public.timesheet_entries
  FOR UPDATE TO authenticated USING (
    user_id = auth.uid() AND status IN ('draft','rejected')
  );
CREATE POLICY "Approvers update timesheets" ON public.timesheet_entries
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'supervisor')
  );
CREATE POLICY "Users delete own draft" ON public.timesheet_entries
  FOR DELETE TO authenticated USING (user_id = auth.uid() AND status = 'draft');

CREATE TRIGGER trg_timesheet_updated
  BEFORE UPDATE ON public.timesheet_entries
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- FRAUD DETECTION TRIGGER
CREATE OR REPLACE FUNCTION public.validate_timesheet_entry()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  total_hours numeric;
  overlap_count int;
  new_flags jsonb := '[]'::jsonb;
BEGIN
  -- Block future dates beyond today
  IF NEW.work_date > CURRENT_DATE THEN
    RAISE EXCEPTION 'Cannot log time for future dates';
  END IF;

  -- Block edits on approved entries (except by approvers)
  IF TG_OP = 'UPDATE' AND OLD.status = 'approved' AND NEW.status = 'approved' THEN
    IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')) THEN
      RAISE EXCEPTION 'Approved entries cannot be modified';
    END IF;
  END IF;

  -- Total hours per day check (≤24h)
  SELECT COALESCE(SUM(regular_hours + overtime_hours),0) INTO total_hours
  FROM public.timesheet_entries
  WHERE user_id = NEW.user_id
    AND work_date = NEW.work_date
    AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid);
  IF total_hours + NEW.regular_hours + NEW.overtime_hours > 24 THEN
    RAISE EXCEPTION 'Total hours for % cannot exceed 24 (current: %, adding: %)',
      NEW.work_date, total_hours, NEW.regular_hours + NEW.overtime_hours;
  END IF;

  -- Time overlap check (if start/end provided)
  IF NEW.start_time IS NOT NULL AND NEW.end_time IS NOT NULL THEN
    IF NEW.end_time <= NEW.start_time THEN
      RAISE EXCEPTION 'End time must be after start time';
    END IF;
    SELECT count(*) INTO overlap_count
    FROM public.timesheet_entries
    WHERE user_id = NEW.user_id
      AND work_date = NEW.work_date
      AND id <> COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::uuid)
      AND start_time IS NOT NULL AND end_time IS NOT NULL
      AND (NEW.start_time, NEW.end_time) OVERLAPS (start_time, end_time);
    IF overlap_count > 0 THEN
      RAISE EXCEPTION 'Time entry overlaps with another entry on %', NEW.work_date;
    END IF;
  END IF;

  -- Soft flags (warnings, stored on row)
  IF total_hours + NEW.regular_hours + NEW.overtime_hours > 12 THEN
    new_flags := new_flags || jsonb_build_object('type','long_day','message','More than 12 hours logged');
  END IF;
  IF EXTRACT(DOW FROM NEW.work_date) IN (0,6) THEN
    new_flags := new_flags || jsonb_build_object('type','weekend','message','Weekend entry');
  END IF;
  IF NEW.overtime_hours > 0 AND NEW.regular_hours < 8 THEN
    new_flags := new_flags || jsonb_build_object('type','ot_without_full_day','message','Overtime logged without full regular day');
  END IF;
  NEW.flags := new_flags;

  -- Approval guard
  IF TG_OP = 'UPDATE' AND NEW.status IN ('approved','rejected') AND OLD.status <> NEW.status THEN
    IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'project_manager') OR has_role(auth.uid(),'supervisor')) THEN
      RAISE EXCEPTION 'Only supervisors/PMs/admins can approve or reject timesheets';
    END IF;
    NEW.reviewed_by := auth.uid();
    NEW.reviewed_at := now();
  END IF;

  IF TG_OP = 'UPDATE' AND NEW.status = 'submitted' AND OLD.status <> 'submitted' THEN
    NEW.submitted_at := now();
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_validate_timesheet
  BEFORE INSERT OR UPDATE ON public.timesheet_entries
  FOR EACH ROW EXECUTE FUNCTION public.validate_timesheet_entry();

-- PAYROLL PERIODS
CREATE TABLE public.payroll_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  period_start date NOT NULL,
  period_end date NOT NULL CHECK (period_end >= period_start),
  status public.payroll_period_status NOT NULL DEFAULT 'open',
  locked_at timestamptz,
  locked_by uuid,
  paid_at timestamptz,
  notes text,
  created_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_payroll_period_range ON public.payroll_periods(period_start, period_end);

ALTER TABLE public.payroll_periods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Payroll managers view periods" ON public.payroll_periods
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'project_manager')
  );
CREATE POLICY "Payroll managers insert periods" ON public.payroll_periods
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Payroll managers update periods" ON public.payroll_periods
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Admins delete periods" ON public.payroll_periods
  FOR DELETE TO authenticated USING (has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_payroll_periods_updated
  BEFORE UPDATE ON public.payroll_periods
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- PAYROLL LINES (snapshot per user/period)
CREATE TABLE public.payroll_lines (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id uuid NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  user_id uuid NOT NULL,
  regular_hours numeric(8,2) NOT NULL DEFAULT 0,
  overtime_hours numeric(8,2) NOT NULL DEFAULT 0,
  hourly_rate numeric(10,2) NOT NULL DEFAULT 0,
  overtime_multiplier numeric(4,2) NOT NULL DEFAULT 1.5,
  regular_pay numeric(12,2) NOT NULL DEFAULT 0,
  overtime_pay numeric(12,2) NOT NULL DEFAULT 0,
  total_pay numeric(12,2) NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'USD',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (period_id, user_id)
);
CREATE INDEX idx_payroll_lines_period ON public.payroll_lines(period_id);

ALTER TABLE public.payroll_lines ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users view own payroll lines" ON public.payroll_lines
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Payroll managers view all lines" ON public.payroll_lines
  FOR SELECT TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant') OR has_role(auth.uid(),'project_manager')
  );
CREATE POLICY "Payroll managers manage lines insert" ON public.payroll_lines
  FOR INSERT TO authenticated WITH CHECK (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Payroll managers manage lines update" ON public.payroll_lines
  FOR UPDATE TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );
CREATE POLICY "Payroll managers manage lines delete" ON public.payroll_lines
  FOR DELETE TO authenticated USING (
    has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')
  );

-- Function to compute payroll lines for a period
CREATE OR REPLACE FUNCTION public.compute_payroll_lines(_period_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  p_start date;
  p_end date;
BEGIN
  IF NOT (has_role(auth.uid(),'admin') OR has_role(auth.uid(),'accountant')) THEN
    RAISE EXCEPTION 'Only admins or accountants can compute payroll';
  END IF;

  SELECT period_start, period_end INTO p_start, p_end
  FROM public.payroll_periods WHERE id = _period_id;

  IF p_start IS NULL THEN
    RAISE EXCEPTION 'Period not found';
  END IF;

  DELETE FROM public.payroll_lines WHERE period_id = _period_id;

  INSERT INTO public.payroll_lines (
    period_id, user_id, regular_hours, overtime_hours,
    hourly_rate, overtime_multiplier,
    regular_pay, overtime_pay, total_pay, currency
  )
  SELECT
    _period_id,
    t.user_id,
    SUM(t.regular_hours),
    SUM(t.overtime_hours),
    COALESCE(pr.hourly_rate, 0),
    COALESCE(pr.overtime_multiplier, 1.5),
    SUM(t.regular_hours) * COALESCE(pr.hourly_rate, 0),
    SUM(t.overtime_hours) * COALESCE(pr.hourly_rate, 0) * COALESCE(pr.overtime_multiplier, 1.5),
    SUM(t.regular_hours) * COALESCE(pr.hourly_rate, 0)
      + SUM(t.overtime_hours) * COALESCE(pr.hourly_rate, 0) * COALESCE(pr.overtime_multiplier, 1.5),
    COALESCE(pr.currency, 'USD')
  FROM public.timesheet_entries t
  LEFT JOIN LATERAL (
    SELECT hourly_rate, overtime_multiplier, currency
    FROM public.pay_rates
    WHERE user_id = t.user_id
      AND effective_from <= p_end
      AND (effective_to IS NULL OR effective_to >= p_start)
    ORDER BY effective_from DESC
    LIMIT 1
  ) pr ON true
  WHERE t.work_date BETWEEN p_start AND p_end
    AND t.status = 'approved'
  GROUP BY t.user_id, pr.hourly_rate, pr.overtime_multiplier, pr.currency;
END;
$$;
