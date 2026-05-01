import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO, isValid } from "date-fns";
import { StatusBadge } from "@/components/StatusBadge";
import type { TaskStatus } from "@/lib/taskMeta";
import type { WbsNode } from "@/lib/wbsMeta";
import type { DepLink, SchedTask } from "@/lib/schedule";
import { delayDays, computeBlockedness } from "@/lib/schedule";
import { useNavigate } from "react-router-dom";

interface TaskRow extends SchedTask {
  title: string;
  code: string | null;
  wbs_node_id: string | null;
  department: string | null;
  baseline_start: string | null;
  baseline_end: string | null;
  actual_start: string | null;
}

interface Props {
  projectId: string;
  nodes: WbsNode[];
}

const fmt = (s: string | null) => {
  if (!s) return "—";
  const d = parseISO(s);
  return isValid(d) ? format(d, "dd-MM-yyyy") : "—";
};

const calcDur = (a: string | null, b: string | null) => {
  if (!a || !b) return "—";
  const ad = parseISO(a); const bd = parseISO(b);
  if (!isValid(ad) || !isValid(bd)) return "—";
  return `${Math.max(1, Math.round((bd.getTime() - ad.getTime()) / 86400000) + 1)}d`;
};

export function ScheduleTable({ projectId, nodes }: Props) {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [deps, setDeps] = useState<DepLink[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [deptFilter, setDeptFilter] = useState<string>("all");
  const [nodeFilter, setNodeFilter] = useState<string>("all");

  useEffect(() => {
    if (!projectId) return;
    setLoading(true);
    (async () => {
      const { data: ts } = await supabase
        .from("tasks")
        .select("id, title, code, wbs_node_id, department, status, planned_start, planned_end, actual_start, actual_end, progress_pct, baseline_start, baseline_end")
        .eq("project_id", projectId)
        .order("planned_start", { ascending: true, nullsFirst: false });
      const rows = (ts ?? []) as unknown as TaskRow[];
      setTasks(rows);
      if (rows.length) {
        const { data: ds } = await supabase
          .from("task_predecessors")
          .select("task_id, predecessor_id, relation_type, lag_days, is_hard_block")
          .in("task_id", rows.map((r) => r.id));
        setDeps((ds ?? []) as DepLink[]);
      } else {
        setDeps([]);
      }
      setLoading(false);
    })();
  }, [projectId]);

  const nodePathById = useMemo(() => {
    const m = new Map<string, string>();
    for (const n of nodes) m.set(n.id, (n as any).path_text ?? n.code);
    return m;
  }, [nodes]);

  const blockedMap = useMemo(() => computeBlockedness(tasks, deps), [tasks, deps]);

  const counts = useMemo(() => {
    const pre = new Map<string, number>(); const suc = new Map<string, number>();
    for (const d of deps) {
      pre.set(d.task_id, (pre.get(d.task_id) ?? 0) + 1);
      suc.set(d.predecessor_id, (suc.get(d.predecessor_id) ?? 0) + 1);
    }
    return { pre, suc };
  }, [deps]);

  const departments = useMemo(() => Array.from(new Set(tasks.map((t) => t.department).filter(Boolean))) as string[], [tasks]);
  const statuses = useMemo(() => Array.from(new Set(tasks.map((t) => t.status).filter(Boolean))) as string[], [tasks]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return tasks.filter((t) => {
      if (q && !`${t.code ?? ""} ${t.title}`.toLowerCase().includes(q)) return false;
      if (statusFilter !== "all" && t.status !== statusFilter) return false;
      if (deptFilter !== "all" && t.department !== deptFilter) return false;
      if (nodeFilter !== "all" && t.wbs_node_id !== nodeFilter) return false;
      return true;
    });
  }, [tasks, search, statusFilter, deptFilter, nodeFilter]);

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-center gap-2 border-b bg-muted/30 p-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search tasks…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px] h-9"><SelectValue placeholder="Status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            {statuses.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={deptFilter} onValueChange={setDeptFilter}>
          <SelectTrigger className="w-[170px] h-9"><SelectValue placeholder="Discipline" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All disciplines</SelectItem>
            {departments.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={nodeFilter} onValueChange={setNodeFilter}>
          <SelectTrigger className="w-[200px] h-9"><SelectValue placeholder="WBS node" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All WBS</SelectItem>
            {nodes.slice(0, 200).map((n) => (
              <SelectItem key={n.id} value={n.id}>{(n as any).path_text ?? n.code}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Badge variant="outline">{filtered.length} of {tasks.length}</Badge>
      </div>

      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm">
          <thead className="sticky top-0 z-10 bg-background border-b text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-2 py-2 text-left">Code</th>
              <th className="px-2 py-2 text-left">Task</th>
              <th className="px-2 py-2 text-left">WBS</th>
              <th className="px-2 py-2 text-left">Dept</th>
              <th className="px-2 py-2 text-left">Status</th>
              <th className="px-2 py-2 text-left">Start</th>
              <th className="px-2 py-2 text-left">Finish</th>
              <th className="px-2 py-2 text-right">Dur</th>
              <th className="px-2 py-2 text-left">Actual start</th>
              <th className="px-2 py-2 text-left">Actual finish</th>
              <th className="px-2 py-2 text-center">Pred</th>
              <th className="px-2 py-2 text-center">Succ</th>
              <th className="px-2 py-2 text-right">Delay</th>
              <th className="px-2 py-2 text-right">%</th>
            </tr>
          </thead>
          <tbody>
            {loading && <tr><td colSpan={14} className="px-3 py-6 text-center text-muted-foreground">Loading…</td></tr>}
            {!loading && filtered.length === 0 && (
              <tr><td colSpan={14} className="px-3 py-6 text-center text-muted-foreground">No tasks match.</td></tr>
            )}
            {filtered.map((t) => {
              const blocked = blockedMap.has(t.id);
              const dly = delayDays(t);
              return (
                <tr
                  key={t.id}
                  className="border-b hover:bg-muted/40 cursor-pointer"
                  onClick={() => navigate(`/tasks/${t.id}`)}
                >
                  <td className="px-2 py-1.5 font-mono text-[11px] text-muted-foreground">{t.code ?? "—"}</td>
                  <td className="px-2 py-1.5 max-w-[260px] truncate">{t.title}</td>
                  <td className="px-2 py-1.5 text-xs text-muted-foreground truncate max-w-[200px]">
                    {t.wbs_node_id ? nodePathById.get(t.wbs_node_id) ?? "—" : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-xs">{t.department ?? "—"}</td>
                  <td className="px-2 py-1.5">
                    <StatusBadge status={(blocked ? "blocked" : (t.status as TaskStatus)) as TaskStatus} />
                  </td>
                  <td className="px-2 py-1.5 tabular-nums text-xs">{fmt(t.planned_start)}</td>
                  <td className="px-2 py-1.5 tabular-nums text-xs">{fmt(t.planned_end)}</td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-xs">{calcDur(t.planned_start, t.planned_end)}</td>
                  <td className="px-2 py-1.5 tabular-nums text-xs">{fmt(t.actual_start)}</td>
                  <td className="px-2 py-1.5 tabular-nums text-xs">{fmt(t.actual_end ?? null)}</td>
                  <td className="px-2 py-1.5 text-center text-xs">{counts.pre.get(t.id) ?? 0}</td>
                  <td className="px-2 py-1.5 text-center text-xs">{counts.suc.get(t.id) ?? 0}</td>
                  <td className={cn("px-2 py-1.5 text-right tabular-nums text-xs", dly > 0 && "text-destructive font-medium")}>
                    {dly > 0 ? `+${dly}d` : "—"}
                  </td>
                  <td className="px-2 py-1.5 text-right tabular-nums text-xs">{t.progress_pct ?? 0}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
