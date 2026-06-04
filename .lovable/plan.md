## Payroll Module Redesign — Plan

Upgrade the existing single-page Payroll into a full lifecycle module aligned with DCOS-HR-PAY-R3 (Cambodia). Scope: **Core lifecycle + Cambodia tax/NSSF + Medium-company approvals + full project/WBS cost allocation**.

---

### 1. Status lifecycle

Replace the current 3-state (`open` / `locked` / `paid`) with the full 11-state machine:

```text
draft → collecting → calculated → under_review → finance_verification
     → pending_approval → approved → locked → exported → paid → closed
```

A Postgres trigger validates transitions; rejections route back to `under_review`. Only `super_admin` may unlock from `locked`.

---

### 2. Database schema (one migration)

New tables (all under `public`, with `GRANT`s + RLS):

- `payroll_tax_brackets` — admin-editable TOS brackets (`min_amount`, `max_amount`, `rate`, `currency`, `effective_from/to`)
- `payroll_tax_relief_rules` — dependent allowance, spouse allowance, threshold (`amount`, `condition_key`, `effective_from/to`)
- `payroll_nssf_rules` — NSSF/Pension contribution rates, salary caps, employer/employee split
- `payroll_employee_tax_profile` — per-employee: `tin`, `nssf_no`, `dependents`, `marital_status`, `is_resident`
- `payroll_employee_salary` — base salary, allowances JSON, deductions JSON, `effective_from/to` (immutable history)
- `payroll_approval_chains` — fixed Medium-company chain seeded: `hr_officer → hr_manager → finance_manager → director`
- `payroll_approval_steps` — per-period approval audit (`step_no`, `approver_id`, `decision`, `decided_at`, `comment`)
- `payroll_cost_allocations` — per payroll-line × project × WBS: `hours`, `pct`, `allocated_amount`
- `payroll_audit_log` — high-severity audit trail (salary change, tax change, approval, unlock, payslip download)
- `payroll_payslips` — generated PDF metadata + storage path

Extend existing tables:

- `payroll_periods`: add `status` (new enum), `collection_completed_at`, `calculated_at`, `verified_by/at`, `approved_by/at`, `exported_at`, `locked_by`, `paid_method`, `current_approval_step`, `rejection_reason`
- `payroll_lines`: add `gross_salary`, `taxable_salary`, `tax_relief`, `tos_amount`, `nssf_employee`, `nssf_employer`, `pension_employee`, `pension_employer`, `allowances_total`, `deductions_total`, `net_salary`, `currency`

New Postgres functions:

- `compute_payroll_v2(period_id)` — gathers attendance + approved timesheets + approved OT, computes gross → applies relief → applies brackets → NSSF → net, writes `payroll_lines` and `payroll_cost_allocations` from timesheet `project_id`/`wbs_node_id` hours weighting
- `payroll_period_transition(period_id, to_status, comment?)` — guards transitions, writes `payroll_approval_steps` + audit log, sends notifications via existing `create_notification`
- `payroll_block_checks(period_id)` returns blockers (missing tax profile, missing NSSF, negative salary, >20% delta, >30% MoM delta, missing attendance)
- `post_payroll_to_cost_ledger(period_id)` — on `exported`, posts cost allocations into project labor cost (uses existing financial ledger pattern)

RLS roles (uses existing `app_role` + a new `hr_manager`, `hr_officer`, `finance_manager`, `director` if not present — otherwise reuses `admin`/`accountant`/`project_manager` mapped via `payroll_approval_chains`).

---

### 3. Frontend pages

New route set under `/hr/payroll`:

- `Payroll.tsx` (redesigned) — period selector, lifecycle stepper, KPI cards, blocker panel, action buttons gated by current step + role
- `PayrollPeriodDetail.tsx` — tabs: **Lines**, **Cost Allocation**, **Blockers**, **Approval Trail**, **Audit Log**
- `PayrollEmployeeProfile.tsx` — salary history, tax profile, NSSF, allowances/deductions editor (admin only, salary changes write audit)
- `PayrollApprovalInbox.tsx` — pending approvals for the current user across periods
- `MyPayslips.tsx` — employee self-service: list + download PDF payslip
- `admin/PayrollTaxBrackets.tsx` — CRUD TOS brackets
- `admin/PayrollTaxRelief.tsx` — CRUD relief rules
- `admin/PayrollNssfRules.tsx` — CRUD NSSF rules
- `admin/PayrollApprovalChain.tsx` — view + edit Medium-tier chain
- `admin/PayrollAudit.tsx` — searchable audit log

Sidebar: extend HR group with **Payroll Dashboard**, **Payroll Approvals**, **My Payslips**, and **Payroll Admin** (admin-only).

Shared UI:

- `PayrollLifecycleStepper` — visual 11-step progress
- `PayrollBlockerList` — red/amber/green blocker badges
- `PayrollApprovalTrail` — reuses `ApprovalChainTimeline` pattern from E-Leave
- `PayslipPdf` — react-pdf template with company branding

---

### 4. Edge functions

- `export-payroll-xlsx` (existing) — extend with new columns (TOS, NSSF, net salary, cost allocation sheet)
- `generate-payslip-pdf` (new) — renders PDF, uploads to `payslips/` storage bucket, returns signed URL
- `payroll-notify` (new) — dispatches in-app + Telegram notifications for each lifecycle transition per Section 28 matrix

---

### 5. Notifications & alerts

Use existing `create_notification` + Telegram bridge. Per Section 28/29 matrix:

| Event | Recipient | Priority |
|---|---|---|
| Period created | HR team | Normal |
| Attendance missing | Employee | High |
| Calculated | HR Manager | Normal |
| Verification required | Finance Manager | High |
| Approval required | Director | High |
| Paid | Employee | Normal |
| Critical blocker (negative pay, >20% delta) | HR + Finance | Critical |

---

### 6. Cost allocation (Section 34)

`compute_payroll_v2` joins each employee's approved `timesheet_entries` within the period by `project_id` + `wbs_node_id`, computes hour-weighted percentages, and writes one `payroll_cost_allocations` row per (line, project, wbs). On `exported`, `post_payroll_to_cost_ledger` inserts the allocated amounts into the existing project cost ledger so labor cost shows up in **Financial Control** / **Budgets** without manual entry.

---

### 7. Out of scope (deferred)

- Small/Enterprise approval tiers (Medium only for now)
- Biometric / QR check-in ingestion (attendance module unchanged)
- Mobile push notifications
- Bank-file (ABA/ACLEDA/Wing) export formats — `exported` status set manually for now
- Year-end / annual tax reconciliation reports

---

### 8. Rollout order

1. Migration: schema + enum + RLS + seed tax/NSSF defaults + seed approval chain
2. `compute_payroll_v2` + `payroll_period_transition` + block checks
3. Redesigned `Payroll.tsx` + `PayrollPeriodDetail` + lifecycle stepper
4. Tax/NSSF/Relief admin pages
5. Approval inbox + notifications
6. Payslip PDF + employee self-service
7. Cost-allocation posting + xlsx export extension
8. Audit log page + integration tests
