import { useMemo, useRef, useState } from "react";
import {
  addDays,
  differenceInDays,
  eachMonthOfInterval,
  eachWeekOfInterval,
  eachYearOfInterval,
  format,
  isAfter,
  isBefore,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
} from "date-fns";
import { ChevronRight, AlertTriangle, CheckCircle2, Clock, Ban, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { useWbsGantt } from "@/hooks/useWbsGantt";
import { WbsNode } from "@/lib/wbsMeta";
import { WbsNodeStat } from "@/hooks/useWbsTree";

// ─── Types ────────────────────────────────────────────────────────────────────
interface Props {
  projectId: string;
  wbsNodes: WbsNode[];
  nodeStats?: Map<string, WbsNodeStat>;
}

type DelayStatus = "completed" | "on_track" | "at_risk" | "delayed" | "no_date";
type ZoomLevel = "day" | "week" | "month" | "year";

// ─── Constants ────────────────────────────────────────────────────────────────
const ZOOM_PX: Record<ZoomLevel, number> = {
  day: 28,
  week: 12,
  month: 4,
  year: 1,
};
const LEFT_GRID_W = 500; // px width of the left data grid

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseDate(s: string | null | undefined): Date | null {
  if (!s) return null;
  try {
    const d = parseISO(s);
    return isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

function calcDuration(start: string | null, end: string | null): number | null {
  const s = parseDate(start);
  const e = parseDate(end);
  if (!s || !e) return null;
  const d = differenceInDays(e, s);
  return d >= 0 ? d + 1 : null;
}

function getDelayStatus(
  status: string,
  plannedEnd: string | null,
  plannedStart: string | null,
  actualEnd?: string | null,
): DelayStatus {
  const done = status === "completed" || status === "closed";
  if (done) return "completed";
  
  // If actual end exists and it's after planned end, it's delayed even if marked as done (though here we handle active tasks)
  if (!plannedEnd || !plannedStart) return "no_date";
  
  const end = parseDate(plannedEnd);
  if (!end) return "no_date";
  
  const today = startOfDay(new Date());
  const daysLeft = differenceInDays(end, today);
  
  if (daysLeft < 0) return "delayed";
  if (daysLeft <= 3) return "at_risk";
  return "on_track";
}

const STATUS_CONFIG: Record<
  DelayStatus,
  { label: string; icon: React.ElementType; cls: string; barCls: string }
> = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    cls: "bg-emerald-500/15 text-emerald-700 border-emerald-200 dark:text-emerald-400",
    barCls: "bg-emerald-500",
  },
  on_track: {
    label: "On Track",
    icon: Clock,
    cls: "bg-blue-500/15 text-blue-700 border-blue-200 dark:text-blue-400",
    barCls: "bg-blue-500",
  },
  at_risk: {
    label: "At Risk",
    icon: AlertTriangle,
    cls: "bg-amber-500/15 text-amber-700 border-amber-200 dark:text-amber-400",
    barCls: "bg-amber-500",
  },
  delayed: {
    label: "Delayed",
    icon: AlertTriangle,
    cls: "bg-rose-500/15 text-rose-700 border-rose-200 dark:text-rose-400",
    barCls: "bg-rose-500",
  },
  no_date: {
    label: "No Date",
    icon: Minus,
    cls: "bg-slate-500/15 text-slate-600 border-slate-200",
    barCls: "bg-slate-400",
  },
};

// ─── Status Badge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: DelayStatus }) {
  const cfg = STATUS_CONFIG[status];
  const Icon = cfg.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded-full border",
        cfg.cls,
      )}
    >
      <Icon className="h-2.5 w-2.5" />
      {cfg.label}
    </span>
  );
}

// ─── Progress Bar cell ────────────────────────────────────────────────────────
function ProgressCell({ pct, status }: { pct: number; status: DelayStatus }) {
  const barCls = STATUS_CONFIG[status].barCls;
  return (
    <div className="flex items-center gap-2 min-w-[80px]">
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", barCls)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-[11px] tabular-nums text-muted-foreground w-7 text-right shrink-0">
        {pct}%
      </span>
    </div>
  );
}

