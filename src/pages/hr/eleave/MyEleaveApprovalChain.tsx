import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useSEO from "@/hooks/useSEO";
import { RefreshCw, UserCheck, Crown, Shield, Mail, Building2, CheckCircle2 } from "lucide-react";

type Profile = { id: string; full_name: string; email: string; department_id: string | null; supervisor_id: string | null };
type Approver = { level: number; user_id: string; full_name: string; email: string; department_name?: string | null; roles: string[] };
type ChainSource = { type: "personal" } | { type: "department"; name: string } | { type: "company" } | { type: "supervisor" } | { type: "admin_fallback" } | { type: "none" };

function initials(name: string, email: string) {
  const base = (name || email || "?").trim();
  const parts = base.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return base.slice(0, 2).toUpperCase();
}

export default function MyEleaveApprovalChain() {
  useSEO({ title: "My E-Leave Approval Chain" });
  const { user } = useAuth();
  const sb = supabase as any;
  const [loading, setLoading] = useState(true);
  const [me, setMe] = useState<Profile | null>(null);
  const [myDeptName, setMyDeptName] = useState<string | null>(null);
  const [supervisorName, setSupervisorName] = useState<string | null>(null);
  const [approvers, setApprovers] = useState<Approver[]>([]);
  const [source, setSource] = useState<ChainSource>({ type: "none" });

  const load = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const { data: profile } = await sb.from("profiles").select("id, full_name, email, department_id, supervisor_id").eq("id", user.id).maybeSingle();
    setMe(profile ?? null);
    let deptName: string | null = null;
    if (profile?.department_id) { const { data: d } = await sb.from("departments").select("name").eq("id", profile.department_id).maybeSingle(); deptName = d?.name ?? null; }
    setMyDeptName(deptName);
    if (profile?.supervisor_id) { const { data: s } = await sb.from("profiles").select("full_name, email").eq("id", profile.supervisor_id).maybeSingle(); setSupervisorName(s?.full_name || s?.email || null); } else setSupervisorName(null);

    let chainRows: { level: number; approver_id: string }[] = [];
    let resolvedSource: ChainSource = { type: "none" };

    const { data: personal } = await sb.from("approval_chains").select("level, approver_id").eq("scope", "personal").eq("user_id", user.id).order("level");
    if (personal && personal.length > 0) { chainRows = personal; resolvedSource = { type: "personal" }; }
    if (chainRows.length === 0 && profile?.department_id) {
      const { data: dept } = await sb.from("approval_chains").select("level, approver_id").eq("scope", "department").eq("department_id", profile.department_id).order("level");
      if (dept && dept.length > 0) { chainRows = dept; resolvedSource = { type: "department", name: deptName ?? "Department" }; }
    }
    if (chainRows.length === 0) {
      const { data: company } = await sb.from("approval_chains").select("level, approver_id").eq("scope", "company").order("level");
      if (company && company.length > 0) { chainRows = company; resolvedSource = { type: "company" }; }
    }
    if (chainRows.length === 0 && profile?.supervisor_id) { chainRows = [{ level: 1, approver_id: profile.supervisor_id }]; resolvedSource = { type: "supervisor" }; }
    if (chainRows.length === 0) {
      const { data: admins } = await sb.from("user_roles").select("user_id").eq("role", "admin").limit(1);
      if (admins && admins.length > 0) { chainRows = [{ level: 1, approver_id: admins[0].user_id }]; resolvedSource = { type: "admin_fallback" }; }
    }

    const ids = chainRows.map((r) => r.approver_id);
    let resolved: Approver[] = [];
    if (ids.length > 0) {
      const [{ data: profs }, { data: roleRows }] = await Promise.all([
        sb.from("profiles").select("id, full_name, email, department_id").in("id", ids),
        sb.from("user_roles").select("user_id, role").in("user_id", ids),
      ]);
      const deptIds = Array.from(new Set((profs ?? []).map((p: any) => p.department_id).filter(Boolean) as string[]));
      let deptMap = new Map<string, string>();
      if (deptIds.length > 0) { const { data: depts } = await sb.from("departments").select("id, name").in("id", deptIds); deptMap = new Map((depts ?? []).map((d: any) => [d.id, d.name])); }
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const rolesMap = new Map<string, string[]>();
      (roleRows ?? []).forEach((r: any) => { const arr = rolesMap.get(r.user_id) ?? []; arr.push(r.role); rolesMap.set(r.user_id, arr); });
      resolved = chainRows.sort((a, b) => a.level - b.level).map((r) => {
        const p = profMap.get(r.approver_id);
        return { level: r.level, user_id: r.approver_id, full_name: p?.full_name || "", email: p?.email || "", department_name: p?.department_id ? deptMap.get(p.department_id) ?? null : null, roles: rolesMap.get(r.approver_id) ?? [] };
      });
    }
    setApprovers(resolved); setSource(resolvedSource); setLoading(false);
  }, [user]);

  useEffect(() => { load(); }, [load]);

  const sourceLabel = (() => { switch (source.type) { case "personal": return "Personal chain"; case "department": return `Department: ${source.name}`; case "company": return "Company default"; case "supervisor": return "Direct supervisor"; case "admin_fallback": return "Admin fallback"; default: return "No approver"; } })();
  const sourceClass = (() => { switch (source.type) { case "personal": return "bg-cat-blue text-cat-blue-fg"; case "department": return "bg-cat-green text-cat-green-fg"; case "company": return "bg-cat-purple text-cat-purple-fg"; case "supervisor": return "bg-cat-amber text-cat-amber-fg"; case "admin_fallback": return "bg-destructive text-destructive-foreground"; default: return "bg-muted text-muted-foreground"; } })();

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-2"><UserCheck className="h-6 w-6 text-primary" /> My E-Leave Approval Chain</h1>
          <p className="text-sm text-muted-foreground mt-1">These are the people who review your E-Leave requests, in order.</p>
        </div>
        <div className="flex items-center gap-2"><Badge className={sourceClass + " border-transparent"}>{sourceLabel}</Badge><Button variant="outline" size="sm" onClick={load} disabled={loading}><RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh</Button></div>
      </div>

      <Card>
        <CardHeader className="pb-3"><CardTitle className="text-base">Your info</CardTitle><CardDescription>Why this chain applies to you</CardDescription></CardHeader>
        <CardContent className="grid sm:grid-cols-3 gap-4 text-sm">
          <div><div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Name</div><div className="font-medium">{me?.full_name || me?.email || "—"}</div></div>
          <div><div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Department</div><div className="font-medium flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5 text-muted-foreground" />{myDeptName || <span className="text-muted-foreground">Not assigned</span>}</div></div>
          <div><div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Direct supervisor</div><div className="font-medium">{supervisorName || <span className="text-muted-foreground">Not assigned</span>}</div></div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="space-y-3">{[0, 1].map((i) => <Skeleton key={i} className="h-28 w-full rounded-lg" />)}</div>
      ) : approvers.length === 0 ? (
        <Card><CardContent className="py-12 text-center"><div className="mx-auto h-12 w-12 rounded-full bg-muted grid place-items-center mb-3"><UserCheck className="h-6 w-6 text-muted-foreground" /></div><div className="font-medium">No approver configured yet</div><div className="text-sm text-muted-foreground mt-1">Please contact your administrator.</div></CardContent></Card>
      ) : (
        <div className="relative">
          <div className="absolute left-[27px] top-4 bottom-4 w-px bg-border md:left-[31px]" aria-hidden />
          <div className="space-y-4">
            {approvers.map((a, idx) => {
              const isFinal = idx === approvers.length - 1;
              const isAdmin = a.roles.includes("admin");
              const isSupervisor = a.roles.includes("supervisor");
              return (
                <div key={a.user_id + idx} className="relative pl-16 md:pl-20">
                  <div className="absolute left-0 top-3 h-14 w-14 md:h-16 md:w-16 rounded-full bg-primary/10 border-2 border-primary/30 grid place-items-center"><span className="text-primary font-bold text-lg">{a.level}</span></div>
                  <Card className="overflow-hidden"><CardContent className="p-4"><div className="flex items-start gap-4 flex-wrap">
                    <div className="h-12 w-12 rounded-full bg-secondary text-secondary-foreground grid place-items-center font-semibold shrink-0">{initials(a.full_name, a.email)}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <div className="font-semibold text-base truncate">{a.full_name || a.email || "Unknown"}</div>
                        {isAdmin && <Badge className="bg-cat-purple text-cat-purple-fg border-transparent gap-1"><Crown className="h-3 w-3" /> Admin</Badge>}
                        {isSupervisor && !isAdmin && <Badge className="bg-cat-amber text-cat-amber-fg border-transparent gap-1"><Shield className="h-3 w-3" /> Supervisor</Badge>}
                        {isFinal && <Badge variant="outline" className="gap-1"><CheckCircle2 className="h-3 w-3" /> Final approver</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Level {a.level}</div>
                      <div className="mt-2 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm text-muted-foreground">
                        {a.department_name && <span className="flex items-center gap-1.5"><Building2 className="h-3.5 w-3.5" /> {a.department_name}</span>}
                        {a.email && <a href={`mailto:${a.email}`} className="flex items-center gap-1.5 hover:text-foreground transition-colors"><Mail className="h-3.5 w-3.5" /> {a.email}</a>}
                      </div>
                    </div>
                  </div></CardContent></Card>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
