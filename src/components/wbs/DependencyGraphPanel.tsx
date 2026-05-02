import { useMemo } from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { DepRelation } from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";

export interface GraphLink {
  task_id: string;
  predecessor_id: string;
  relation_type: DepRelation;
  lag_days: number;
}

export interface GraphTaskMin {
  id: string;
  title: string;
  code: string | null;
  status?: string | null;
  planned_start?: string | null;
  planned_end?: string | null;
}

interface Props {
  selectedTaskId: string;
  tasks: GraphTaskMin[];
  predecessors: GraphLink[]; // links where task_id === selectedTaskId
  successors: GraphLink[];   // links where predecessor_id === selectedTaskId
  onNodeClick?: (taskId: string) => void;
}

function fmtDate(s?: string | null) {
  if (!s) return "—";
  const d = parseISO(s);
  return isValid(d) ? format(d, "dd MMM") : "—";
}

function statusTone(status?: string | null): string {
  switch (status) {
    case "completed": return "border-emerald-500/40 bg-emerald-500/5";
    case "in_progress": return "border-blue-500/40 bg-blue-500/5";
    case "blocked": return "border-destructive/40 bg-destructive/5";
    case "on_hold": return "border-amber-500/40 bg-amber-500/5";
    default: return "border-border bg-muted/30";
  }
}

function NodeCard({
  task, onClick, highlight,
}: { task: GraphTaskMin | undefined; onClick?: () => void; highlight?: boolean }) {
  if (!task) {
    return (
      <div className="w-44 h-16 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
        Unknown task
      </div>
    );
  }
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-44 text-left rounded-md border px-2.5 py-1.5 transition-colors",
        statusTone(task.status),
        highlight && "ring-2 ring-primary border-primary",
        onClick && "hover:border-primary/60 cursor-pointer",
      )}
    >
      <div className="flex items-center gap-1.5 mb-0.5">
        {task.code && (
          <span className="font-mono text-[10px] text-muted-foreground shrink-0">{task.code}</span>
        )}
        <span className="text-xs font-medium truncate">{task.title}</span>
      </div>
      <div className="text-[10px] text-muted-foreground tabular-nums">
        {fmtDate(task.planned_start)} → {fmtDate(task.planned_end)}
      </div>
    </button>
  );
}

function LinkArrow({ relation, lag }: { relation: DepRelation; lag: number }) {
  return (
    <div className="flex flex-col items-center gap-0.5 px-1 shrink-0">
      <Badge variant="outline" className="font-mono text-[9px] h-4 px-1">
        {relation}
      </Badge>
      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
      {lag !== 0 && (
        <span className="text-[9px] text-muted-foreground tabular-nums">
          {lag > 0 ? `+${lag}` : lag}d
        </span>
      )}
    </div>
  );
}

export function DependencyGraphPanel({
  selectedTaskId, tasks, predecessors, successors, onNodeClick,
}: Props) {
  const taskMap = useMemo(() => {
    const m = new Map<string, GraphTaskMin>();
    for (const t of tasks) m.set(t.id, t);
    return m;
  }, [tasks]);

  const selected = taskMap.get(selectedTaskId);
  const preds = predecessors.filter((p) => p.task_id === selectedTaskId);
  const succs = successors.filter((s) => s.predecessor_id === selectedTaskId);

  if (!selected) return null;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Dependency graph
        </h4>
        <span className="text-[10px] text-muted-foreground">
          {preds.length} pred · {succs.length} succ
        </span>
      </div>

      <div className="overflow-x-auto">
        <div className="flex items-stretch gap-2 min-w-min">
          {/* Predecessors column */}
          <div className="flex flex-col gap-1.5 justify-center">
            {preds.length === 0 ? (
              <div className="w-44 h-16 rounded-md border border-dashed flex items-center justify-center text-[11px] text-muted-foreground italic">
                No predecessors
              </div>
            ) : (
              preds.map((p) => (
                <div key={`p-${p.predecessor_id}`} className="flex items-center">
                  <NodeCard
                    task={taskMap.get(p.predecessor_id)}
                    onClick={onNodeClick ? () => onNodeClick(p.predecessor_id) : undefined}
                  />
                </div>
              ))
            )}
          </div>

          {/* Predecessor arrows */}
          <div className="flex flex-col justify-center">
            {preds.length === 0 ? (
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 mx-2" />
            ) : (
              <div className="flex flex-col gap-1.5">
                {preds.map((p) => (
                  <div key={`pa-${p.predecessor_id}`} className="h-16 flex items-center">
                    <LinkArrow relation={p.relation_type} lag={p.lag_days} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Selected node */}
          <div className="flex flex-col justify-center">
            <NodeCard task={selected} highlight />
          </div>

          {/* Successor arrows */}
          <div className="flex flex-col justify-center">
            {succs.length === 0 ? (
              <ArrowRight className="h-4 w-4 text-muted-foreground/40 mx-2" />
            ) : (
              <div className="flex flex-col gap-1.5">
                {succs.map((s) => (
                  <div key={`sa-${s.task_id}`} className="h-16 flex items-center">
                    <LinkArrow relation={s.relation_type} lag={s.lag_days} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Successors column */}
          <div className="flex flex-col gap-1.5 justify-center">
            {succs.length === 0 ? (
              <div className="w-44 h-16 rounded-md border border-dashed flex items-center justify-center text-[11px] text-muted-foreground italic">
                No successors
              </div>
            ) : (
              succs.map((s) => (
                <div key={`s-${s.task_id}`} className="flex items-center">
                  <NodeCard
                    task={taskMap.get(s.task_id)}
                    onClick={onNodeClick ? () => onNodeClick(s.task_id) : undefined}
                  />
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