// ─── Timeline Header ──────────────────────────────────────────────────────────
function TimelineHeader({
  minDate,
  totalDays,
  zoom,
  pxPerDay,
}: {
  minDate: Date;
  totalDays: number;
  zoom: ZoomLevel;
  pxPerDay: number;
}) {
  const today = startOfDay(new Date());
  const maxDate = addDays(minDate, totalDays - 1);

  let topItems: { label: string; offsetDays: number; spanDays: number }[] = [];
  if (zoom === "day" || zoom === "week") {
    const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: maxDate });
    topItems = months.map((m) => {
      const offset = Math.max(0, differenceInDays(m, minDate));
      const endM = addDays(startOfMonth(addDays(m, 32)), -1);
      const span = Math.min(differenceInDays(endM, m) + 1, totalDays - offset);
      return { label: format(m, "MMM yyyy"), offsetDays: offset, spanDays: span };
    });
  } else {
    const years = eachYearOfInterval({ start: startOfYear(minDate), end: maxDate });
    topItems = years.map((y) => {
      const offset = Math.max(0, differenceInDays(y, minDate));
      const endY = addDays(startOfYear(addDays(y, 366)), -1);
      const span = Math.min(differenceInDays(endY, y) + 1, totalDays - offset);
      return { label: format(y, "yyyy"), offsetDays: offset, spanDays: span };
    });
  }

  let bottomItems: { label: string; offsetDays: number }[] = [];
  if (zoom === "day") {
    const step = totalDays > 100 ? 3 : 1;
    for(let i=0; i<totalDays; i+=step) {
      const d = addDays(minDate, i);
      bottomItems.push({ label: format(d, "d"), offsetDays: i });
    }
  } else if (zoom === "week") {
    const weeks = eachWeekOfInterval({ start: minDate, end: maxDate });
    bottomItems = weeks.map((w) => ({
      label: format(w, "d MMM"),
      offsetDays: Math.max(0, differenceInDays(w, minDate)),
    }));
  } else if (zoom === "month") {
    const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: maxDate });
    bottomItems = months.map((m) => ({
      label: format(m, "MMM"),
      offsetDays: Math.max(0, differenceInDays(m, minDate)),
    }));
  } else if (zoom === "year") {
    const months = eachMonthOfInterval({ start: startOfMonth(minDate), end: maxDate });
    bottomItems = months.filter((m) => m.getMonth() % 3 === 0).map((m) => ({
      label: `Q${Math.floor(m.getMonth() / 3) + 1}`,
      offsetDays: Math.max(0, differenceInDays(m, minDate)),
    }));
  }

  return (
    <div className="relative h-10 bg-muted/40 border-b overflow-hidden" style={{ width: totalDays * pxPerDay }}>
      {topItems.map((item, i) => (
        <div
          key={`top-${i}`}
          className="absolute top-0 h-5 flex items-center border-r border-border/60 px-1.5 overflow-hidden"
          style={{ left: item.offsetDays * pxPerDay, width: item.spanDays * pxPerDay }}
        >
          <span className="text-[10px] font-medium text-muted-foreground truncate">
            {item.label}
          </span>
        </div>
      ))}

      {bottomItems.map((item, i) => (
        <div
          key={`bot-${i}`}
          className="absolute bottom-0 h-5 border-l border-border/40 flex items-end pb-0.5 pl-0.5"
          style={{ left: item.offsetDays * pxPerDay }}
        >
          <span className="text-[9px] text-muted-foreground/60 whitespace-nowrap">
            {item.label}
          </span>
        </div>
      ))}

      {!isBefore(today, minDate) && !isAfter(today, maxDate) && (
        <div
          className="absolute top-0 bottom-0 w-px bg-rose-500/70 z-10"
          style={{ left: differenceInDays(today, minDate) * pxPerDay }}
        />
      )}
    </div>
  );
}

