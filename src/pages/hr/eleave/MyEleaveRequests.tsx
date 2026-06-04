// @ts-nocheck
import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/eleave/StatusPill";
import { toast } from "sonner";
import { leaveAction } from "@/lib/eleave/leave";
import useSEO from "@/hooks/useSEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { XCircle } from "lucide-react";
import { ApprovalChainTimeline, type ApprovalStep } from "@/components/eleave/ApprovalChainTimeline";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

type ApprovalRow = {
  request_id: string;
  level: number;
  decision: string | null;
  comment: string | null;
  decided_at: string | null;
  approver_id: string;
};

export default function MyEleaveRequests() {
  useSEO({ title: "My E-Leave requests" });
  const { user } = useAuth();
  const sb = supabase as any;
  const [rows, setRows] = useState<any[]>([]);
  const [approvalsByReq, setApprovalsByReq] = useState<Record<string, (ApprovalRow & { approver_name?: string; approver_email?: string })[]>>({});
  const [cancelTarget, setCancelTarget] = useState<any | null>(null);
  const [cancelReason, setCancelReason] = useState("");
  const [submittingCancel, setSubmittingCancel] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await sb.from("eleave_leave_requests").select("*, leave_types(name,color,cancel_cutoff_days)").eq("user_id", user.id).order("created_at", { ascending: false });
    const list = data ?? [];
    setRows(list);

    const ids = list.map((r: any) => r.id);
    if (!ids.length) { setApprovalsByReq({}); return; }
    const { data: appr } = await sb.from("eleave_request_approvals").select("request_id, level, decision, comment, decided_at, approver_id").in("request_id", ids).order("level", { ascending: true });
    const approverIds = Array.from(new Set((appr ?? []).map((a: any) => a.approver_id)));
    const { data: profs } = approverIds.length ? await sb.from("profiles").select("id, full_name, email").in("id", approverIds) : { data: [] as any[] };
    const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
    const grouped: Record<string, any[]> = {};
    for (const a of appr ?? []) {
      const p = profMap.get(a.approver_id);
      (grouped[a.request_id] ||= []).push({ ...a, approver_name: p?.full_name, approver_email: p?.email });
    }
    setApprovalsByReq(grouped);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const act = async (action: string, request_id: string) => {
    try { await leaveAction(action, { request_id, payload: { reason: "User initiated" } }); toast.success("Done"); load(); } catch (e: any) { toast.error(e.message); }
  };

  const openCancelDialog = (row: any) => { setCancelTarget(row); setCancelReason(""); };
  const closeCancelDialog = () => { setCancelTarget(null); setCancelReason(""); };

  const submitCancel = async () => {
    if (!cancelTarget) return;
    const reason = cancelReason.trim();
    if (!reason) { toast.error("Please provide a reason for cancellation."); return; }
    setSubmittingCancel(true);
    try {
      await leaveAction("request_cancel", { request_id: cancelTarget.id, payload: { reason } });
      toast.success("Cancellation request sent for approval");
      closeCancelDialog();
      load();
    } catch (e: any) { toast.error(e.message); } finally { setSubmittingCancel(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">My E-Leave requests</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Dates</TableHead>
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Approver feedback</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No requests yet.</TableCell></TableRow>
            ) : (
              rows.map((r) => {
                const allApprovals = approvalsByReq[r.id] ?? [];
                const decided = allApprovals.filter((a) => a.decision);
                const isInFlight = r.status === "pending" || r.status === "pending_cancellation";
                const isFinalized = r.status === "approved" || r.status === "rejected" || r.status === "withdrawn";
                const steps: ApprovalStep[] = allApprovals.map((a) => ({ level: a.level, approver_name: a.approver_name, approver_email: a.approver_email, decision: a.decision as any, comment: a.comment, decided_at: a.decided_at }));
                return (
                  <TableRow key={r.id}>
                    <TableCell className="font-medium align-top">{r.leave_types?.name}</TableCell>
                    <TableCell className="text-sm align-top">{r.start_date} → {r.end_date}</TableCell>
                    <TableCell className="align-top">{r.days}</TableCell>
                    <TableCell className="align-top"><StatusPill status={r.status} /></TableCell>
                    <TableCell className="align-top max-w-sm">
                      {r.status === "pending_cancellation" && r.cancellation_reason && (
                        <div className="mb-2 text-xs"><span className="font-medium">Cancellation reason: </span><span className="italic text-muted-foreground">"{r.cancellation_reason}"</span></div>
                      )}
                      {isInFlight && allApprovals.length > 0 && (
                        <ApprovalChainTimeline approvals={steps} current_level={r.current_level} total_levels={r.total_levels} variant="full" isCancellation={r.status === "pending_cancellation"} />
                      )}
                      {isFinalized && decided.length > 0 && (
                        <div className="space-y-1.5">
                          {decided.map((a) => (
                            <div key={`${a.level}-${a.decided_at}`} className="text-xs">
                              <span className="font-medium">L{a.level} · {a.approver_name ?? "Approver"}: </span>
                              <span className={a.decision === "rejected" ? "text-destructive" : "text-foreground"}>{a.decision === "approved" ? "Approved" : "Rejected"}</span>
                              {a.comment && <div className="text-muted-foreground italic mt-0.5">"{a.comment}"</div>}
                            </div>
                          ))}
                        </div>
                      )}
                      {isFinalized && decided.length === 0 && <span className="text-xs text-muted-foreground">No feedback</span>}
                      {isInFlight && allApprovals.length === 0 && <span className="text-xs text-muted-foreground italic">Approver not assigned — contact admin</span>}
                    </TableCell>
                    <TableCell className="text-right space-x-2 align-top">
                      {r.status === "pending" && <Button size="sm" variant="outline" onClick={() => act("withdraw", r.id)}>Withdraw</Button>}
                      {r.status === "approved" && (() => {
                        const cutoffDays = Number(r.leave_types?.cancel_cutoff_days ?? 0);
                        if (cutoffDays <= 0) return null;
                        const cutoffDate = new Date(r.created_at);
                        cutoffDate.setDate(cutoffDate.getDate() + cutoffDays);
                        cutoffDate.setHours(23, 59, 59, 999);
                        const windowOpen = Date.now() <= cutoffDate.getTime();
                        if (windowOpen) {
                          return (<Button size="sm" variant="outline" onClick={() => openCancelDialog(r)}><XCircle className="h-4 w-4 mr-1" /> Request cancel</Button>);
                        }
                        const y = cutoffDate.getFullYear();
                        const m = String(cutoffDate.getMonth() + 1).padStart(2, "0");
                        const d = String(cutoffDate.getDate()).padStart(2, "0");
                        const cutoffStr = `${y}/${m}/${d}`;
                        return (
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild><span className="inline-block"><Button size="sm" variant="outline" disabled className="pointer-events-none opacity-60"><XCircle className="h-4 w-4 mr-1" /> Request cancel</Button></span></TooltipTrigger>
                              <TooltipContent>Cancel Request closed on {cutoffStr}. Contact HR for Cancel.</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        );
                      })()}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!cancelTarget} onOpenChange={(o) => !o && closeCancelDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request leave cancellation</DialogTitle>
            <DialogDescription>This sends a cancellation request back to your approver(s) for review. Your leave stays approved until they decide.</DialogDescription>
          </DialogHeader>
          {cancelTarget && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Type: </span>{cancelTarget.leave_types?.name}</div>
              <div><span className="text-muted-foreground">Dates: </span>{cancelTarget.start_date} → {cancelTarget.end_date} ({cancelTarget.days} day(s))</div>
              <div className="space-y-1.5">
                <Label htmlFor="cancel-reason">Reason for cancellation<span className="text-destructive ml-0.5">*</span></Label>
                <Textarea id="cancel-reason" placeholder="Explain why you need to cancel this approved leave…" value={cancelReason} onChange={(e) => setCancelReason(e.target.value)} rows={4} required />
                <p className="text-xs text-muted-foreground">Your approver(s) will see this reason and decide whether to approve or reject the cancellation.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeCancelDialog} disabled={submittingCancel}>Back</Button>
            <Button onClick={submitCancel} disabled={submittingCancel || !cancelReason.trim()}>{submittingCancel ? "Sending…" : "Send cancel request"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
