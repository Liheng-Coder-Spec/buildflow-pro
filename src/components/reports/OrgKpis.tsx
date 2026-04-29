import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, Clock, CheckCircle2, AlertCircle, DollarSign, Users } from "lucide-react";

export interface OrgKpiData {
  totalProjects: number;
  totalMembers: number;
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

export function OrgKpis({ data }: { data: OrgKpiData }) {
  const completionRate =
    data.totalTasks > 0 ? Math.round((data.completedTasks / data.totalTasks) * 100) : 0;

  return (
    <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
      <KpiCard
        icon={<Users className="h-4 w-4" />}
        label="Active members"
        value={String(data.totalMembers)}
        hint={`${data.totalProjects} projects`}
      />
      <KpiCard
        icon={<ClipboardList className="h-4 w-4" />}
        label="Tasks"
        value={`${data.completedTasks}/${data.totalTasks}`}
        hint={`${completionRate}% complete`}
      />
      <KpiCard
        icon={<Clock className="h-4 w-4" />}
        label="Hours logged"
        value={data.totalHours.toFixed(1)}
        hint={`${data.approvedHours.toFixed(1)} approved`}
      />
      <KpiCard
        icon={<CheckCircle2 className="h-4 w-4" />}
        label="On-time delivery"
        value={`${data.onTimeRate}%`}
        hint="Of completed tasks"
      />
      <KpiCard
        icon={<AlertCircle className="h-4 w-4" />}
        label="Overdue"
        value={String(data.overdueTasks)}
        hint={`${data.inProgressTasks} in progress`}
        tone={data.overdueTasks > 0 ? "warning" : "default"}
      />
      <KpiCard
        icon={<DollarSign className="h-4 w-4" />}
        label="Payroll (all periods)"
        value={`${data.payrollCurrency} ${data.payrollTotal.toLocaleString(undefined, { maximumFractionDigits: 0 })}`}
        hint="Total computed payroll"
      />
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
        <div className={`text-2xl font-bold ${tone === "warning" ? "text-destructive" : ""}`}>
          {value}
        </div>
        {hint && <p className="text-xs text-muted-foreground mt-1">{hint}</p>}
      </CardContent>
    </Card>
  );
}