// ─── Task Bar in timeline ─────────────────────────────────────────────────────
function TaskBar({
  task,
  minDate,
  totalDays,
  rowH,
  pxPerDay,
}: {
  task: ReturnType<typeof useWbsGantt>["tasks"][number];
  minDate: Date;
  totalDays: number;
  rowH: number;
  pxPerDay: number;
}) {
  const pStart = parseDate(task.planned_start);
  const pEnd = parseDate(task.planned_end);
  const aStart = parseDate(task.actual_start);
  const aEnd = parseDate(task.actual_end) || (task.actual_start ? startOfDay(new Date()) : null);
  
  const today = startOfDay(new Date());
  const delayStatus = getDelayStatus(task.status, task.planned_end, task.planned_start, task.actual_end);
  const cfg = STATUS_CONFIG[delayStatus];

  return (
    <div
      className="relative flex items-center"
      style={{ width: totalDays * pxPerDay, height: rowH }}
    >
      {/* Today vertical line */}
      <TodayLine minDate={minDate} totalDays={totalDays} pxPerDay={pxPerDay} />

      {/* Planned Bar (Baseline) */}
      {pStart && pEnd && (
        <div
          title={`Planned: ${format(pStart, "dd MMM")} → ${format(pEnd, "dd MMM")}`}
          className={cn(
            "absolute rounded-sm h-3 z-0 border border-black/5 opacity-40",
            cfg.barCls,
          )}
          style={{ 
            top: 6,
            left: differenceInDays(isBefore(pStart, minDate) ? minDate : pStart, minDate) * pxPerDay, 
            width: Math.max(differenceInDays(pEnd, pStart) + 1, 1) * pxPerDay 
          }}
        />
      )}

      {/* Actual Bar */}
      {aStart && (
        <div
          title={`Actual: ${format(aStart, "dd MMM")} → ${aEnd ? format(aEnd, "dd MMM") : "Ongoing"}`}
          className={cn(
            "absolute rounded-sm h-5 z-10 border shadow-sm cursor-default select-none flex items-center overflow-hidden",
            cfg.barCls,
            "border-black/10"
          )}
          style={{ 
            top: 10,
            left: differenceInDays(isBefore(aStart, minDate) ? minDate : aStart, minDate) * pxPerDay, 
            width: Math.max(differenceInDays(aEnd || today, aStart) + 1, 1) * pxPerDay 
          }}
        >
          {/* Progress fill */}
          <div
            className="absolute inset-0 bg-white/30 rounded-sm"
            style={{ width: `${task.progress_pct}%` }}
          />
          {/* Label */}
          <span className="relative px-1.5 text-[9px] text-white font-bold truncate">
            {task.progress_pct}%
          </span>
        </div>
      )}
      
      {!pStart && !pEnd && !aStart && (
        <span className="text-[10px] text-muted-foreground/40 italic ml-2">No dates</span>
      )}
    </div>
  );
}

function TodayLine({ minDate, totalDays, pxPerDay }: { minDate: Date; totalDays: number; pxPerDay: number }) {
  const today = startOfDay(new Date());
  const todayLeft = !isBefore(today, minDate) && !isAfter(today, addDays(minDate, totalDays - 1))
      ? differenceInDays(today, minDate) * pxPerDay
      : null;

  if (todayLeft === null) return null;
  return (
    <div
      className="absolute top-0 bottom-0 w-px bg-rose-500/30 pointer-events-none z-20"
      style={{ left: todayLeft }}
    />
  );
}

