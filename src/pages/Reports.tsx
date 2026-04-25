import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Loader2, Download } from "lucide-react";
import { toast } from "sonner";
import { OrgKpis, type OrgKpiData } from "@/components/reports/OrgKpis";
import {
  MemberPerformanceTable,
  type MemberRow,
} from "@/components/reports/MemberPerformanceTable";
import { MemberDetailSheet } from "@/components/reports/MemberDetailSheet";
import { invokeXlsxDownload } from "@/lib/xlsxDownload";

interface ProjectOpt {
  id: string;
  code: string;
  name: string;
}

export default function Reports() {
  const { hasRole } = useAuth();
  const isAdmin = hasRole("admin");

  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [projects, setProjects] = useState<ProjectOpt[]>([]);
  const [projectId, setProjectId] = useState<string>("all");
  const [dateFrom, setDateFrom] = useState<string>(defaultFrom());
  const [dateTo, setDateTo] = useState<string>(defaultTo());

  const [kpi, setKpi] = useState<OrgKpiData | null>(null);
  const [members, setMembers] = useState<MemberRow[]>([]);
  const [active, setActive] = useState<MemberRow | null>(null);

  useEffect(() => {
    supabase
      .from("projects")
      .select("id, code, name")
      .order("code")
      .then(({ data }) => setProjects((data ?? []) as ProjectOpt[]));
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoading(true);
      const today = new Date().toISOString().slice(0, 10);

      let tasksQ = supabase
        .from("tasks")
        .select(
          "id, status, planned_end, actual_end, project_id, created_by",
        );
      if (projectId !== "all") tasksQ = tasksQ.eq("project_id", projectId);

      let tsQ = supabase
        .from("timesheet_entries")
        .select("user_id, project_id, regular_hours, overtime_hours, status, work_date");
      if (projectId !== "all") tsQ = tsQ.eq("project_id", projectId);
      if (dateFrom) tsQ = tsQ.gte("work_date", dateFrom);
      if (dateTo) tsQ = tsQ.lte("work_date", dateTo);

      const [tRes, tsRes, plRes, mRes, prRes] = await Promise.all([
        tasksQ,
        tsQ,
        supabase.from("payroll_lines").select("total_pay, currency"),
        supabase.from("project_members").select("user_id, project_id"),
        supabase.from("profiles").select("id, full_name, job_title"),
      ]);
      if (cancelled) return;

      const tasks = (tRes.data ?? []) as Array<{
        id: string;
        status: string;
        planned_end: string | null;
        actual_end: string | null;
        project_id: string;
      }>;
      const ts = (tsRes.data ?? []) as Array<{
        user_id: string;
        project_id: string;
        regular_hours: number;
        overtime_hours: number;
        status: string;
        work_date: string;
      }>;
      const pl = (plRes.data ?? []) as Array<{ total_pay: number; currency: string }>;
      const projMembers = (mRes.data ?? []) as Array<{ user_id: string; project_id: string }>;
      const profiles = (prRes.data ?? []) as Array<{
        id: string;
        full_name: string;
        job_title: string | null;
      }>;

      // Org KPIs
      const completed = tasks.filter((t) => t.status === "completed" || t.status === "closed").length;
      const inProgress = tasks.filter((t) => t.status === "in_progress").length;
      const overdue = tasks.filter(
        (t) =>
          t.planned_end &&
          t.planned_end < today &&
          !["completed", "closed", "approved"].includes(t.status),
      ).length;
      const onTime = tasks.filter(
        (t) =>
          (t.status === "completed" || t.status === "closed") &&
          t.planned_end &&
          t.actual_end &&
          new Date(t.actual_end) <= new Date(t.planned_end),
      ).length;
      const onTimeRate = completed > 0 ? Math.round((onTime / completed) * 100) : 0;
      const totalHours = ts.reduce(
        (s, e) => s + Number(e.regular_hours) + Number(e.overtime_hours),
        0,
      );
      const approvedHours = ts
        .filter((e) => e.status === "approved")
        .reduce((s, e) => s + Number(e.regular_hours) + Number(e.overtime_hours), 0);
      const payrollTotal = pl.reduce((s, l) => s + Number(l.total_pay), 0);
      const payrollCurrency = pl[0]?.currency ?? "USD";

      const projectIds = projectId !== "all"
        ? new Set([projectId])
        : new Set(projMembers.map((m) => m.project_id));
      const memberIds = new Set(
        projMembers
          .filter((m) => projectIds.has(m.project_id))
          .map((m) => m.user_id),
      );

      setKpi({
        totalProjects: projectId !== "all" ? 1 : new Set(projMembers.map((m) => m.project_id)).size,
        totalMembers: memberIds.size,
        totalTasks: tasks.length,
        completedTasks: completed,
        inProgressTasks: inProgress,
        overdueTasks: overdue,
        totalHours,
        approvedHours,
        payrollTotal,
        payrollCurrency,
        onTimeRate,
      });

      // Per-member rows
      if (isAdmin) {
        const taskIds = tasks.map((t) => t.id);
        const { data: assigns } = taskIds.length
          ? await supabase
              .from("task_assignments")
              .select("user_id, task_id")
              .in("task_id", taskIds)
              .is("unassigned_at", null)
          : { data: [] };
        if (cancelled) return;

        const taskMap = new Map(tasks.map((t) => [t.id, t]));
        const profMap = new Map(profiles.map((p) => [p.id, p]));

        type Acc = {
          total: number; done: number; inProg: number; overdue: number; onTime: number;
          regH: number; otH: number; appH: number;
        };
        const agg = new Map<string, Acc>();
        const ensure = (uid: string): Acc => {
          let a = agg.get(uid);
          if (!a) {
            a = { total: 0, done: 0, inProg: 0, overdue: 0, onTime: 0, regH: 0, otH: 0, appH: 0 };
            agg.set(uid, a);
          }
          return a;
        };

        ((assigns ?? []) as Array<{ user_id: string; task_id: string }>).forEach((a) => {
          const t = taskMap.get(a.task_id);
          if (!t) return;
          const acc = ensure(a.user_id);
          acc.total += 1;
          if (t.status === "completed" || t.status === "closed") acc.done += 1;
          if (t.status === "in_progress") acc.inProg += 1;
          const isClosed = ["completed", "closed", "approved"].includes(t.status);
          if (t.planned_end && t.planned_end < today && !isClosed) acc.overdue += 1;
          if (
            (t.status === "completed" || t.status === "closed") &&
            t.planned_end && t.actual_end &&
            new Date(t.actual_end) <= new Date(t.planned_end)
          ) {
            acc.onTime += 1;
          }
        });

        ts.forEach((e) => {
          const acc = ensure(e.user_id);
          acc.regH += Number(e.regular_hours);
          acc.otH += Number(e.overtime_hours);
          if (e.status === "approved") acc.appH += Number(e.regular_hours) + Number(e.overtime_hours);
        });

        const rows: MemberRow[] = Array.from(agg.entries()).map(([uid, a]) => {
          const p = profMap.get(uid);
          return {
            user_id: uid,
            full_name: p?.full_name ?? "Unknown",
            job_title: p?.job_title ?? null,
            total_tasks: a.total,
            completed: a.done,
            in_progress: a.inProg,
            overdue: a.overdue,
            on_time_rate: a.done > 0 ? a.onTime / a.done : 0,
            completion_rate: a.total > 0 ? a.done / a.total : 0,
            regular_hours: a.regH,
            overtime_hours: a.otH,
            approved_hours: a.appH,
          };
        });

        setMembers(rows);
      }

      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [projectId, dateFrom, dateTo, isAdmin]);

  const exportReport = async () => {
    setExporting(true);
    try {
      await invokeXlsxDownload(
        "export-member-report-xlsx",
        { project_id: projectId, date_from: dateFrom, date_to: dateTo },
        `member-report-${dateFrom}_to_${dateTo}.xlsx`,
      );
      toast.success("Excel report downloaded");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const projectLabel = useMemo(() => {
    if (projectId === "all") return "All projects";
    const p = projects.find((x) => x.id === projectId);
    return p ? `${p.code} · ${p.name}` : "—";
  }, [projectId, projects]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-end gap-3">
        <div className="mr-auto">
          <h1 className="text-2xl font-bold">Reports</h1>
          <p className="text-sm text-muted-foreground">
            Org-wide insights and per-member performance — {projectLabel}
          </p>
        </div>
        <Filter label="Project">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All projects</SelectItem>
              {projects.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.code} · {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Filter>
        <Filter label="From">
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="w-36"
          />
        </Filter>
        <Filter label="To">
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-36"
          />
        </Filter>
        {isAdmin && (
          <Button onClick={exportReport} disabled={exporting} variant="default">
            {exporting ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Download className="h-4 w-4 mr-2" />
            )}
            Export Excel
          </Button>
        )}
      </div>

      {loading || !kpi ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          <OrgKpis data={kpi} />
          {isAdmin ? (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Per-member performance</CardTitle>
              </CardHeader>
              <CardContent>
                <MemberPerformanceTable rows={members} onSelect={setActive} />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="py-6 text-sm text-muted-foreground">
                Per-member breakdown is visible to admins only.
              </CardContent>
            </Card>
          )}
        </>
      )}

      <MemberDetailSheet
        member={active}
        open={!!active}
        onOpenChange={(o) => !o && setActive(null)}
      />
    </div>
  );
}

function Filter({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      {children}
    </div>
  );
}

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return d.toISOString().slice(0, 10);
}

function defaultTo(): string {
  return new Date().toISOString().slice(0, 10);
}
