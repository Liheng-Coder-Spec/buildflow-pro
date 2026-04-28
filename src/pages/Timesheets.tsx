import { useEffect, useState, useCallback, useMemo } from "react";
import { format, startOfWeek, endOfWeek, addDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { TimesheetStatusBadge } from "@/components/timesheets/TimesheetStatusBadge";
import { formatHours, TimesheetFlag, TimesheetStatus } from "@/lib/timesheetMeta";
import { ChevronLeft, ChevronRight, Plus, Send, Trash2, AlertTriangle, Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Entry {
  id: string;
  user_id: string;
  project_id: string;
  task_id: string | null;
  work_date: string;
  start_time: string | null;
  end_time: string | null;
  morning_start: string | null;
  morning_end: string | null;
  afternoon_start: string | null;
  afternoon_end: string | null;
  ot_start: string | null;
  ot_end: string | null;
  regular_hours: number;
  overtime_hours: number;
  notes: string | null;
  status: TimesheetStatus;
  flags: TimesheetFlag[];
  rejection_reason: string | null;
}

function diffHours(start: string | null, end: string | null): number {
  if (!start || !end) return 0;
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  const mins = (eh * 60 + em) - (sh * 60 + sm);
  return mins > 0 ? Math.round((mins / 60) * 100) / 100 : 0;
}

interface TaskOpt {
  id: string;
  title: string;
  code: string | null;
  wbs_node_id?: string | null;
}

interface TaskInfo {
  id: string;
  title: string;
  code: string | null;
  wbs_path: string | null;
  wbs_code: string | null;
}

const WEEK_DAYS = 7;

export default function Timesheets() {
  const { user } = useAuth();
  const { projects, activeProject } = useProjects();
  const [weekStart, setWeekStart] = useState<Date>(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [entries, setEntries] = useState<Entry[]>([]);
  const [tasks, setTasks] = useState<TaskOpt[]>([]);
  const [taskInfo, setTaskInfo] = useState<Map<string, TaskInfo>>(new Map());
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Entry | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const weekEnd = useMemo(() => endOfWeek(weekStart, { weekStartsOn: 1 }), [weekStart]);

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const startStr = format(weekStart, "yyyy-MM-dd");
    const endStr = format(weekEnd, "yyyy-MM-dd");
    const { data } = await supabase
      .from("timesheet_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("work_date", startStr)
      .lte("work_date", endStr)
      .order("work_date", { ascending: true });
    setEntries((data ?? []) as unknown as Entry[]);
    setLoading(false);
  }, [user, weekStart, weekEnd]);

  useEffect(() => { load(); }, [load]);

  // Resolve task + WBS info for all entries shown this week
  useEffect(() => {
    const ids = Array.from(new Set(entries.map((e) => e.task_id).filter(Boolean))) as string[];
    if (ids.length === 0) { setTaskInfo(new Map()); return; }
    (async () => {
      const { data: ts } = await supabase
        .from("tasks")
        .select("id, title, code, wbs_node_id")
        .in("id", ids);
      const wbsIds = Array.from(new Set((ts ?? []).map((t) => t.wbs_node_id).filter(Boolean))) as string[];
      let wbsMap = new Map<string, { code: string; path_text: string }>();
      if (wbsIds.length > 0) {
        const { data: ws } = await supabase
          .from("wbs_nodes")
          .select("id, code, path_text")
          .in("id", wbsIds);
        for (const w of ws ?? []) wbsMap.set(w.id, { code: w.code, path_text: w.path_text });
      }
      const map = new Map<string, TaskInfo>();
      for (const t of ts ?? []) {
        const w = t.wbs_node_id ? wbsMap.get(t.wbs_node_id) : null;
        map.set(t.id, {
          id: t.id, title: t.title, code: t.code,
          wbs_code: w?.code ?? null,
          wbs_path: w?.path_text ?? null,
        });
      }
      setTaskInfo(map);
    })();
  }, [entries]);

  // Load tasks for active project that are assigned to the current user
  useEffect(() => {
    if (!activeProject || !user) { setTasks([]); return; }
    (async () => {
      const { data: assigns } = await supabase
        .from("task_assignments")
        .select("task_id")
        .eq("user_id", user.id)
        .is("unassigned_at", null);
      const ids = (assigns ?? []).map((a) => a.task_id);
      if (ids.length === 0) { setTasks([]); return; }
      const { data } = await supabase
        .from("tasks")
        .select("id, title, code")
        .eq("project_id", activeProject.id)
        .in("id", ids)
        .order("created_at", { ascending: false })
        .limit(200);
      setTasks((data ?? []) as TaskOpt[]);
    })();
  }, [activeProject, user]);

  const totals = useMemo(() => {
    const reg = entries.reduce((s, e) => s + Number(e.regular_hours), 0);
    const ot = entries.reduce((s, e) => s + Number(e.overtime_hours), 0);
    return { reg, ot, total: reg + ot };
  }, [entries]);

  const dayTotals = useMemo(() => {
    const map = new Map<string, number>();
    for (const e of entries) {
      const k = e.work_date;
      map.set(k, (map.get(k) ?? 0) + Number(e.regular_hours) + Number(e.overtime_hours));
    }
    return map;
  }, [entries]);

  const openCreate = (date?: Date) => {
    setEditing({
      id: "",
      user_id: user!.id,
      project_id: activeProject?.id ?? "",
      task_id: null,
      work_date: format(date ?? new Date(), "yyyy-MM-dd"),
      start_time: null,
      end_time: null,
      morning_start: "08:00",
      morning_end: "12:00",
      afternoon_start: "13:00",
      afternoon_end: "17:00",
      ot_start: null,
      ot_end: null,
      regular_hours: 8,
      overtime_hours: 0,
      notes: "",
      status: "draft",
      flags: [],
      rejection_reason: null,
    });
    setDialogOpen(true);
  };

  const openEdit = (e: Entry) => {
    setEditing({ ...e });
    setDialogOpen(true);
  };

  const save = async () => {
    if (!editing || !user) return;
    if (!editing.project_id) { toast.error("Pick a project"); return; }
    const morningH = diffHours(editing.morning_start, editing.morning_end);
    const afternoonH = diffHours(editing.afternoon_start, editing.afternoon_end);
    const otH = diffHours(editing.ot_start, editing.ot_end);
    const reg = morningH + afternoonH;
    if (reg + otH <= 0) { toast.error("Enter at least one valid time block"); return; }
    setSubmitting(true);
    // Pick earliest start / latest end across all blocks for legacy start/end fields
    const allStarts = [editing.morning_start, editing.afternoon_start, editing.ot_start].filter(Boolean) as string[];
    const allEnds = [editing.morning_end, editing.afternoon_end, editing.ot_end].filter(Boolean) as string[];
    const startTime = allStarts.length ? allStarts.sort()[0] : null;
    const endTime = allEnds.length ? allEnds.sort().slice(-1)[0] : null;
    const payload = {
      user_id: user.id,
      project_id: editing.project_id,
      task_id: editing.task_id || null,
      work_date: editing.work_date,
      start_time: startTime,
      end_time: endTime,
      morning_start: editing.morning_start || null,
      morning_end: editing.morning_end || null,
      afternoon_start: editing.afternoon_start || null,
      afternoon_end: editing.afternoon_end || null,
      ot_start: editing.ot_start || null,
      ot_end: editing.ot_end || null,
      regular_hours: reg,
      overtime_hours: otH,
      notes: editing.notes || null,
      status: editing.status,
    };
    const op = editing.id
      ? supabase.from("timesheet_entries").update(payload).eq("id", editing.id)
      : supabase.from("timesheet_entries").insert(payload);
    const { error } = await op;
    setSubmitting(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editing.id ? "Entry updated" : "Entry added");
    setDialogOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    const { error } = await supabase.from("timesheet_entries").delete().eq("id", id);
    if (error) toast.error(error.message);
    else { toast.success("Entry deleted"); load(); }
  };

  const submitAll = async () => {
    const draftIds = entries.filter((e) => e.status === "draft" || e.status === "rejected").map((e) => e.id);
    if (draftIds.length === 0) { toast.info("No draft entries to submit"); return; }
    const { error } = await supabase
      .from("timesheet_entries")
      .update({ status: "submitted" })
      .in("id", draftIds);
    if (error) toast.error(error.message);
    else { toast.success(`${draftIds.length} entries submitted`); load(); }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Timesheets</h1>
          <p className="text-muted-foreground">Log your daily hours by project and task</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, -7))}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <div className="text-sm font-medium px-3 min-w-[220px] text-center">
            {format(weekStart, "MMM d")} – {format(weekEnd, "MMM d, yyyy")}
          </div>
          <Button variant="outline" size="icon" onClick={() => setWeekStart(addDays(weekStart, 7))}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
            This Week
          </Button>
          <Button onClick={() => openCreate()}>
            <Plus className="h-4 w-4 mr-1" /> Add Entry
          </Button>
          <Button variant="default" onClick={submitAll} className="bg-success hover:bg-success/90 text-success-foreground">
            <Send className="h-4 w-4 mr-1" /> Submit Week
          </Button>
        </div>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Regular Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold num">{formatHours(totals.reg)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Overtime Hours</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold num text-warning">{formatHours(totals.ot)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Week Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold num">{formatHours(totals.total)}</div>
            <p className="text-xs text-muted-foreground mt-1">Standard week: 40h</p>
          </CardContent>
        </Card>
      </div>

      {/* Day overview */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: WEEK_DAYS }).map((_, i) => {
              const d = addDays(weekStart, i);
              const key = format(d, "yyyy-MM-dd");
              const hours = dayTotals.get(key) ?? 0;
              const isWeekend = i === 5 || i === 6;
              return (
                <button
                  key={key}
                  onClick={() => openCreate(d)}
                  className={cn(
                    "rounded-lg border p-3 text-left hover:bg-accent transition-colors",
                    isWeekend && "bg-muted/30",
                    hours > 0 && "border-primary/40",
                  )}
                >
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{format(d, "EEE")}</div>
                  <div className="text-lg font-semibold">{format(d, "d")}</div>
                  <div className="text-xs num text-muted-foreground mt-1">
                    <Clock className="h-3 w-3 inline mr-0.5" />
                    {formatHours(hours)}h
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Entries */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-3">
              {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}
            </div>
          ) : entries.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Clock className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p className="font-medium">No entries this week</p>
              <p className="text-sm">Click a day above or "Add Entry" to log time.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Project / Task</TableHead>
                  <TableHead className="text-right">Regular</TableHead>
                  <TableHead className="text-right">OT</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {entries.map((e) => {
                  const project = projects.find((p) => p.id === e.project_id);
                  const editable = e.status === "draft" || e.status === "rejected";
                  return (
                    <TableRow key={e.id}>
                      <TableCell className="font-medium">
                        {format(parseISO(e.work_date), "EEE, MMM d")}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-medium">{project?.code ?? "—"}</div>
                        <div className="text-xs text-muted-foreground truncate max-w-[280px]">
                          {e.notes || "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-right num">{formatHours(e.regular_hours)}</TableCell>
                      <TableCell className="text-right num text-warning">{formatHours(e.overtime_hours)}</TableCell>
                      <TableCell>
                        <TimesheetStatusBadge status={e.status} />
                        {e.status === "rejected" && e.rejection_reason && (
                          <div className="text-[10px] text-destructive mt-1 max-w-[200px]">{e.rejection_reason}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {e.flags?.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {e.flags.map((f, i) => (
                              <span key={i} className="inline-flex items-center gap-1 rounded bg-warning-soft text-warning px-1.5 py-0.5 text-[10px]">
                                <AlertTriangle className="h-2.5 w-2.5" />
                                {f.type.replace(/_/g, " ")}
                              </span>
                            ))}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {editable && (
                          <div className="flex justify-end gap-1">
                            <Button size="sm" variant="ghost" onClick={() => openEdit(e)}>Edit</Button>
                            <Button size="sm" variant="ghost" onClick={() => remove(e.id)}>
                              <Trash2 className="h-3 w-3 text-destructive" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Edit Entry" : "New Time Entry"}</DialogTitle>
            <DialogDescription>Log hours worked on a specific day.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Date</Label>
                  <Input
                    type="date"
                    value={editing.work_date}
                    max={format(new Date(), "yyyy-MM-dd")}
                    onChange={(e) => setEditing({ ...editing, work_date: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <Label>Project</Label>
                  <Select
                    value={editing.project_id}
                    onValueChange={(v) => setEditing({ ...editing, project_id: v, task_id: null })}
                  >
                    <SelectTrigger><SelectValue placeholder="Select project" /></SelectTrigger>
                    <SelectContent>
                      {projects.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.code} · {p.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Task (optional)</Label>
                <Select
                  value={editing.task_id ?? "none"}
                  onValueChange={(v) => setEditing({ ...editing, task_id: v === "none" ? null : v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={tasks.length ? "Select a task assigned to you" : "No tasks assigned to you in this project"} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— No specific task —</SelectItem>
                    {tasks.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.code ? `${t.code} · ` : ""}{t.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {tasks.length === 0 && (
                  <p className="text-[11px] text-muted-foreground">Only tasks in the active project that are assigned to you appear here.</p>
                )}
              </div>

              {(() => {
                const morningH = diffHours(editing.morning_start, editing.morning_end);
                const afternoonH = diffHours(editing.afternoon_start, editing.afternoon_end);
                const otH = diffHours(editing.ot_start, editing.ot_end);
                const blocks = [
                  { key: "morning", label: "Morning", tone: "text-info", start: editing.morning_start, end: editing.morning_end, h: morningH,
                    setStart: (v: string) => setEditing({ ...editing, morning_start: v || null }),
                    setEnd: (v: string) => setEditing({ ...editing, morning_end: v || null }) },
                  { key: "afternoon", label: "Afternoon", tone: "text-primary", start: editing.afternoon_start, end: editing.afternoon_end, h: afternoonH,
                    setStart: (v: string) => setEditing({ ...editing, afternoon_start: v || null }),
                    setEnd: (v: string) => setEditing({ ...editing, afternoon_end: v || null }) },
                  { key: "ot", label: "Overtime", tone: "text-warning", start: editing.ot_start, end: editing.ot_end, h: otH,
                    setStart: (v: string) => setEditing({ ...editing, ot_start: v || null }),
                    setEnd: (v: string) => setEditing({ ...editing, ot_end: v || null }) },
                ];
                return (
                  <div className="space-y-2">
                    <Label>Time Blocks</Label>
                    <div className="rounded-lg border divide-y">
                      {blocks.map((b) => (
                        <div key={b.key} className="grid grid-cols-12 items-center gap-2 p-2.5">
                          <div className={cn("col-span-3 text-xs font-semibold uppercase tracking-wider", b.tone)}>
                            {b.label}
                          </div>
                          <Input
                            className="col-span-4 h-9"
                            type="time"
                            value={b.start ?? ""}
                            onChange={(e) => b.setStart(e.target.value)}
                          />
                          <Input
                            className="col-span-4 h-9"
                            type="time"
                            value={b.end ?? ""}
                            onChange={(e) => b.setEnd(e.target.value)}
                          />
                          <div className="col-span-1 text-xs num text-right text-muted-foreground">
                            {formatHours(b.h)}h
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-xs text-muted-foreground px-1">
                      <span>Regular: <span className="num text-foreground font-medium">{formatHours(morningH + afternoonH)}h</span></span>
                      <span>Overtime: <span className="num text-warning font-medium">{formatHours(otH)}h</span></span>
                      <span>Total: <span className="num text-foreground font-semibold">{formatHours(morningH + afternoonH + otH)}h</span></span>
                    </div>
                  </div>
                );
              })()}

              <div className="space-y-1.5">
                <Label>Notes</Label>
                <Textarea
                  rows={3}
                  value={editing.notes ?? ""}
                  onChange={(e) => setEditing({ ...editing, notes: e.target.value })}
                  placeholder="What did you work on?"
                />
              </div>

              {editing.flags?.length > 0 && (
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    {editing.flags.map((f) => f.message).join(" · ")}
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={save} disabled={submitting}>
              {submitting && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