// ─── Main Gantt Component ─────────────────────────────────────────────────────
export function WbsGanttTab({ projectId, wbsNodes, nodeStats }: Props) {
  const { tasks, loading } = useWbsGantt(projectId);
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const [zoom, setZoom] = useState<ZoomLevel>("day");
  const timelineRef = useRef<HTMLDivElement>(null);

  const pxPerDay = ZOOM_PX[zoom];

  const nodeMap = useMemo(
    () => new Map(wbsNodes.map((n) => [n.id, n])),
    [wbsNodes],
  );

  // Group tasks by wbs_node_id
  const grouped = useMemo(() => {
    const map = new Map<string | null, typeof tasks>();
    tasks.forEach((t) => {
      const key = t.wbs_node_id ?? "__none__";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(t);
    });
    return map;
  }, [tasks]);

  // Ordered node groups: nodes that have tasks, then "Unassigned"
  const orderedGroups = useMemo(() => {
    const out: Array<{ nodeId: string | null; tasks: typeof tasks }> = [];
    wbsNodes.forEach((n) => {
      const t = grouped.get(n.id);
      if (t && t.length > 0) out.push({ nodeId: n.id, tasks: t });
    });
    const unassigned = grouped.get("__none__");
    if (unassigned && unassigned.length > 0)
      out.push({ nodeId: null, tasks: unassigned });
    return out;
  }, [grouped, wbsNodes]);

  // Date range for timeline
  const { minDate, totalDays } = useMemo(() => {
    const allDates: Date[] = [];
    tasks.forEach((t) => {
      const s = parseDate(t.planned_start);
      const e = parseDate(t.planned_end);
      if (s) allDates.push(s);
      if (e) allDates.push(e);
    });
    if (allDates.length === 0) {
      const today = startOfDay(new Date());
      return { minDate: today, totalDays: 90 };
    }
    const min = new Date(Math.min(...allDates.map((d) => d.getTime())));
    const max = new Date(Math.max(...allDates.map((d) => d.getTime())));
    const minD = addDays(startOfMonth(min), -7);
    const span = Math.max(60, differenceInDays(max, minD) + 14);
    return { minDate: minD, totalDays: span };
  }, [tasks]);

  const toggleCollapse = (id: string) => {
    setCollapsed((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const scrollToToday = () => {
    if (!timelineRef.current) return;
    const today = startOfDay(new Date());
    if (isBefore(today, minDate) || isAfter(today, addDays(minDate, totalDays))) return;
    
    const offset = differenceInDays(today, minDate) * pxPerDay;
    // Account for left grid and give some padding
    const scrollPos = Math.max(0, offset - LEFT_GRID_W + 100);
    timelineRef.current.scrollTo({ left: scrollPos, behavior: "smooth" });
  };

  const ROW_H = 36; // px per task row
  const GROUP_H = 32; // px per group header

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-8 w-full" />
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm p-12">
        No tasks with WBS assignments found for this project.
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Toolbar ── */}
      <div className="flex items-center gap-2 px-4 py-2 border-b bg-muted/20 shrink-0">
        <button
          onClick={scrollToToday}
          className="text-xs font-medium px-3 py-1.5 rounded border bg-background hover:bg-accent hover:text-accent-foreground transition-colors shadow-sm"
        >
          Today
        </button>
        <div className="flex items-center rounded-md border bg-muted/40 p-0.5 gap-0.5 ml-auto">
          {(["day", "week", "month", "year"] as ZoomLevel[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setZoom(lvl)}
              className={cn(
                "px-2.5 py-1 text-xs capitalize rounded transition-colors",
                zoom === lvl
                  ? "bg-background shadow-sm text-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
              )}
            >
              {lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Horizontal scroll wrapper */}
      <div className="flex-1 overflow-auto" ref={timelineRef}>
        <table className="border-collapse text-sm" style={{ tableLayout: "fixed" }}>
          {/* ── Column definitions ── */}
          <colgroup>
            <col style={{ width: 220 }} /> {/* Name */}
            <col style={{ width: 50 }} />  {/* Duration */}
            <col style={{ width: 80 }} />  {/* Start */}
            <col style={{ width: 80 }} />  {/* Finish */}
            <col style={{ width: 90 }} />  {/* Status */}
            <col style={{ width: 80 }} /> {/* Progress */}
            <col style={{ width: totalDays * pxPerDay }} /> {/* Timeline */}
          </colgroup>

          {/* ── Sticky header ── */}
          <thead className="sticky top-0 z-20 bg-background">
            <tr>
              {[
                { label: "WBS / Task", align: "left" },
                { label: "Days", align: "center" },
                { label: "Start", align: "center" },
                { label: "Finish", align: "center" },
                { label: "Status", align: "center" },
                { label: "Progress", align: "left" },
              ].map((col) => (
                <th
                  key={col.label}
                  className={cn(
                    "border border-border/60 bg-muted/50 px-2 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground whitespace-nowrap",
                    col.align === "center" ? "text-center" : "text-left",
                  )}
                >
                  {col.label}
                </th>
              ))}
              {/* Timeline header cell */}
              <th className="border border-border/60 bg-muted/50 p-0">
                <TimelineHeader minDate={minDate} totalDays={totalDays} zoom={zoom} pxPerDay={pxPerDay} />
              </th>
            </tr>
          </thead>

          <tbody>
            {orderedGroups.map(({ nodeId, tasks: groupTasks }) => {
              const node = nodeId ? nodeMap.get(nodeId) : null;
              const groupLabel = node
                ? `${node.code} · ${node.name}`
                : "Unassigned";
              const isCollapsed = nodeId ? collapsed.has(nodeId) : false;

              // Group-level aggregates (Using nodeStats if available)
              const stat = nodeId && nodeStats ? nodeStats.get(nodeId) : null;
              
              const groupProgress = stat?.avgProgress ?? 
                (groupTasks.length > 0
                  ? Math.round(groupTasks.reduce((s, t) => s + t.progress_pct, 0) / groupTasks.length)
                  : 0);

              // Earliest start / latest end for the group bar
              let gStartDate = stat?.minStart ? new Date(stat.minStart) : null;
              let gEndDate = stat?.maxEnd ? new Date(stat.maxEnd) : null;
              
              if (!gStartDate && groupTasks.length > 0) {
                 const gStarts = groupTasks.map((t) => parseDate(t.planned_start)).filter(Boolean) as Date[];
                 if(gStarts.length > 0) gStartDate = new Date(Math.min(...gStarts.map((d) => d.getTime())));
              }
              if (!gEndDate && groupTasks.length > 0) {
                 const gEnds = groupTasks.map((t) => parseDate(t.planned_end)).filter(Boolean) as Date[];
                 if(gEnds.length > 0) gEndDate = new Date(Math.max(...gEnds.map((d) => d.getTime())));
              }

              const gDuration =
                gStartDate && gEndDate
                  ? differenceInDays(gEndDate, gStartDate) + 1
                  : null;

              // Determine group delay status (worst of all tasks)
              const worstStatus = ((): DelayStatus => {
                const order: DelayStatus[] = [
                  "delayed", "at_risk", "no_date", "on_track", "completed",
                ];
                const statuses = groupTasks.map((t) =>
                  getDelayStatus(t.status, t.planned_end, t.planned_start),
                );
                for (const s of order) {
                  if (statuses.includes(s)) return s;
                }
                return "completed";
              })();

              return [
                /* ── Group header row ── */
                <tr
                  key={`group-${nodeId ?? "none"}`}
                  className="bg-muted/30 hover:bg-muted/50 transition-colors"
                  style={{ height: GROUP_H }}
                >
                  {/* Name cell */}
                  <td className="border border-border/60 px-2 py-1">
                    <button
                      type="button"
                      onClick={() => nodeId && toggleCollapse(nodeId)}
                      className="flex items-center gap-1.5 w-full text-left"
                    >
                      {nodeId && (
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 text-muted-foreground shrink-0 transition-transform",
                            !isCollapsed && "rotate-90",
                          )}
                        />
                      )}
                      <span className="font-semibold text-[12px] truncate">{groupLabel}</span>
                    </button>
                  </td>

                  {/* Duration */}
                  <td className="border border-border/60 px-2 py-1 text-center text-[11px] text-muted-foreground tabular-nums">
                    {gDuration != null ? `${gDuration}d` : "—"}
                  </td>

                  {/* Start */}
                  <td className="border border-border/60 px-2 py-1 text-center text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                    {gStartDate ? format(gStartDate, "dd MMM yy") : "—"}
                  </td>

                  {/* Finish */}
                  <td className="border border-border/60 px-2 py-1 text-center text-[11px] text-muted-foreground tabular-nums whitespace-nowrap">
                    {gEndDate ? format(gEndDate, "dd MMM yy") : "—"}
                  </td>

                  {/* Status */}
                  <td className="border border-border/60 px-2 py-1 text-center">
                    <StatusBadge status={worstStatus} />
                  </td>

                  {/* Progress */}
                  <td className="border border-border/60 px-2 py-1">
                    <ProgressCell pct={groupProgress} status={worstStatus} />
                  </td>

                  {/* Group summary bar in timeline */}
                  <td className="border border-border/60 p-0 bg-muted/10">
                    {gStartDate && gEndDate ? (
                      <div
                        className="relative flex items-center"
                        style={{ width: totalDays * pxPerDay, height: GROUP_H }}
                      >
                        <div
                          className={cn(
                            "absolute rounded h-3 opacity-40",
                            STATUS_CONFIG[worstStatus].barCls,
                          )}
                          style={{
                            left:
                              Math.max(0, differenceInDays(gStartDate, minDate)) *
                              pxPerDay,
                            width:
                              Math.max(4, differenceInDays(gEndDate, gStartDate) + 1) *
                              pxPerDay,
                          }}
                        />
                      </div>
                    ) : (
                      <div style={{ width: totalDays * pxPerDay, height: GROUP_H }} />
                    )}
                  </td>
                </tr>,

                /* ── Task rows ── */
                ...(!isCollapsed
                  ? groupTasks.map((task) => {
                      const duration = calcDuration(task.planned_start, task.planned_end);
                      const delayStatus = getDelayStatus(
                        task.status,
                        task.planned_end,
                        task.planned_start,
                      );
                      const start = parseDate(task.planned_start);
                      const end = parseDate(task.planned_end);

                      return (
                        <tr
                          key={task.id}
                          className="hover:bg-muted/20 transition-colors group/row"
                          style={{ height: ROW_H }}
                        >
                          {/* Name */}
                          <td className="border border-border/60 px-2 py-1 pl-7 relative">
                            <div className="flex flex-col min-w-0">
                              <div className="flex items-baseline gap-1.5">
                                {task.code && (
                                  <span className="font-mono text-[9px] text-muted-foreground shrink-0 uppercase">
                                    {task.code}
                                  </span>
                                )}
                                <span className="truncate text-[12px] font-medium" title={task.title}>
                                  {task.title}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Duration */}
                          <td className="border border-border/60 px-2 py-1 text-center text-[11px] tabular-nums text-muted-foreground">
                            <span>{duration != null ? `${duration}d` : "—"}</span>
                          </td>

                          {/* Start */}
                          <td className="border border-border/60 px-2 py-1 text-center text-[11px] tabular-nums text-muted-foreground whitespace-nowrap">
                            <span className="font-medium text-foreground/80">{start ? format(start, "dd MMM") : "—"}</span>
                          </td>

                          {/* Finish */}
                          <td className="border border-border/60 px-2 py-1 text-center text-[11px] tabular-nums text-muted-foreground whitespace-nowrap">
                            <span className="font-medium text-foreground/80">{end ? format(end, "dd MMM") : "—"}</span>
                          </td>

                          {/* Status badge */}
                          <td className="border border-border/60 px-2 py-1 text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <StatusBadge status={delayStatus} />
                              {delayStatus === "delayed" && end && (
                                <span className="text-[9px] text-rose-500 font-bold">
                                  {differenceInDays(new Date(), end)}d Late
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Progress bar */}
                          <td className="border border-border/60 px-2 py-1">
                            <ProgressCell pct={task.progress_pct} status={delayStatus} />
                          </td>

                          {/* Task bar in timeline */}
                          <td className="border border-border/60 p-0 relative">
                            <TaskBar
                              task={task}
                              minDate={minDate}
                              totalDays={totalDays}
                              rowH={ROW_H}
                              pxPerDay={pxPerDay}
                            />
                          </td>
                        </tr>
                      );
                    })
                  : []),
              ];
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 px-4 py-2 border-t bg-muted/20 text-[10px] text-muted-foreground flex-wrap shrink-0">
        <span className="font-medium">Legend:</span>
        {(Object.entries(STATUS_CONFIG) as [DelayStatus, (typeof STATUS_CONFIG)[DelayStatus]][]).map(
          ([key, cfg]) => {
            const Icon = cfg.icon;
            return (
              <span key={key} className="flex items-center gap-1">
                <Icon className="h-3 w-3" />
                <span
                  className={cn(
                    "px-1.5 py-0.5 rounded-full border text-[9px] font-medium",
                    cfg.cls,
                  )}
                >
                  {cfg.label}
                </span>
              </span>
            );
          },
        )}
        <span className="ml-auto flex items-center gap-1">
          <span className="inline-block w-4 h-px bg-rose-500/70" />
          Today
        </span>
      </div>
    </div>
  );
}
