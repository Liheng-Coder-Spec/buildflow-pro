import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import useSEO from "@/hooks/useSEO";
import { CalendarDays, ClipboardList, Layers, Network, Settings, Users, BarChart3, CalendarCheck, Sparkles } from "lucide-react";

const ADMIN_LINKS = [
  { to: "/hr/eleave/admin/leave-types", title: "Leave Types", desc: "Configure leave types, accruals, half-day & cancellation rules.", icon: Layers },
  { to: "/hr/eleave/admin/approval-chains", title: "Approval Chains", desc: "Personal, department, and company-wide approval chains.", icon: Network },
  { to: "/hr/eleave/admin/capacity", title: "Team Capacity", desc: "Caps on simultaneous leave per department + overrides.", icon: Users },
  { to: "/hr/eleave/admin/seniority", title: "Seniority Rules", desc: "Tiered allowances based on years of service.", icon: Sparkles },
  { to: "/hr/eleave/admin/allowances", title: "Allowances", desc: "Per-user yearly balances and carry-forward management.", icon: ClipboardList },
  { to: "/hr/eleave/admin/year-end", title: "Year-End Run", desc: "Carry forward and expiry batch for next year.", icon: CalendarCheck },
  { to: "/hr/eleave/admin/users", title: "Users", desc: "Roles, gender, years of service, probation, supervisor.", icon: Users },
  { to: "/hr/eleave/admin/reports", title: "Reports", desc: "Master report with KPIs, filters, and exports.", icon: BarChart3 },
  { to: "/hr/eleave/admin/holidays", title: "Public Holidays", desc: "Manage holidays; bulk seed Cambodia presets.", icon: CalendarDays },
];

export default function EleaveAdminHome() {
  useSEO({ title: "E-Leave Administration" });
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Settings className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">E-Leave Administration</h1>
          <p className="text-sm text-muted-foreground">Configure leave types, chains, capacity, allowances, holidays and reporting.</p>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {ADMIN_LINKS.map((l) => {
          const Icon = l.icon;
          return (
            <Link key={l.to} to={l.to}>
              <Card className="h-full hover:border-primary/40 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center"><Icon className="h-4 w-4" /></div>
                    <CardTitle className="text-base">{l.title}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent><CardDescription>{l.desc}</CardDescription></CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
