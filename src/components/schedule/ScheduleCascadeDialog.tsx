import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cascade, type DepLink, type SchedTask, type ShiftedTask } from "@/lib/schedule";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  projectId: string;
  /** Tasks that the user changed directly (id → new dates). */
  proposed: Map<string, { planned_start: string; planned_end: string; title?: string; code?: string | null }>;
  triggerTaskId?: string | null;
  triggerReason?: string;
  onApplied?: () => void;
}

const fmt = (d: string | null) => (d ? format(parseISO(d), "dd-MM-yyyy") : "—");

export function ScheduleCascadeDialog({
  open, onOpenChange, projectId, proposed, triggerTaskId, triggerReason, onApplied,
}: Props) {
  const [allTasks, setAllTasks] = useState<SchedTask[]>([]);
  const [deps, setDeps] = useState<DepLink[]>([]);
  const [titleById, setTitleById] = useState<Map<string, { title: string; code: string | null }>>(new Map());
  const [loading, setLoading] = useState(false);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    if (!open || !projectId) return;
    setLoading(true);
    (async () => {
      const { data: ts } = await supabase
        .from("tasks")
        .select("id, title, code, planned_start, planned_end, status, actual_end, progress_pct")
        .eq("project_id", projectId);
      const rows = (ts ?? []) as (SchedTask & { title: string; code: string | null })[];
      setAllTasks(rows);
      const m = new Map<string, { title: string; code: string | null }>();
      rows.forEach((r) => m.set(r.id, { title: r.title, code: r.code }));
      setTitleById(m);

      if (rows.length) {
        const { data: ds } = await supabase
          .from("task_predecessors")
          .select("task_id, predecessor_id, relation_type, lag_days, is_hard_block")
          .in("task_id", rows.map((r) => r.id));
        setDeps((ds ?? []) as DepLink[]);
      }
      setLoading(false);
    })();
  }, [open, projectId]);

  const shifts: ShiftedTask[] = useMemo(() => {
    if (!proposed.size) return [];
    const proposedDates = new Map<string, { planned_start: string; planned_end: string }>();
    proposed.forEach((v, k) => proposedDates.set(k, { planned_start: v.planned_start, planned_end: v.planned_end }));
    return cascade(allTasks, deps, proposedDates);
  }, [allTasks, deps, proposed]);

  const directIds = new Set(proposed.keys());
  const directShifts = shifts.filter((s) => directIds.has(s.id));
  const cascadedShifts = shifts.filter((s) => !directIds.has(s.id));

  const apply = async () => {
    if (!shifts.length) return;
    setApplying(true);

    const before = shifts.map((s) => ({ id: s.id, planned_start: s.oldStart, planned_end: s.oldEnd }));
    const after = shifts.map((s) => ({ id: s.id, planned_start: s.newStart, planned_end: s.newEnd }));

    const errors: string[] = [];
    for (const s of shifts) {
      const { error } = await supabase
        .from("tasks")
        .update({ planned_start: s.newStart, planned_end: s.newEnd })
        .eq("id", s.id);
      if (error) errors.push(`${s.id}: ${error.message}`);
    }

    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("schedule_calculation_logs").insert({
      project_id: projectId,
      triggered_by_task_id: triggerTaskId ?? null,
      triggered_by_user: user?.id ?? null,
      trigger_reason: triggerReason ?? "Manual schedule change",
      affected_count: shifts.length,
      payload: { before, after },
    });

    setApplying(false);
    if (errors.length) {
      toast.error(`Applied with ${errors.length} error(s)`);
    } else {
      toast.success(`Updated ${shifts.length} task${shifts.length === 1 ? "" : "s"}`);
    }
    onApplied?.();
    onOpenChange(false);
  };

  const renderRow = (s: ShiftedTask, isDirect: boolean) => {
    const meta = titleById.get(s.id);
    return (
      <tr key={s.id} className={cn("border-t", isDirect && "bg-info-soft/30")}>
        <td className="px-2 py-1.5 font-mono text-[11px] text-muted-foreground">{meta?.code ?? "—"}</td>
        <td className="px-2 py-1.5 text-sm truncate max-w-[260px]">{meta?.title ?? s.id.slice(0, 8)}</td>
        <td className="px-2 py-1.5 tabular-nums text-xs">
          {fmt(s.oldStart)} → <span className="font-medium">{fmt(s.newStart)}</span>
        </td>
        <td className="px-2 py-1.5 tabular-nums text-xs">
          {fmt(s.oldEnd)} → <span className="font-medium">{fmt(s.newEnd)}</span>
        </td>
        <td className={cn(
          "px-2 py-1.5 text-xs tabular-nums text-right",
          s.shiftDays > 0 ? "text-warning" : s.shiftDays < 0 ? "text-success" : "text-muted-foreground",
        )}>
          {s.shiftDays > 0 ? `+${s.shiftDays}d` : `${s.shiftDays}d`}
        </td>
      </tr>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Confirm schedule change</DialogTitle>
          <DialogDescription>
            Review every task that will move before applying. An audit log entry will be recorded.
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Calculating cascade…
          </div>
        ) : shifts.length === 0 ? (
          <div className="flex items-center gap-2 py-6 text-sm text-muted-foreground">
            <AlertCircle className="h-4 w-4" /> No tasks to update.
          </div>
        ) : (
          <div className="border rounded-md max-h-[420px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground sticky top-0">
                <tr>
                  <th className="px-2 py-1.5 text-left">Code</th>
                  <th className="px-2 py-1.5 text-left">Task</th>
                  <th className="px-2 py-1.5 text-left">Start</th>
                  <th className="px-2 py-1.5 text-left">Finish</th>
                  <th className="px-2 py-1.5 text-right">Shift</th>
                </tr>
              </thead>
              <tbody>
                {directShifts.length > 0 && (
                  <>
                    <tr className="bg-muted/30"><td colSpan={5} className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Your change ({directShifts.length})</td></tr>
                    {directShifts.map((s) => renderRow(s, true))}
                  </>
                )}
                {cascadedShifts.length > 0 && (
                  <>
                    <tr className="bg-muted/30"><td colSpan={5} className="px-2 py-1 text-[10px] uppercase tracking-wide text-muted-foreground">Cascaded successors ({cascadedShifts.length})</td></tr>
                    {cascadedShifts.map((s) => renderRow(s, false))}
                  </>
                )}
              </tbody>
            </table>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={applying}>Cancel</Button>
          <Button onClick={apply} disabled={applying || loading || shifts.length === 0}>
            {applying && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
            Apply {shifts.length > 0 ? `(${shifts.length})` : ""}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
