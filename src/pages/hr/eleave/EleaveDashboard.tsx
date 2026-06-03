import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import useSEO from "@/hooks/useSEO";
import { StatusPill } from "@/components/eleave/StatusPill";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Plus, ArrowRight } from "lucide-react";
import { ApprovalChainTimeline, type ApprovalStep } from "@/components/eleave/ApprovalChainTimeline";

type Bal = { id: string; year: number; yearly_allowance: number; carried_over: number; used: number; expired: number; adjustments: number; leave_types: { name: string; color: string } };

const ringColor: Record<string, string> = {
  blue: "hsl(var(--cat-blue-fg))",
  green: "hsl(var(--cat-green-fg))",
  purple: "hsl(var(--cat-purple-fg))",
  amber: "hsl(var(--cat-amber-fg))",
  red: "hsl(var(--cat-red-fg))",
  gray: "hsl(var(--cat-gray-fg))",
};
const dotColor: Record<string, string> = {
  blue: "bg-cat-blue-fg",
  green: "bg-cat-green-fg",
  purple: "bg-cat-purple-fg",
  amber: "bg-cat-amber-fg",
  red: "bg-cat-red-fg",
  gray: "bg-cat-gray-fg",
};

function ProgressRing({ value, total, color }: { value: number; total: number; color: string }) {
  const size = 132;
  const stroke = 10;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = total > 0 ? Math.min(1, Math.max(0, value / total)) : 0;
  const dash = c * pct;
  const stroked = ringColor[color] ?? ringColor.blue;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} stroke="hsl(var(--secondary))" strokeWidth={stroke} fill="none" />
        <circle cx={size / 2} cy={size / 2} r={r} stroke={stroked} strokeWidth={stroke} fill="none" strokeLinecap="round" strokeDasharray={`${dash} ${c - dash}`} className="transition-[stroke-dasharray] duration-700 ease-out" />
      </svg>
      <div className="absolute inset-0 grid place-items-center">
        <div className="text-center">
          <div className="text-3xl font-semibold leading-none text-foreground">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-1">remaining</div>
        </div>
      </div>
    </div>
  );
}

