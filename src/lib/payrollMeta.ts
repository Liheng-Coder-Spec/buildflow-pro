// Payroll lifecycle metadata, helpers, and shared types

export type PayrollLifecycleStatus =
  | "draft"
  | "collecting"
  | "calculated"
  | "under_review"
  | "finance_verification"
  | "pending_approval"
  | "approved"
  | "locked"
  | "exported"
  | "paid"
  | "closed"
  // legacy
  | "open";

export const PAYROLL_LIFECYCLE_ORDER: PayrollLifecycleStatus[] = [
  "draft",
  "collecting",
  "calculated",
  "under_review",
  "finance_verification",
  "pending_approval",
  "approved",
  "locked",
  "exported",
  "paid",
  "closed",
];

export const PAYROLL_LIFECYCLE_LABELS: Record<PayrollLifecycleStatus, string> = {
  draft: "Draft",
  collecting: "Collecting Data",
  calculated: "Calculated",
  under_review: "Under Review (HR Mgr)",
  finance_verification: "Finance Verification",
  pending_approval: "Pending Director",
  approved: "Approved",
  locked: "Locked",
  exported: "Exported",
  paid: "Paid",
  closed: "Closed",
  open: "Open",
};

export const PAYROLL_LIFECYCLE_TONE: Record<PayrollLifecycleStatus, string> = {
  draft: "bg-muted text-muted-foreground",
  collecting: "bg-info-soft text-info",
  calculated: "bg-info-soft text-info",
  under_review: "bg-warning-soft text-warning",
  finance_verification: "bg-warning-soft text-warning",
  pending_approval: "bg-warning-soft text-warning",
  approved: "bg-success-soft text-success",
  locked: "bg-success-soft text-success",
  exported: "bg-success-soft text-success",
  paid: "bg-success-soft text-success",
  closed: "bg-muted text-muted-foreground",
  open: "bg-info-soft text-info",
};

// Role required to advance from a given status (used to gate action buttons).
export const PAYROLL_NEXT_ACTION: Record<
  PayrollLifecycleStatus,
  { to: PayrollLifecycleStatus; label: string; roles: string[] } | null
> = {
  draft:                { to: "collecting",           label: "Start Collection",   roles: ["hr_officer", "admin"] },
  collecting:           { to: "calculated",           label: "Compute Payroll",    roles: ["hr_officer", "admin"] },
  calculated:           { to: "under_review",         label: "Send to HR Manager", roles: ["hr_officer", "admin"] },
  under_review:         { to: "finance_verification", label: "Approve & Forward",  roles: ["hr_manager", "admin"] },
  finance_verification: { to: "pending_approval",     label: "Verify & Forward",   roles: ["accountant", "finance_manager", "admin"] },
  pending_approval:     { to: "approved",             label: "Approve",            roles: ["director", "admin"] },
  approved:             { to: "locked",               label: "Lock",               roles: ["hr_manager", "admin"] },
  locked:               { to: "exported",             label: "Mark Exported",      roles: ["accountant", "finance_manager", "admin"] },
  exported:             { to: "paid",                 label: "Mark Paid",          roles: ["accountant", "finance_manager", "admin"] },
  paid:                 { to: "closed",               label: "Close Period",       roles: ["hr_manager", "admin"] },
  closed:               null,
  open:                 { to: "calculated",           label: "Compute Payroll",    roles: ["hr_officer", "admin"] },
};

// Fixed Medium-company approval chain (also reflects DB seed)
export const PAYROLL_APPROVAL_CHAIN: { step: number; role: string; label: string }[] = [
  { step: 1, role: "hr_officer",      label: "HR Officer (Prepare)" },
  { step: 2, role: "hr_manager",      label: "HR Manager (Review)" },
  { step: 3, role: "finance_manager", label: "Finance Manager (Verify)" },
  { step: 4, role: "director",        label: "Director (Approve)" },
];

export interface PayrollBlocker {
  code: string;
  message: string;
  severity: "critical" | "high" | "warning" | "info" | string;
  user_id: string | null;
}

export function blockerToneClass(severity: string): string {
  switch (severity) {
    case "critical": return "bg-destructive-soft text-destructive border-destructive/40";
    case "high":     return "bg-warning-soft text-warning border-warning/40";
    case "warning":  return "bg-warning-soft text-warning border-warning/40";
    default:         return "bg-info-soft text-info border-info/40";
  }
}

export function canTransition(
  status: PayrollLifecycleStatus,
  roles: string[],
): boolean {
  const next = PAYROLL_NEXT_ACTION[status];
  if (!next) return false;
  return next.roles.some((r) => roles.includes(r));
}
