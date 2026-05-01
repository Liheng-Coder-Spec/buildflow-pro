import { useMemo } from "react";
import { Link2, ArrowRight, ArrowLeft } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { DepRelation, DEP_RELATION_LABELS, taskStatus, SCHEDULE_STATUS_TONE, SCHEDULE_STATUS_DOT } from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskScheduleLite } from "@/lib/scheduleMeta";

export interface DependencyLink {
  task_id: string;
  predecessor_id: string;
  relation_type: DepRelation;
  lag_days: number;
}

export interface GraphTask extends TaskScheduleLite {
  title: string;
  code: string | null;
}

interface TaskDependencyGraphProps {
  selectedTaskId: string | null;
  tasks: GraphTask[];
  predecessors: DependencyLink[];
  successors: DependencyLink[];
  onSelectTask: (taskId: string) => void;
}

function getTaskById(tasks: GraphTask[], id: string): GraphTask | undefined {
  return tasks.find((t) => t.id === id);
}

function fmtDate(s: string | null): string {
  if (!s) return "-";
  const d = parseISO(s);
  return isValid(d) ? format(d, "dd MMM") : "-";
}

function TaskNode({ task, isSelected, onClick }: { task: GraphTask; isSelected: boolean; onClick: () => void }) {
  const status = taskStatus(task, new Date());
  const tone = SCHEDULE_STATUS_TONE[status];
  const dot = SCHEDULE_STATUS_DOT[status];

  return (
    <button
      onClick={onClick}
      className={`w-full text-left border rounded-md px-2.5 py-2 transition-all hover:shadow-sm ${
        isSelected ? "ring-2 ring-primary border-primary bg-primary/5" : "border-border bg-background hover:bg-muted/30"
      }`}
    >
      <div className="flex items-center gap-1.5 mb-1">
        {task.code && (
          <span className="font-mono text-[10px] text-muted-foreground">{task.code}</span>
        )}
        <span className="text-xs font-medium truncate flex-1">{task.title}</span>
      </div>
      <div className="flex items-center justify-between">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-[10px]", tone)}>
          <span className={cn("h-1.5 w-1.5 rounded-full", dot)} />
          {status}
        </span>
        <span className="text-[10px] text-muted-foreground tabular-nums">
          {fmtDate(task.planned_start)} → {fmtDate(task.planned_end)}
        </span>
      </div>
    </button>
  );
}

function DependencyEdge({ relation, lagDays, direction }: { relation: DepRelation; lagDays: number; direction: "in" | "out" }) {
  return (
    <div className="flex items-center gap-1 py-0.5">
      {direction === "in" && <ArrowRight className="h-3 w-3 text-muted-foreground" />}
      <Badge variant="outline" className="font-mono text-[9px] px-1 py-0 h-4">
        {relation}
      </Badge>
      {lagDays !== 0 && (
        <span className="text-[10px] text-muted-foreground">
          {lagDays > 0 ? `+${lagDays}` : lagDays}d
        </span>
      )}
      {direction === "out" && <ArrowLeft className="h-3 w-3 text-muted-foreground" />}
    </div>
  );
}

export function TaskDependencyGraph({
  selectedTaskId,
  tasks,
  predecessors,
  successors,
  onSelectTask,
}: TaskDependencyGraphProps) {
  const selectedTask = useMemo(() => getTaskById(tasks, selectedTaskId ?? ""), [tasks, selectedTaskId]);

  const predLinks = useMemo(() => {
    if (!selectedTaskId) return [];
    return predecessors.filter((p) => p.task_id === selectedTaskId);
  }, [predecessors, selectedTaskId]);

  const succLinks = useMemo(() => {
    if (!selectedTaskId) return [];
    return successors.filter((s) => s.predecessor_id === selectedTaskId);
  }, [successors, selectedTaskId]);

  if (!selectedTaskId || !selectedTask) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-muted-foreground p-6">
        <Link2 className="h-8 w-8 mb-2 opacity-40" />
        <p className="text-sm font-medium">No task selected</p>
        <p className="text-xs">Click a task in the Gantt chart to view its dependencies</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-background">
      <div className="border-b px-3 py-2.5 flex items-center gap-2">
        <Link2 className="h-4 w-4 text-primary shrink-0" />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold truncate">{selectedTask.title}</p>
          <p className="text-[10px] text-muted-foreground">
            {selectedTask.code && <span className="font-mono mr-1">{selectedTask.code}</span>}
            Dependency Graph
          </p>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {predLinks.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" />
                Predecessors ({predLinks.length})
              </h4>
              <div className="space-y-2">
                {predLinks.map((link) => {
                  const predTask = getTaskById(tasks, link.predecessor_id);
                  if (!predTask) return null;
                  return (
                    <div key={link.predecessor_id} className="flex items-start gap-2">
                      <div className="flex-1">
                        <TaskNode
                          task={predTask}
                          isSelected={false}
                          onClick={() => onSelectTask(predTask.id)}
                        />
                      </div>
                      <div className="pt-3">
                        <DependencyEdge relation={link.relation_type} lagDays={link.lag_days} direction="in" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-center">
            <div className="h-px flex-1 bg-border" />
            <Badge variant="secondary" className="mx-2 text-[10px]">Selected Task</Badge>
            <div className="h-px flex-1 bg-border" />
          </div>

          {succLinks.length > 0 && (
            <div>
              <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" />
                Successors ({succLinks.length})
              </h4>
              <div className="space-y-2">
                {succLinks.map((link) => {
                  const succTask = getTaskById(tasks, link.task_id);
                  if (!succTask) return null;
                  return (
                    <div key={link.task_id} className="flex items-start gap-2">
                      <div className="pt-3">
                        <DependencyEdge relation={link.relation_type} lagDays={link.lag_days} direction="out" />
                      </div>
                      <div className="flex-1">
                        <TaskNode
                          task={succTask}
                          isSelected={false}
                          onClick={() => onSelectTask(succTask.id)}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {predLinks.length === 0 && succLinks.length === 0 && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No dependencies found for this task.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