export default function EleaveDashboard() {
  useSEO({ title: "E-Leave Balance", description: "View your E-Leave balances for the current year." });
  const { user, role } = useAuth();
  const [balances, setBalances] = useState<Bal[]>([]);
  const [upcoming, setUpcoming] = useState<any[]>([]);
  const [pending, setPending] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<Record<string, ApprovalStep[]>>({});
  const [toApprove, setToApprove] = useState<any[]>([]);
  const year = new Date().getFullYear();
  const sb = supabase as any;

  useEffect(() => {
    if (!user) return;
    sb.from("eleave_leave_balances").select("*, leave_types(name,color)").eq("user_id", user.id).eq("year", year).then(({ data }: any) => setBalances((data as any) ?? []));
    sb.from("eleave_leave_requests").select("*, leave_types(name,color)").eq("user_id", user.id).eq("status", "approved").gte("end_date", new Date().toISOString().slice(0, 10)).order("start_date").then(({ data }: any) => setUpcoming(data ?? []));
    (async () => {
      const { data: pendingRows } = await sb.from("eleave_leave_requests").select("*, leave_types(name,color)").eq("user_id", user.id).in("status", ["pending", "pending_cancellation"]).order("created_at", { ascending: false });
      const list = pendingRows ?? [];
      setPending(list);
      const ids = list.map((r: any) => r.id);
      if (!ids.length) { setPendingApprovals({}); return; }
      const { data: appr } = await sb.from("eleave_request_approvals").select("request_id, level, decision, comment, decided_at, approver_id").in("request_id", ids).order("level", { ascending: true });
      const approverIds = Array.from(new Set((appr ?? []).map((a: any) => a.approver_id)));
      const { data: profs } = approverIds.length ? await sb.from("profiles").select("id, full_name, email").in("id", approverIds) : { data: [] as any[] };
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const grouped: Record<string, ApprovalStep[]> = {};
      for (const a of appr ?? []) {
        const p = profMap.get(a.approver_id);
        (grouped[a.request_id] ||= []).push({ level: a.level, approver_name: p?.full_name, approver_email: p?.email, decision: a.decision as any, comment: a.comment, decided_at: a.decided_at });
      }
      setPendingApprovals(grouped);
    })();

    if (role === "supervisor" || role === "admin") {
      (async () => {
        const { data: appr } = await sb.from("eleave_request_approvals").select("request_id, level").eq("approver_id", user.id).is("decision", null);
        const ids = (appr ?? []).map((a: any) => a.request_id);
        if (!ids.length) { setToApprove([]); return; }
        const { data: reqs } = await sb.from("eleave_leave_requests").select("*, leave_types(name,color)").in("id", ids).in("status", ["pending", "pending_cancellation"]).order("created_at", { ascending: false });
        const userIds = Array.from(new Set((reqs ?? []).map((r: any) => r.user_id)));
        const { data: profs } = userIds.length ? await sb.from("profiles").select("id, full_name, email").in("id", userIds) : { data: [] as any[] };
        const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
        const byId = new Map((appr ?? []).map((a: any) => [a.request_id, a.level]));
        setToApprove(((reqs as any) ?? []).filter((r: any) => r.current_level === byId.get(r.id) || r.status === "pending_cancellation").map((r: any) => ({ ...r, profiles: profMap.get(r.user_id) })));
      })();
    }
  }, [user, year, role]);

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">E-Leave Balance</h1>
          <p className="text-sm text-muted-foreground mt-1">View your E-Leave balances for the current year</p>
        </div>
        <Button asChild size="lg" className="rounded-xl shadow-sm">
          <Link to="/hr/eleave/apply"><Plus className="h-4 w-4 mr-1" />Apply E-Leave</Link>
        </Button>
      </div>

      {(role === "supervisor" || role === "admin") && toApprove.length > 0 && (
        <Card className="p-5 border-cat-amber/40 bg-cat-amber/10">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Awaiting your approval</h3>
              <p className="text-xs text-muted-foreground">{toApprove.length} request(s) need your decision.</p>
            </div>
            <Button asChild size="sm"><Link to="/hr/eleave/approvals">Open inbox</Link></Button>
          </div>
          <ul className="divide-y">
            {toApprove.slice(0, 4).map((r) => (
              <li key={r.id} className="py-2 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{r.profiles?.full_name} · {r.leave_types?.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{r.start_date} → {r.end_date} · {r.days} day(s)</div>
                </div>
                <StatusPill status={r.status} />
              </li>
            ))}
          </ul>
        </Card>
      )}

      {balances.length === 0 ? (
        <Card className="p-6 text-sm text-muted-foreground">No balances yet — ask your admin to assign allowances.</Card>
      ) : (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {balances.map((b) => {
            const total = Number(b.yearly_allowance) + Number(b.carried_over) + Number(b.adjustments);
            const used = Number(b.used) + Number(b.expired);
            const remaining = total - used;
            const color = b.leave_types.color || "blue";
            return (
              <Card key={b.id} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className={`h-2.5 w-2.5 rounded-full ${dotColor[color] ?? dotColor.blue}`} />
                    <span className="font-semibold text-foreground">{b.leave_types.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{b.yearly_allowance} days per year</span>
                </div>
                <div className="grid place-items-center py-3">
                  <ProgressRing value={remaining} total={total || 1} color={color} />
                </div>
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-foreground"><span className={`h-2 w-2 rounded-full ${dotColor[color] ?? dotColor.blue}`} />Taken</span>
                    <span className="font-medium">{used} days</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-2 text-muted-foreground"><span className="h-2 w-2 rounded-full bg-muted-foreground/40" />Remaining</span>
                    <span className="font-medium">{remaining} days</span>
                  </div>
                  <div className="h-1.5 bg-secondary rounded-full overflow-hidden mt-3">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${total > 0 ? Math.min(100, (used / total) * 100) : 0}%`, backgroundColor: ringColor[color] ?? ringColor.blue }} />
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="font-semibold mb-3">Upcoming approved E-Leave</h3>
          {upcoming.length === 0 ? <p className="text-sm text-muted-foreground">Nothing scheduled.</p> : (
            <ul className="divide-y">
              {upcoming.map((u) => (
                <li key={u.id} className="py-2.5 flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium">{u.leave_types?.name}</div>
                    <div className="text-xs text-muted-foreground">{u.start_date} → {u.end_date} · {u.days} day(s)</div>
                  </div>
                  <StatusPill status={u.status} />
                </li>
              ))}
            </ul>
          )}
        </Card>
        <Card className="p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Pending requests</h3>
            {pending.length > 0 && (
              <Link to="/hr/eleave/requests" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
                View all <ArrowRight className="h-3 w-3" />
              </Link>
            )}
          </div>
          {pending.length === 0 ? <p className="text-sm text-muted-foreground">No pending requests.</p> : (
            <ul className="divide-y">
              {pending.map((u) => {
                const steps = pendingApprovals[u.id] ?? [];
                const currentApprover = steps.find((s) => s.level === u.current_level && !s.decision);
                return (
                  <li key={u.id} className="py-3 space-y-1.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{u.leave_types?.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{u.start_date} → {u.end_date} · {u.days} day(s)</div>
                      </div>
                      <StatusPill status={u.status} />
                    </div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[11px] inline-flex items-center gap-1.5 rounded-md bg-cat-amber/10 border border-cat-amber-fg/20 px-2 py-0.5">
                        <span className="text-cat-amber-fg font-medium">Waiting on L{u.current_level}/{u.total_levels}:</span>
                        <span className="text-foreground truncate max-w-[160px]">{currentApprover?.approver_name ?? "Approver"}</span>
                      </span>
                      {steps.length > 0 && (
                        <ApprovalChainTimeline approvals={steps} current_level={u.current_level} total_levels={u.total_levels} variant="compact" />
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
      </div>
    </div>
  );
}
