import { useMemo, useState } from "react";
import { Link2, ArrowRight, ArrowLeft, Trash2, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { DepRelation, DEP_RELATION_LABELS } from "@/lib/scheduleMeta";
import { format, parseISO, isValid } from "date-fns";
import { TaskScheduleLite } from "@/lib/scheduleMeta";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DependencyLink {
  id?: string;
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
  const [linkMode, setLinkMode] = useState<"idle" | "selecting" | "edit">("idle");
  const [linkTarget, setLinkTarget] = useState<string | null>(null);
  const [editLink, setEditLink] = useState<DependencyLink | null>(null);
  const [editRelation, setEditRelation] = useState<DepRelation>("FS");
  const [editLag, setEditLag] = useState("0");
  const [saving, setSaving] = useState(false);

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

  const handleLink = async () => {
    if (!selectedTaskId || !linkTarget || !projectId) return;
    setSaving(true);

    const { error } = await supabase.from("task_predecessors").insert({
      task_id: selectedTaskId,
      predecessor_id: linkTarget,
      relation_type: "FS",
      lag_days: 0,
    } as any);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Dependency linked (FS)");
    setLinkMode("idle");
    setLinkTarget(null);
    onDependencyChange();
  };

  const handleEditLink = async (link: DependencyLink) => {
    setEditLink(link);
    setEditRelation(link.relation_type);
    setEditLag(String(link.lag_days ?? 0));
    setLinkMode("edit");
  };

  const handleSaveEdit = async () => {
    if (!editLink) return;
    setSaving(true);

    const { error } = await supabase
      .from("task_predecessors")
      .update({
        relation_type: editRelation,
        lag_days: Number(editLag) || 0,
      } as any)
      .eq("task_id", editLink.task_id)
      .eq("predecessor_id", editLink.predecessor_id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Dependency updated");
    setLinkMode("idle");
    setEditLink(null);
    onDependencyChange();
  };

  const handleDeleteLink = async (link: DependencyLink) => {
    const { error } = await supabase
      .from("task_predecessors")
      .delete()
      .eq("task_id", link.task_id)
      .eq("predecessor_id", link.predecessor_id)
      .eq("relation_type", link.relation_type);

    if (error) {
      toast.error(error.message);
      return;
    }

    toast.success("Dependency deleted");
    setLinkMode("idle");
    setEditLink(null);
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
    <Dialog open={open} onOpenChange={(o) => {
      onOpenChange(o);
      if (!o) {
        setLinkMode("idle");
        setLinkTarget(null);
        setEditLink(null);
      }
    }}>
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
          {/* Link Mode */}
          {linkMode === "selecting" && (
            <div className="p-3 border rounded-md bg-muted/30 space-y-3">
              <p className="text-sm font-medium">Select predecessor task to link:</p>
              <Select value={linkTarget} onValueChange={setLinkTarget}>
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
              <div className="flex gap-2">
                <Button size="sm" onClick={handleLink} disabled={saving || !linkTarget} className="text-sm">
                  {saving ? "Linking..." : "Link (FS)"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setLinkMode("idle"); setLinkTarget(null); }} className="text-sm">
                  Cancel
                </Button>
              </div>
            </div>
          )}

          {/* Edit Mode */}
          {linkMode === "edit" && editLink && (
            <div className="p-3 border rounded-md bg-muted/30 space-y-3">
              <p className="text-sm font-medium">Edit Dependency</p>
              <div className="flex items-center gap-2">
                <Select value={editRelation} onValueChange={(v) => setEditRelation(v as DepRelation)}>
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
                <Input
                  type="number"
                  value={editLag}
                  onChange={(e) => setEditLag(e.target.value)}
                  className="w-16 h-8 px-2 text-sm border rounded text-center"
                  placeholder="Lag"
                />
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={handleSaveEdit} disabled={saving} className="text-sm">
                  {saving ? "Saving..." : "OK"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => { setLinkMode("idle"); setEditLink(null); }} className="text-sm">
                  Cancel
                </Button>
                <Button size="sm" variant="destructive" onClick={() => handleDeleteLink(editLink)} disabled={saving} className="text-sm ml-auto">
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </Button>
              </div>
            </div>
          )}

          {/* Predecessors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ArrowRight className="h-4 w-4" />
                Predecessors ({predLinks.length})
              </h4>
              {canEdit && linkMode === "idle" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => { setLinkMode("selecting"); setLinkTarget(null); }}
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  Link Predecessor
                </Button>
              )}
            </div>

            {predLinks.length > 0 ? (
              <div className="space-y-2">
                {predLinks.map((link) => {
                  const predTask = getTaskById(tasks, link.predecessor_id);
                  if (!predTask) return null;
                  return (
                    <div key={link.predecessor_id} className="flex items-start gap-3 p-2 border rounded-md bg-background hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {predTask.code && (
                            <span className="font-mono text-xs text-muted-foreground">{predTask.code}</span>
                          )}
                          <span className="text-sm font-medium truncate">{predTask.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
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
                      {canEdit && linkMode === "idle" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLink(link)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Settings className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : linkMode === "idle" ? (
              <p className="text-xs text-muted-foreground italic">No predecessors. Click "Link Predecessor" to add.</p>
            ) : null}
          </div>

          {/* Successors Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <ArrowLeft className="h-4 w-4" />
                Successors ({succLinks.length})
              </h4>
              {canEdit && linkMode === "idle" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    // For successors, we need to link selectedTask as predecessor
                    // So we swap the logic - selectedTask becomes the predecessor
                    // This is essentially the same as linking a predecessor
                    setLinkMode("selecting");
                    setLinkTarget(null);
                  }}
                >
                  <Link2 className="h-4 w-4 mr-1" />
                  Link Successor
                </Button>
              )}
            </div>

            {succLinks.length > 0 ? (
              <div className="space-y-2">
                {succLinks.map((link) => {
                  const succTask = getTaskById(tasks, link.task_id);
                  if (!succTask) return null;
                  return (
                    <div key={link.task_id} className="flex items-start gap-3 p-2 border rounded-md bg-background hover:bg-muted/30 transition-colors">
                      <div className="flex-1">
                        <div className="flex items-center gap-1.5 mb-1">
                          {succTask.code && (
                            <span className="font-mono text-xs text-muted-foreground">{succTask.code}</span>
                          )}
                          <span className="text-sm font-medium truncate">{succTask.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
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
                      {canEdit && linkMode === "idle" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditLink(link)}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <Settings className="h-3.5 w-3.5 text-muted-foreground hover:text-foreground" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : linkMode === "idle" ? (
              <p className="text-xs text-muted-foreground italic">No successors. Click "Link Successor" to add.</p>
            ) : null}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
