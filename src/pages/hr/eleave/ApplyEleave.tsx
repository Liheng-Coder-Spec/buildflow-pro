import { useEffect, useMemo, useRef, useState } from "react";
import { CalendarDays, FileText, Info, Loader2, Mail, Paperclip, Plus, Users, X, CalendarOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { leaveAction } from "@/lib/eleave/leave";
import useSEO from "@/hooks/useSEO";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

type DayType = "full" | "am" | "pm" | "skip";
type DaySelection = { date: string; type: DayType };
type Profile = { id: string; full_name: string; email: string };
type Holiday = { holiday_date: string; name: string };

const MAX_FILES = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const DAY_OPTIONS: { value: DayType; label: string; activeClass: string }[] = [
  { value: "full", label: "Full", activeClass: "bg-primary text-primary-foreground border-primary shadow-sm" },
  { value: "am",   label: "AM",   activeClass: "bg-cat-blue text-cat-blue-fg border-cat-blue-fg/30 shadow-sm" },
  { value: "pm",   label: "PM",   activeClass: "bg-cat-amber text-cat-amber-fg border-cat-amber-fg/30 shadow-sm" },
  { value: "skip", label: "Skip", activeClass: "bg-cat-gray text-cat-gray-fg border-cat-gray-fg/30" },
];

function enumerateDates(start: string, end: string): string[] {
  if (!start || !end) return [];
  const s = new Date(start);
  const e = new Date(end);
  if (isNaN(s.getTime()) || isNaN(e.getTime()) || e < s) return [];
  const out: string[] = [];
  const cur = new Date(s);
  while (cur <= e) {
    out.push(cur.toISOString().slice(0, 10));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

function formatDateLabel(iso: string) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString(undefined, { weekday: "short", year: "numeric", month: "short", day: "numeric" });
}

export default function ApplyEleave() {
  useSEO({ title: "Apply for E-Leave" });
  const nav = useNavigate();
  const { user } = useAuth();
  const sb = supabase as any;
  const currentYear = new Date().getFullYear();

  const [types, setTypes] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [balancesLoading, setBalancesLoading] = useState(true);
  const [leave_type_id, setType] = useState("");
  const [start_date, setStart] = useState("");
  const [end_date, setEnd] = useState("");
  const [daySelections, setDaySelections] = useState<Record<string, DayType>>({});
  const [overrides, setOverrides] = useState<Record<string, boolean>>({});
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [reason, setReason] = useState("");

  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [teammates, setTeammates] = useState<Profile[]>([]);
  const [ccUserIds, setCcUserIds] = useState<string[]>([]);
  const [ccEmails, setCcEmails] = useState<string[]>([]);
  const [emailDraft, setEmailDraft] = useState("");
  const [ccPickerOpen, setCcPickerOpen] = useState(false);

  const [busy, setBusy] = useState(false);

  useEffect(() => {
    sb.from("leave_types").select("*").eq("active", true).order("name").then(({ data }: any) => setTypes(data ?? []));
    sb.from("profiles").select("id, full_name, email").order("full_name").then(({ data }: any) => setTeammates((data ?? []) as Profile[]));
  }, []);

  useEffect(() => {
    if (!user) return;
    setBalancesLoading(true);
    sb.from("leave_balances").select("*").eq("user_id", user.id).eq("year", currentYear).then(({ data }: any) => {
      setBalances(data ?? []);
      setBalancesLoading(false);
    });
  }, [user, currentYear]);

  const dateList = useMemo(() => enumerateDates(start_date, end_date), [start_date, end_date]);
  const selectedType = useMemo(() => types.find((t) => t.id === leave_type_id), [types, leave_type_id]);
  const halfAllowed = selectedType?.half_day_allowed !== false;

  useEffect(() => {
    if (!start_date && !end_date) { setHolidays([]); return; }
    const startYear = start_date ? new Date(start_date).getFullYear() : new Date(end_date).getFullYear();
    const endYear = end_date ? new Date(end_date).getFullYear() : startYear;
    const from = `${startYear}-01-01`;
    const to = `${endYear}-12-31`;
    sb.from("public_holidays").select("holiday_date, name").gte("holiday_date", from).lte("holiday_date", to).then(({ data }: any) => setHolidays((data ?? []) as Holiday[]));
  }, [start_date, end_date]);

  const holidayMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const h of holidays) m.set(h.holiday_date, h.name);
    return m;
  }, [holidays]);

  const isSunday = (iso: string) => new Date(iso + "T00:00:00").getDay() === 0;
  const nonWorkingInfo = (iso: string): { reason: "sunday" | "holiday"; label: string } | null => {
    if (holidayMap.has(iso)) return { reason: "holiday", label: `Holiday: ${holidayMap.get(iso)}` };
    if (isSunday(iso)) return { reason: "sunday", label: "Sunday" };
    return null;
  };

  useEffect(() => {
    setDaySelections((prev) => {
      const next: Record<string, DayType> = {};
      for (const d of dateList) {
        if (prev[d] !== undefined) next[d] = prev[d];
        else if (overrides[d]) next[d] = "full";
        else if (nonWorkingInfo(d)) next[d] = "skip";
        else next[d] = "full";
      }
      return next;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateList.join("|"), holidayMap.size]);

  const totalDays = useMemo(() => {
    let total = 0;
    for (const d of dateList) {
      const t = daySelections[d] ?? "full";
      if (t === "full") total += 1;
      else if (t === "am" || t === "pm") total += 0.5;
    }
    return total;
  }, [dateList, daySelections]);

  const remaining = useMemo(() => {
    if (!leave_type_id) return null;
    const b = balances.find((x) => x.leave_type_id === leave_type_id);
    if (!b) return 0;
    return Number(b.carried_over) + Number(b.yearly_allowance) - Number(b.expired) - Number(b.used) + Number(b.adjustments);
  }, [balances, leave_type_id]);

  const setDayType = (date: string, t: DayType) => setDaySelections((prev) => ({ ...prev, [date]: t }));

  const onPickFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    const incoming = Array.from(e.target.files ?? []);
    if (!incoming.length) return;
    const next = [...files];
    for (const f of incoming) {
      if (next.length >= MAX_FILES) { toast.error(`Maximum ${MAX_FILES} files allowed.`); break; }
      if (f.size > MAX_FILE_SIZE) { toast.error(`"${f.name}" is over 10 MB.`); continue; }
      if (next.some((x) => x.name === f.name && x.size === f.size)) continue;
      next.push(f);
    }
    setFiles(next);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeFile = (idx: number) => setFiles((prev) => prev.filter((_, i) => i !== idx));

  const addEmailFromDraft = () => {
    const v = emailDraft.trim().toLowerCase();
    if (!v) return;
    if (!EMAIL_RE.test(v)) { toast.error("That doesn't look like a valid email."); return; }
    if (ccEmails.includes(v)) { setEmailDraft(""); return; }
    setCcEmails((prev) => [...prev, v]);
    setEmailDraft("");
  };

  const toggleCcUser = (id: string) => setCcUserIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!leave_type_id || !start_date || !end_date) return toast.error("Fill in all required fields.");
    if (new Date(end_date) < new Date(start_date)) return toast.error("End date must be after start date.");
    if (totalDays <= 0) return toast.error("Please select at least one day to take leave.");
    if (selectedType?.doc_required && files.length === 0) return toast.error("This leave type requires a supporting document.");

    const day_selections: DaySelection[] = dateList.map((d) => ({ date: d, type: daySelections[d] ?? "full" }));
    const anyHalf = day_selections.some((s) => s.type === "am" || s.type === "pm");

    setBusy(true);
    try {
      const attachment_urls: string[] = [];
      if (files.length && user) {
        setUploading(true);
        for (const f of files) {
          const ext = f.name.split(".").pop() || "bin";
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
          const { error: upErr } = await supabase.storage.from("leave-attachments").upload(path, f, { cacheControl: "3600", upsert: false, contentType: f.type || undefined });
          if (upErr) throw upErr;
          attachment_urls.push(path);
        }
        setUploading(false);
      }

      const result: any = await leaveAction("submit", {
        payload: { leave_type_id, start_date, end_date, half_day: anyHalf, reason, day_selections, attachment_urls, attachment_url: attachment_urls[0], cc_user_ids: ccUserIds, cc_emails: ccEmails },
      });

      let approverName = "your approver";
      try {
        const requestId = result?.request?.id ?? result?.id ?? result?.request_id;
        if (requestId) {
          const { data: appr } = await sb.from("request_approvals").select("approver_id").eq("request_id", requestId).eq("level", 1).maybeSingle();
          if (appr?.approver_id) {
            const { data: prof } = await sb.from("profiles").select("full_name, email").eq("id", appr.approver_id).maybeSingle();
            if (prof) approverName = prof.full_name || prof.email || approverName;
          }
        }
      } catch { /* non-fatal */ }

      toast.success(`Request submitted. Awaiting approval from ${approverName}.`);
      nav("/hr/eleave/requests");
    } catch (e: any) { toast.error(e.message); } finally { setBusy(false); setUploading(false); }
  };

  const ccUserProfiles = useMemo(() => teammates.filter((t) => ccUserIds.includes(t.id)), [teammates, ccUserIds]);

  const summaryRange = start_date && end_date && dateList.length > 0
    ? `${formatDateLabel(start_date)} → ${formatDateLabel(end_date)}`
    : "Pick a date range";

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-3xl font-semibold tracking-tight">Apply for E-Leave</h1>
        <p className="text-muted-foreground text-sm">Submit a new E-Leave request for approval. Add CC's and attachments as needed.</p>
      </div>

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-6 space-y-5">
            <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><FileText className="h-4 w-4" /> Request details</div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5"><Label>Period year</Label><Input type="text" value={currentYear} readOnly disabled className="bg-muted" /></div>
              <div className="space-y-1.5">
                <Label>Leave type <span className="text-destructive">*</span></Label>
                <Select value={leave_type_id} onValueChange={setType}>
                  <SelectTrigger><SelectValue placeholder="Select leave type" /></SelectTrigger>
                  <SelectContent>
                    {types.map((t) => (
                      <SelectItem key={t.id} value={t.id}>{t.name}{t.gender_restriction !== "any" ? ` (${t.gender_restriction})` : ""}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5"><Label>Start date <span className="text-destructive">*</span></Label><Input type="date" value={start_date} onChange={(e) => setStart(e.target.value)} /></div>
              <div className="space-y-1.5"><Label>End date <span className="text-destructive">*</span></Label><Input type="date" value={end_date} onChange={(e) => setEnd(e.target.value)} /></div>
            </div>
            <div className="space-y-1.5"><Label>Reason</Label><Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Why are you taking this leave?" rows={3} /></div>
          </Card>

          {dateList.length > 0 && (
            <Card className="p-6 space-y-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><CalendarDays className="h-4 w-4" /> Per-day selection</div>
                <Badge variant="secondary" className="font-normal">{dateList.length} day{dateList.length === 1 ? "" : "s"} in range</Badge>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Info className="h-3.5 w-3.5" />
                Sundays and public holidays are auto-excluded. Click <span className="font-medium">Override</span> to include one.
              </p>
              <div className="rounded-lg border divide-y overflow-hidden">
                {dateList.map((d) => {
                  const t = daySelections[d] ?? "full";
                  const nw = nonWorkingInfo(d);
                  const overridden = !!overrides[d];
                  const locked = !!nw && !overridden;
                  return (
                    <div key={d} className={cn("flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3", locked ? "bg-muted/40" : "bg-card")}>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className={cn("text-sm font-medium", locked && "text-muted-foreground")}>{formatDateLabel(d)}</span>
                        {nw && (
                          <Badge variant="outline" className={cn("font-normal gap-1", nw.reason === "holiday" ? "bg-cat-red/10 text-cat-red-fg border-cat-red-fg/30" : "bg-cat-gray/30 text-cat-gray-fg border-cat-gray-fg/30")}>
                            <CalendarOff className="h-3 w-3" />{nw.label}
                          </Badge>
                        )}
                        {nw && (
                          <button type="button" onClick={() => { setOverrides((prev) => ({ ...prev, [d]: !overridden })); setDaySelections((prev) => ({ ...prev, [d]: !overridden ? "full" : "skip" })); }} className="text-xs text-primary hover:underline">
                            {overridden ? "Reset to skip" : "Override"}
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {DAY_OPTIONS.map((opt) => {
                          const isActive = t === opt.value;
                          const halfDisabled = (opt.value === "am" || opt.value === "pm") && !halfAllowed;
                          const lockedDisabled = locked && opt.value !== "skip";
                          const disabled = halfDisabled || lockedDisabled;
                          return (
                            <button key={opt.value} type="button" disabled={disabled} onClick={() => setDayType(d, opt.value)} aria-pressed={isActive}
                              className={cn(
                                "inline-flex items-center justify-center rounded-md border px-3 h-8 text-xs font-medium transition-all",
                                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                                isActive ? opt.activeClass : "bg-background text-foreground/70 hover:bg-secondary hover:text-foreground border-input",
                                disabled && "opacity-50 cursor-not-allowed hover:bg-background hover:text-foreground/70",
                              )}
                            >{opt.label}</button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
              {!halfAllowed && (
                <p className="text-xs text-muted-foreground flex items-center gap-1.5"><Info className="h-3.5 w-3.5" />Half-day (AM/PM) is not allowed for this leave type.</p>
              )}
            </Card>
          )}

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground"><Users className="h-4 w-4" /> CC <span className="text-xs">(optional)</span></div>
              <span className="text-xs text-muted-foreground">Keep teammates or external contacts in the loop</span>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">Teammates</Label>
              <div className="flex flex-wrap gap-1.5 items-center">
                {ccUserProfiles.map((p) => (
                  <Badge key={p.id} variant="secondary" className="gap-1 pr-1">{p.full_name || p.email}<button type="button" onClick={() => toggleCcUser(p.id)} className="ml-1 rounded-sm hover:bg-background/60 p-0.5" aria-label={`Remove ${p.full_name}`}><X className="h-3 w-3" /></button></Badge>
                ))}
                <Popover open={ccPickerOpen} onOpenChange={setCcPickerOpen}>
                  <PopoverTrigger asChild><Button type="button" variant="outline" size="sm" className="h-7"><Plus className="h-3.5 w-3.5 mr-1" /> Add teammate</Button></PopoverTrigger>
                  <PopoverContent className="p-0 w-72" align="start">
                    <Command>
                      <CommandInput placeholder="Search teammates..." />
                      <CommandList>
                        <CommandEmpty>No teammates found.</CommandEmpty>
                        <CommandGroup>
                          {teammates.filter((t) => t.id !== user?.id).map((t) => {
                            const checked = ccUserIds.includes(t.id);
                            return (
                              <CommandItem key={t.id} value={`${t.full_name} ${t.email}`} onSelect={() => toggleCcUser(t.id)} className="flex items-center justify-between">
                                <div className="flex flex-col"><span className="text-sm">{t.full_name || t.email}</span><span className="text-xs text-muted-foreground">{t.email}</span></div>
                                {checked && <Badge className="bg-primary/10 text-primary border-transparent">Added</Badge>}
                              </CommandItem>
                            );
                          })}
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-xs uppercase tracking-wide text-muted-foreground">External emails</Label>
              <div className="flex flex-wrap gap-1.5">
                {ccEmails.map((em) => (
                  <Badge key={em} variant="outline" className="gap-1 pr-1"><Mail className="h-3 w-3" /> {em}<button type="button" onClick={() => setCcEmails((p) => p.filter((x) => x !== em))} className="ml-1 rounded-sm hover:bg-secondary p-0.5" aria-label={`Remove ${em}`}><X className="h-3 w-3" /></button></Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input type="email" placeholder="name@example.com" value={emailDraft} onChange={(e) => setEmailDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); addEmailFromDraft(); } }} />
                <Button type="button" variant="outline" onClick={addEmailFromDraft}>Add</Button>
              </div>
            </div>
          </Card>

          <Card className="p-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Paperclip className="h-4 w-4" />Attachments
                {selectedType?.doc_required ? <span className="text-destructive">*</span> : <span className="text-xs">(optional)</span>}
              </div>
              <span className="text-xs text-muted-foreground">Up to {MAX_FILES} files · 10 MB each</span>
            </div>
            <input ref={fileInputRef} type="file" multiple className="hidden" accept="image/*,application/pdf,.doc,.docx" onChange={onPickFiles} />
            {files.length > 0 && (
              <div className="space-y-2">
                {files.map((f, i) => (
                  <div key={`${f.name}-${i}`} className="flex items-center justify-between rounded-md border bg-muted/50 px-3 py-2 text-sm">
                    <span className="flex items-center gap-2 truncate min-w-0"><Paperclip className="h-4 w-4 shrink-0 text-muted-foreground" /><span className="truncate">{f.name}</span><span className="text-muted-foreground shrink-0 text-xs">({(f.size / 1024).toFixed(0)} KB)</span></span>
                    <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(i)} disabled={uploading}><X className="h-4 w-4" /></Button>
                  </div>
                ))}
              </div>
            )}
            {files.length < MAX_FILES && (
              <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()} className="w-full justify-start">
                <Paperclip className="h-4 w-4 mr-2" />{files.length === 0 ? "Choose files (PDF, image, doc)" : `Add more (${files.length}/${MAX_FILES})`}
              </Button>
            )}
            {selectedType?.doc_required && files.length === 0 && (
              <p className="text-xs text-muted-foreground">A supporting document is required for this leave type.</p>
            )}
          </Card>
        </div>

        <div className="lg:col-span-1">
          <div className="lg:sticky lg:top-20 space-y-4">
            <Card className="p-6 space-y-4">
              <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Summary</h2>
              <div className="space-y-3">
                <div><div className="text-xs text-muted-foreground">Leave type</div><div className="text-sm font-medium">{selectedType?.name ?? "—"}</div></div>
                <div><div className="text-xs text-muted-foreground">Date range</div><div className="text-sm font-medium">{summaryRange}</div></div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-lg border bg-muted/40 p-3"><div className="text-xs text-muted-foreground">Days requested</div><div className="text-2xl font-semibold text-primary">{totalDays}</div></div>
                  <div className="rounded-lg border bg-muted/40 p-3"><div className="text-xs text-muted-foreground">Remaining</div>
                    <div className="text-2xl font-semibold">{balancesLoading ? <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /> : leave_type_id ? remaining : <span className="text-muted-foreground text-base font-normal">—</span>}</div>
                  </div>
                </div>
                {(ccUserProfiles.length > 0 || ccEmails.length > 0) && (
                  <div className="space-y-1.5">
                    <div className="text-xs text-muted-foreground">CC</div>
                    <div className="flex flex-wrap gap-1.5">
                      {ccUserProfiles.map((p) => <Badge key={p.id} variant="secondary" className="font-normal">{p.full_name || p.email}</Badge>)}
                      {ccEmails.map((em) => <Badge key={em} variant="outline" className="font-normal gap-1"><Mail className="h-3 w-3" />{em}</Badge>)}
                    </div>
                  </div>
                )}
                {files.length > 0 && <div className="space-y-1.5"><div className="text-xs text-muted-foreground">Attachments</div><div className="text-sm">{files.length} file{files.length === 1 ? "" : "s"}</div></div>}
              </div>
              <div className="flex flex-col gap-2 pt-2">
                <Button type="submit" disabled={busy || uploading} className="w-full">{uploading ? "Uploading…" : busy ? "Submitting…" : "Submit request"}</Button>
                <Button type="button" variant="outline" onClick={() => nav(-1)} className="w-full">Cancel</Button>
              </div>
            </Card>
            <Card className="p-4">
              <p className="text-xs text-muted-foreground flex gap-2"><Info className="h-4 w-4 shrink-0 text-primary" />CC'd teammates get an in-app notification. External emails are recorded with the request for reference.</p>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
