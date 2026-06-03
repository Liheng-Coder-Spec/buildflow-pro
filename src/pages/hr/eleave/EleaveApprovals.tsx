import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/eleave/StatusPill";
import { toast } from "sonner";
import { leaveAction } from "@/lib/eleave/leave";
import { replacementAction } from "@/lib/eleave/replacement";
import useSEO from "@/hooks/useSEO";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Check, X, CalendarClock } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

type ReviewKind = "leave" | "replacement";

export default function EleaveApprovals() {
  useSEO({ title: "E-Leave Approvals" });
  const { user } = useAuth();
  const sb = supabase as any;
  const [rows, setRows] = useState<any[]>([]);
  const [replRows, setReplRows] = useState<any[]>([]);
  const [open, setOpen] = useState<any | null>(null);
  const [openKind, setOpenKind] = useState<ReviewKind>("leave");
  const [mode, setMode] = useState<"approve" | "reject" | null>(null);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data: appr } = await sb.from("request_approvals").select("request_id, level").eq("approver_id", user.id).is("decision", null);
    const ids = (appr ?? []).map((a: any) => a.request_id);
    let leaveRows: any[] = [];
    if (ids.length) {
      const { data: reqs } = await sb.from("leave_requests").select("*, leave_types(name,color)").in("id", ids).in("status", ["pending", "pending_cancellation"]);
      const userIds = Array.from(new Set((reqs ?? []).map((r: any) => r.user_id)));
      const { data: profs } = userIds.length ? await sb.from("profiles").select("id, full_name, email").in("id", userIds) : { data: [] as any[] };
      const profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      const byId = new Map((appr ?? []).map((a: any) => [a.request_id, a.level]));
      leaveRows = (reqs ?? []).filter((r: any) => r.current_level === byId.get(r.id)).map((r: any) => ({ ...r, profiles: profMap.get(r.user_id) }));
    }
    setRows(leaveRows);

    const { data: roleRow } = await sb.from("user_roles").select("role").eq("user_id", user.id);
    const isAdmin = (roleRow ?? []).some((r: any) => r.role === "admin");

    let q = sb.from("replacement_credits").select("*").eq("status", "pending");
    if (isAdmin) q = q.eq("current_level", 2);
    else q = q.eq("current_level", 1).eq("supervisor_id", user.id);
    const { data: claims } = await q.order("created_at", { ascending: false });
    const claimUserIds = Array.from(new Set((claims ?? []).map((c: any) => c.user_id)));
    const { data: cprofs } = claimUserIds.length ? await sb.from("profiles").select("id, full_name, email").in("id", claimUserIds) : { data: [] as any[] };
    const cprofMap = new Map((cprofs ?? []).map((p: any) => [p.id, p]));
    setReplRows((claims ?? []).map((c: any) => ({ ...c, profiles: cprofMap.get(c.user_id) })));
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const openReview = (row: any, m: "approve" | "reject", kind: ReviewKind = "leave") => { setOpen(row); setOpenKind(kind); setMode(m); setComment(""); };
  const closeDialog = () => { setOpen(null); setMode(null); setComment(""); };

  const decide = async () => {
    if (!open || !mode) return;
    const trimmed = comment.trim();
    if (!trimmed) { toast.error(mode === "reject" ? "A rejection reason is required." : "A comment is required for approval."); return; }
    setSubmitting(true);
    try {
      if (openKind === "replacement") {
        await replacementAction(mode, { claim_id: open.id, payload: { comment: trimmed } });
      } else {
        const realAction = open.status === "pending_cancellation" ? (mode === "approve" ? "approve_cancel" : "deny_cancel") : mode;
        await leaveAction(realAction, { request_id: open.id, payload: { comment: trimmed } });
      }
      toast.success(mode === "approve" ? "Approved" : "Rejected");
      closeDialog(); load();
    } catch (e: any) { toast.error(e.message); } finally { setSubmitting(false); }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">E-Leave Approvals inbox</h1>

      <Tabs defaultValue="leave" className="space-y-4">
        <TabsList>
          <TabsTrigger value="leave">Leave requests {rows.length > 0 && <span className="ml-1.5 rounded-full bg-primary/15 text-primary px-1.5 text-xs">{rows.length}</span>}</TabsTrigger>
          <TabsTrigger value="replacement"><CalendarClock className="h-3.5 w-3.5 mr-1" />Replacement claims {replRows.length > 0 && <span className="ml-1.5 rounded-full bg-primary/15 text-primary px-1.5 text-xs">{replRows.length}</span>}</TabsTrigger>
        </TabsList>

        <TabsContent value="leave">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Dates</TableHead><TableHead>Days</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {rows.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">Nothing pending.</TableCell></TableRow> :
                  rows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><div className="text-sm font-medium">{r.profiles?.full_name}</div><div className="text-xs text-muted-foreground">{r.profiles?.email}</div></TableCell>
                      <TableCell>{r.leave_types?.name}</TableCell>
                      <TableCell className="text-sm">{r.start_date} → {r.end_date}</TableCell>
                      <TableCell>{r.days}</TableCell>
                      <TableCell><StatusPill status={r.status} /></TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openReview(r, "reject", "leave")}><X className="h-4 w-4 mr-1" /> Reject</Button>
                        <Button size="sm" onClick={() => openReview(r, "approve", "leave")}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>

        <TabsContent value="replacement">
          <Card className="overflow-hidden">
            <Table>
              <TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Worked date</TableHead><TableHead>Period</TableHead><TableHead>Days</TableHead><TableHead>Stage</TableHead><TableHead className="text-right">Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {replRows.length === 0 ? <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-8">No replacement claims pending.</TableCell></TableRow> :
                  replRows.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell><div className="text-sm font-medium">{r.profiles?.full_name}</div><div className="text-xs text-muted-foreground">{r.profiles?.email}</div></TableCell>
                      <TableCell className="text-sm">{r.worked_date}</TableCell>
                      <TableCell className="uppercase text-xs">{r.period}</TableCell>
                      <TableCell>{r.days}</TableCell>
                      <TableCell><span className="text-xs text-muted-foreground">Level {r.current_level}/{r.total_levels}</span></TableCell>
                      <TableCell className="text-right"><div className="flex justify-end gap-2">
                        <Button size="sm" variant="outline" onClick={() => openReview(r, "reject", "replacement")}><X className="h-4 w-4 mr-1" /> Reject</Button>
                        <Button size="sm" onClick={() => openReview(r, "approve", "replacement")}><Check className="h-4 w-4 mr-1" /> Approve</Button>
                      </div></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Card>
        </TabsContent>
      </Tabs>

      <Dialog open={!!open} onOpenChange={(o) => !o && closeDialog()}>
        <DialogContent>
          <DialogHeader><DialogTitle>{openKind === "replacement" ? (mode === "approve" ? "Approve replacement claim" : "Reject replacement claim") : open?.status === "pending_cancellation" ? (mode === "approve" ? "Approve cancellation" : "Reject cancellation") : (mode === "approve" ? "Approve request" : "Reject request")}</DialogTitle></DialogHeader>
          {open && (
            <div className="space-y-3 text-sm">
              <div><span className="text-muted-foreground">Employee: </span>{open.profiles?.full_name}</div>
              {openKind === "replacement" ? (
                <>
                  <div><span className="text-muted-foreground">Worked date: </span>{open.worked_date} ({String(open.period).toUpperCase()})</div>
                  <div><span className="text-muted-foreground">Days to credit: </span>{open.days}</div>
                  {open.reason && <div><span className="text-muted-foreground">Reason: </span>{open.reason}</div>}
                  {open.supervisor_comment && open.current_level === 2 && <div><span className="text-muted-foreground">Supervisor note: </span>{open.supervisor_comment}</div>}
                </>
              ) : (
                <>
                  <div><span className="text-muted-foreground">Type: </span>{open.leave_types?.name}</div>
                  <div><span className="text-muted-foreground">Dates: </span>{open.start_date} → {open.end_date} ({open.days} day(s))</div>
                  {open.reason && <div><span className="text-muted-foreground">Reason: </span>{open.reason}</div>}
                  {open.cancellation_reason && <div><span className="text-muted-foreground">Cancellation reason: </span>{open.cancellation_reason}</div>}
                </>
              )}
              <div className="space-y-1.5">
                <Label htmlFor="decision-comment">{mode === "reject" ? "Rejection reason" : "Approval comment"}<span className="text-destructive ml-0.5">*</span></Label>
                <Textarea id="decision-comment" placeholder={mode === "reject" ? "Explain why this is being rejected…" : "Add a brief comment for the employee…"} value={comment} onChange={(e) => setComment(e.target.value)} rows={4} required />
                <p className="text-xs text-muted-foreground">This message will be sent to the employee.</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} disabled={submitting}>Cancel</Button>
            <Button variant={mode === "reject" ? "destructive" : "default"} onClick={decide} disabled={submitting || !comment.trim()}>{submitting ? "Submitting…" : mode === "approve" ? "Confirm approve" : "Confirm reject"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
