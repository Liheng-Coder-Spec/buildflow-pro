import { RefObject, UIEvent } from "react";
import { format, isValid, parseISO } from "date-fns";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GanttRow } from "@/lib/wbsGanttRows";
import { cn } from "@/lib/utils";
import {
  NodeRollup,
  SCHEDULE_STATUS_DOT,
  SCHEDULE_STATUS_LABEL,
  SCHEDULE_STATUS_TONE,
  taskStatus,
  workingDaysBetween,
} from "@/lib/scheduleMeta";

interface Props {
  rows: GanttRow[];
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  holidaySet: Set<string>;
  rollupByNode?: Map<string, NodeRollup>;
  projectRollup?: NodeRollup | null;
  bodyScrollRef?: RefObject<HTMLDivElement>;
  onBodyScroll?: (event: UIEvent<HTMLDivElement>) => void;
}

const ROW_H = 36;
const TITLE_H = 52;
const HEADER_H = 56;

const fmtDate = (s: string | null) => {
  if (!s) return "-";
  const d = parseISO(s);
  return isValid(d) ? format(d, "dd MMM") : "-";
};

export function WbsGanttTree({
  rows,
  collapsed = new Set<string>(),
  onToggle,
  holidaySet,
  rollupByNode,
  projectRollup,
  bodyScrollRef,
  onBodyScroll,
}: Props) {
  const today = new Date();

  return (
    <div className="h-full min-h-0 overflow-hidden bg-[linear-gradient(180deg,hsl(var(--background)),hsl(var(--muted))/0.35)]">
      <div className="flex items-center border-b bg-background/90 px-4" style={{ height: TITLE_H }}>
        <div>
          <div className="text-sm font-semibold text-foreground">WBS Schedule</div>
          <div className="text-[11px] text-muted-foreground">Hierarchy, duration, dates, progress, and status</div>
        </div>
      </div>
      <div
        className="border-b bg-muted/70 grid items-center text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground"
        style={{ height: HEADER_H, gridTemplateColumns: "minmax(260px,1fr) 76px 86px 86px 108px 92px" }}
      >
        <div className="px-4 border-r">WBS / Task</div>
        <div className="px-2 text-right border-r">Dur</div>
        <div className="px-2 text-right border-r">Start</div>
        <div className="px-2 text-right border-r">Finish</div>
        <div className="px-3 border-r">Status</div>
        <div className="px-3 text-right">Progress</div>
      </div>

      <div ref={bodyScrollRef} onScroll={onBodyScroll} className="h-[calc(100%-108px)] overflow-auto">
        {rows.map((r, index) => {
          let start: string | null = null;
          let end: string | null = null;
          let progress = 0;
          let statusKey: ReturnType<typeof taskStatus> = "not_started";

          if (r.kind === "project") {
            if (projectRollup) {
              start = projectRollup.plannedStart;
              end = projectRollup.plannedEnd;
              progress = projectRollup.progressPct;
              statusKey = projectRollup.status;
            }
          } else if (r.kind === "task") {
            start = r.task.planned_start;
            end = r.task.planned_end;
            progress = r.task.progress_pct ?? 0;
            statusKey = taskStatus(r.task, today);
          } else {
            const rollup = rollupByNode?.get(r.id);
            if (rollup) {
              start = rollup.plannedStart;
              end = rollup.plannedEnd;
              progress = rollup.progressPct;
              statusKey = rollup.status;
            }
          }

          const duration = workingDaysBetween(start, end, holidaySet);

          return (
            <div
              key={r.kind + r.id}
              className={cn(
                "grid items-center text-sm border-b border-border/60",
                index % 2 === 0 ? "bg-background/80" : "bg-muted/10",
                r.kind === "project" && "bg-primary/8",
                r.kind === "node" && "bg-muted/35",
              )}
              style={{
                height: ROW_H,
                gridTemplateColumns: "minmax(260px,1fr) 76px 86px 86px 108px 92px",
              }}
            >
              <div
                className="flex items-center gap-1.5 min-w-0 pr-2 border-r h-full"
                style={{ paddingLeft: r.depth * 16 + 12 }}
              >
                {r.kind === "project" ? (
                  <>
                    <span className="h-5 w-5 shrink-0" />
                    <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-primary shrink-0">
                      Project
                    </span>
                    <span className="truncate font-semibold">{r.label}</span>
                  </>
                ) : r.kind === "node" ? (
                  <>
                    {r.hasChildren ? (
                      <button
                        type="button"
                        onClick={() => onToggle(r.id)}
                        className="h-5 w-5 rounded-md inline-flex items-center justify-center text-muted-foreground hover:bg-background hover:text-foreground shrink-0"
                      >
                        <ChevronRight
                          className={cn(
                            "h-3.5 w-3.5 transition-transform",
                            !collapsed.has(r.id) && "rotate-90",
                          )}
                        />
                      </button>
                    ) : (
                      <span className="h-5 w-5 shrink-0" />
                    )}
                    <span className={cn(
                      "rounded px-1.5 py-0.5 font-mono text-[10px] shrink-0",
                      r.node.node_type === "building" && "bg-primary/10 text-primary",
                      r.node.node_type === "level" && "bg-success-soft text-success",
                      r.node.node_type === "zone" && "bg-warning-soft text-warning",
                      !["building", "level", "zone"].includes(r.node.node_type) && "bg-background/80 text-muted-foreground",
                    )}>
                      {r.node.code}
                    </span>
                    <span className={cn(
                      "truncate font-medium",
                      r.node.node_type === "building" && "text-foreground",
                      r.node.node_type === "level" && "text-foreground/95",
                      r.node.node_type === "zone" && "text-foreground/90",
                    )}>
                      {r.node.name}
                    </span>
                  </>
                ) : (
                  <Link
                    to={`/tasks/${r.task.id}`}
                    className="ml-6 truncate hover:text-primary inline-flex items-center gap-2 min-w-0"
                  >
                    {r.task.code && (
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] text-muted-foreground shrink-0">
                        {r.task.code}
                      </span>
                    )}
                    <span className="truncate">{r.task.title}</span>
                  </Link>
                )}
              </div>

              <div className="px-2 text-right tabular-nums text-xs text-muted-foreground border-r h-full flex items-center justify-end">
                {duration > 0 ? duration : "-"}
              </div>

              <div className="px-2 text-right tabular-nums text-xs text-muted-foreground border-r h-full flex items-center justify-end">
                {fmtDate(start)}
              </div>

              <div className="px-2 text-right tabular-nums text-xs text-muted-foreground border-r h-full flex items-center justify-end">
                {fmtDate(end)}
              </div>

              <div className="px-3 border-r h-full flex items-center">
                <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-[11px]", SCHEDULE_STATUS_TONE[statusKey])}>
                  <span className={cn("h-2 w-2 rounded-full shrink-0", SCHEDULE_STATUS_DOT[statusKey])} />
                  <span className="truncate">{SCHEDULE_STATUS_LABEL[statusKey]}</span>
                </span>
              </div>

              <div className="px-3 flex items-center gap-2 justify-end h-full">
                <div className="h-1.5 w-[48px] rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full"
                    style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
                  />
                </div>
                <span className="tabular-nums text-[11px] text-muted-foreground w-8 text-right">
                  {Math.round(progress)}%
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
