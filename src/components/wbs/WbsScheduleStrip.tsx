import { NodeRollup, SCHEDULE_STATUS_DOT, SCHEDULE_STATUS_LABEL } from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  rollup: NodeRollup | undefined;
  compact?: boolean;
}

const fmt = (iso: string | null) => {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "MMM d") : "—";
};

export function WbsScheduleStrip({ rollup, compact }: Props) {
  if (!rollup || rollup.totalTasks === 0) {
    return (
      <span className="text-[10px] text-muted-foreground/60 hidden md:inline">
        No tasks
      </span>
    );
  }
  return (
    <div className="hidden md:flex items-center gap-2 text-[10px] text-muted-foreground">
      <span
        className={cn("h-2 w-2 rounded-full", SCHEDULE_STATUS_DOT[rollup.status])}
        title={SCHEDULE_STATUS_LABEL[rollup.status]}
      />
      <span className="tabular-nums">
        {fmt(rollup.plannedStart)} <span className="opacity-50">→</span> {fmt(rollup.plannedEnd)}
      </span>
      {!compact && (
        <span className="inline-flex items-center gap-1">
          <span className="h-1 w-12 rounded-full bg-muted overflow-hidden">
            <span
              className="block h-full bg-primary"
              style={{ width: `${Math.min(100, Math.max(0, rollup.progressPct))}%` }}
            />
          </span>
          <span className="tabular-nums w-7 text-right">{rollup.progressPct}%</span>
        </span>
      )}
      {rollup.lateCount > 0 && (
        <span className="text-destructive font-medium">
          {rollup.lateCount} late
        </span>
      )}
    </div>
  );
}
