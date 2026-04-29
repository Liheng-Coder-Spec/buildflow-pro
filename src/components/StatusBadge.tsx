import { TaskStatus, TASK_STATUS_LABELS, TASK_STATUS_TONE } from "@/lib/taskMeta";
import { cn } from "@/lib/utils";

export function StatusBadge({ status, className }: { status: TaskStatus; className?: string }) {
  const tone = TASK_STATUS_TONE[status];
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
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}
