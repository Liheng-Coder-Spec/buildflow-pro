import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import useSEO from "@/hooks/useSEO";

function ymd(d: Date) { return d.toISOString().slice(0, 10); }

export default function EleaveTeamCalendar() {
  useSEO({ title: "Team E-Leave calendar" });
  const { user } = useAuth();
  const sb = supabase as any;
  const [cursor, setCursor] = useState(new Date());
  const [requests, setRequests] = useState<any[]>([]);
  const [deptSize, setDeptSize] = useState(1);
  const [maxPct, setMaxPct] = useState(50);

  useEffect(() => {
    if (!user) return;
    (async () => {
      const { data: prof } = await sb.from("profiles").select("department_id").eq("id", user.id).maybeSingle();
      if (!prof?.department_id) { setDeptSize(1); return; }
      const { data: peers } = await sb.from("profiles").select("id").eq("department_id", prof.department_id);
      setDeptSize(peers?.length || 1);
      const { data: cap } = await sb.from("eleave_team_capacity_rules").select("max_percent").or(`department_id.eq.${prof.department_id},department_id.is.null`).order("department_id", { ascending: false }).limit(1).maybeSingle();
      if (cap) setMaxPct(Number(cap.max_percent));
      const peerIds = (peers ?? []).map((p: any) => p.id);
      const { data: reqs } = await sb.from("eleave_leave_requests").select("user_id,start_date,end_date,status,leave_types(name,color)").in("user_id", peerIds).eq("status", "approved");
      setRequests(reqs ?? []);
    })();
  }, [user]);

  const grid = useMemo(() => {
    const y = cursor.getFullYear(), m = cursor.getMonth();
    const first = new Date(y, m, 1);
    const startDow = first.getDay();
    const daysInMonth = new Date(y, m + 1, 0).getDate();
    const cells: { date: Date | null }[] = [];
    for (let i = 0; i < startDow; i++) cells.push({ date: null });
    for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(y, m, d) });
    return cells;
  }, [cursor]);

  const onLeaveCount = (d: Date) => {
    const k = ymd(d);
    return requests.filter((r) => r.start_date <= k && r.end_date >= k).length;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Team E-Leave calendar</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}><ChevronLeft className="h-4 w-4" /></Button>
          <div className="font-medium w-40 text-center">{cursor.toLocaleString(undefined, { month: "long", year: "numeric" })}</div>
          <Button variant="outline" size="icon" onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="grid grid-cols-7 gap-2 text-xs text-muted-foreground mb-2">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => <div key={d} className="text-center font-medium">{d}</div>)}
        </div>
        <div className="grid grid-cols-7 gap-2">
          {grid.map((c, i) => {
            if (!c.date) return <div key={i} />;
            const count = onLeaveCount(c.date);
            const pct = (count / deptSize) * 100;
            const tone = pct >= maxPct ? "bg-cat-red text-cat-red-fg" : pct >= maxPct * 0.6 ? "bg-cat-amber text-cat-amber-fg" : "bg-cat-green text-cat-green-fg";
            return (
              <div key={i} className={`rounded-lg p-2 min-h-16 ${count > 0 ? tone : "bg-secondary"}`}>
                <div className="text-xs font-medium">{c.date.getDate()}</div>
                {count > 0 && <div className="text-xs mt-1">{count} on leave</div>}
              </div>
            );
          })}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground mt-4">
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-cat-green" /> low</span>
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-cat-amber" /> medium</span>
          <span className="inline-flex items-center gap-1"><span className="h-3 w-3 rounded bg-cat-red" /> capacity reached ({maxPct}%)</span>
        </div>
      </Card>
    </div>
  );
}
