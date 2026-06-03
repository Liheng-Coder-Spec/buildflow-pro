import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Search, Calendar as CalendarIcon, Users, ListOrdered } from "lucide-react";
import useSEO from "@/hooks/useSEO";

type Row = {
  id: string;
  user_id: string;
  start_date: string;
  end_date: string;
  days: number;
  half_day: boolean;
  full_name: string;
  department: string | null;
  leave_type: string;
  leave_color: string;
};

function ymd(d: Date) { return d.toISOString().slice(0, 10); }
function todayYmd() { return ymd(new Date()); }
function addDays(d: string, n: number) { const dt = new Date(d); dt.setDate(dt.getDate() + n); return ymd(dt); }
function eachDay(from: string, to: string) {
  const out: string[] = [];
  let cur = from;
  while (cur <= to) { out.push(cur); cur = addDays(cur, 1); }
  return out;
}
function initials(name: string) {
  return name.split(" ").filter(Boolean).slice(0, 2).map(n => n[0]?.toUpperCase() ?? "").join("") || "?";
}
function fmt(d: string) { return new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" }); }

const colorMap: Record<string, string> = {
  blue: "bg-cat-blue text-cat-blue-fg",
  green: "bg-cat-green text-cat-green-fg",
  amber: "bg-cat-amber text-cat-amber-fg",
  red: "bg-cat-red text-cat-red-fg",
  purple: "bg-cat-purple text-cat-purple-fg",
  pink: "bg-cat-pink text-cat-pink-fg",
};

export default function WhosOnEleave() {
  useSEO({ title: "Who's on E-Leave", description: "Search who is on E-Leave between any date range." });
  const sb = supabase as any;

  const [from, setFrom] = useState(todayYmd());
  const [to, setTo] = useState(addDays(todayYmd(), 13));
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  const [view, setView] = useState<"table" | "byDate">("table");

  const fetchData = async () => {
    if (!from || !to || from > to) return;
    setLoading(true);
    try {
      const { data: reqs, error } = await sb.from("leave_requests").select("id,user_id,start_date,end_date,days,half_day,leave_types(name,color)").eq("status", "approved").lte("start_date", to).gte("end_date", from);
      if (error) throw error;

      const userIds = Array.from(new Set((reqs ?? []).map((r: any) => r.user_id)));
      let profilesById = new Map<string, { full_name: string; department_id: string | null }>();
      let deptsById = new Map<string, string>();
      if (userIds.length) {
        const { data: profs } = await sb.from("profiles").select("id,full_name,department_id").in("id", userIds);
        profilesById = new Map((profs ?? []).map((p: any) => [p.id, { full_name: p.full_name, department_id: p.department_id }]));
        const deptIds = Array.from(new Set((profs ?? []).map((p: any) => p.department_id).filter(Boolean) as string[]));
        if (deptIds.length) {
          const { data: ds } = await sb.from("departments").select("id,name").in("id", deptIds);
          deptsById = new Map((ds ?? []).map((d: any) => [d.id, d.name]));
        }
      }

      const mapped: Row[] = (reqs ?? []).map((r: any) => {
        const p = profilesById.get(r.user_id);
        return {
          id: r.id, user_id: r.user_id, start_date: r.start_date, end_date: r.end_date, days: Number(r.days), half_day: r.half_day,
          full_name: p?.full_name || "Unknown",
          department: p?.department_id ? (deptsById.get(p.department_id) ?? null) : null,
          leave_type: r.leave_types?.name ?? "Leave",
          leave_color: r.leave_types?.color ?? "blue",
        };
      });
      setRows(mapped);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); /* eslint-disable-next-line */ }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter(r => r.full_name.toLowerCase().includes(q) || (r.department ?? "").toLowerCase().includes(q) || r.leave_type.toLowerCase().includes(q));
  }, [rows, query]);

  const sortedTable = useMemo(() => [...filtered].sort((a, b) => a.start_date.localeCompare(b.start_date) || a.full_name.localeCompare(b.full_name)), [filtered]);

  const grouped = useMemo(() => {
    const days = eachDay(from, to);
    return days.map(day => ({ day, people: filtered.filter(r => r.start_date <= day && r.end_date >= day).sort((a, b) => a.full_name.localeCompare(b.full_name)) }));
  }, [filtered, from, to]);

  const totalPeople = useMemo(() => new Set(filtered.map(r => r.user_id)).size, [filtered]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Who's on E-Leave</h1>
          <p className="text-sm text-muted-foreground">Search who is away across the company between any date range.</p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <Badge variant="secondary" className="gap-1"><Users className="h-3.5 w-3.5" />{totalPeople} {totalPeople === 1 ? "person" : "people"}</Badge>
          <Badge variant="secondary" className="gap-1"><ListOrdered className="h-3.5 w-3.5" />{filtered.length} {filtered.length === 1 ? "leave" : "leaves"}</Badge>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2"><CalendarIcon className="h-4 w-4 text-primary" /> Date range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-[1fr_1fr_2fr_auto] gap-3 items-end">
            <div className="space-y-1.5"><Label htmlFor="from">From</Label><Input id="from" type="date" value={from} onChange={e => setFrom(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="to">To</Label><Input id="to" type="date" value={to} min={from} onChange={e => setTo(e.target.value)} /></div>
            <div className="space-y-1.5"><Label htmlFor="search">Search</Label>
              <div className="relative"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input id="search" className="pl-9" placeholder="Name, department or leave type" value={query} onChange={e => setQuery(e.target.value)} /></div>
            </div>
            <Button onClick={fetchData} disabled={loading || !from || !to || from > to}>{loading ? "Searching…" : "Search"}</Button>
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => { setFrom(todayYmd()); setTo(todayYmd()); }}>Today</Button>
            <Button size="sm" variant="outline" onClick={() => { setFrom(todayYmd()); setTo(addDays(todayYmd(), 6)); }}>Next 7 days</Button>
            <Button size="sm" variant="outline" onClick={() => { setFrom(todayYmd()); setTo(addDays(todayYmd(), 29)); }}>Next 30 days</Button>
            <Button size="sm" variant="outline" onClick={() => { const d = new Date(); const y = d.getFullYear(), m = d.getMonth(); setFrom(ymd(new Date(y, m, 1))); setTo(ymd(new Date(y, m + 1, 0))); }}>This month</Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={view} onValueChange={(v) => setView(v as "table" | "byDate")}>
        <TabsList><TabsTrigger value="table">Table list</TabsTrigger><TabsTrigger value="byDate">Grouped by date</TabsTrigger></TabsList>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead><TableHead>Department</TableHead><TableHead>Leave type</TableHead><TableHead>From</TableHead><TableHead>To</TableHead><TableHead className="text-right">Days</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedTable.length === 0 ? (
                    <TableRow><TableCell colSpan={6} className="text-center text-muted-foreground py-10">{loading ? "Loading…" : "No one is on leave in this range."}</TableCell></TableRow>
                  ) : sortedTable.map(r => (
                    <TableRow key={r.id}>
                      <TableCell><div className="flex items-center gap-2"><Avatar className="h-8 w-8"><AvatarFallback className="text-xs">{initials(r.full_name)}</AvatarFallback></Avatar><span className="font-medium">{r.full_name}</span></div></TableCell>
                      <TableCell className="text-muted-foreground">{r.department ?? "—"}</TableCell>
                      <TableCell><Badge className={`${colorMap[r.leave_color] ?? colorMap.blue} border-transparent`}>{r.leave_type}</Badge></TableCell>
                      <TableCell>{fmt(r.start_date)}</TableCell>
                      <TableCell>{fmt(r.end_date)}</TableCell>
                      <TableCell className="text-right tabular-nums">{r.days}{r.half_day ? " (½)" : ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="byDate" className="mt-4">
          <div className="space-y-3">
            {grouped.map(g => (
              <Card key={g.day}>
                <CardHeader className="py-3 flex-row items-center justify-between space-y-0">
                  <CardTitle className="text-sm font-semibold">{fmt(g.day)}</CardTitle>
                  <Badge variant="secondary">{g.people.length} on leave</Badge>
                </CardHeader>
                <CardContent className="pt-0">
                  {g.people.length === 0 ? <p className="text-sm text-muted-foreground">Nobody is on leave.</p> : (
                    <div className="flex flex-wrap gap-2">
                      {g.people.map(p => (
                        <div key={p.id + g.day} className="flex items-center gap-2 rounded-lg border bg-card px-3 py-2">
                          <Avatar className="h-7 w-7"><AvatarFallback className="text-[10px]">{initials(p.full_name)}</AvatarFallback></Avatar>
                          <div className="text-sm"><div className="font-medium leading-tight">{p.full_name}</div><div className="text-xs text-muted-foreground">{p.department ?? "—"}</div></div>
                          <Badge className={`${colorMap[p.leave_color] ?? colorMap.blue} border-transparent ml-1`}>{p.leave_type}</Badge>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
