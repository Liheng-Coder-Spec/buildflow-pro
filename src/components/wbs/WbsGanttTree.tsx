import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WbsNode } from "@/lib/wbsMeta";
import {
  TaskScheduleLite,
  taskStatus,
  SCHEDULE_STATUS_DOT,
  SCHEDULE_STATUS_LABEL,
  NodeRollup,
  workingDaysBetween,
} from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";

interface DepLink {
  task_id: string;
  predecessor_id: string;
  relation_type: "FS" | "SS" | "FF" | "SF";
  lag_days: number;
}

interface Props {
  nodes: WbsNode[];
  tasks: (TaskScheduleLite & { title: string; code: string | null })[];
  predecessors: DepLink[];
  holidaySet: Set<string>;
  rollupByNode?: Map<string, NodeRollup>;
}

type Row =
  | { kind: "node"; id: string; node: WbsNode; depth: number; hasChildren: boolean }
  | { kind: "task"; id: string; task: Props["tasks"][number]; depth: number };

const ROW_H = 32;
const HEADER_H = 48;

const fmtDate = (s: string | null) => {
  if (!s) return "—";
  const d = parseISO(s);
  return isValid(d) ? format(d, "MMM d") : "—";
};

export function WbsGanttTree({ nodes, tasks, holidaySet, rollupByNode }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const childrenOf = useMemo(() => {
    const m = new Map<string | null, WbsNode[]>();
    for (const n of nodes) {
      const arr = m.get(n.parent_id) ?? [];
      arr.push(n);
      m.set(n.parent_id, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) =>
        a.sort_order !== b.sort_order ? a.sort_order - b.sort_order : a.name.localeCompare(b.name),
      );
    }
    return m;
  }, [nodes]);

  const tasksByNode = useMemo(() => {
    const m = new Map<string, Props["tasks"]>();
    for (const t of tasks) {
      if (!t.wbs_node_id) continue;
      const arr = m.get(t.wbs_node_id) ?? [];
      arr.push(t);
      m.set(t.wbs_node_id, arr);
    }
    return m;
  }, [tasks]);

  // Flatten — if a node is a "leaf" (has no child nodes), don't render its row, just its tasks.
  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    const walk = (parentId: string | null, depth: number) => {
      const kids = childrenOf.get(parentId) ?? [];
      for (const n of kids) {
        const nodeTasks = tasksByNode.get(n.id) ?? [];
        const childNodes = childrenOf.get(n.id) ?? [];
        const isLeaf = childNodes.length === 0;

        if (isLeaf) {
          // Leaf with tasks: emit tasks directly under parent (no node row).
          // If leaf has no tasks at all, still show node row so it isn't lost.
          if (nodeTasks.length === 0) {
            out.push({ kind: "node", id: n.id, node: n, depth, hasChildren: false });
          } else {
            for (const t of nodeTasks) {
              out.push({ kind: "task", id: t.id, task: t, depth });
            }
          }
        } else {
          out.push({
            kind: "node",
            id: n.id,
            node: n,
            depth,
            hasChildren: true,
          });
          if (collapsed.has(n.id)) continue;
          walk(n.id, depth + 1);
          for (const t of nodeTasks) {
            out.push({ kind: "task", id: t.id, task: t, depth: depth + 1 });
          }
        }
      }
    };
    walk(null, 0);
    return out;
  }, [childrenOf, tasksByNode, collapsed]);

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const today = new Date();

  return (
    <div className="h-full overflow-auto">
      {/* Sticky header */}
      <div
        className="sticky top-0 z-20 border-b bg-muted/50 backdrop-blur grid items-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        style={{ height: HEADER_H, gridTemplateColumns: "1fr 70px 80px 80px 100px 90px" }}
      >
        <div className="px-3">WBS / Task</div>
        <div className="px-2 text-right">Dur (d)</div>
        <div className="px-2 text-right">Start</div>
        <div className="px-2 text-right">Finish</div>
        <div className="px-2">Status</div>
        <div className="px-2 pr-3 text-right">% Done</div>
      </div>

      {rows.map((r) => {
        // Compute row data
        let start: string | null = null;
        let end: string | null = null;
        let progress = 0;
        let statusKey: ReturnType<typeof taskStatus> = "not_started";

        if (r.kind === "task") {
          start = r.task.planned_start;
          end = r.task.planned_end;
          progress = r.task.progress_pct ?? 0;
          statusKey = taskStatus(r.task, today);
        } else {
          const ru = rollupByNode?.get(r.id);
          if (ru) {
            start = ru.plannedStart;
            end = ru.plannedEnd;
            progress = ru.progressPct;
            statusKey = ru.status;
          }
        }
        const duration = workingDaysBetween(start, end, holidaySet);

        return (
          <div
            key={r.kind + r.id}
            className={cn(
              "border-b grid items-center text-sm hover:bg-muted/30",
              r.kind === "node" && "bg-muted/40 font-medium",
            )}
            style={{
              height: ROW_H,
              gridTemplateColumns: "1fr 70px 80px 80px 100px 90px",
            }}
          >
            {/* Name column */}
            <div
              className="flex items-center gap-1 min-w-0 pr-2"
              style={{ paddingLeft: r.depth * 14 + 8 }}
            >
              {r.kind === "node" ? (
                <>
                  <button
                    type="button"
                    onClick={() => toggle(r.id)}
                    className="h-4 w-4 inline-flex items-center justify-center text-muted-foreground hover:text-foreground shrink-0"
                  >
                    <ChevronRight
                      className={cn(
                        "h-3.5 w-3.5 transition-transform",
                        !collapsed.has(r.id) && "rotate-90",
                      )}
                    />
                  </button>
                  <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                    {r.node.code}
                  </span>
                  <span className="ml-1 truncate">{r.node.name}</span>
                </>
              ) : (
                <Link
                  to={`/tasks/${r.task.id}`}
                  className="ml-5 truncate hover:text-primary inline-flex items-center gap-2 min-w-0"
                >
                  {r.task.code && (
                    <span className="font-mono text-[11px] text-muted-foreground shrink-0">
                      {r.task.code}
                    </span>
                  )}
                  <span className="truncate">{r.task.title}</span>
                </Link>
              )}
            </div>

            {/* Duration */}
            <div className="px-2 text-right tabular-nums text-xs text-muted-foreground">
              {duration > 0 ? duration : "—"}
            </div>

            {/* Start */}
            <div className="px-2 text-right tabular-nums text-xs text-muted-foreground">
              {fmtDate(start)}
            </div>

            {/* Finish */}
            <div className="px-2 text-right tabular-nums text-xs text-muted-foreground">
              {fmtDate(end)}
            </div>

            {/* Status */}
            <div className="px-2">
              <span className="inline-flex items-center gap-1.5 text-xs">
                <span
                  className={cn("h-2 w-2 rounded-full shrink-0", SCHEDULE_STATUS_DOT[statusKey])}
                />
                <span className="truncate">{SCHEDULE_STATUS_LABEL[statusKey]}</span>
              </span>
            </div>

            {/* Progress */}
            <div className="px-2 pr-3 flex items-center gap-2 justify-end">
              <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden max-w-[50px]">
                <div
                  className="h-full bg-primary rounded-full"
                  style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                />
              </div>
              <span className="tabular-nums text-[11px] text-muted-foreground w-7 text-right">
                {Math.round(progress)}%
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}
