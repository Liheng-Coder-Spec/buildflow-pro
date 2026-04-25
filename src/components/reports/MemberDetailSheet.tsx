import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import type { MemberRow } from "./MemberPerformanceTable";

interface RecentTask {
  id: string;
  code: string | null;
  title: string;
  status: string;
  planned_end: string | null;
}

interface RecentTimesheet {
  id: string;
  work_date: string;
  regular_hours: number;
  overtime_hours: number;
  status: string;
}

interface RecentAudit {
  id: string;
  entity_type: string;
  action: string;
  created_at: string;
}

export function MemberDetailSheet({
  member,
  open,
  onOpenChange,
}: {
  member: MemberRow | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState<RecentTask[]>([]);
  const [ts, setTs] = useState<RecentTimesheet[]>([]);
  const [audits, setAudits] = useState<RecentAudit[]>([]);

  useEffect(() => {
    if (!open || !member) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      const [aRes, tsRes, auRes] = await Promise.all([
        supabase
          .from("task_assignments")
          .select("task_id")
          .eq("user_id", member.user_id)
          .is("unassigned_at", null)
          .limit(50),
        supabase
          .from("timesheet_entries")
          .select("id, work_date, regular_hours, overtime_hours, status")
          .eq("user_id", member.user_id)
          .order("work_date", { ascending: false })
          .limit(15),
        supabase
          .from("audit_log")
          .select("id, entity_type, action, created_at")
          .eq("user_id", member.user_id)
          .order("created_at", { ascending: false })
          .limit(20),
      ]);
      if (cancelled) return;

      const taskIds = (aRes.data ?? []).map((a: { task_id: string }) => a.task_id);
      let tList: RecentTask[] = [];
      if (taskIds.length) {
        const { data } = await supabase
          .from("tasks")
          .select("id, code, title, status, planned_end")
          .in("id", taskIds)
          .order("planned_end", { ascending: true, nullsFirst: false })
          .limit(15);
        tList = (data ?? []) as RecentTask[];
      }
      if (cancelled) return;

      setTasks(tList);
      setTs((tsRes.data ?? []) as RecentTimesheet[]);
      setAudits((auRes.data ?? []) as RecentAudit[]);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [open, member]);

  if (!member) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
        <SheetHeader>
          <SheetTitle>{member.full_name}</SheetTitle>
          <SheetDescription>
            {member.job_title || "—"} · {member.total_tasks} tasks ·{" "}
            {member.approved_hours.toFixed(1)} approved hours
          </SheetDescription>
        </SheetHeader>

        <div className="grid grid-cols-3 gap-3 mt-4">
          <Stat label="Completed" value={String(member.completed)} />
          <Stat
            label="Overdue"
            value={String(member.overdue)}
            tone={member.overdue > 0 ? "warning" : "default"}
          />
          <Stat label="On-time %" value={`${Math.round(member.on_time_rate * 100)}%`} />
        </div>

        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="grid gap-6 mt-6">
            <Section title="Active tasks">
              {tasks.length === 0 ? (
                <Empty />
              ) : (
                <ul className="divide-y rounded-md border">
                  {tasks.map((t) => (
                    <li key={t.id} className="px-3 py-2 flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">
                          {t.code ? `${t.code} · ` : ""}
                          {t.title}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Due {t.planned_end ?? "—"}
                        </div>
                      </div>
                      <Badge variant="secondary" className="capitalize">
                        {t.status.replace("_", " ")}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Recent timesheets">
              {ts.length === 0 ? (
                <Empty />
              ) : (
                <ul className="divide-y rounded-md border">
                  {ts.map((e) => (
                    <li key={e.id} className="px-3 py-2 flex items-center gap-2 text-sm">
                      <div className="font-medium w-28">{e.work_date}</div>
                      <div className="flex-1 text-muted-foreground">
                        {Number(e.regular_hours).toFixed(1)}h reg ·{" "}
                        {Number(e.overtime_hours).toFixed(1)}h OT
                      </div>
                      <Badge variant="outline" className="capitalize">
                        {e.status}
                      </Badge>
                    </li>
                  ))}
                </ul>
              )}
            </Section>

            <Section title="Recent activity">
              {audits.length === 0 ? (
                <Empty />
              ) : (
                <ul className="divide-y rounded-md border">
                  {audits.map((a) => (
                    <li key={a.id} className="px-3 py-2 flex items-center gap-2 text-sm">
                      <Badge variant="outline" className="capitalize">
                        {a.action}
                      </Badge>
                      <span className="font-medium">{a.entity_type}</span>
                      <span className="ml-auto text-xs text-muted-foreground">
                        {new Date(a.created_at).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </Section>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Stat({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "warning";
}) {
  return (
    <div className="rounded-md border p-3">
      <div className="text-xs text-muted-foreground">{label}</div>
      <div
        className={`text-xl font-bold ${tone === "warning" ? "text-destructive" : ""}`}
      >
        {value}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </div>
  );
}

function Empty() {
  return <p className="text-sm text-muted-foreground py-2">No records.</p>;
}
