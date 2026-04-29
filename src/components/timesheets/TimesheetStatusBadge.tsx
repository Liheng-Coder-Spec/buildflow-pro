import {
  TimesheetStatus,
  TIMESHEET_STATUS_LABELS,
  TIMESHEET_STATUS_TONE,
} from "@/lib/timesheetMeta";
import { cn } from "@/lib/utils";

export function TimesheetStatusBadge({
  status,
  className,
}: {
  status: TimesheetStatus;
  className?: string;
}) {
  const tone = TIMESHEET_STATUS_TONE[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium",
        tone.bg,
        tone.fg,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", tone.dot)} />
      {TIMESHEET_STATUS_LABELS[status]}
    </span>
  );
}
