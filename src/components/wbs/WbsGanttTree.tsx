import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { WbsNode } from "@/lib/wbsMeta";
import { TaskScheduleLite, taskStatus, SCHEDULE_STATUS_DOT } from "@/lib/scheduleMeta";
import { buildNodePathMap } from "@/lib/wbsMeta";
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
}

type Row =
  | { kind: "node"; id: string; node: WbsNode; depth: number; hasChildren: boolean }
  | { kind: "task"; id: string; task: Props["tasks"][number]; depth: number };

const ROW_H = 32;

export function WbsGanttTree({ nodes, tasks, predecessors, holidaySet }: Props) {
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  // Build children map
  const childrenOf = useMemo(() => {
    const m = new Map<string | null, WbsNode[]>();
    for (const n of nodes) {
      const arr = m.get(n.parent_id) ?? [];
      arr.push(n);
      m.set(n.parent_id, arr);
    }
    for (const arr of m.values()) {
      arr.sort((a, b) =>
        a.sort_order !== b.sort_order ? a.sort_order - b.sort_order : a.name.localeCompare(b.name)
      );
    }
    return m;
  }, [nodes]);

  // Build tasks by node
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

  // Build flat row list (tree structure)
  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    const walk = (parentId: string | null, depth: number) => {
      const kids = childrenOf.get(parentId) ?? [];
      for (const n of kids) {
        const nodeTasks = tasksByNode.get(n.id) ?? [];
        const hasKids = (childrenOf.get(n.id)?.length ?? 0) > 0;
        out.push({ kind: "node", id: n.id, node: n, depth, hasChildren: hasKids || nodeTasks.length > 0 });
        if (collapsed.has(n.id)) continue;
        walk(n.id, depth + 1);
        for (const t of nodeTasks) {
          out.push({ kind: "task", id: t.id, task: t, depth: depth + 1 });
        }
      }
    };
    walk(null, 0);
    return out;
  }, [childrenOf, tasksByNode, collapsed]);

  const pathMap = useMemo(() => buildNodePathMap(nodes), [nodes]);

  const toggle = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  return (
    <div className="h-full overflow-auto">
      <div className="border-b bg-muted/40" style={{ height: 48 }}>
        <div className="px-3 h-full flex items-center text-xs font-medium uppercase tracking-wider text-muted-foreground">
          WBS / Task
        </div>
      </div>
      {rows.map((r) => (
        <div
          key={r.kind + r.id}
          className={cn(
            "border-b flex items-center px-2 text-sm hover:bg-muted/30",
            r.kind === "node" && "bg-muted/30 font-medium",
          )}
          style={{ height: ROW_H, paddingLeft: r.depth * 14 + 8 }}
        >
          {r.kind === "node" ? (
            <>
              <button
                type="button"
                onClick={() => toggle(r.id)}
                className="h-4 w-4 inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
              >
                <ChevronRight
                  className={cn(
                    "h-3.5 w-3.5 transition-transform",
                    !collapsed.has(r.id) && "rotate-90",
                  )}
                />
              </button>
              <span className="font-mono text-[11px] text-muted-foreground ml-1">{r.node.code}</span>
              <span className="ml-2 truncate">{r.node.name}</span>
            </>
          ) : (
            <Link
              to={`/tasks/${r.task.id}`}
              className="ml-5 truncate hover:text-primary inline-flex items-center gap-2"
            >
              <span
                className={cn(
                  "h-2 w-2 rounded-full shrink-0",
                  SCHEDULE_STATUS_DOT[taskStatus(r.task, new Date())],
                )}
              />
              {r.task.code && (
                <span className="font-mono text-[11px] text-muted-foreground">{r.task.code}</span>
              )}
              <span className="truncate">
                {(() => {
                  const pathInfo = r.task.wbs_node_id ? pathMap.get(r.task.wbs_node_id) : undefined;
                  return pathInfo?.fullPath ? `${pathInfo.fullPath} > ${r.task.title}` : r.task.title;
                })()}
              </span>
            </Link>
          )}
        </div>
      ))}
    </div>
  );
}
