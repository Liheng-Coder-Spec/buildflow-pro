import { useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ChevronRight, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";
import { WbsNode, buildNodePathMap } from "@/lib/wbsMeta";
import { TaskScheduleLite, taskStatus, SCHEDULE_STATUS_DOT } from "@/lib/scheduleMeta";
import {
  addDays, differenceInCalendarDays, format, isValid, max, min, parseISO, startOfDay,
} from "date-fns";

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

type Zoom = "day" | "week" | "month";

const ZOOM_PX: Record<Zoom, number> = { day: 28, week: 12, month: 4 };

const ROW_H = 32;
const HEADER_H = 48;
const CHART_LEFT = 0;

function safeDate(s: string | null) {
  if (!s) return null;
  const d = parseISO(s);
  return isValid(d) ? startOfDay(d) : null;
}

export function WbsGantt({ nodes, tasks, predecessors, holidaySet }: Props) {
  const [zoom, setZoom] = useState<Zoom>("week");
  const [collapsed, setcollapsed] = useState<Set<string>>(new Set());

  // Determine date range across all tasks
  const range = useMemo(() => {
    const starts: Date[] = [];
    const ends: Date[] = [];
    for (const t of tasks) {
      const s = safeDate(t.planned_start);
      const e = safeDate(t.planned_end);
      if (s) starts.push(s);
      if (e) ends.push(e);
    }
    if (starts.length === 0 || ends.length === 0) {
      const today = startOfDay(new Date());
      return { start: addDays(today, -7), end: addDays(today, 30) };
    }
    return {
      start: addDays(min(starts), -3),
      end: addDays(max(ends), 7),
    };
  }, [tasks]);

  const totalDays = differenceInCalendarDays(range.end, range.start) + 1;
  const dayWidth = ZOOM_PX[zoom];
  const chartWidth = totalDays * dayWidth;

  // Build flat ordered list: nodes (depth-first) interleaved with their tasks
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
    const m = new Map<string, typeof tasks>();
    for (const t of tasks) {
      if (!t.wbs_node_id) continue;
      const arr = m.get(t.wbs_node_id) ?? [];
      arr.push(t);
      m.set(t.wbs_node_id, arr);
    }
    return m;
  }, [tasks]);

  type Row =
    | { kind: "node"; id: string; node: WbsNode; depth: number; hasChildren: boolean }
    | { kind: "task"; id: string; task: typeof tasks[number]; depth: number };

  const rows: Row[] = useMemo(() => {
    const out: Row[] = [];
    const walk = (parentId: string | null, depth: number) => {
      const kids = childrenOf.get(parentId) ?? [];
      for (const n of kids) {
        const nodeTasks = tasksByNode.get(n.id) ?? [];
        const childNodes = childrenOf.get(n.id) ?? [];
        const isLeaf = childNodes.length === 0;

        if (isLeaf) {
          if (nodeTasks.length === 0) {
            out.push({ kind: "node", id: n.id, node: n, depth, hasChildren: false });
          } else {
            for (const t of nodeTasks) {
              out.push({ kind: "task", id: t.id, task: t, depth });
            }
          }
        } else {
          out.push({ kind: "node", id: n.id, node: n, depth, hasChildren: true });
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

  // Index task row positions for dependency arrows
  const taskRowIndex = useMemo(() => {
    const m = new Map<string, number>();
    rows.forEach((r, i) => {
      if (r.kind === "task") m.set(r.id, i);
    });
    return m;
  }, [rows]);

  const pathMap = useMemo(() => buildNodePathMap(nodes), [nodes]);

  const today = startOfDay(new Date());
  const todayX = differenceInCalendarDays(today, range.start) * dayWidth;

  const dayHeaders = useMemo(() => {
    const items: { date: Date; isHoliday: boolean; isWeekend: boolean }[] = [];
    for (let i = 0; i < totalDays; i++) {
      const d = addDays(range.start, i);
      items.push({
        date: d,
        isHoliday: holidaySet.has(format(d, "yyyy-MM-dd")),
        isWeekend: d.getDay() === 0 || d.getDay() === 6,
      });
    }
    return items;
  }, [range.start, totalDays, holidaySet]);

  const monthHeaders = useMemo(() => {
    const groups: { label: string; span: number }[] = [];
    let cur: { label: string; span: number } | null = null;
    for (const dh of dayHeaders) {
      const label = format(dh.date, "MMM yyyy");
      if (!cur || cur.label !== label) {
        if (cur) groups.push(cur);
        cur = { label, span: 1 };
      } else cur.span++;
    }
    if (cur) groups.push(cur);
    return groups;
  }, [dayHeaders]);

  const toggle = (id: string) => {
    setcollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const scrollRef = useRef<HTMLDivElement>(null);
  const jumpToToday = () => {
    const el = scrollRef.current;
    if (!el) return;
    const target = Math.max(0, todayX - el.clientWidth / 2);
    el.scrollTo({ left: target, behavior: "smooth" });
  };

  return (
    <div className="border rounded-lg bg-card flex flex-col h-full overflow-hidden">
      {/* Toolbar */}
      <div className="flex items-center justify-between px-3 py-2 border-b">
        <div className="text-sm text-muted-foreground">
          {tasks.length} task{tasks.length === 1 ? "" : "s"} · {format(range.start, "MMM d")} → {format(range.end, "MMM d, yyyy")}
        </div>
        <div className="flex items-center gap-1">
          <Button size="sm" variant="outline" onClick={jumpToToday} className="gap-1.5 mr-1">
            <Calendar className="h-3.5 w-3.5" />
            Today
          </Button>
          <Button
            size="sm"
            variant={zoom === "day" ? "default" : "outline"}
            onClick={() => setZoom("day")}
          >
            Day
          </Button>
          <Button
            size="sm"
            variant={zoom === "week" ? "default" : "outline"}
            onClick={() => setZoom("week")}
          >
            Week
          </Button>
          <Button
            size="sm"
            variant={zoom === "month" ? "default" : "outline"}
            onClick={() => setZoom("month")}
          >
            Month
          </Button>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-auto relative">
        <div className="flex" style={{ minWidth: chartWidth }}>
          {/* Right chart area */}
          <div className="relative" style={{ width: chartWidth }}>
            {/* Header */}
            <div className="border-b bg-muted/40" style={{ height: HEADER_H }}>
              <div className="flex h-6 border-b border-border/50">
                {monthHeaders.map((m, i) => (
                  <div
                    key={i}
                    className="text-[11px] uppercase tracking-wider text-muted-foreground border-r flex items-center px-2"
                    style={{ width: m.span * dayWidth, flexShrink: 0 }}
                  >
                    {m.label}
                  </div>
                ))}
              </div>
              <div className="flex h-6">
                {dayHeaders.map((dh, i) => (
                  <div
                    key={i}
                    className={cn(
                      "text-[10px] text-center border-r border-border/30",
                      (dh.isWeekend || dh.isHoliday) && "bg-muted/40 text-muted-foreground",
                    )}
                    style={{ width: dayWidth, flexShrink: 0 }}
                  >
                    {zoom === "day" && format(dh.date, "d")}
                    {zoom === "week" && dh.date.getDay() === 1 && format(dh.date, "MMM d")}
                  </div>
                ))}
              </div>
            </div>

            {/* Body grid */}
            <div className="relative">
              {/* Background day stripes (weekend/holiday shading + per-day vertical grid) */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{ height: rows.length * ROW_H }}
              >
                {dayHeaders.map((dh, i) => (
                  <div
                    key={i}
                    className={cn(
                      "absolute top-0 bottom-0 border-l border-border/30",
                      dh.isHoliday && "bg-warning/10",
                      !dh.isHoliday && dh.isWeekend && "bg-muted/30",
                    )}
                    style={{ left: i * dayWidth, width: dayWidth }}
                  />
                ))}
              </div>

              {/* Today line */}
              {todayX >= 0 && todayX <= chartWidth && (
                <div
                  className="absolute top-0 bottom-0 w-px bg-primary z-10 pointer-events-none"
                  style={{ left: todayX, height: rows.length * ROW_H }}
                >
                  <div className="absolute -top-2 -left-1 h-2 w-2 rounded-full bg-primary" />
                </div>
              )}

              {/* Rows + bars */}
              {rows.map((r, idx) => (
                <div
                  key={r.kind + r.id}
                  className="border-b relative"
                  style={{ height: ROW_H }}
                >
                  {r.kind === "task" && (() => {
                    const ps = safeDate(r.task.planned_start);
                    const pe = safeDate(r.task.planned_end);
                    if (!ps || !pe || pe < ps) return null;
                    const left = differenceInCalendarDays(ps, range.start) * dayWidth;
                    const width = Math.max(dayWidth, (differenceInCalendarDays(pe, ps) + 1) * dayWidth);
                    const status = taskStatus(r.task, today);
                    const barColor =
                      status === "late" ? "bg-destructive/70 border-destructive"
                        : status === "at_risk" ? "bg-warning/70 border-warning"
                        : status === "done" ? "bg-primary/60 border-primary"
                        : "bg-primary/40 border-primary/60";
                    return (
                      <div
                        className={cn(
                          "absolute top-1.5 rounded-md border h-5 group cursor-pointer overflow-hidden",
                          barColor,
                        )}
                        style={{ left, width }}
                        title={`${r.task.title} · ${format(ps, "MMM d")} → ${format(pe, "MMM d")}`}
                      >
                        <div
                          className="h-full bg-foreground/20"
                          style={{ width: `${Math.min(100, r.task.progress_pct)}%` }}
                        />
                      </div>
                    );
                  })()}
                </div>
              ))}

              {/* Dependency arrows (SVG overlay) */}
              <svg
                className="absolute inset-0 pointer-events-none"
                style={{ width: chartWidth, height: rows.length * ROW_H }}
              >
                <defs>
                  <marker
                    id="arrow"
                    viewBox="0 0 10 10"
                    refX="8"
                    refY="5"
                    markerWidth="6"
                    markerHeight="6"
                    orient="auto"
                  >
                    <path d="M0,0 L10,5 L0,10 z" fill="hsl(var(--muted-foreground))" />
                  </marker>
                </defs>
                {predecessors.map((p, i) => {
                  const fromIdx = taskRowIndex.get(p.predecessor_id);
                  const toIdx = taskRowIndex.get(p.task_id);
                  if (fromIdx === undefined || toIdx === undefined) return null;
                  const from = rows[fromIdx];
                  const to = rows[toIdx];
                  if (from.kind !== "task" || to.kind !== "task") return null;
                  const fps = safeDate(from.task.planned_start);
                  const fpe = safeDate(from.task.planned_end);
                  const tps = safeDate(to.task.planned_start);
                  const tpe = safeDate(to.task.planned_end);
                  if (!fps || !fpe || !tps || !tpe) return null;

                  const fromLeft = differenceInCalendarDays(fps, range.start) * dayWidth;
                  const fromRight = (differenceInCalendarDays(fpe, range.start) + 1) * dayWidth;
                  const toLeft = differenceInCalendarDays(tps, range.start) * dayWidth;
                  const toRight = (differenceInCalendarDays(tpe, range.start) + 1) * dayWidth;

                  let x1 = fromRight, x2 = toLeft;
                  if (p.relation_type === "SS") { x1 = fromLeft; x2 = toLeft; }
                  else if (p.relation_type === "FF") { x1 = fromRight; x2 = toRight; }
                  else if (p.relation_type === "SF") { x1 = fromLeft; x2 = toRight; }
                  x2 += (p.lag_days ?? 0) * dayWidth;

                  const y1 = fromIdx * ROW_H + ROW_H / 2;
                  const y2 = toIdx * ROW_H + ROW_H / 2;
                  const midX = x1 + 8;
                  return (
                    <polyline
                      key={i}
                      points={`${x1},${y1} ${midX},${y1} ${midX},${y2} ${x2},${y2}`}
                      fill="none"
                      stroke="hsl(var(--muted-foreground))"
                      strokeWidth={1}
                      markerEnd="url(#arrow)"
                      opacity={0.55}
                    />
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t px-3 py-2 text-[11px] text-muted-foreground flex items-center gap-4">
        <Badge variant="outline" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-primary/60" /> Planned
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-warning/70" /> At risk
        </Badge>
        <Badge variant="outline" className="gap-1.5">
          <span className="h-2 w-2 rounded-full bg-destructive/70" /> Late
        </Badge>
        <span className="ml-auto">Today is highlighted in primary color · holiday columns shaded</span>
      </div>
    </div>
  );
}
