import { useMemo, useState } from "react";
import { Link2, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DepRelation, DEP_RELATION_LABELS, taskStatus, SCHEDULE_STATUS_TONE, SCHEDULE_STATUS_DOT } from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";
import { cn } from "@/lib/utils";
import { TaskScheduleLite } from "@/lib/scheduleMeta";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

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
  projectId: string | null;
  canEdit: boolean;
  onSelectTask: (taskId: string) => void;
  onDependencyChange: () => void;
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
  projectId,
  canEdit,
  onSelectTask,
  onDependencyChange,
}: TaskDependencyGraphProps) {
  const [showAddPred, setShowAddPred] = useState(false);
  const [showAddSucc, setShowAddSucc] = useState(false);
  const [newTaskId, setNewTaskId] = useState("");
  const [newRelation, setNewRelation] = useState<DepRelation>("FS");
  const [newLag, setNewLag] = useState("0");
  const [adding, setAdding] = useState(false);

  const selectedTask = useMemo(() => getTaskById(tasks, selectedTaskId ?? ""), [tasks, selectedTaskId]);

  const predLinks = useMemo(() => {
    if (!selectedTaskId) return [];
    return predecessors.filter((p) => p.task_id === selectedTaskId);
  }, [predecessors, selectedTaskId]);

  const succLinks = useMemo(() => {
    if (!selectedTaskId) return [];
    return successors.filter((s) => s.predecessor_id === selectedTaskId);
  }, [successors, selectedTaskId]);

  const availableTasks = useMemo(() => {
    return tasks.filter((t) => t.id !== selectedTaskId);
  }, [tasks, selectedTaskId]);

  const handleAddDependency = async (type: "predecessor" | "successor") => {
    if (!selectedTaskId || !newTaskId || !projectId) return;
    setAdding(true);

    let predId: string, taskId: string;
    if (type === "predecessor") {
      predId = newTaskId;
      taskId = selectedTaskId;
    } else {
      predId = selectedTaskId;
      taskId = newTaskId;
    }

    const { error } = await supabase.from("task_predecessors").insert({
      task_id: taskId,
      predecessor_id: predId,
      relation_type: newRelation,
      lag_days: Number(newLag) || 0,
    } as any);

    setAdding(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Dependency added");
    setNewTaskId("");
    setNewLag("0");
    setNewRelation("FS");
    setShowAddPred(false);
    setShowAddSucc(false);
    onDependencyChange();
  };

  const handleRemoveDependency = async (link: DependencyLink, type: "predecessor" | "successor") => {
    const { error } = await supabase
      .from("task_predecessors")
      .delete()
      .eq("task_id", type === "predecessor" ? selectedTaskId : link.task_id)
      .eq("predecessor_id", type === "predecessor" ? link.predecessor_id : selectedTaskId)
      .eq("relation_type", link.relation_type);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Dependency removed");
    onDependencyChange();
  };

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
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ArrowRight className="h-3 w-3" />
                  Predecessors ({predLinks.length})
                </h4>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 px-1.5 text-[10px]"
                    onClick={() => { setShowAddPred(!showAddPred); setShowAddSucc(false); }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {predLinks.map((link) => {
                  const predTask = getTaskById(tasks, link.predecessor_id);
                  if (!predTask) return null;
                  return (
                    <div key={link.predecessor_id} className="flex items-start gap-2 group">
                      <div className="flex-1">
                        <TaskNode
                          task={predTask}
                          isSelected={false}
                          onClick={() => onSelectTask(predTask.id)}
                        />
                      </div>
                      <div className="pt-3 flex items-start gap-1">
                        <DependencyEdge relation={link.relation_type} lagDays={link.lag_days} direction="in" />
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveDependency(link, "predecessor")}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {showAddPred && (
                <div className="mt-2 p-2 border rounded-md bg-muted/30 space-y-2">
                  <Select value={newTaskId} onValueChange={setNewTaskId}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.code && <span className="font-mono mr-1">{t.code}</span>}
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Select value={newRelation} onValueChange={(v) => setNewRelation(v as DepRelation)}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(DEP_RELATION_LABELS).map((k) => (
                          <SelectItem key={k} value={k} className="text-xs">
                            <span className="font-mono">{k}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      value={newLag}
                      onChange={(e) => setNewLag(e.target.value)}
                      className="w-12 h-7 px-1 text-xs border rounded text-center"
                      placeholder="Lag"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => handleAddDependency("predecessor")}
                    disabled={adding || !newTaskId}
                  >
                    {adding ? "Adding..." : "Add Predecessor"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {!predLinks.length && canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { setShowAddPred(!showAddPred); setShowAddSucc(false); }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Predecessor
            </Button>
          )}

          <div className="flex justify-center">
            <div className="h-px flex-1 bg-border" />
            <Badge variant="secondary" className="mx-2 text-[10px]">Selected Task</Badge>
            <div className="h-px flex-1 bg-border" />
          </div>

          {succLinks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <ArrowLeft className="h-3 w-3" />
                  Successors ({succLinks.length})
                </h4>
                {canEdit && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-5 px-1.5 text-[10px]"
                    onClick={() => { setShowAddSucc(!showAddSucc); setShowAddPred(false); }}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <div className="space-y-2">
                {succLinks.map((link) => {
                  const succTask = getTaskById(tasks, link.task_id);
                  if (!succTask) return null;
                  return (
                    <div key={link.task_id} className="flex items-start gap-2 group">
                      <div className="pt-3 flex items-start gap-1">
                        <DependencyEdge relation={link.relation_type} lagDays={link.lag_days} direction="out" />
                        {canEdit && (
                          <button
                            onClick={() => handleRemoveDependency(link, "successor")}
                            className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-opacity"
                          >
                            <X className="h-3 w-3" />
                          </button>
                        )}
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
              {showAddSucc && (
                <div className="mt-2 p-2 border rounded-md bg-muted/30 space-y-2">
                  <Select value={newTaskId} onValueChange={setNewTaskId}>
                    <SelectTrigger className="h-7 text-xs">
                      <SelectValue placeholder="Select task" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTasks.map((t) => (
                        <SelectItem key={t.id} value={t.id} className="text-xs">
                          {t.code && <span className="font-mono mr-1">{t.code}</span>}
                          {t.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center gap-1">
                    <Select value={newRelation} onValueChange={(v) => setNewRelation(v as DepRelation)}>
                      <SelectTrigger className="h-7 text-xs flex-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(DEP_RELATION_LABELS).map((k) => (
                          <SelectItem key={k} value={k} className="text-xs">
                            <span className="font-mono">{k}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <input
                      type="number"
                      value={newLag}
                      onChange={(e) => setNewLag(e.target.value)}
                      className="w-12 h-7 px-1 text-xs border rounded text-center"
                      placeholder="Lag"
                    />
                  </div>
                  <Button
                    size="sm"
                    className="w-full h-7 text-xs"
                    onClick={() => handleAddDependency("successor")}
                    disabled={adding || !newTaskId}
                  >
                    {adding ? "Adding..." : "Add Successor"}
                  </Button>
                </div>
              )}
            </div>
          )}

          {!succLinks.length && canEdit && (
            <Button
              size="sm"
              variant="ghost"
              className="w-full text-xs text-muted-foreground"
              onClick={() => { setShowAddSucc(!showAddSucc); setShowAddPred(false); }}
            >
              <Plus className="h-3 w-3 mr-1" />
              Add Successor
            </Button>
          )}

          {predLinks.length === 0 && succLinks.length === 0 && !canEdit && (
            <div className="text-center py-4 text-xs text-muted-foreground">
              No dependencies found for this task.
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
