import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import useSEO from "@/hooks/useSEO";
import { StatusPill } from "@/components/eleave/StatusPill";
import { replacementAction } from "@/lib/eleave/replacement";
import { CalendarClock, Sun, Sunrise, Sunset, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

type Period = "full" | "am" | "pm";

const PERIOD_OPTIONS: { value: Period; label: string; icon: typeof Sun; days: number }[] = [
  { value: "full", label: "Full day", icon: Sun, days: 1 },
  { value: "am", label: "AM (Half)", icon: Sunrise, days: 0.5 },
  { value: "pm", label: "PM (Half)", icon: Sunset, days: 0.5 },
];

export default function EleaveReplacement() {
  useSEO({ title: "Replacement E-Leave" });
  const { user } = useAuth();
  const sb = supabase as any;
  const [worked_date, setDate] = useState("");
  const [target_date, setTargetDate] = useState("");
  const [period, setPeriod] = useState<Period>("full");
  const [reason, setReason] = useState("");
  const [list, setList] = useState<any[]>([]);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    if (!user) return;
    const { data } = await sb.from("replacement_credits").select("*").eq("user_id", user.id).order("created_at", { ascending: false });
    setList(data ?? []);
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const reset = () => { setDate(""); setTargetDate(""); setPeriod("full"); setReason(""); };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!worked_date) return toast.error("Please select the worked date.");
    if (!target_date) return toast.error("Please select the target replacement date.");
    if (target_date <= worked_date) return toast.error("Target date must be after the worked date.");
    if (!reason.trim()) return toast.error("Please describe what you worked on.");
    setBusy(true);
    try {
      await replacementAction("submit", { payload: { worked_date, target_date, period, reason: reason.trim() } });
      toast.success("Replacement claim submitted to your supervisor.");
      reset(); load();
    } catch (err: any) { toast.error(err.message); } finally { setBusy(false); }
  };

  const days = PERIOD_OPTIONS.find((p) => p.value === period)?.days ?? 1;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Replacement E-Leave</h1>
        <p className="text-sm text-muted-foreground mt-1">Claim a day off for a day you worked. Goes to your supervisor, then admin for final approval.</p>
      </div>

      <Card className="p-6 space-y-5">
        <div className="space-y-1.5">
          <Label className="flex items-center gap-1.5">Leave type <Lock className="h-3 w-3 text-muted-foreground" /></Label>
          <div className="flex items-center gap-2 rounded-md border bg-muted/40 px-3 py-2.5">
            <CalendarClock className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium">Replacement Leave</span>
            <span className="text-xs text-muted-foreground ml-auto">Auto-selected · cannot be changed</span>
          </div>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div className="space-y-1.5"><Label htmlFor="worked-date">Worked date <span className="text-destructive">*</span></Label><Input id="worked-date" type="date" value={worked_date} onChange={(e) => setDate(e.target.value)} required /></div>
          <div className="space-y-1.5"><Label htmlFor="target-date">Target replacement date <span className="text-destructive">*</span></Label><Input id="target-date" type="date" value={target_date} onChange={(e) => setTargetDate(e.target.value)} required /><p className="text-xs text-muted-foreground">The day you want to take off in exchange.</p></div>
          <div className="space-y-1.5">
            <Label>Period worked <span className="text-destructive">*</span></Label>
            <div className="grid grid-cols-3 gap-2">
              {PERIOD_OPTIONS.map(({ value, label, icon: Icon, days: d }) => {
                const active = period === value;
                return (
                  <button key={value} type="button" onClick={() => setPeriod(value)} className={cn("flex flex-col items-center justify-center gap-1 rounded-md border p-3 text-sm transition", active ? "border-primary bg-primary/10 text-primary" : "border-border hover:border-primary/50 hover:bg-muted/50")}>
                    <Icon className="h-4 w-4" /><span className="font-medium">{label}</span><span className="text-xs text-muted-foreground">+{d} day</span>
                  </button>
                );
              })}
            </div>
          </div>
          <div className="space-y-1.5"><Label htmlFor="reason">Reason <span className="text-destructive">*</span></Label><Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="What did you work on? (e.g. project deadline, client emergency)" rows={3} required /></div>
          <div className="rounded-md bg-accent/30 border border-accent px-3 py-2 text-xs text-muted-foreground">You will earn <span className="font-medium text-foreground">{days} day</span> of Replacement leave once approved by both supervisor and admin.</div>
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" onClick={reset} disabled={busy}>Cancel</Button>
            <Button type="submit" disabled={busy}>{busy ? "Submitting…" : "Submit"}</Button>
          </div>
        </form>
      </Card>

      <Card className="p-5">
        <h2 className="text-sm font-medium mb-3 text-muted-foreground">Your replacement claims</h2>
        {list.length === 0 ? <p className="text-sm text-muted-foreground">None yet.</p> : (
          <ul className="divide-y">
            {list.map((r) => (
              <li key={r.id} className="py-3 flex items-start justify-between gap-3">
                <div className="space-y-0.5 min-w-0 flex-1">
                  <div className="text-sm font-medium">Worked {r.worked_date}{r.target_date ? ` → Off ${r.target_date}` : ""} · {r.days} day(s) · <span className="uppercase text-xs text-muted-foreground">{r.period}</span></div>
                  {r.reason && <div className="text-xs text-muted-foreground line-clamp-2">{r.reason}</div>}
                  {r.status === "pending" && <div className="text-xs text-muted-foreground">Awaiting {r.current_level === 1 ? "supervisor" : "admin"} approval</div>}
                  {r.rejection_reason && <div className="text-xs text-destructive">Rejected: {r.rejection_reason}</div>}
                  {r.status === "approved" && r.admin_comment && <div className="text-xs text-muted-foreground">Admin note: {r.admin_comment}</div>}
                </div>
                <StatusPill status={r.status} />
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
