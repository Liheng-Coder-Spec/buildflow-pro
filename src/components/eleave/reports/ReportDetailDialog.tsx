import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { StatusPill } from "@/components/eleave/StatusPill";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { Check, X, Clock, FileText, Paperclip } from "lucide-react";
import { cn } from "@/lib/utils";

export type DetailRequest = {
  id: string;
  employee: string;
  email: string;
  department: string;
  supervisor: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string;
  cancellation_reason: string | null;
  attachment_urls: string[];
  created_at: string;
  updated_at: string;
};

type ApprovalRow = { level: number; approver_id: string; decision: string | null; comment: string | null; decided_at: string | null; created_at: string };
type AuditRow = { id: string; action: string; actor_id: string | null; details: any; created_at: string };

export function ReportDetailDialog({ open, onOpenChange, request, profileMap }: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  request: DetailRequest | null;
  profileMap: Map<string, { full_name: string; email: string }>;
}) {
  const [approvals, setApprovals] = useState<ApprovalRow[]>([]);
  const [audits, setAudits] = useState<AuditRow[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !request) return;
    setLoading(true);
    Promise.all([
      supabase.from("eleave_request_approvals").select("level, approver_id, decision, comment, decided_at, created_at").eq("request_id", request.id).order("level"),
      supabase.from("eleave_audit_log").select("id, action, actor_id, details, created_at").eq("entity", "leave_request").eq("entity_id", request.id).order("created_at"),
    ]).then(([a, b]) => {
      setApprovals((a.data as any) ?? []);
      setAudits((b.data as any) ?? []);
      setLoading(false);
    });
  }, [open, request]);

  if (!request) return null;

  const decisionIcon = (d: string | null) =>
    d === "approve" ? <Check className="h-4 w-4 text-cat-green-fg" /> :
    d === "reject" ? <X className="h-4 w-4 text-cat-red-fg" /> :
    <Clock className="h-4 w-4 text-cat-amber-fg" />;

  const decisionTone = (d: string | null) =>
    d === "approve" ? "bg-cat-green" :
    d === "reject" ? "bg-cat-red" :
    "bg-cat-amber";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" /> Leave request detail
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {/* Employee + Request blocks */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-lg border bg-card p-4">
              <div className="text-xs uppercase tracking-wider text-muted-foreground mb-2">Employee</div>
              <div className="font-medium">{request.employee}</div>
              <div className="text-sm text-muted-foreground">{request.email}</div>
              <div className="mt-2 text-sm"><span className="text-muted-foreground">Department: </span>{request.department || "—"}</div>
              <div className="text-sm"><span className="text-muted-foreground">Supervisor: </span>{request.supervisor || "—"}</div>
            </div>

            <div className="rounded-lg border bg-card p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs uppercase tracking-wider text-muted-foreground">Request</div>
                <StatusPill status={request.status} />
              </div>
              <div className="font-medium">{request.leave_type}</div>
              <div className="text-sm text-muted-foreground">
                {format(new Date(request.start_date), "MMM d, yyyy")} → {format(new Date(request.end_date), "MMM d, yyyy")} · {request.days} day(s)
              </div>
              {request.reason && <div className="mt-2 text-sm"><span className="text-muted-foreground">Reason: </span>{request.reason}</div>}
              {request.cancellation_reason && <div className="mt-1 text-sm"><span className="text-muted-foreground">Cancellation reason: </span>{request.cancellation_reason}</div>}
              {request.attachment_urls?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {request.attachment_urls.map((u, i) => (
                    <a key={i} href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs px-2 py-1 rounded bg-secondary hover:bg-secondary/80">
                      <Paperclip className="h-3 w-3" /> Attachment {i + 1}
                    </a>
                  ))}
                </div>
              )}
              <div className="mt-2 text-xs text-muted-foreground">
                Applied: {format(new Date(request.created_at), "PPp")} · Updated: {format(new Date(request.updated_at), "PPp")}
              </div>
            </div>
          </div>

          {/* Approval timeline */}
          <div>
            <div className="text-sm font-semibold mb-2">Approval timeline</div>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : approvals.length === 0 ? (
              <div className="text-sm text-muted-foreground">No approval records.</div>
            ) : (
              <div className="space-y-3">
                {approvals.map((a, idx) => {
                  const approver = profileMap.get(a.approver_id);
                  return (
                    <div key={idx} className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className={cn("h-8 w-8 rounded-full grid place-items-center", decisionTone(a.decision))}>
                          {decisionIcon(a.decision)}
                        </div>
                        {idx < approvals.length - 1 && <div className="flex-1 w-px bg-border my-1" />}
                      </div>
                      <div className="flex-1 rounded-lg border bg-card p-3">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="text-sm font-medium">Level {a.level} · {approver?.full_name ?? "Unknown"}</div>
                          <Badge variant="secondary" className="capitalize">{a.decision ?? "pending"}</Badge>
                        </div>
                        {approver?.email && <div className="text-xs text-muted-foreground">{approver.email}</div>}
                        {a.comment && <div className="text-sm mt-1">{a.comment}</div>}
                        {a.decided_at && <div className="text-xs text-muted-foreground mt-1">{format(new Date(a.decided_at), "PPp")}</div>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Audit log */}
          <div>
            <div className="text-sm font-semibold mb-2">Audit log</div>
            {loading ? (
              <div className="text-sm text-muted-foreground">Loading…</div>
            ) : audits.length === 0 ? (
              <div className="text-sm text-muted-foreground">No audit entries.</div>
            ) : (
              <div className="rounded-lg border divide-y">
                {audits.map((a) => {
                  const actor = a.actor_id ? profileMap.get(a.actor_id) : null;
                  return (
                    <div key={a.id} className="p-3 text-sm">
                      <div className="flex items-center justify-between flex-wrap gap-2">
                        <div className="font-medium capitalize">{a.action.replace(/_/g, " ")}</div>
                        <div className="text-xs text-muted-foreground">{format(new Date(a.created_at), "PPp")}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">By {actor?.full_name ?? "System"}</div>
                      {a.details && (
                        <pre className="mt-1 text-xs bg-muted/40 rounded p-2 overflow-x-auto">{JSON.stringify(a.details, null, 2)}</pre>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
