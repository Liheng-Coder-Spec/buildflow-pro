import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, parseISO, startOfMonth } from "date-fns";

export type ChartRow = {
  start_date: string;
  days: number;
  status: string;
  department: string;
  employee: string;
};

export function ReportCharts({ rows }: { rows: ChartRow[] }) {
  const approved = useMemo(() => rows.filter((r) => r.status === "approved"), [rows]);

  const perMonth = useMemo(() => {
    const map = new Map<string, number>();
    approved.forEach((r) => {
      const k = format(startOfMonth(parseISO(r.start_date)), "yyyy-MM");
      map.set(k, (map.get(k) ?? 0) + Number(r.days || 0));
    });
    return Array.from(map.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => ({ month: format(parseISO(`${k}-01`), "MMM yyyy"), days: Number(v.toFixed(1)) }));
  }, [approved]);

  const byDept = useMemo(() => {
    const map = new Map<string, number>();
    approved.forEach((r) => {
      const k = r.department || "—";
      map.set(k, (map.get(k) ?? 0) + Number(r.days || 0));
    });
    return Array.from(map.entries())
      .map(([department, days]) => ({ department, days: Number(days.toFixed(1)) }))
      .sort((a, b) => b.days - a.days);
  }, [approved]);

  const top5 = useMemo(() => {
    const map = new Map<string, number>();
    approved.forEach((r) => {
      const k = r.employee || "—";
      map.set(k, (map.get(k) ?? 0) + Number(r.days || 0));
    });
    return Array.from(map.entries())
      .map(([employee, days]) => ({ employee, days: Number(days.toFixed(1)) }))
      .sort((a, b) => b.days - a.days)
      .slice(0, 5);
  }, [approved]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Card className="lg:col-span-2">
        <CardHeader><CardTitle className="text-base">Approved leaves per month</CardTitle></CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={perMonth}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="days" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Approved days by department</CardTitle></CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={byDept}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="department" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="days" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">Top 5 employees by approved days</CardTitle></CardHeader>
        <CardContent className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={top5} layout="vertical" margin={{ left: 24 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} />
              <YAxis type="category" dataKey="employee" stroke="hsl(var(--muted-foreground))" fontSize={12} width={120} />
              <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8 }} />
              <Bar dataKey="days" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
}
