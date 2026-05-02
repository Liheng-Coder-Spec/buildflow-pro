import { useMemo, useRef, useState } from "react";
import { ArrowRight, Link2, Plus } from "lucide-react";
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
  /** Create a new dependency: predecessor → successor. Return true if created. */
  onCreateLink?: (predecessorId: string, successorId: string) => Promise<boolean> | boolean;
  canEdit?: boolean;
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

interface NodeCardProps {
  task: GraphTaskMin | undefined;
  onClick?: () => void;
  highlight?: boolean;
  draggable?: boolean;
  onDragStart?: (id: string, e: React.DragEvent) => void;
  onDragEnd?: () => void;
  onDragOver?: (id: string, e: React.DragEvent) => void;
  onDragLeave?: () => void;
  onDrop?: (id: string, e: React.DragEvent) => void;
  isDropTarget?: boolean;
  isDragSource?: boolean;
  invalidTarget?: boolean;
}

function NodeCard({
  task, onClick, highlight, draggable,
  onDragStart, onDragEnd, onDragOver, onDragLeave, onDrop,
  isDropTarget, isDragSource, invalidTarget,
}: NodeCardProps) {
  if (!task) {
    return (
      <div className="w-44 h-16 rounded-md border border-dashed flex items-center justify-center text-xs text-muted-foreground">
        Unknown task
      </div>
    );
  }
  return (
    <div
      className={cn(
        "relative w-44 rounded-md border px-2.5 py-1.5 transition-all group",
        statusTone(task.status),
        highlight && "ring-2 ring-primary border-primary",
        isDropTarget && !invalidTarget && "ring-2 ring-emerald-500 border-emerald-500 scale-[1.02]",
        isDropTarget && invalidTarget && "ring-2 ring-destructive border-destructive",
        isDragSource && "opacity-50",
      )}
      onDragOver={(e) => {
        if (!onDragOver) return;
        onDragOver(task.id, e);
      }}
      onDragLeave={onDragLeave}
      onDrop={(e) => {
        if (!onDrop) return;
        onDrop(task.id, e);
      }}
    >
      <button
        onClick={onClick}
        className={cn("block w-full text-left", onClick && "cursor-pointer")}
      >
        <div className="flex items-center gap-1.5 mb-0.5 pr-4">
          {task.code && (
            <span className="font-mono text-[10px] text-muted-foreground shrink-0">{task.code}</span>
          )}
          <span className="text-xs font-medium truncate">{task.title}</span>
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums">
          {fmtDate(task.planned_start)} → {fmtDate(task.planned_end)}
        </div>
      </button>

      {draggable && (
        <button
          type="button"
          draggable
          onDragStart={(e) => {
            e.dataTransfer.effectAllowed = "link";
            e.dataTransfer.setData("text/plain", task.id);
            onDragStart?.(task.id, e);
          }}
          onDragEnd={onDragEnd}
          title="Drag onto another task to create a dependency"
          className="absolute top-1/2 -right-2 -translate-y-1/2 h-5 w-5 rounded-full bg-primary text-primary-foreground border border-background shadow flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition cursor-grab active:cursor-grabbing"
        >
          <Link2 className="h-3 w-3" />
        </button>
      )}
    </div>
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
  onCreateLink, canEdit,
}: Props) {
  const taskMap = useMemo(() => {
    const m = new Map<string, GraphTaskMin>();
    for (const t of tasks) m.set(t.id, t);
    return m;
  }, [tasks]);

  const selected = taskMap.get(selectedTaskId);
  const preds = predecessors.filter((p) => p.task_id === selectedTaskId);
  const succs = successors.filter((s) => s.predecessor_id === selectedTaskId);

  const [dragSourceId, setDragSourceId] = useState<string | null>(null);
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const allLinks = useMemo(() => [...predecessors, ...successors], [predecessors, successors]);

  // Validate a potential drop: source -> target as predecessor -> successor.
  const validateDrop = (sourceId: string, targetId: string): { ok: boolean; reason?: string } => {
    if (sourceId === targetId) return { ok: false, reason: "Cannot link a task to itself" };
    // Already exists in either direction
    const exists = allLinks.some(
      (l) => l.predecessor_id === sourceId && l.task_id === targetId,
    );
    if (exists) return { ok: false, reason: "Link already exists" };
    const reverse = allLinks.some(
      (l) => l.predecessor_id === targetId && l.task_id === sourceId,
    );
    if (reverse) return { ok: false, reason: "Reverse link already exists" };
    return { ok: true };
  };

  const handleDragStart = (id: string) => setDragSourceId(id);
  const handleDragEnd = () => { setDragSourceId(null); setDropTargetId(null); };
  const handleDragOver = (id: string, e: React.DragEvent) => {
    if (!dragSourceId) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = "link";
    if (dropTargetId !== id) setDropTargetId(id);
  };
  const handleDragLeave = () => setDropTargetId(null);
  const handleDrop = async (id: string, e: React.DragEvent) => {
    e.preventDefault();
    const sourceId = dragSourceId ?? e.dataTransfer.getData("text/plain");
    setDragSourceId(null);
    setDropTargetId(null);
    if (!sourceId || !onCreateLink) return;
    const v = validateDrop(sourceId, id);
    if (!v.ok) {
      // Surface via window event-less alert: rely on parent's toast in onCreateLink for success;
      // here just bail. Parent can also re-validate.
      // eslint-disable-next-line no-console
      console.warn("[DependencyGraph] Invalid drop:", v.reason);
      return;
    }
    await onCreateLink(sourceId, id);
  };

  if (!selected) return null;

  const dropInvalid = dragSourceId && dropTargetId
    ? !validateDrop(dragSourceId, dropTargetId).ok
    : false;

  const enableDrag = !!canEdit && !!onCreateLink;

  return (
    <div className="rounded-lg border bg-card p-3">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
          Dependency graph
        </h4>
        <span className="text-[10px] text-muted-foreground flex items-center gap-2">
          {enableDrag && (
            <span className="inline-flex items-center gap-1 text-muted-foreground/80">
              <Plus className="h-3 w-3" /> Drag the link handle onto another task to connect
            </span>
          )}
          <span>{preds.length} pred · {succs.length} succ</span>
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
                    draggable={enableDrag}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    isDropTarget={dropTargetId === p.predecessor_id}
                    isDragSource={dragSourceId === p.predecessor_id}
                    invalidTarget={dropInvalid && dropTargetId === p.predecessor_id}
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
            <NodeCard
              task={selected}
              highlight
              draggable={enableDrag}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              isDropTarget={dropTargetId === selected.id}
              isDragSource={dragSourceId === selected.id}
              invalidTarget={dropInvalid && dropTargetId === selected.id}
            />
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
                    draggable={enableDrag}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    isDropTarget={dropTargetId === s.task_id}
                    isDragSource={dragSourceId === s.task_id}
                    invalidTarget={dropInvalid && dropTargetId === s.task_id}
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
