import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Department, DEPARTMENT_LABELS, DEPARTMENT_TONE } from "@/lib/departmentMeta";
import { DepartmentBadge } from "@/components/DepartmentBadge";
import { cn } from "@/lib/utils";

export interface DeptRow {
  department: Department | "unassigned";
  members: number;
  total: number;
  open: number;
  assigned: number;
  in_progress: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  completed: number;
  closed: number;
  overdue: number;
  hours: number;
}

const SEGMENTS: {
  key: keyof Pick<
    DeptRow,
    "open" | "assigned" | "in_progress" | "pending_approval" | "approved" | "completed" | "closed" | "rejected"
  >;
  label: string;
  bar: string;
}[] = [
  { key: "open", label: "Open", bar: "bg-neutral-status" },
  { key: "assigned", label: "Assigned", bar: "bg-info/70" },
  { key: "in_progress", label: "In Progress", bar: "bg-info" },
  { key: "pending_approval", label: "Pending", bar: "bg-warning" },
  { key: "approved", label: "Approved", bar: "bg-success/70" },
  { key: "completed", label: "Completed", bar: "bg-success" },
  { key: "closed", label: "Closed", bar: "bg-muted-foreground/40" },
  { key: "rejected", label: "Rejected", bar: "bg-destructive" },
];

export function DepartmentBreakdown({ rows }: { rows: DeptRow[] }) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">By Department</CardTitle>
      </CardHeader>
      <CardContent>
        <TooltipProvider delayDuration={100}>
          <div className="flex flex-col divide-y">
            {rows.map((r) => (
              <DeptRowItem key={r.department} row={r} />
            ))}
            {rows.length === 0 && (
              <div className="text-sm text-muted-foreground py-6 text-center">
                No department activity in this range.
              </div>
            )}
          </div>
          <Legend />
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

function DeptRowItem({ row }: { row: DeptRow }) {
  const completion = row.total > 0 ? Math.round((row.completed / row.total) * 100) : 0;
  const isUnassigned = row.department === "unassigned";
  const tone = isUnassigned ? null : DEPARTMENT_TONE[row.department as Department];

  return (
    <div className={cn("py-3 grid gap-3 items-center", "grid-cols-1 md:grid-cols-12")}>
      {/* Left: identity */}
      <div className="md:col-span-3 flex items-center gap-2">
        {isUnassigned ? (
          <span className="inline-flex items-center gap-1.5 rounded-full bg-muted text-muted-foreground px-2 py-0.5 text-xs font-medium">
            <span className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
            Unassigned
          </span>
        ) : (
          <DepartmentBadge department={row.department as Department} />
        )}
        <span className="text-xs text-muted-foreground">
          {row.members} {row.members === 1 ? "member" : "members"} · {row.total} tasks
        </span>
      </div>

      {/* Middle: stacked bar */}
      <div className="md:col-span-7">
        {row.total === 0 ? (
          <div className="h-3 rounded-full bg-muted" />
        ) : (
          <div className="h-3 rounded-full bg-muted overflow-hidden flex">
            {SEGMENTS.map((s) => {
              const count = row[s.key];
              if (!count) return null;
              const pct = (count / row.total) * 100;
              return (
                <Tooltip key={s.key}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn("h-full", s.bar)}
                      style={{ width: `${pct}%` }}
                    />
                  </TooltipTrigger>
                  <TooltipContent>
                    {s.label}: {count} ({pct.toFixed(0)}%)
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </div>
        )}
      </div>

      {/* Right: KPIs */}
      <div className="md:col-span-2 flex items-center justify-end gap-2 text-xs">
        <span className="tabular-nums text-muted-foreground">
          {completion}% done
        </span>
        {row.overdue > 0 && (
          <Badge variant="destructive" className="tabular-nums">
            {row.overdue} late
          </Badge>
        )}
      </div>
    </div>
  );
}

function Legend() {
  return (
    <div className="mt-4 pt-3 border-t flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
      {SEGMENTS.map((s) => (
        <span key={s.key} className="inline-flex items-center gap-1.5">
          <span className={cn("h-2 w-2 rounded-sm", s.bar)} />
          {s.label}
        </span>
      ))}
    </div>
  );
}
