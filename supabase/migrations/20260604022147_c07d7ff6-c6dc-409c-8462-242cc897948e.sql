
-- ============================================================
-- 1. Extend payroll_period_status enum
-- ============================================================
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'draft';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'collecting';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'calculated';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'under_review';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'finance_verification';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'pending_approval';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'approved';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'exported';
ALTER TYPE public.payroll_period_status ADD VALUE IF NOT EXISTS 'closed';

-- ============================================================
-- 2. Extend payroll_periods with lifecycle metadata
-- ============================================================
ALTER TABLE public.payroll_periods
  ADD COLUMN IF NOT EXISTS calculated_at      timestamptz,
  ADD COLUMN IF NOT EXISTS calculated_by      uuid,
  ADD COLUMN IF NOT EXISTS reviewed_at        timestamptz,
  ADD COLUMN IF NOT EXISTS reviewed_by        uuid,
  ADD COLUMN IF NOT EXISTS verified_at        timestamptz,
  ADD COLUMN IF NOT EXISTS verified_by        uuid,
  ADD COLUMN IF NOT EXISTS approved_at        timestamptz,
  ADD COLUMN IF NOT EXISTS approved_by        uuid,
  ADD COLUMN IF NOT EXISTS exported_at        timestamptz,
  ADD COLUMN IF NOT EXISTS exported_by        uuid,
  ADD COLUMN IF NOT EXISTS closed_at          timestamptz,
  ADD COLUMN IF NOT EXISTS rejection_reason   text,
  ADD COLUMN IF NOT EXISTS current_step_no    integer NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS payment_method     text;

-- ============================================================
-- 3. Extend payroll_lines with Cambodia tax breakdown
-- ============================================================
ALTER TABLE public.payroll_lines
  ADD COLUMN IF NOT EXISTS base_salary        numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS allowances_total   numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS deductions_total   numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS gross_salary       numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tax_relief         numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS taxable_salary     numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS tos_amount         numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nssf_employee      numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS nssf_employer      numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pension_employee   numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS pension_employer   numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS net_salary         numeric(12,2) NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS calc_breakdown     jsonb         NOT NULL DEFAULT '{}'::jsonb;

