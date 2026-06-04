import * as React from "react";
import { format, parseISO, startOfMonth, endOfMonth } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Plus, Calculator, Download, Loader2, DollarSign, FileSpreadsheet, AlertTriangle,
  ChevronRight, RotateCcw, Settings,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import {
  PAYROLL_LIFECYCLE_LABELS,
  PAYROLL_LIFECYCLE_TONE,
  PAYROLL_NEXT_ACTION,
  PAYROLL_APPROVAL_CHAIN,
  PayrollLifecycleStatus,
  PayrollBlocker,
  blockerToneClass,
  canTransition,
} from "@/lib/payrollMeta";
import { PayrollLifecycleStepper } from "@/components/payroll/PayrollLifecycleStepper";
import * as PayrollSvc from "@/services/payrollService";
import { invokeXlsxDownload } from "@/lib/xlsxDownload";
import { formatCurrency, formatHours } from "@/lib/timesheetMeta";

interface ProfileLite {
  id: string;
  full_name: string;
  employee_id: string | null;
}

export default function Payroll() {
  const { roles } = useAuth();
  const canManage =
    roles.includes("admin") || roles.includes("accountant") ||
    (roles as string[]).includes("hr_manager") || (roles as string[]).includes("hr_officer") ||
    (roles as string[]).includes("finance_manager") || (roles as string[]).includes("director");

  const [periods, setPeriods] = React.useState<PayrollSvc.PayrollPeriod[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [lines, setLines] = React.useState<PayrollSvc.PayrollLine[]>([]);
  const [allocations, setAllocations] = React.useState<PayrollSvc.PayrollCostAllocation[]>([]);
  const [steps, setSteps] = React.useState<PayrollSvc.PayrollApprovalStep[]>([]);
  const [audit, setAudit] = React.useState<PayrollSvc.PayrollAuditEntry[]>([]);
  const [blockers, setBlockers] = React.useState<PayrollBlocker[]>([]);
  const [profiles, setProfiles] = React.useState<ProfileLite[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [busy, setBusy] = React.useState(false);

  const [periodDialog, setPeriodDialog] = React.useState(false);
  const [newPeriod, setNewPeriod] = React.useState({
    name: format(new Date(), "MMMM yyyy"),
    period_start: format(startOfMonth(new Date()), "yyyy-MM-dd"),
    period_end: format(endOfMonth(new Date()), "yyyy-MM-dd"),
  });

  const [rejectDialog, setRejectDialog] = React.useState(false);
  const [rejectComment, setRejectComment] = React.useState("");

  const profMap = React.useMemo(
    () => new Map(profiles.map((p) => [p.id, p])),
    [profiles],
  );

  const loadAll = React.useCallback(async () => {
    setLoading(true);
    try {
      const [ps, profRes] = await Promise.all([
        PayrollSvc.listPeriods(),
        supabase.from("profiles").select("id, full_name, employee_id").order("full_name"),
      ]);
      setPeriods(ps);
      setProfiles((profRes.data ?? []) as ProfileLite[]);
      if (!activeId && ps.length > 0) setActiveId(ps[0].id);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }, [activeId]);

  React.useEffect(() => { loadAll(); }, [loadAll]);

  const loadDetails = React.useCallback(async () => {
    if (!activeId) {
      setLines([]); setAllocations([]); setSteps([]); setAudit([]); setBlockers([]);
      return;
    }
    try {
      const [ln, al, st, ad, bl] = await Promise.all([
        PayrollSvc.listLines(activeId),
        PayrollSvc.listCostAllocations(activeId),
        PayrollSvc.listApprovalSteps(activeId),
        PayrollSvc.listAudit(activeId),
        PayrollSvc.checkBlockers(activeId).catch(() => []),
      ]);
      setLines(ln); setAllocations(al); setSteps(st); setAudit(ad); setBlockers(bl);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load details");
    }
  }, [activeId]);

  React.useEffect(() => { loadDetails(); }, [loadDetails]);

  const activePeriod = periods.find((p) => p.id === activeId) ?? null;
  const currentStatus: PayrollLifecycleStatus =
    (activePeriod?.status as PayrollLifecycleStatus) ?? "draft";
  const nextAction = PAYROLL_NEXT_ACTION[currentStatus];
  const canDoNext = canTransition(currentStatus, roles as string[]);

  const totals = React.useMemo(() => ({
    gross: lines.reduce((s, l) => s + Number(l.gross_salary || 0), 0),
    tos: lines.reduce((s, l) => s + Number(l.tos_amount || 0), 0),
    nssf: lines.reduce((s, l) => s + Number(l.nssf_employee || 0) + Number(l.nssf_employer || 0), 0),
    net: lines.reduce((s, l) => s + Number(l.net_salary || 0), 0),
  }), [lines]);

  const criticalBlockers = blockers.filter((b) => b.severity === "critical");

  const createPeriod = async () => {
    setBusy(true);
    try {
      const p = await PayrollSvc.createPeriod(newPeriod);
      toast.success("Period created");
      setPeriodDialog(false);
      setActiveId(p.id);
      await loadAll();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed");
    } finally { setBusy(false); }
  };

  const doCompute = async () => {
    if (!activeId) return;
    setBusy(true);
    try {
      const n = await PayrollSvc.computePayroll(activeId);
      toast.success(`Computed ${n} lines`);
      await Promise.all([loadAll(), loadDetails()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Compute failed");
    } finally { setBusy(false); }
  };

  const doTransition = async (to: PayrollLifecycleStatus, comment?: string) => {
    if (!activeId) return;
    if (criticalBlockers.length > 0 &&
        ["finance_verification", "pending_approval", "approved", "locked"].includes(to)) {
      toast.error("Resolve critical blockers before advancing");
      return;
    }
    setBusy(true);
    try {
      await PayrollSvc.transitionPeriod(activeId, to, comment);
      toast.success(`Moved to ${PAYROLL_LIFECYCLE_LABELS[to]}`);
      await Promise.all([loadAll(), loadDetails()]);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Transition failed");
    } finally { setBusy(false); }
  };

  const doReject = async () => {
    if (!rejectComment.trim()) { toast.error("Please provide a reason"); return; }
    await doTransition("under_review", rejectComment.trim());
    setRejectDialog(false);
    setRejectComment("");
  };

  const exportXlsx = async () => {
    if (!activeId || !activePeriod) return;
    setBusy(true);
    try {
      await invokeXlsxDownload(
        "export-payroll-xlsx",
        { period_id: activeId },
        `payroll-${activePeriod.name.replace(/\s+/g, "-")}.xlsx`,
      );
      toast.success("Excel file downloaded");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Export failed");
    } finally { setBusy(false); }
  };

  if (!canManage) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Payroll</h1>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">Restricted area</p>
            <p className="text-sm">Only HR and Finance roles can access payroll.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold">Payroll</h1>
          <p className="text-muted-foreground">
            Cambodia-compliant payroll lifecycle, tax engine, and cost allocation
          </p>
        </div>
        <Button variant="outline" onClick={() => setPeriodDialog(true)}>
          <Plus className="h-4 w-4 mr-1" /> New Period
        </Button>
      </div>

      {/* Period selector */}
      <div className="flex items-center gap-3 flex-wrap">
        <Select value={activeId ?? ""} onValueChange={setActiveId}>
          <SelectTrigger className="w-[340px]">
            <SelectValue placeholder="Select pay period" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((p) => (
              <SelectItem key={p.id} value={p.id}>
                {p.name} ({format(parseISO(p.period_start), "MMM d")} – {format(parseISO(p.period_end), "MMM d")})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {activePeriod && (
          <span className={cn(
            "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
            PAYROLL_LIFECYCLE_TONE[currentStatus],
          )}>
            {PAYROLL_LIFECYCLE_LABELS[currentStatus]}
          </span>
        )}
      </div>

      {!activePeriod ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <DollarSign className="h-12 w-12 mx-auto mb-3 opacity-30" />
            <p className="font-medium">No pay period yet</p>
            <p className="text-sm">Create a period to begin.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Lifecycle stepper */}
          <Card>
            <CardContent className="pt-6">
              <PayrollLifecycleStepper current={currentStatus} />
            </CardContent>
          </Card>

          {/* Action bar */}
          <div className="flex items-center gap-2 flex-wrap">
            {currentStatus === "collecting" || currentStatus === "draft" ? (
              <Button variant="outline" onClick={doCompute} disabled={busy}>
                {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Calculator className="h-4 w-4 mr-1" />}
                Compute Payroll
              </Button>
            ) : null}

            {nextAction && canDoNext && (
              <Button
                onClick={() => doTransition(nextAction.to)}
                disabled={busy}
              >
                {busy ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <ChevronRight className="h-4 w-4 mr-1" />}
                {nextAction.label}
              </Button>
            )}

            {["under_review", "finance_verification", "pending_approval"].includes(currentStatus) && canDoNext && (
              <Button variant="outline" onClick={() => setRejectDialog(true)} disabled={busy}>
                <RotateCcw className="h-4 w-4 mr-1" /> Reject & Return
              </Button>
            )}

            {lines.length > 0 && (
              <Button variant="outline" onClick={exportXlsx} disabled={busy}>
                <Download className="h-4 w-4 mr-1" /> Export Excel
              </Button>
            )}

            <div className="flex-1" />
            {nextAction && !canDoNext && (
              <span className="text-xs text-muted-foreground">
                Awaiting: {nextAction.roles.join(" / ")}
              </span>
            )}
          </div>

          {/* Blocker panel */}
          {blockers.length > 0 && (
            <Card className="border-warning/40">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-semibold flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-warning" />
                  Blockers ({blockers.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {blockers.map((b, i) => (
                  <div
                    key={i}
                    className={cn(
                      "rounded border px-3 py-2 text-sm flex items-center justify-between gap-2",
                      blockerToneClass(b.severity),
                    )}
                  >
                    <span>
                      <span className="font-medium uppercase text-[10px] mr-2">{b.severity}</span>
                      {b.message}
                    </span>
                    {b.user_id && (
                      <span className="text-xs opacity-70">
                        {profMap.get(b.user_id)?.full_name ?? b.user_id.slice(0, 8)}
                      </span>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}

          {/* KPI cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Employees</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold num">{lines.length}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Gross</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold num">{formatCurrency(totals.gross)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">TOS Tax</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold num text-warning">{formatCurrency(totals.tos)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">NSSF Total</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold num">{formatCurrency(totals.nssf)}</div></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-muted-foreground">Net Payroll</CardTitle></CardHeader>
              <CardContent><div className="text-2xl font-bold num text-success">{formatCurrency(totals.net)}</div></CardContent>
            </Card>
          </div>

          <Tabs defaultValue="lines" className="space-y-4">
            <TabsList>
              <TabsTrigger value="lines">Lines</TabsTrigger>
              <TabsTrigger value="allocation">Cost Allocation</TabsTrigger>
              <TabsTrigger value="approvals">Approval Trail</TabsTrigger>
              <TabsTrigger value="audit">Audit Log</TabsTrigger>
              <TabsTrigger value="admin"><Settings className="h-3.5 w-3.5 mr-1" />Tax Setup</TabsTrigger>
            </TabsList>

            <TabsContent value="lines">
              <Card>
                <CardContent className="p-0">
                  {loading ? (
                    <div className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
                  ) : lines.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">
                      <FileSpreadsheet className="h-12 w-12 mx-auto mb-3 opacity-30" />
                      <p className="font-medium">No payroll lines yet</p>
                      <p className="text-sm">Click "Compute Payroll" to generate from approved timesheets and salaries.</p>
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead className="text-right">Base</TableHead>
                          <TableHead className="text-right">Allow.</TableHead>
                          <TableHead className="text-right">Gross</TableHead>
                          <TableHead className="text-right">Relief</TableHead>
                          <TableHead className="text-right">TOS</TableHead>
                          <TableHead className="text-right">NSSF (E/Er)</TableHead>
                          <TableHead className="text-right">Net</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lines.map((l) => {
                          const p = profMap.get(l.user_id);
                          return (
                            <TableRow key={l.id}>
                              <TableCell>
                                <div className="font-medium">{p?.full_name ?? "—"}</div>
                                <div className="text-xs text-muted-foreground">{p?.employee_id ?? ""}</div>
                              </TableCell>
                              <TableCell className="text-right num">{formatCurrency(l.base_salary, l.currency)}</TableCell>
                              <TableCell className="text-right num">{formatCurrency(l.allowances_total, l.currency)}</TableCell>
                              <TableCell className="text-right num">{formatCurrency(l.gross_salary, l.currency)}</TableCell>
                              <TableCell className="text-right num text-muted-foreground">{formatCurrency(l.tax_relief, l.currency)}</TableCell>
                              <TableCell className="text-right num text-warning">{formatCurrency(l.tos_amount, l.currency)}</TableCell>
                              <TableCell className="text-right num text-xs">
                                {formatCurrency(l.nssf_employee, l.currency)} / {formatCurrency(l.nssf_employer, l.currency)}
                              </TableCell>
                              <TableCell className="text-right num font-semibold text-success">
                                {formatCurrency(l.net_salary, l.currency)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="allocation">
              <Card>
                <CardContent className="p-0">
                  {allocations.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">No cost allocations yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Employee</TableHead>
                          <TableHead>Project</TableHead>
                          <TableHead className="text-right">Hours</TableHead>
                          <TableHead className="text-right">Allocation %</TableHead>
                          <TableHead className="text-right">Amount</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {allocations.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell>{profMap.get(a.user_id)?.full_name ?? "—"}</TableCell>
                            <TableCell className="text-xs font-mono">{a.project_id?.slice(0, 8) ?? "—"}</TableCell>
                            <TableCell className="text-right num">{formatHours(a.hours)}</TableCell>
                            <TableCell className="text-right num">{(Number(a.allocation_pct) * 100).toFixed(1)}%</TableCell>
                            <TableCell className="text-right num">{formatCurrency(a.allocated_amount, a.currency)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="approvals">
              <Card>
                <CardContent className="pt-6 space-y-3">
                  {PAYROLL_APPROVAL_CHAIN.map((c) => {
                    const step = steps.find((s) => s.step_no === c.step);
                    return (
                      <div key={c.step} className="flex items-center justify-between gap-3 border rounded p-3">
                        <div>
                          <div className="font-medium text-sm">Step {c.step}. {c.label}</div>
                          <div className="text-xs text-muted-foreground">Role: {c.role}</div>
                        </div>
                        <div className="text-right">
                          {step ? (
                            <>
                              <div className={cn(
                                "text-xs font-medium",
                                step.decision === "approved" && "text-success",
                                step.decision === "rejected" && "text-destructive",
                                step.decision === "pending" && "text-muted-foreground",
                              )}>
                                {step.decision.toUpperCase()}
                              </div>
                              {step.decided_at && (
                                <div className="text-[11px] text-muted-foreground">
                                  {format(parseISO(step.decided_at), "MMM d, HH:mm")}
                                </div>
                              )}
                              {step.comment && <div className="text-xs italic">{step.comment}</div>}
                            </>
                          ) : (
                            <div className="text-xs text-muted-foreground">Pending</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {activePeriod.rejection_reason && (
                    <div className="rounded border border-destructive/40 bg-destructive-soft text-destructive px-3 py-2 text-sm">
                      <span className="font-medium">Rejection note: </span>{activePeriod.rejection_reason}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="audit">
              <Card>
                <CardContent className="p-0">
                  {audit.length === 0 ? (
                    <div className="p-12 text-center text-muted-foreground">No audit entries yet.</div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>When</TableHead>
                          <TableHead>Action</TableHead>
                          <TableHead>Severity</TableHead>
                          <TableHead>Comment</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {audit.map((a) => (
                          <TableRow key={a.id}>
                            <TableCell className="text-xs">{format(parseISO(a.created_at), "MMM d, HH:mm:ss")}</TableCell>
                            <TableCell className="text-sm">{a.action}</TableCell>
                            <TableCell>
                              <span className={cn(
                                "text-[10px] uppercase font-medium rounded px-1.5 py-0.5",
                                a.severity === "critical" && "bg-destructive-soft text-destructive",
                                a.severity === "high" && "bg-warning-soft text-warning",
                                a.severity === "medium" && "bg-info-soft text-info",
                                a.severity === "low" && "bg-muted text-muted-foreground",
                              )}>{a.severity}</span>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground">{a.comment ?? "—"}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="admin">
              <TaxAdminPanel />
            </TabsContent>
          </Tabs>
        </>
      )}

      {/* New period dialog */}
      <Dialog open={periodDialog} onOpenChange={setPeriodDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New Pay Period</DialogTitle>
            <DialogDescription>Define a pay period to aggregate hours.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input value={newPeriod.name} onChange={(e) => setNewPeriod({ ...newPeriod, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Start</Label>
                <Input type="date" value={newPeriod.period_start} onChange={(e) => setNewPeriod({ ...newPeriod, period_start: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>End</Label>
                <Input type="date" value={newPeriod.period_end} onChange={(e) => setNewPeriod({ ...newPeriod, period_end: e.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPeriodDialog(false)}>Cancel</Button>
            <Button onClick={createPeriod} disabled={busy}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reject dialog */}
      <Dialog open={rejectDialog} onOpenChange={setRejectDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Return for Revision</DialogTitle>
            <DialogDescription>Return this period to HR for correction.</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectComment}
            onChange={(e) => setRejectComment(e.target.value)}
            rows={4}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialog(false)}>Cancel</Button>
            <Button variant="destructive" onClick={doReject} disabled={busy}>Reject & Return</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// Tax Admin Panel — brackets / relief / NSSF inline editors
// ============================================================
function TaxAdminPanel() {
  const { roles } = useAuth();
  const isAdmin = roles.includes("admin");
  const [brackets, setBrackets] = React.useState<PayrollSvc.TaxBracket[]>([]);
  const [reliefs, setReliefs] = React.useState<PayrollSvc.TaxReliefRule[]>([]);
  const [nssf, setNssf] = React.useState<PayrollSvc.NssfRule[]>([]);
  const [loading, setLoading] = React.useState(true);

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const [b, r, n] = await Promise.all([
        PayrollSvc.listTaxBrackets(),
        PayrollSvc.listReliefRules(),
        PayrollSvc.listNssfRules(),
      ]);
      setBrackets(b); setReliefs(r); setNssf(n);
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Failed to load tax setup");
    } finally { setLoading(false); }
  }, []);

  React.useEffect(() => { load(); }, [load]);

  if (loading) {
    return <Card><CardContent className="p-6 space-y-3">{[...Array(3)].map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}</CardContent></Card>;
  }

  return (
    <Tabs defaultValue="brackets" className="space-y-4">
      <TabsList>
        <TabsTrigger value="brackets">Tax Brackets (TOS)</TabsTrigger>
        <TabsTrigger value="relief">Tax Relief</TabsTrigger>
        <TabsTrigger value="nssf">NSSF Rates</TabsTrigger>
      </TabsList>

      <TabsContent value="brackets">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                  <TableHead className="text-right">Max</TableHead>
                  <TableHead className="text-right">Rate</TableHead>
                  <TableHead className="text-right">Fixed Ded.</TableHead>
                  <TableHead>Effective From</TableHead>
                  <TableHead>Notes</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brackets.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell>{b.currency}</TableCell>
                    <TableCell className="text-right num">{Number(b.min_amount).toLocaleString()}</TableCell>
                    <TableCell className="text-right num">{b.max_amount ? Number(b.max_amount).toLocaleString() : "∞"}</TableCell>
                    <TableCell className="text-right num">{(Number(b.rate) * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right num">{Number(b.fixed_deduction).toLocaleString()}</TableCell>
                    <TableCell>{b.effective_from}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">{b.notes ?? ""}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        {!isAdmin && <p className="text-xs text-muted-foreground mt-2">Read-only — admin role required to edit.</p>}
      </TabsContent>

      <TabsContent value="relief">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Per Dependent</TableHead>
                  <TableHead>From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reliefs.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="font-mono text-xs">{r.code}</TableCell>
                    <TableCell>{r.name}</TableCell>
                    <TableCell>{r.currency}</TableCell>
                    <TableCell className="text-right num">{Number(r.amount).toLocaleString()}</TableCell>
                    <TableCell>{r.per_dependent ? "Yes" : "No"}</TableCell>
                    <TableCell>{r.effective_from}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="nssf">
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Scheme</TableHead>
                  <TableHead className="text-right">Employer Rate</TableHead>
                  <TableHead className="text-right">Employee Rate</TableHead>
                  <TableHead className="text-right">Salary Cap</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>From</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {nssf.map((n) => (
                  <TableRow key={n.id}>
                    <TableCell className="capitalize">{n.scheme.replace(/_/g, " ")}</TableCell>
                    <TableCell className="text-right num">{(Number(n.employer_rate) * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right num">{(Number(n.employee_rate) * 100).toFixed(2)}%</TableCell>
                    <TableCell className="text-right num">{n.salary_cap ? Number(n.salary_cap).toLocaleString() : "—"}</TableCell>
                    <TableCell>{n.currency}</TableCell>
                    <TableCell>{n.effective_from}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
}
