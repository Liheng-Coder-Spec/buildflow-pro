import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import {
  TaskStatus, TaskPriority, TaskType,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_TONE, TASK_TYPE_LABELS,
} from "@/lib/taskMeta";
import { CheckCheck, Clock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Pending {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskType;
  progress_pct: number;
  estimated_hours: number | null;
  actual_hours: number | null;
  updated_at: string;
}

export default function Approvals() {
  const { activeProject } = useProjects();
  const { roles } = useAuth();
  const [items, setItems] = useState<Pending[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const canApprove = roles.some((r) =>
    ["admin", "project_manager", "supervisor", "qaqc_inspector"].includes(r),
  );

  const load = useCallback(async () => {
    if (!activeProject) {
      setItems([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("id, title, status, priority, task_type, progress_pct, estimated_hours, actual_hours, updated_at")
      .eq("project_id", activeProject.id)
      .eq("status", "pending_approval")
      .order("updated_at", { ascending: true });
    setItems((data ?? []) as Pending[]);
    setLoading(false);
  }, [activeProject]);

  useEffect(() => { load(); }, [load]);

  const approve = async (id: string) => {
    setBusy(id);
    const { error } = await supabase.from("tasks").update({ status: "approved" }).eq("id", id);
    setBusy(null);
    if (error) toast.error(error.message);
    else { toast.success("Approved"); load(); }
  };

  const approveAndComplete = async (id: string) => {
    setBusy(id);
    const { error: e1 } = await supabase.from("tasks").update({ status: "approved" }).eq("id", id);
    if (!e1) {
      await supabase.from("tasks").update({
        status: "completed",
        progress_pct: 100,
        actual_end: new Date().toISOString(),
      }).eq("id", id);
    }
    setBusy(null);
    if (e1) toast.error(e1.message);
    else { toast.success("Approved & completed"); load(); }
  };

  if (!activeProject) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Approvals</h1>
        <Card><CardContent className="p-12 text-center text-muted-foreground">Select a project first.</CardContent></Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Approvals</h1>
        <p className="text-muted-foreground">
          Tasks pending your review · {activeProject.code}
        </p>
      </div>

      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : items.length === 0 ? (
            <div className="p-12 text-center">
              <CheckCheck className="h-12 w-12 text-success mx-auto mb-2" />
              <p className="font-medium">All caught up</p>
              <p className="text-sm text-muted-foreground">Nothing pending approval right now.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Priority</TableHead>
                  <TableHead>Hours</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell>
                      <Link to={`/tasks/${t.id}`} className="font-medium hover:text-primary">
                        {t.title}
                      </Link>
                      <div className="mt-1"><StatusBadge status={t.status} /></div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">{TASK_TYPE_LABELS[t.task_type]}</TableCell>
                    <TableCell>
                      <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", TASK_PRIORITY_TONE[t.priority])}>
                        {TASK_PRIORITY_LABELS[t.priority]}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="inline-flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span className="num">{t.actual_hours ?? 0}</span> / <span className="num">{t.estimated_hours ?? 0}</span>
                      </span>
                    </TableCell>
                    <TableCell className="w-32">
                      <div className="flex items-center gap-2">
                        <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1">
                          <div className="h-full bg-primary" style={{ width: `${t.progress_pct}%` }} />
                        </div>
                        <span className="text-xs num text-muted-foreground w-8 text-right">{t.progress_pct}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {canApprove ? (
                        <div className="flex justify-end gap-2">
                          <Button size="sm" variant="outline" disabled={busy === t.id} onClick={() => approve(t.id)}>
                            {busy === t.id && <Loader2 className="h-3 w-3 animate-spin" />}
                            Approve
                          </Button>
                          <Button size="sm" disabled={busy === t.id} onClick={() => approveAndComplete(t.id)}>
                            Approve & complete
                          </Button>
                        </div>
                      ) : (
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/tasks/${t.id}`}>Review</Link>
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
