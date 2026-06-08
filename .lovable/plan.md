## Problem

The Payroll module is built (`/payroll` admin page and `/hr/my-payslips` employee page exist and are routed in `App.tsx`), but it's not visible inside the **HR Management** sidebar group:

- `Payroll` is currently listed only under the **Finance** group, gated to `admin`/`accountant` roles — so HR users (and most employees) never see it.
- `MyPayslips` (`/hr/my-payslips`) has a route but **no sidebar entry at all**, so employees have no way to reach their payslips.

## Plan

Edit `src/components/AppLayout.tsx` only — pure navigation/presentation change, no business logic.

1. **Add two entries to the `HR Management` nav group** (placed after Attendance, before People):
   - `My Payslips` → `/hr/my-payslips`, icon `Receipt` (already imported), `module: "hr"` so any HR-permitted user sees it.
   - `Payroll` → `/payroll`, icon `DollarSign` (already imported), gated with `roles: ["admin", "accountant"]` so only payroll admins see the admin page from the HR group too.

2. **Keep the existing Finance group `Payroll` entry** so accountants still reach it from Finance (no behavior change there).

3. No route changes, no service changes, no permission/RLS changes — both pages already exist and are protected by `ProtectedRoute` + their own role checks.

### Technical detail

In `NAV_GROUPS`, the `HR Management` group's `items` array becomes:

```text
HR Dashboard
E-Leave (+ sub-items, unchanged)
Attendance
My Payslips          ← new (module: "hr")
Payroll              ← new (roles: ["admin", "accountant"])
People
```

Result: every HR-permitted user gets **My Payslips** in the HR Management section, and admins/accountants additionally see **Payroll** there (in addition to its existing Finance entry).
