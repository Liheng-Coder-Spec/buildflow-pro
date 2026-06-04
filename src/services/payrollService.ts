import { supabase } from "@/integrations/supabase/client";
import type { PayrollLifecycleStatus, PayrollBlocker } from "@/lib/payrollMeta";

// ---------- Types ----------
export interface PayrollPeriod {
  id: string;
  name: string;
  period_start: string;
  period_end: string;
  status: PayrollLifecycleStatus;
  notes: string | null;
  calculated_at: string | null;
  reviewed_at: string | null;
  verified_at: string | null;
  approved_at: string | null;
  locked_at: string | null;
  exported_at: string | null;
  paid_at: string | null;
  closed_at: string | null;
  rejection_reason: string | null;
  current_step_no: number | null;
}

export interface PayrollLine {
  id: string;
  period_id: string;
  user_id: string;
  regular_hours: number;
  overtime_hours: number;
  base_salary: number;
  allowances_total: number;
  deductions_total: number;
  gross_salary: number;
  tax_relief: number;
  taxable_salary: number;
  tos_amount: number;
  nssf_employee: number;
  nssf_employer: number;
  pension_employee: number;
  pension_employer: number;
  net_salary: number;
  total_pay: number;
  currency: string;
  calc_breakdown: Record<string, unknown> | null;
  profile?: { full_name: string; employee_id: string | null };
}

export interface PayrollCostAllocation {
  id: string;
  period_id: string;
  payroll_line_id: string;
  user_id: string;
  project_id: string | null;
  wbs_node_id: string | null;
  hours: number;
  allocation_pct: number;
  allocated_amount: number;
  currency: string;
}

export interface PayrollApprovalStep {
  id: string;
  period_id: string;
  step_no: number;
  step_label: string;
  role_code: string;
  decision: "pending" | "approved" | "rejected";
  decided_by: string | null;
  decided_at: string | null;
  comment: string | null;
  created_at: string;
}

export interface PayrollAuditEntry {
  id: string;
  period_id: string | null;
  entity_type: string;
  entity_id: string | null;
  action: string;
  severity: string;
  actor_id: string | null;
  comment: string | null;
  created_at: string;
  old_values: Record<string, unknown> | null;
  new_values: Record<string, unknown> | null;
}

export interface TaxBracket {
  id: string;
  currency: "USD" | "KHR";
  min_amount: number;
  max_amount: number | null;
  rate: number;
  fixed_deduction: number;
  effective_from: string;
  effective_to: string | null;
  sort_order: number;
  notes: string | null;
}