-- ============================================================
-- 4. Tax brackets (TOS)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_tax_brackets (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  currency        text NOT NULL CHECK (currency IN ('USD','KHR')),
  min_amount      numeric(14,2) NOT NULL,
  max_amount      numeric(14,2),
  rate            numeric(6,4) NOT NULL,
  fixed_deduction numeric(14,2) NOT NULL DEFAULT 0,
  effective_from  date NOT NULL,
  effective_to    date,
  sort_order      integer NOT NULL DEFAULT 0,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.payroll_tax_brackets TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.payroll_tax_brackets TO authenticated;
GRANT ALL ON public.payroll_tax_brackets TO service_role;
ALTER TABLE public.payroll_tax_brackets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view tax brackets" ON public.payroll_tax_brackets FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage tax brackets" ON public.payroll_tax_brackets FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_payroll_tax_brackets_updated BEFORE UPDATE ON public.payroll_tax_brackets
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 5. Tax relief rules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_tax_relief_rules (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            text NOT NULL UNIQUE,
  name            text NOT NULL,
  currency        text NOT NULL CHECK (currency IN ('USD','KHR')),
  amount          numeric(14,2) NOT NULL,
  per_dependent   boolean NOT NULL DEFAULT false,
  effective_from  date NOT NULL,
  effective_to    date,
  notes           text,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_tax_relief_rules TO authenticated;
GRANT ALL ON public.payroll_tax_relief_rules TO service_role;
ALTER TABLE public.payroll_tax_relief_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view tax relief" ON public.payroll_tax_relief_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage tax relief" ON public.payroll_tax_relief_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_payroll_tax_relief_updated BEFORE UPDATE ON public.payroll_tax_relief_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 6. NSSF rules
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_nssf_rules (
  id                  uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scheme              text NOT NULL CHECK (scheme IN ('occupational_risk','healthcare','pension')),
  employer_rate       numeric(6,4) NOT NULL DEFAULT 0,
  employee_rate       numeric(6,4) NOT NULL DEFAULT 0,
  salary_cap          numeric(14,2),
  currency            text NOT NULL DEFAULT 'KHR' CHECK (currency IN ('USD','KHR')),
  effective_from      date NOT NULL,
  effective_to        date,
  notes               text,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_nssf_rules TO authenticated;
GRANT ALL ON public.payroll_nssf_rules TO service_role;
ALTER TABLE public.payroll_nssf_rules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view nssf rules" ON public.payroll_nssf_rules FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage nssf rules" ON public.payroll_nssf_rules FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_payroll_nssf_updated BEFORE UPDATE ON public.payroll_nssf_rules
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 7. Employee tax profile
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_employee_tax_profile (
  user_id          uuid PRIMARY KEY,
  tin              text,
  nssf_number      text,
  is_resident      boolean NOT NULL DEFAULT true,
  marital_status   text NOT NULL DEFAULT 'single' CHECK (marital_status IN ('single','married','divorced','widowed')),
  dependents       integer NOT NULL DEFAULT 0 CHECK (dependents >= 0),
  notes            text,
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_employee_tax_profile TO authenticated;
GRANT ALL ON public.payroll_employee_tax_profile TO service_role;
ALTER TABLE public.payroll_employee_tax_profile ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee or HR view tax profile" ON public.payroll_employee_tax_profile FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "HR manage tax profile" ON public.payroll_employee_tax_profile FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

CREATE TRIGGER trg_payroll_tax_profile_updated BEFORE UPDATE ON public.payroll_employee_tax_profile
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- ============================================================
-- 8. Employee salary history (immutable rows preferred)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_employee_salary (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         uuid NOT NULL,
  base_salary     numeric(12,2) NOT NULL,
  currency        text NOT NULL DEFAULT 'USD' CHECK (currency IN ('USD','KHR')),
  allowances      jsonb NOT NULL DEFAULT '[]'::jsonb,
  deductions      jsonb NOT NULL DEFAULT '[]'::jsonb,
  effective_from  date NOT NULL,
  effective_to    date,
  reason          text,
  created_by      uuid,
  created_at      timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payroll_salary_user ON public.payroll_employee_salary(user_id, effective_from DESC);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_employee_salary TO authenticated;
GRANT ALL ON public.payroll_employee_salary TO service_role;
ALTER TABLE public.payroll_employee_salary ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee or HR view salary" ON public.payroll_employee_salary FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "HR manage salary" ON public.payroll_employee_salary FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

-- ============================================================
-- 9. Approval chains + steps
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_approval_chains (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tier            text NOT NULL DEFAULT 'medium' CHECK (tier IN ('small','medium','enterprise')),
  step_no         integer NOT NULL,
  role_code       text NOT NULL,
  step_label      text NOT NULL,
  transitions_to  text NOT NULL,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tier, step_no)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_approval_chains TO authenticated;
GRANT ALL ON public.payroll_approval_chains TO service_role;
ALTER TABLE public.payroll_approval_chains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authenticated view chains" ON public.payroll_approval_chains FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage chains" ON public.payroll_approval_chains FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));

CREATE TRIGGER trg_payroll_chains_updated BEFORE UPDATE ON public.payroll_approval_chains
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE IF NOT EXISTS public.payroll_approval_steps (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id      uuid NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  step_no        integer NOT NULL,
  step_label     text NOT NULL,
  role_code      text NOT NULL,
  decision       text NOT NULL CHECK (decision IN ('pending','approved','rejected')),
  decided_by     uuid,
  decided_at     timestamptz,
  comment        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payroll_steps_period ON public.payroll_approval_steps(period_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_approval_steps TO authenticated;
GRANT ALL ON public.payroll_approval_steps TO service_role;
ALTER TABLE public.payroll_approval_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR view approval steps" ON public.payroll_approval_steps FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant') OR public.has_role(auth.uid(),'project_manager'));
CREATE POLICY "HR write approval steps" ON public.payroll_approval_steps FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

-- ============================================================
-- 10. Cost allocations
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_cost_allocations (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id         uuid NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  payroll_line_id   uuid NOT NULL REFERENCES public.payroll_lines(id) ON DELETE CASCADE,
  user_id           uuid NOT NULL,
  project_id        uuid,
  wbs_node_id       uuid,
  hours             numeric(8,2) NOT NULL DEFAULT 0,
  allocation_pct    numeric(7,4) NOT NULL DEFAULT 0,
  allocated_amount  numeric(14,2) NOT NULL DEFAULT 0,
  currency          text NOT NULL DEFAULT 'USD',
  posted_at         timestamptz,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payroll_alloc_period ON public.payroll_cost_allocations(period_id);
CREATE INDEX IF NOT EXISTS idx_payroll_alloc_project ON public.payroll_cost_allocations(project_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_cost_allocations TO authenticated;
GRANT ALL ON public.payroll_cost_allocations TO service_role;
ALTER TABLE public.payroll_cost_allocations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "View cost allocations" ON public.payroll_cost_allocations FOR SELECT TO authenticated
  USING (
    user_id = auth.uid()
    OR public.has_role(auth.uid(),'admin')
    OR public.has_role(auth.uid(),'accountant')
    OR (public.has_role(auth.uid(),'project_manager') AND project_id IS NOT NULL AND EXISTS (
         SELECT 1 FROM public.project_members pm WHERE pm.project_id = payroll_cost_allocations.project_id AND pm.user_id = auth.uid()
       ))
  );
CREATE POLICY "HR manage cost allocations" ON public.payroll_cost_allocations FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

-- ============================================================
-- 11. Audit log
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_audit_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id      uuid,
  entity_type    text NOT NULL,
  entity_id      uuid,
  action         text NOT NULL,
  severity       text NOT NULL DEFAULT 'medium' CHECK (severity IN ('low','medium','high','critical')),
  actor_id       uuid,
  old_values     jsonb,
  new_values     jsonb,
  comment        text,
  created_at     timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_payroll_audit_period ON public.payroll_audit_log(period_id, created_at DESC);

GRANT SELECT, INSERT ON public.payroll_audit_log TO authenticated;
GRANT ALL ON public.payroll_audit_log TO service_role;
ALTER TABLE public.payroll_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "HR view audit" ON public.payroll_audit_log FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "Authenticated insert audit" ON public.payroll_audit_log FOR INSERT TO authenticated
  WITH CHECK (true);

-- ============================================================
-- 12. Payslips
-- ============================================================
CREATE TABLE IF NOT EXISTS public.payroll_payslips (
  id               uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  period_id        uuid NOT NULL REFERENCES public.payroll_periods(id) ON DELETE CASCADE,
  payroll_line_id  uuid NOT NULL REFERENCES public.payroll_lines(id) ON DELETE CASCADE,
  user_id          uuid NOT NULL,
  storage_path     text,
  generated_at     timestamptz NOT NULL DEFAULT now(),
  downloaded_at    timestamptz,
  UNIQUE (period_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.payroll_payslips TO authenticated;
GRANT ALL ON public.payroll_payslips TO service_role;
ALTER TABLE public.payroll_payslips ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Employee or HR view payslip" ON public.payroll_payslips FOR SELECT TO authenticated
  USING (user_id = auth.uid() OR public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));
CREATE POLICY "HR manage payslips" ON public.payroll_payslips FOR ALL TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'))
  WITH CHECK (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant'));

-- ============================================================
-- 13. Seed Cambodia 2024 defaults
-- ============================================================
INSERT INTO public.payroll_tax_brackets (currency, min_amount, max_amount, rate, fixed_deduction, effective_from, sort_order, notes) VALUES
  ('KHR',         0,    1500000, 0.00,         0, '2024-01-01', 1, 'Tax-free band'),
  ('KHR',   1500000,    2000000, 0.05,     75000, '2024-01-01', 2, '5% bracket'),
  ('KHR',   2000000,    8500000, 0.10,    175000, '2024-01-01', 3, '10% bracket'),
  ('KHR',   8500000,   12500000, 0.15,    600000, '2024-01-01', 4, '15% bracket'),
  ('KHR',  12500000,       NULL, 0.20,   1225000, '2024-01-01', 5, '20% bracket'),
  ('USD',         0,        375, 0.00,         0, '2024-01-01', 1, 'Tax-free band (USD eq)'),
  ('USD',       375,        500, 0.05,     18.75, '2024-01-01', 2, '5% bracket'),
  ('USD',       500,       2125, 0.10,     43.75, '2024-01-01', 3, '10% bracket'),
  ('USD',      2125,       3125, 0.15,    150.00, '2024-01-01', 4, '15% bracket'),
  ('USD',      3125,       NULL, 0.20,    306.25, '2024-01-01', 5, '20% bracket')
ON CONFLICT DO NOTHING;

INSERT INTO public.payroll_tax_relief_rules (code, name, currency, amount, per_dependent, effective_from, notes) VALUES
  ('dependent_khr', 'Dependent allowance (KHR)', 'KHR', 150000, true,  '2024-01-01', 'Per minor child or non-working spouse'),
  ('dependent_usd', 'Dependent allowance (USD)', 'USD',  37.50, true,  '2024-01-01', 'Per dependent (USD equivalent)')
ON CONFLICT (code) DO NOTHING;

INSERT INTO public.payroll_nssf_rules (scheme, employer_rate, employee_rate, salary_cap, currency, effective_from, notes) VALUES
  ('occupational_risk', 0.008, 0.000, 1200000, 'KHR', '2024-01-01', 'Occupational risk insurance'),
  ('healthcare',        0.013, 0.013, 1200000, 'KHR', '2024-01-01', 'Healthcare scheme'),
  ('pension',           0.020, 0.020, 1200000, 'KHR', '2024-01-01', 'Pension scheme phase 1')
ON CONFLICT DO NOTHING;

INSERT INTO public.payroll_approval_chains (tier, step_no, role_code, step_label, transitions_to) VALUES
  ('medium', 1, 'accountant',      'HR Officer Review',     'under_review'),
  ('medium', 2, 'accountant',      'HR Manager Approval',   'finance_verification'),
  ('medium', 3, 'accountant',      'Finance Verification',  'pending_approval'),
  ('medium', 4, 'admin',           'Director Approval',     'approved')
ON CONFLICT (tier, step_no) DO NOTHING;

-- ============================================================
-- 14. Calculate TOS from brackets
-- ============================================================
CREATE OR REPLACE FUNCTION public.payroll_calc_tos(
  _taxable_amount numeric,
  _currency       text,
  _period_date    date
) RETURNS numeric
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_rate            numeric;
  v_fixed           numeric;
  v_min             numeric;
BEGIN
  IF _taxable_amount IS NULL OR _taxable_amount <= 0 THEN RETURN 0; END IF;
  SELECT rate, fixed_deduction, min_amount
    INTO v_rate, v_fixed, v_min
    FROM public.payroll_tax_brackets
   WHERE currency = _currency
     AND effective_from <= _period_date
     AND (effective_to IS NULL OR effective_to >= _period_date)
     AND _taxable_amount > min_amount
     AND (max_amount IS NULL OR _taxable_amount <= max_amount)
   ORDER BY sort_order DESC
   LIMIT 1;
  IF v_rate IS NULL THEN RETURN 0; END IF;
  RETURN GREATEST(0, ROUND((_taxable_amount * v_rate) - v_fixed, 2));
END $$;

-- ============================================================
-- 15. compute_payroll_v2
-- ============================================================
CREATE OR REPLACE FUNCTION public.compute_payroll_v2(_period_id uuid)
RETURNS integer
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_period         public.payroll_periods;
  v_count          integer := 0;
  emp              record;
  v_line_id        uuid;
  v_base           numeric;
  v_currency       text;
  v_allow_total    numeric;
  v_deduct_total   numeric;
  v_gross          numeric;
  v_relief         numeric;
  v_taxable        numeric;
  v_tos            numeric;
  v_nssf_e         numeric;
  v_nssf_er        numeric;
  v_pen_e          numeric;
  v_pen_er         numeric;
  v_net            numeric;
  v_dependents     integer;
  v_reg_hours      numeric;
  v_ot_hours       numeric;
  v_relief_amount  numeric;
BEGIN
  IF NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant')) THEN
    RAISE EXCEPTION 'Only HR/admin can compute payroll';
  END IF;

  SELECT * INTO v_period FROM public.payroll_periods WHERE id = _period_id;
  IF v_period.id IS NULL THEN RAISE EXCEPTION 'Period not found'; END IF;
  IF v_period.status IN ('locked','approved','exported','paid','closed') THEN
    RAISE EXCEPTION 'Cannot recompute a locked/approved period';
  END IF;

  -- Wipe existing lines + allocations for clean recompute
  DELETE FROM public.payroll_cost_allocations WHERE period_id = _period_id;
  DELETE FROM public.payroll_lines WHERE period_id = _period_id;

  FOR emp IN
    SELECT DISTINCT te.user_id
      FROM public.timesheet_entries te
     WHERE te.work_date BETWEEN v_period.period_start AND v_period.period_end
       AND te.status = 'approved'
    UNION
    SELECT s.user_id FROM public.payroll_employee_salary s
     WHERE s.effective_from <= v_period.period_end
       AND (s.effective_to IS NULL OR s.effective_to >= v_period.period_start)
  LOOP
    -- Latest effective salary
    SELECT base_salary, currency,
           COALESCE((SELECT SUM((a->>'amount')::numeric) FROM jsonb_array_elements(allowances) a), 0),
           COALESCE((SELECT SUM((d->>'amount')::numeric) FROM jsonb_array_elements(deductions) d), 0)
      INTO v_base, v_currency, v_allow_total, v_deduct_total
      FROM public.payroll_employee_salary
     WHERE user_id = emp.user_id
       AND effective_from <= v_period.period_end
     ORDER BY effective_from DESC
     LIMIT 1;

    IF v_base IS NULL THEN
      v_base := 0; v_currency := 'USD'; v_allow_total := 0; v_deduct_total := 0;
    END IF;

    -- Hours
    SELECT COALESCE(SUM(regular_hours),0), COALESCE(SUM(overtime_hours),0)
      INTO v_reg_hours, v_ot_hours
      FROM public.timesheet_entries
     WHERE user_id = emp.user_id
       AND work_date BETWEEN v_period.period_start AND v_period.period_end
       AND status = 'approved';

    -- Dependents
    SELECT COALESCE(dependents,0) INTO v_dependents
      FROM public.payroll_employee_tax_profile WHERE user_id = emp.user_id;
    v_dependents := COALESCE(v_dependents, 0);

    -- Relief amount
    SELECT COALESCE(amount,0) INTO v_relief_amount
      FROM public.payroll_tax_relief_rules
     WHERE per_dependent = true
       AND currency = v_currency
       AND effective_from <= v_period.period_end
       AND (effective_to IS NULL OR effective_to >= v_period.period_start)
     ORDER BY effective_from DESC LIMIT 1;
    v_relief := COALESCE(v_relief_amount, 0) * v_dependents;

    v_gross   := v_base + v_allow_total;
    v_taxable := GREATEST(0, v_gross - v_deduct_total - v_relief);

    -- NSSF (only for KHR-equivalent salaries; simple model: convert USD→KHR @ 4100)
    -- Skip NSSF calc on USD here for v1 simplicity
    v_nssf_e := 0; v_nssf_er := 0; v_pen_e := 0; v_pen_er := 0;

    v_tos := public.payroll_calc_tos(v_taxable, v_currency, v_period.period_end);
    v_net := v_gross - v_deduct_total - v_tos - v_nssf_e - v_pen_e;

    INSERT INTO public.payroll_lines (
      period_id, user_id, regular_hours, overtime_hours, hourly_rate, overtime_multiplier,
      regular_pay, overtime_pay, total_pay, currency,
      base_salary, allowances_total, deductions_total, gross_salary, tax_relief, taxable_salary,
      tos_amount, nssf_employee, nssf_employer, pension_employee, pension_employer, net_salary,
      calc_breakdown
    ) VALUES (
      _period_id, emp.user_id, v_reg_hours, v_ot_hours, 0, 1.5,
      0, 0, v_net, v_currency,
      v_base, v_allow_total, v_deduct_total, v_gross, v_relief, v_taxable,
      v_tos, v_nssf_e, v_nssf_er, v_pen_e, v_pen_er, v_net,
      jsonb_build_object('dependents', v_dependents, 'relief_per_dep', v_relief_amount)
    ) RETURNING id INTO v_line_id;

    -- Cost allocations by project from timesheets
    INSERT INTO public.payroll_cost_allocations (period_id, payroll_line_id, user_id, project_id, wbs_node_id, hours, allocation_pct, allocated_amount, currency)
    SELECT _period_id, v_line_id, emp.user_id, te.project_id, te.task_id, SUM(te.regular_hours + te.overtime_hours),
           CASE WHEN (v_reg_hours + v_ot_hours) > 0
                THEN ROUND(SUM(te.regular_hours + te.overtime_hours) / (v_reg_hours + v_ot_hours), 4)
                ELSE 0 END,
           CASE WHEN (v_reg_hours + v_ot_hours) > 0
                THEN ROUND(v_net * (SUM(te.regular_hours + te.overtime_hours) / (v_reg_hours + v_ot_hours)), 2)
                ELSE 0 END,
           v_currency
      FROM public.timesheet_entries te
     WHERE te.user_id = emp.user_id
       AND te.work_date BETWEEN v_period.period_start AND v_period.period_end
       AND te.status = 'approved'
     GROUP BY te.project_id, te.task_id;

    v_count := v_count + 1;
  END LOOP;

  UPDATE public.payroll_periods
     SET status = 'calculated', calculated_at = now(), calculated_by = auth.uid()
   WHERE id = _period_id;

  INSERT INTO public.payroll_audit_log (period_id, entity_type, entity_id, action, severity, actor_id, comment)
  VALUES (_period_id, 'payroll_period', _period_id, 'compute', 'medium', auth.uid(), format('Computed %s lines', v_count));

  RETURN v_count;
END $$;

-- ============================================================
-- 16. Lifecycle transition
-- ============================================================
CREATE OR REPLACE FUNCTION public.payroll_period_transition(
  _period_id uuid,
  _to_status payroll_period_status,
  _comment   text DEFAULT NULL
) RETURNS public.payroll_periods
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  v_period public.payroll_periods;
  v_from   payroll_period_status;
  v_allowed boolean := false;
  v_severity text := 'medium';
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication required'; END IF;
  SELECT * INTO v_period FROM public.payroll_periods WHERE id = _period_id;
  IF v_period.id IS NULL THEN RAISE EXCEPTION 'Period not found'; END IF;
  v_from := v_period.status;

  v_allowed := (
    (v_from = 'draft'                AND _to_status IN ('collecting')) OR
    (v_from = 'collecting'           AND _to_status IN ('calculated','draft')) OR
    (v_from IN ('open','calculated') AND _to_status IN ('under_review','collecting')) OR
    (v_from = 'under_review'         AND _to_status IN ('finance_verification','collecting')) OR
    (v_from = 'finance_verification' AND _to_status IN ('pending_approval','under_review')) OR
    (v_from = 'pending_approval'     AND _to_status IN ('approved','under_review')) OR
    (v_from = 'approved'             AND _to_status IN ('locked')) OR
    (v_from = 'locked'               AND _to_status IN ('exported','paid')) OR
    (v_from = 'exported'             AND _to_status IN ('paid')) OR
    (v_from = 'paid'                 AND _to_status IN ('closed')) OR
    (v_from = 'locked'               AND _to_status IN ('approved') AND public.has_role(auth.uid(),'admin'))
  );

  IF NOT v_allowed THEN
    RAISE EXCEPTION 'Invalid payroll transition: % -> %', v_from, _to_status;
  END IF;

  -- Role gating
  IF _to_status IN ('finance_verification','pending_approval','approved','locked','exported','paid','closed')
     AND NOT (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'accountant')) THEN
    RAISE EXCEPTION 'Insufficient privileges for transition';
  END IF;

  UPDATE public.payroll_periods SET
    status = _to_status,
    reviewed_at = CASE WHEN _to_status = 'under_review' THEN now() ELSE reviewed_at END,
    reviewed_by = CASE WHEN _to_status = 'under_review' THEN auth.uid() ELSE reviewed_by END,
    verified_at = CASE WHEN _to_status = 'finance_verification' THEN now() ELSE verified_at END,
    verified_by = CASE WHEN _to_status = 'finance_verification' THEN auth.uid() ELSE verified_by END,
    approved_at = CASE WHEN _to_status = 'approved' THEN now() ELSE approved_at END,
    approved_by = CASE WHEN _to_status = 'approved' THEN auth.uid() ELSE approved_by END,
    locked_at   = CASE WHEN _to_status = 'locked' THEN now() ELSE locked_at END,
    locked_by   = CASE WHEN _to_status = 'locked' THEN auth.uid() ELSE locked_by END,
    exported_at = CASE WHEN _to_status = 'exported' THEN now() ELSE exported_at END,
    exported_by = CASE WHEN _to_status = 'exported' THEN auth.uid() ELSE exported_by END,
    paid_at     = CASE WHEN _to_status = 'paid' THEN now() ELSE paid_at END,
    closed_at   = CASE WHEN _to_status = 'closed' THEN now() ELSE closed_at END,
    rejection_reason = CASE WHEN _to_status IN ('collecting','under_review') AND _comment IS NOT NULL THEN _comment ELSE rejection_reason END
  WHERE id = _period_id
  RETURNING * INTO v_period;

  IF _to_status IN ('locked','exported') THEN v_severity := 'high'; END IF;
  IF _to_status = 'approved' AND v_from = 'locked' THEN v_severity := 'critical'; END IF;

  INSERT INTO public.payroll_audit_log (period_id, entity_type, entity_id, action, severity, actor_id, old_values, new_values, comment)
  VALUES (_period_id, 'payroll_period', _period_id, 'transition', v_severity, auth.uid(),
          jsonb_build_object('status', v_from), jsonb_build_object('status', _to_status), _comment);

  RETURN v_period;
END $$;

-- ============================================================
-- 17. Block checks
-- ============================================================
CREATE OR REPLACE FUNCTION public.payroll_block_checks(_period_id uuid)
RETURNS TABLE(severity text, code text, message text, user_id uuid)
LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public AS $$
BEGIN
  RETURN QUERY
  -- Missing tax profile
  SELECT 'critical'::text, 'missing_tax_profile'::text,
         'Employee has no tax profile'::text, l.user_id
    FROM public.payroll_lines l
    LEFT JOIN public.payroll_employee_tax_profile p ON p.user_id = l.user_id
   WHERE l.period_id = _period_id AND p.user_id IS NULL
  UNION ALL
  -- Negative net
  SELECT 'critical', 'negative_net', 'Negative net salary', l.user_id
    FROM public.payroll_lines l WHERE l.period_id = _period_id AND l.net_salary < 0
  UNION ALL
  -- Missing salary record
  SELECT 'critical', 'missing_salary', 'Employee has no base salary record', l.user_id
    FROM public.payroll_lines l WHERE l.period_id = _period_id AND l.base_salary = 0
  UNION ALL
  -- Large MoM swing
  SELECT 'high', 'large_delta',
         format('Net pay swing > 30%% vs prior period (was %s, now %s)',
                prev.net_salary, l.net_salary),
         l.user_id
    FROM public.payroll_lines l
    JOIN public.payroll_periods cur ON cur.id = l.period_id
    JOIN LATERAL (
      SELECT pl.net_salary FROM public.payroll_lines pl
       JOIN public.payroll_periods pp ON pp.id = pl.period_id
       WHERE pl.user_id = l.user_id AND pp.period_end < cur.period_start
       ORDER BY pp.period_end DESC LIMIT 1
    ) prev ON true
   WHERE l.period_id = _period_id
     AND prev.net_salary > 0
     AND ABS(l.net_salary - prev.net_salary) / prev.net_salary > 0.30;
END $$;
