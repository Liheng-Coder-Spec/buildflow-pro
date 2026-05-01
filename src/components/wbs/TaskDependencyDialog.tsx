import { useMemo, useState } from "react";
import { Link2, ArrowRight, ArrowLeft, Plus, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
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

interface GraphTask extends TaskScheduleLite {
  title: string;
  code: string | null;
}

interface TaskDependencyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTaskId: string | null;
  tasks: GraphTask[];
  predecessors: DependencyLink[];
  successors: DependencyLink[];
  projectId: string | null;
  canEdit: boolean;
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

export function TaskDependencyDialog({
  open,
  onOpenChange,
  selectedTaskId,
  tasks,
  predecessors,
  successors,
  projectId,
  canEdit,
  onDependencyChange,
}: TaskDependencyDialogProps) {
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

    let predId: string;
    let taskId: string;
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
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>No task selected</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8 text-muted-foreground">
            <p>Click a task in the Gantt chart to manage its dependencies</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5 text-primary" />
            <div>
              <div className="text-base">{selectedTask.title}</div>
              <div className="text-xs text-muted-foreground font-normal">
                {selectedTask.code && <span className="font-mono mr-1">{selectedTask.code}</span>}
                Dependency Management
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-auto space-y-6 p-1">
          {/* Predecessors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Predecessors ({predLinks.length})
              </h4>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowAddSucc(false); setShowAddPred(p => !p); }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Predecessor
                </Button>
              )}
            </div>

            {predLinks.length > 0 && (
              <div className="space-y-2">
                {predLinks.map((link) => {
                  const predTask = getTaskById(tasks, link.predecessor_id);
                  if (!predTask) return null;
                  return (
                    <div key={link.predecessor_id} className="flex items-start gap-3 group p-2 border rounded-md bg-background hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {predTask.code && (
                            <span className="font-mono text-xs text-muted-foreground">{predTask.code}</span>
                          )}
                          <span className="text-sm font-medium truncate">{predTask.title}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-[10px] h-5">
                            {link.relation_type}
                          </Badge>
                          {link.lag_days !== 0 && (
                            <span className="text-xs text-muted-foreground">
                              {link.lag_days > 0 ? `+${link.lag_days}` : link.lag_days}d
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {fmtDate(predTask.planned_start)} → {fmtDate(predTask.planned_end)}
                          </span>
                        </div>
                      </div>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => handleRemoveDependency(link, "predecessor")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {showAddPred && (
              <div className="mt-3 p-3 border rounded-md bg-muted/30 space-y-3">
                <Select value={newTaskId} onValueChange={setNewTaskId}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-sm">
                        {t.code && <span className="font-mono mr-2">{t.code}</span>}
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Select value={newRelation} onValueChange={(v) => setNewRelation(v as DepRelation)}>
                    <SelectTrigger className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(DEP_RELATION_LABELS).map((k) => (
                        <SelectItem key={k} value={k} className="text-sm">
                          <span className="font-mono">{k}</span>
                          <span className="text-xs text-muted-foreground ml-2">{DEP_RELATION_LABELS[k as DepRelation]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="number"
                    value={newLag}
                    onChange={(e) => setNewLag(e.target.value)}
                    className="w-16 h-8 px-2 text-sm border rounded text-center"
                    placeholder="Lag"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full h-8 text-sm"
                  onClick={() => handleAddDependency("predecessor")}
                  disabled={adding || !newTaskId}
                >
                  {adding ? "Adding..." : "Add Predecessor"}
                </Button>
              </div>
            )}
          </div>

          {/* Successors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Successors ({succLinks.length})
              </h4>
              {canEdit && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setShowAddPred(false); setShowAddSucc(p => !p); }}
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Successor
                </Button>
              )}
            </div>

            {succLinks.length > 0 && (
              <div className="space-y-2">
                {succLinks.map((link) => {
                  const succTask = getTaskById(tasks, link.task_id);
                  if (!succTask) return null;
                  return (
                    <div key={link.task_id} className="flex items-start gap-3 group p-2 border rounded-md bg-background hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {succTask.code && (
                            <span className="font-mono text-xs text-muted-foreground">{succTask.code}</span>
                          )}
                          <span className="text-sm font-medium truncate">{succTask.title}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge variant="outline" className="font-mono text-[10px] h-5">
                            {link.relation_type}
                          </Badge>
                          {link.lag_days !== 0 && (
                            <span className="text-xs text-muted-foreground">
                              {link.lag_days > 0 ? `+${link.lag_days}` : link.lag_days}d
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {fmtDate(succTask.planned_start)} → {fmtDate(succTask.planned_end)}
                          </span>
                        </div>
                      </div>
                      {canEdit && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                          onClick={() => handleRemoveDependency(link, "successor")}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {showAddSucc && (
              <div className="mt-3 p-3 border rounded-md bg-muted/30 space-y-3">
                <Select value={newTaskId} onValueChange={setNewTaskId}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder="Select task" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTasks.map((t) => (
                      <SelectItem key={t.id} value={t.id} className="text-sm">
                        {t.code && <span className="font-mono mr-2">{t.code}</span>}
                        {t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex items-center gap-2">
                  <Select value={newRelation} onValueChange={(v) => setNewRelation(v as DepRelation)}>
                    <SelectTrigger className="h-8 text-sm flex-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(DEP_RELATION_LABELS).map((k) => (
                        <SelectItem key={k} value={k} className="text-sm">
                          <span className="font-mono">{k}</span>
                          <span className="text-xs text-muted-foreground ml-2">{DEP_RELATION_LABELS[k as DepRelation]}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <input
                    type="number"
                    value={newLag}
                    onChange={(e) => setNewLag(e.target.value)}
                    className="w-16 h-8 px-2 text-sm border rounded text-center"
                    placeholder="Lag"
                  />
                </div>
                <Button
                  size="sm"
                  className="w-full h-8 text-sm"
                  onClick={() => handleAddDependency("successor")}
                  disabled={adding || !newTaskId}
                >
                  {adding ? "Adding..." : "Add Successor"}
                </Button>
              </div>
            )}
          </div>

          {predLinks.length === 0 && succLinks.length === 0 && !canEdit && (
            <div className="text-center py-8 text-sm text-muted-foreground">
              No dependencies found for this task.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
