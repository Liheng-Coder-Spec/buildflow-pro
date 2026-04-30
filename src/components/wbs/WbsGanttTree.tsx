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
  taskStatus,
  workingDaysBetween,
} from "@/lib/scheduleMeta";

interface Props {
  rows: GanttRow[];
  collapsed: Set<string>;
  onToggle: (id: string) => void;
  holidaySet: Set<string>;
  rollupByNode?: Map<string, NodeRollup>;
  bodyScrollRef?: RefObject<HTMLDivElement>;
  onBodyScroll?: (event: UIEvent<HTMLDivElement>) => void;
}

const ROW_H = 32;
const HEADER_H = 48;

const fmtDate = (s: string | null) => {
  if (!s) return "-";
  const d = parseISO(s);
  return isValid(d) ? format(d, "dd-MM-yyyy") : "-";
};

export function WbsGanttTree({
  rows,
  collapsed = new Set<string>(),
  onToggle,
  holidaySet,
  rollupByNode,
  bodyScrollRef,
  onBodyScroll,
}: Props) {
  const today = new Date();

  return (
    <div className="h-full min-h-0 overflow-hidden">
      <div
        className="border-b border-l border-r bg-muted/50 backdrop-blur grid items-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
        style={{ height: HEADER_H, gridTemplateColumns: "1fr 70px 90px 90px 100px 90px" }}
      >
        <div className="px-3 border-r">WBS / Task</div>
        <div className="px-2 text-right border-r">Dur (d)</div>
        <div className="px-2 text-right border-r">Start</div>
        <div className="px-2 text-right border-r">Finish</div>
        <div className="px-2 border-r">Status</div>
        <div className="px-2 pr-3 text-right">% Done</div>
      </div>

      <div ref={bodyScrollRef} onScroll={onBodyScroll} className="h-[calc(100%-48px)] overflow-auto">
        {rows.map((r) => {
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
                "border-b border-l border-r grid items-center text-sm hover:bg-muted/30",
                r.kind === "node" && "bg-muted/40 font-medium",
              )}
              style={{
                height: ROW_H,
                gridTemplateColumns: "1fr 70px 90px 90px 100px 90px",
              }}
            >
              <div
                className="flex items-center gap-1 min-w-0 pr-2 border-r h-full"
                style={{ paddingLeft: r.depth * 14 + 8 }}
              >
                {r.kind === "node" ? (
                  <>
                    <button
                      type="button"
                      onClick={() => onToggle(r.id)}
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

              <div className="px-2 text-right tabular-nums text-xs text-muted-foreground border-r h-full flex items-center justify-end">
                {duration > 0 ? duration : "-"}
              </div>

              <div className="px-2 text-right tabular-nums text-xs text-muted-foreground border-r h-full flex items-center justify-end">
                {fmtDate(start)}
              </div>

              <div className="px-2 text-right tabular-nums text-xs text-muted-foreground border-r h-full flex items-center justify-end">
                {fmtDate(end)}
              </div>

              <div className="px-2 border-r h-full flex items-center">
                <span className="inline-flex items-center gap-1.5 text-xs">
                  <span
                    className={cn("h-2 w-2 rounded-full shrink-0", SCHEDULE_STATUS_DOT[statusKey])}
                  />
                  <span className="truncate">{SCHEDULE_STATUS_LABEL[statusKey]}</span>
                </span>
              </div>

              <div className="px-2 pr-3 flex items-center gap-2 justify-end h-full">
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
    </div>
  );
}
