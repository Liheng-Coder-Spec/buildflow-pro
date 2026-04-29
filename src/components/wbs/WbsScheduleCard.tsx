import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  NodeRollup, SCHEDULE_STATUS_LABEL, SCHEDULE_STATUS_TONE, workingDaysBetween,
} from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { CalendarRange, AlertTriangle, CheckCircle2 } from "lucide-react";

interface Props {
  rollup: NodeRollup | undefined;
  holidaySet: Set<string>;
}

const fmt = (iso: string | null) => {
  if (!iso) return "—";
  const d = parseISO(iso);
  return isValid(d) ? format(d, "MMM d, yyyy") : "—";
};

export function WbsScheduleCard({ rollup, holidaySet }: Props) {
  if (!rollup || rollup.totalTasks === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          No tasks attached to this node yet. Add tasks with planned dates to see a roll-up here.
        </CardContent>
      </Card>
    );
  }

  const plannedDays = workingDaysBetween(rollup.plannedStart, rollup.plannedEnd, holidaySet);
  const actualDays = workingDaysBetween(rollup.actualStart, rollup.actualEnd, holidaySet);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <CalendarRange className="h-4 w-4" /> Schedule
          </CardTitle>
          <Badge className={cn("border-0", SCHEDULE_STATUS_TONE[rollup.status])}>
            {SCHEDULE_STATUS_LABEL[rollup.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <KV label="Planned start" value={fmt(rollup.plannedStart)} />
          <KV label="Planned finish" value={fmt(rollup.plannedEnd)} />
          <KV label="Actual start" value={fmt(rollup.actualStart)} />
          <KV label="Actual finish" value={fmt(rollup.actualEnd)} />
          <KV label="Planned working days" value={plannedDays ? `${plannedDays}d` : "—"} />
          <KV label="Actual working days" value={actualDays ? `${actualDays}d` : "—"} />
        </div>
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-muted-foreground">Progress (weighted)</span>
            <span className="font-medium tabular-nums">{rollup.progressPct}%</span>
          </div>
          <div className="h-2 w-full bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${Math.min(100, rollup.progressPct)}%` }}
            />
          </div>
        </div>
        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <CheckCircle2 className="h-3.5 w-3.5" />
            {rollup.totalTasks} task{rollup.totalTasks === 1 ? "" : "s"}
          </span>
          {rollup.lateCount > 0 && (
            <span className="inline-flex items-center gap-1 text-destructive font-medium">
              <AlertTriangle className="h-3.5 w-3.5" />
              {rollup.lateCount} late
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="font-medium tabular-nums">{value}</div>
    </div>
  );
}
