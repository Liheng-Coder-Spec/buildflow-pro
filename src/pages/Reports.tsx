import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useProjects } from "@/contexts/ProjectContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader2, ClipboardList, Clock, CheckCircle2, AlertCircle, DollarSign } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface KPIs {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  overdueTasks: number;
  totalHours: number;
  approvedHours: number;
  payrollTotal: number;
  payrollCurrency: string;
  onTimeRate: number;
}

interface TopTask {
  id: string;
  title: string;
  status: string;
  progress_pct: number;
  planned_end: string | null;
}

export default function Reports() {
  const { activeProject } = useProjects();
  const [loading, setLoading] = useState(true);
  const [kpis, setKpis] = useState<KPIs | null>(null);
  const [topTasks, setTopTasks] = useState<TopTask[]>([]);

  useEffect(() => {
    const load = async () => {
      if (!activeProject) {
        setLoading(false);
        return;
      }
      setLoading(true);
      const [tasksRes, timesheetRes, payrollRes] = await Promise.all([
        supabase.from("tasks").select("*").eq("project_id", activeProject.id),
        supabase.from("timesheet_entries").select("*").eq("project_id", activeProject.id),
        supabase.from("payroll_lines").select("total_pay,currency"),
      ]);

      const tasks = tasksRes.data ?? [];
      const ts = timesheetRes.data ?? [];
      const pl = payrollRes.data ?? [];
      const today = new Date().toISOString().slice(0, 10);

      const completed = tasks.filter((t: any) => t.status === "completed" || t.status === "closed").length;
      const inProgress = tasks.filter((t: any) => t.status === "in_progress").length;
      const overdue = tasks.filter(
        (t: any) =>
          t.planned_end &&
          t.planned_end < today &&
          !["completed", "closed", "approved"].includes(t.status),
      ).length;
      const onTime = tasks.filter(
        (t: any) =>
          (t.status === "completed" || t.status === "closed") &&
          t.planned_end &&
          t.actual_end &&
          new Date(t.actual_end) <= new Date(t.planned_end),
      ).length;
      const onTimeRate = completed > 0 ? Math.round((onTime / completed) * 100) : 0;

      const totalHours = ts.reduce(
        (s: number, e: any) => s + Number(e.regular_hours) + Number(e.overtime_hours),
        0,
      );
      const approvedHours = ts
        .filter((e: any) => e.status === "approved")
        .reduce((s: number, e: any) => s + Number(e.regular_hours) + Number(e.overtime_hours), 0);

      const payrollTotal = pl.reduce((s: number, l: any) => s + Number(l.total_pay), 0);
      const payrollCurrency = (pl[0]?.currency as string) || "USD";

      setKpis({
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

      const top = [...tasks]
        .filter((t: any) => !["closed", "completed"].includes(t.status))
        .sort((a: any, b: any) => (a.planned_end || "").localeCompare(b.planned_end || ""))
        .slice(0, 8) as TopTask[];
      setTopTasks(top);

      setLoading(false);
    };
    load();
  }, [activeProject?.id]);

  if (!activeProject) {
    return (
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-muted-foreground">Select a project to view KPIs.</p>
      </div>
    );
  }

  if (loading || !kpis) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const completionRate =
    kpis.totalTasks > 0 ? Math.round((kpis.completedTasks / kpis.totalTasks) * 100) : 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Reports</h1>
        <p className="text-sm text-muted-foreground">
          {activeProject.code} · {activeProject.name}
        </p>
      </div>

      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        <KpiCard
          icon={<ClipboardList className="h-4 w-4" />}
          label="Tasks"
          value={`${kpis.completedTasks}/${kpis.totalTasks}`}
          hint={`${completionRate}% complete`}
        />
        <KpiCard
          icon={<Clock className="h-4 w-4" />}
          label="Hours logged"
          value={kpis.totalHours.toFixed(1)}
          hint={`${kpis.approvedHours.toFixed(1)} approved`}
        />
        <KpiCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          label="On-time delivery"
          value={`${kpis.onTimeRate}%`}
          hint="Of completed tasks"
        />
        <KpiCard
          icon={<AlertCircle className="h-4 w-4" />}
          label="Overdue"
          value={String(kpis.overdueTasks)}
          hint={`${kpis.inProgressTasks} in progress`}
          tone={kpis.overdueTasks > 0 ? "warning" : "default"}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <DollarSign className="h-4 w-4" />
            Payroll (all periods)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {kpis.payrollCurrency}{" "}
            {kpis.payrollTotal.toLocaleString(undefined, { maximumFractionDigits: 2 })}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Total computed payroll across all periods
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Upcoming task deadlines</CardTitle>
        </CardHeader>
        <CardContent>
          {topTasks.length === 0 ? (
            <p className="text-sm text-muted-foreground">No active tasks.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Task</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Due</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topTasks.map((t) => (
                  <TableRow key={t.id}>
                    <TableCell className="font-medium">{t.title}</TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {t.status.replace("_", " ")}
                      </Badge>
                    </TableCell>
                    <TableCell>{t.progress_pct}%</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {t.planned_end ?? "—"}
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

function KpiCard({
  icon,
  label,
  value,
  hint,
  tone = "default",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  hint?: string;
  tone?: "default" | "warning";
}) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-2">
          {icon}
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div
          className={`text-2xl font-bold ${tone === "warning" ? "text-destructive" : ""}`}
        >
          {value}
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}
