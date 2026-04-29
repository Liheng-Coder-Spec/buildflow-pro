export type TimesheetStatus = "draft" | "submitted" | "approved" | "rejected";

export const TIMESHEET_STATUS_LABELS: Record<TimesheetStatus, string> = {
  draft: "Draft",
  submitted: "Submitted",
  approved: "Approved",
  rejected: "Rejected",
};

export const TIMESHEET_STATUS_TONE: Record<
  TimesheetStatus,
  { bg: string; fg: string; dot: string }
> = {
  draft: { bg: "bg-neutral-status-soft", fg: "text-neutral-status", dot: "bg-neutral-status" },
  submitted: { bg: "bg-info-soft", fg: "text-info", dot: "bg-info" },
  approved: { bg: "bg-success-soft", fg: "text-success", dot: "bg-success" },
  rejected: { bg: "bg-destructive-soft", fg: "text-destructive", dot: "bg-destructive" },
};

export type PayrollPeriodStatus = "open" | "locked" | "paid";

export const PAYROLL_STATUS_LABELS: Record<PayrollPeriodStatus, string> = {
  open: "Open",
  locked: "Locked",
  paid: "Paid",
};

export const PAYROLL_STATUS_TONE: Record<PayrollPeriodStatus, string> = {
  open: "bg-info-soft text-info",
  locked: "bg-warning-soft text-warning",
  paid: "bg-success-soft text-success",
};

export interface TimesheetFlag {
  type: string;
  message: string;
}

export function formatHours(n: number | null | undefined): string {
  if (n === null || n === undefined) return "0.00";
  return Number(n).toFixed(2);
}

export function formatCurrency(n: number | null | undefined, currency = "USD"): string {
  if (n === null || n === undefined) return "0.00";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(Number(n));
  } catch {
    return Number(n).toFixed(2);
  }
}