export interface TaxReliefRule {
  id: string;
  code: string;
  name: string;
  currency: "USD" | "KHR";
  amount: number;
  per_dependent: boolean;
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export interface NssfRule {
  id: string;
  scheme: "occupational_risk" | "healthcare" | "pension";
  employer_rate: number;
  employee_rate: number;
  salary_cap: number | null;
  currency: "USD" | "KHR";
  effective_from: string;
  effective_to: string | null;
  notes: string | null;
}

export interface EmployeeTaxProfile {
  user_id: string;
  tin: string | null;
  nssf_number: string | null;
  is_resident: boolean;
  marital_status: "single" | "married" | "divorced" | "widowed";
  dependents: number;
  notes: string | null;
}

export interface EmployeeSalary {
  id: string;
  user_id: string;
  base_salary: number;
  currency: "USD" | "KHR";
  allowances: Array<{ name: string; amount: number }>;
  deductions: Array<{ name: string; amount: number }>;
  effective_from: string;
  effective_to: string | null;
  reason: string | null;
}

export interface PayslipRecord {
  id: string;
  period_id: string;
  payroll_line_id: string;
  user_id: string;
  storage_path: string | null;
  generated_at: string;
  downloaded_at: string | null;
}

// ---------- Periods ----------
export async function listPeriods(): Promise<PayrollPeriod[]> {
  const { data, error } = await supabase
    .from("payroll_periods")
    .select("*")
    .order("period_start", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PayrollPeriod[];
}

export async function createPeriod(input: {
  name: string;
  period_start: string;
  period_end: string;
}): Promise<PayrollPeriod> {
  const { data, error } = await supabase
    .from("payroll_periods")
    .insert({ ...input, status: "draft" as PayrollLifecycleStatus })
    .select()
    .single();
  if (error) throw error;
  return data as unknown as PayrollPeriod;
}

export async function transitionPeriod(
  periodId: string,
  to: PayrollLifecycleStatus,
  comment?: string,
): Promise<void> {
  const { error } = await (supabase as any).rpc("payroll_period_transition", {
    _period_id: periodId,
    _to_status: to,
    _comment: comment ?? null,
  });
  if (error) throw error;
}

export async function computePayroll(periodId: string): Promise<number> {
  const { data, error } = await supabase.rpc("compute_payroll_v2", { _period_id: periodId });
  if (error) throw error;
  return Number(data ?? 0);
}

// ---------- Lines / blockers ----------
export async function listLines(periodId: string): Promise<PayrollLine[]> {
  const { data, error } = await supabase
    .from("payroll_lines")
    .select("*")
    .eq("period_id", periodId)
    .order("net_salary", { ascending: false });
  if (error) throw error;
  return (data ?? []) as unknown as PayrollLine[];
}

export async function checkBlockers(periodId: string): Promise<PayrollBlocker[]> {
  const { data, error } = await (supabase as any).rpc("payroll_block_checks", {
    _period_id: periodId,
  });
  if (error) throw error;
  return (data ?? []) as PayrollBlocker[];
}

// ---------- Cost allocations ----------
export async function listCostAllocations(periodId: string): Promise<PayrollCostAllocation[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_cost_allocations")
    .select("*")
    .eq("period_id", periodId);
  if (error) throw error;
  return (data ?? []) as PayrollCostAllocation[];
}

// ---------- Approval steps / audit ----------
export async function listApprovalSteps(periodId: string): Promise<PayrollApprovalStep[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_approval_steps")
    .select("*")
    .eq("period_id", periodId)
    .order("step_no");
  if (error) throw error;
  return (data ?? []) as PayrollApprovalStep[];
}

export async function listAudit(periodId: string): Promise<PayrollAuditEntry[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_audit_log")
    .select("*")
    .eq("period_id", periodId)
    .order("created_at", { ascending: false })
    .limit(200);
  if (error) throw error;
  return (data ?? []) as PayrollAuditEntry[];
}

// ---------- Tax brackets ----------
export async function listTaxBrackets(): Promise<TaxBracket[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_tax_brackets")
    .select("*")
    .order("currency")
    .order("sort_order");
  if (error) throw error;
  return (data ?? []) as TaxBracket[];
}
export async function upsertTaxBracket(row: Partial<TaxBracket>): Promise<void> {
  const { error } = await (supabase as any).from("payroll_tax_brackets").upsert(row);
  if (error) throw error;
}
export async function deleteTaxBracket(id: string): Promise<void> {
  const { error } = await (supabase as any).from("payroll_tax_brackets").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Relief ----------
export async function listReliefRules(): Promise<TaxReliefRule[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_tax_relief_rules")
    .select("*")
    .order("currency")
    .order("code");
  if (error) throw error;
  return (data ?? []) as TaxReliefRule[];
}
export async function upsertReliefRule(row: Partial<TaxReliefRule>): Promise<void> {
  const { error } = await (supabase as any).from("payroll_tax_relief_rules").upsert(row);
  if (error) throw error;
}
export async function deleteReliefRule(id: string): Promise<void> {
  const { error } = await (supabase as any).from("payroll_tax_relief_rules").delete().eq("id", id);
  if (error) throw error;
}

// ---------- NSSF ----------
export async function listNssfRules(): Promise<NssfRule[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_nssf_rules")
    .select("*")
    .order("scheme");
  if (error) throw error;
  return (data ?? []) as NssfRule[];
}
export async function upsertNssfRule(row: Partial<NssfRule>): Promise<void> {
  const { error } = await (supabase as any).from("payroll_nssf_rules").upsert(row);
  if (error) throw error;
}
export async function deleteNssfRule(id: string): Promise<void> {
  const { error } = await (supabase as any).from("payroll_nssf_rules").delete().eq("id", id);
  if (error) throw error;
}

// ---------- Employee tax profile ----------
export async function listTaxProfiles(): Promise<EmployeeTaxProfile[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_employee_tax_profile")
    .select("*");
  if (error) throw error;
  return (data ?? []) as EmployeeTaxProfile[];
}
export async function getTaxProfile(userId: string): Promise<EmployeeTaxProfile | null> {
  const { data, error } = await (supabase as any)
    .from("payroll_employee_tax_profile")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return (data as EmployeeTaxProfile) ?? null;
}
export async function upsertTaxProfile(row: EmployeeTaxProfile): Promise<void> {
  const { error } = await (supabase as any).from("payroll_employee_tax_profile").upsert(row);
  if (error) throw error;
}

// ---------- Employee salary history ----------
export async function listSalaries(): Promise<EmployeeSalary[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_employee_salary")
    .select("*")
    .order("effective_from", { ascending: false });
  if (error) throw error;
  return (data ?? []) as EmployeeSalary[];
}
export async function addSalary(row: Omit<EmployeeSalary, "id">): Promise<void> {
  const { error } = await (supabase as any).from("payroll_employee_salary").insert(row);
  if (error) throw error;
}

// ---------- Payslips ----------
export async function listMyPayslips(userId: string): Promise<PayslipRecord[]> {
  const { data, error } = await (supabase as any)
    .from("payroll_payslips")
    .select("*")
    .eq("user_id", userId)
    .order("generated_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as PayslipRecord[];
}
