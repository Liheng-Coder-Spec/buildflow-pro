import { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { StatusBadge } from "@/components/StatusBadge";
import { CreateTaskDialog } from "@/components/tasks/CreateTaskDialog";
import {
  TaskStatus, TaskPriority, TaskType,
  TASK_PRIORITY_LABELS, TASK_PRIORITY_TONE, TASK_TYPE_LABELS,
  KANBAN_COLUMNS, TASK_STATUS_LABELS,
} from "@/lib/taskMeta";
import { Search, LayoutGrid, List, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

interface TaskRow {
  id: string;
  title: string;
  status: TaskStatus;
  priority: TaskPriority;
  task_type: TaskType;
  location_zone: string | null;
  planned_end: string | null;
  estimated_hours: number | null;
  progress_pct: number;
}

export default function Tasks() {
  const { activeProject } = useProjects();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<TaskStatus | "all">("all");
  const [priorityFilter, setPriorityFilter] = useState<TaskPriority | "all">("all");

  const load = useCallback(async () => {
    if (!activeProject) {
      setTasks([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const { data } = await supabase
      .from("tasks")
      .select("id, title, status, priority, task_type, location_zone, planned_end, estimated_hours, progress_pct")
      .eq("project_id", activeProject.id)
      .order("created_at", { ascending: false });
    setTasks((data ?? []) as TaskRow[]);
    setLoading(false);
  }, [activeProject]);

  useEffect(() => { load(); }, [load]);

  const filtered = tasks.filter((t) => {
    if (search && !t.title.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (priorityFilter !== "all" && t.priority !== priorityFilter) return false;
    return true;
  });

  if (!activeProject) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Tasks</h1>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Select a project from the top bar to view tasks.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">
            {activeProject.code} · {activeProject.name}
          </p>
        </div>
        <CreateTaskDialog onCreated={load} />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px] max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as any)}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {(Object.keys(TASK_STATUS_LABELS) as TaskStatus[]).map((s) => (
              <SelectItem key={s} value={s}>{TASK_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={priorityFilter} onValueChange={(v) => setPriorityFilter(v as any)}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All priorities</SelectItem>
            {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <SelectItem key={p} value={p}>{TASK_PRIORITY_LABELS[p]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <div className="ml-auto text-sm text-muted-foreground">
          {filtered.length} of {tasks.length}
        </div>
      </div>

      <Tabs defaultValue="list">
        <TabsList>
          <TabsTrigger value="list" className="gap-2"><List className="h-4 w-4" /> List</TabsTrigger>
          <TabsTrigger value="kanban" className="gap-2"><LayoutGrid className="h-4 w-4" /> Kanban</TabsTrigger>
        </TabsList>

        <TabsContent value="list">
          <Card>
            <CardContent className="p-0">
              {loading ? (
                <div className="p-6 space-y-3">
                  {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
                </div>
              ) : filtered.length === 0 ? (
                <div className="p-12 text-center text-muted-foreground">
                  No tasks match your filters.
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Priority</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Progress</TableHead>
                      <TableHead>Due</TableHead>
                      <TableHead className="text-right">Est. hrs</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filtered.map((t) => (
                      <TableRow key={t.id} className="cursor-pointer">
                        <TableCell className="font-medium">
                          <Link to={`/tasks/${t.id}`} className="hover:text-primary">
                            {t.title}
                          </Link>
                          {t.location_zone && (
                            <div className="text-xs text-muted-foreground">{t.location_zone}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {TASK_TYPE_LABELS[t.task_type]}
                        </TableCell>
                        <TableCell>
                          <span className={cn("inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium", TASK_PRIORITY_TONE[t.priority])}>
                            {TASK_PRIORITY_LABELS[t.priority]}
                          </span>
                        </TableCell>
                        <TableCell><StatusBadge status={t.status} /></TableCell>
                        <TableCell className="w-32">
                          <div className="flex items-center gap-2">
                            <div className="h-1.5 bg-muted rounded-full overflow-hidden flex-1">
                              <div className="h-full bg-primary" style={{ width: `${t.progress_pct}%` }} />
                            </div>
                            <span className="text-xs num text-muted-foreground w-8 text-right">{t.progress_pct}%</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {t.planned_end ? (
                            <span className="inline-flex items-center gap-1"><Calendar className="h-3 w-3" />{t.planned_end}</span>
                          ) : "—"}
                        </TableCell>
                        <TableCell className="text-right num text-sm">{t.estimated_hours ?? 0}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="kanban">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {KANBAN_COLUMNS.map((col) => {
              const items = filtered.filter((t) => t.status === col);
              return (
                <div key={col} className="bg-muted/50 rounded-lg p-2 min-h-[300px]">
                  <div className="flex items-center justify-between px-1 mb-2">
                    <StatusBadge status={col} />
                    <span className="text-xs text-muted-foreground num">{items.length}</span>
                  </div>
                  <div className="space-y-2">
                    {items.map((t) => (
                      <Link
                        key={t.id}
                        to={`/tasks/${t.id}`}
                        className="block bg-card rounded-md border p-2 hover:shadow-elevated transition-shadow"
                      >
                        <div className="text-sm font-medium leading-snug mb-2">{t.title}</div>
                        <div className="flex items-center justify-between gap-1">
                          <span className={cn("inline-flex items-center rounded-full px-1.5 py-0.5 text-[10px] font-medium", TASK_PRIORITY_TONE[t.priority])}>
                            {TASK_PRIORITY_LABELS[t.priority]}
                          </span>
                          <span className="text-[10px] text-muted-foreground">{TASK_TYPE_LABELS[t.task_type]}</span>
                        </div>
                        {t.progress_pct > 0 && (
                          <div className="h-1 bg-muted rounded-full overflow-hidden mt-2">
                            <div className="h-full bg-primary" style={{ width: `${t.progress_pct}%` }} />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
