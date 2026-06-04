-- No-op migration to force regeneration of generated TypeScript types
-- after a prior regeneration dropped references to many pre-existing tables.
COMMENT ON TABLE public.payroll_periods IS 'Payroll periods — lifecycle-managed pay runs.';