import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Loader2, Plus, X, Link2 } from "lucide-react";
import { toast } from "sonner";
import { DepRelation, DEP_RELATION_LABELS } from "@/lib/scheduleMeta";

interface PredecessorRow {
  id: string;
  predecessor_id: string;
  relation_type: DepRelation;
  lag_days: number;
  is_hard_block: boolean;
  note: string | null;
}

interface TaskOption { id: string; title: string; code: string | null }

interface Props {
  taskId: string;
  projectId: string;
  canEdit: boolean;
}

export function TaskDependenciesSection({ taskId, projectId, canEdit }: Props) {
  const [rows, setRows] = useState<PredecessorRow[]>([]);
  const [options, setOptions] = useState<TaskOption[]>([]);
  const [optionMap, setOptionMap] = useState<Record<string, TaskOption>>({});
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);

  const [newPredId, setNewPredId] = useState("");
  const [newRelation, setNewRelation] = useState<DepRelation>("FS");
  const [newLag, setNewLag] = useState("0");
  const [newHard, setNewHard] = useState(false);

  const load = async () => {
    setLoading(true);
    const [pre, opts] = await Promise.all([
      supabase
        .from("task_predecessors")
        .select("id, predecessor_id, relation_type, lag_days, is_hard_block, note")
        .eq("task_id", taskId),
      supabase
        .from("tasks")
        .select("id, title, code")
        .eq("project_id", projectId)
        .neq("id", taskId)
        .order("code", { ascending: true })
        .limit(500),
    ]);
    if (pre.data) setRows(pre.data as unknown as PredecessorRow[]);
    if (opts.data) {
      const list = opts.data as unknown as TaskOption[];
      setOptions(list);
      const m: Record<string, TaskOption> = {};
      for (const o of list) m[o.id] = o;
      setOptionMap(m);
    }
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [taskId, projectId]);

  const onAdd = async () => {
    if (!newPredId) { toast.error("Pick a predecessor task"); return; }
    setAdding(true);
    const { error } = await supabase.from("task_predecessors").insert({
      task_id: taskId,
      predecessor_id: newPredId,
      relation_type: newRelation,
      lag_days: Number(newLag) || 0,
      is_hard_block: newHard,
    } as any);
    setAdding(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Dependency added");
    setNewPredId("");
    setNewLag("0");
    setNewRelation("FS");
    setNewHard(false);
    load();
  };

  const onRemove = async (id: string) => {
    const { error } = await supabase.from("task_predecessors").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Dependency removed");
    load();
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold">Predecessors</h3>
        <span className="text-xs text-muted-foreground">
          {rows.length} link{rows.length === 1 ? "" : "s"}
        </span>
      </div>

      {loading ? (
        <div className="text-xs text-muted-foreground">Loading…</div>
      ) : rows.length === 0 ? (
        <div className="text-xs text-muted-foreground italic">No predecessors yet.</div>
      ) : (
        <ul className="space-y-1.5">
          {rows.map((r) => {
            const pred = optionMap[r.predecessor_id];
            return (
              <li
                key={r.id}
                className="flex items-center gap-2 text-sm border rounded-md px-2 py-1.5 bg-muted/30"
              >
                <Badge variant="outline" className="font-mono text-[10px] shrink-0">
                  {r.relation_type}
                </Badge>
                <div className="min-w-0 flex-1 truncate">
                  {pred ? (
                    <>
                      <span className="font-mono text-[11px] text-muted-foreground mr-1">
                        {pred.code ?? "—"}
                      </span>
                      {pred.title}
                    </>
                  ) : (
                    <span className="text-muted-foreground">Task {r.predecessor_id.slice(0, 6)}</span>
                  )}
                </div>
                {r.lag_days !== 0 && (
                  <span className="text-xs text-muted-foreground tabular-nums shrink-0">
                    {r.lag_days > 0 ? `+${r.lag_days}` : r.lag_days}d
                  </span>
                )}
                {r.is_hard_block && (
                  <Badge variant="destructive" className="text-[10px] shrink-0">Hard block</Badge>
                )}
                {canEdit && (
                  <button
                    onClick={() => onRemove(r.id)}
                    className="text-muted-foreground hover:text-destructive"
                    aria-label="Remove"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      )}

      {canEdit && (
        <div className="border rounded-md p-3 space-y-3 bg-background">
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-6">
              <Label className="text-xs">Predecessor task</Label>
              <Select value={newPredId} onValueChange={setNewPredId}>
                <SelectTrigger><SelectValue placeholder="Select task" /></SelectTrigger>
                <SelectContent>
                  {options.map((o) => (
                    <SelectItem key={o.id} value={o.id}>
                      <span className="font-mono text-[11px] mr-2">{o.code ?? "—"}</span>
                      {o.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Type</Label>
              <Select value={newRelation} onValueChange={(v) => setNewRelation(v as DepRelation)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {(Object.keys(DEP_RELATION_LABELS) as DepRelation[]).map((k) => (
                    <SelectItem key={k} value={k}>
                      <span className="font-mono mr-2">{k}</span>
                      <span className="text-xs text-muted-foreground">{DEP_RELATION_LABELS[k]}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-3">
              <Label className="text-xs">Lag (days)</Label>
              <Input
                type="number"
                value={newLag}
                onChange={(e) => setNewLag(e.target.value)}
                step="1"
              />
            </div>
          </div>
          <div className="flex items-center justify-between">
            <label className="inline-flex items-center gap-2 text-xs">
              <input
                type="checkbox"
                checked={newHard}
                onChange={(e) => setNewHard(e.target.checked)}
              />
              Hard block (warn loudly when violated)
            </label>
            <Button size="sm" onClick={onAdd} disabled={adding || !newPredId}>
              {adding ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
              Add link
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
