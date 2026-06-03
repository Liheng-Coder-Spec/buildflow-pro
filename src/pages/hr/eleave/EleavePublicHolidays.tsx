import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ChevronLeft, ChevronRight, Download, Search, CalendarDays, Sparkles } from "lucide-react";
import useSEO from "@/hooks/useSEO";

type Holiday = { id: string; holiday_date: string; name: string; note: string | null };

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const WEEKDAYS = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
const WEEKDAY_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];
const MONTH_TINTS = ["bg-cat-blue/10","bg-cat-purple/10","bg-cat-pink/10","bg-cat-amber/10","bg-cat-green/10","bg-cat-teal/10","bg-cat-blue/10","bg-cat-purple/10","bg-cat-pink/10","bg-cat-amber/10","bg-cat-green/10","bg-cat-teal/10"];

function parseDate(iso: string) { const [y, m, d] = iso.split("-").map(Number); return new Date(y, m - 1, d); }
function fmtDDMMYYYY(d: Date) { return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`; }
function fmtCode(d: Date) { return `${String(d.getDate()).padStart(2, "0")} ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getFullYear()}`; }
function isSameDay(a: Date, b: Date) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate(); }

export default function EleavePublicHolidays() {
  useSEO({ title: "Public Holidays — Cambodia", description: "Official Cambodia public holidays recognized by the company." });
  const sb = supabase as any;
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [search, setSearch] = useState("");
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  const yearOptions = useMemo(() => { const base = today.getFullYear(); const arr: number[] = []; for (let y = base - 2; y <= base + 5; y++) arr.push(y); return arr; }, [today]);

  useEffect(() => {
    setLoading(true);
    sb.from("eleave_public_holidays").select("*").gte("holiday_date", `${year}-01-01`).lte("holiday_date", `${year}-12-31`).order("holiday_date", { ascending: true }).then(({ data }: any) => { setHolidays((data ?? []) as Holiday[]); setLoading(false); });
  }, [year]);

  const filtered = useMemo(() => { const q = search.trim().toLowerCase(); if (!q) return holidays; return holidays.filter((h) => h.name.toLowerCase().includes(q)); }, [holidays, search]);
  const nextHoliday = useMemo(() => { const todayIso = today.toISOString().slice(0, 10); return holidays.find((h) => h.holiday_date >= todayIso); }, [holidays, today]);
  const daysUntilNext = useMemo(() => { if (!nextHoliday) return null; const d = parseDate(nextHoliday.holiday_date); return Math.ceil((d.getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) / (1000 * 60 * 60 * 24)); }, [nextHoliday, today]);

  function exportCsv() {
    const rows = [["Code","Description","Date","Day"], ...filtered.map((h) => { const d = parseDate(h.holiday_date); return [fmtCode(d), h.name, fmtDDMMYYYY(d), WEEKDAY_FULL[d.getDay()]]; })];
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `public-holidays-${year}.csv`; a.click(); URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2"><CalendarDays className="h-6 w-6 text-primary" />Public Holidays</h1>
          <p className="text-sm text-muted-foreground mt-1">Official public holidays recognized by the company (Cambodia).</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="icon" onClick={() => setYear((y) => y - 1)} aria-label="Previous year"><ChevronLeft className="h-4 w-4" /></Button>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}><SelectTrigger className="w-28"><SelectValue /></SelectTrigger><SelectContent>{yearOptions.map((y) => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}</SelectContent></Select>
          <Button variant="outline" size="icon" onClick={() => setYear((y) => y + 1)} aria-label="Next year"><ChevronRight className="h-4 w-4" /></Button>
          <Button variant="outline" onClick={exportCsv} disabled={!filtered.length}><Download className="h-4 w-4" />Export CSV</Button>
        </div>
      </div>

      {nextHoliday && year === today.getFullYear() && (
        <Card className="p-4 bg-primary/5 border-primary/20 flex items-center gap-3 flex-wrap">
          <Sparkles className="h-5 w-5 text-primary" />
          <div className="text-sm"><span className="font-medium">Next holiday in {daysUntilNext} day{daysUntilNext === 1 ? "" : "s"}</span> — <span className="font-semibold">{nextHoliday.name}</span> <span className="text-muted-foreground">({fmtCode(parseDate(nextHoliday.holiday_date))}, {WEEKDAY_FULL[parseDate(nextHoliday.holiday_date).getDay()]})</span></div>
        </Card>
      )}

      <div className="relative max-w-sm"><Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" /><Input placeholder="Search holiday by name..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" /></div>

      <Tabs defaultValue="list">
        <TabsList><TabsTrigger value="list">List</TabsTrigger><TabsTrigger value="calendar">Calendar</TabsTrigger></TabsList>

        <TabsContent value="list" className="mt-4">
          <Card className="overflow-hidden rounded-xl">
            {loading ? <div className="p-8 text-center text-muted-foreground">Loading...</div> : filtered.length === 0 ? (
              <div className="p-12 text-center text-muted-foreground"><CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />No holidays added yet for {year}.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-muted/50"><tr className="text-left"><th className="px-4 py-3 font-medium">Code</th><th className="px-4 py-3 font-medium">Description</th><th className="px-4 py-3 font-medium">Date</th><th className="px-4 py-3 font-medium">Day</th></tr></thead>
                  <tbody>
                    {filtered.map((h) => {
                      const d = parseDate(h.holiday_date); const isToday = isSameDay(d, today); const isPast = d < new Date(today.getFullYear(), today.getMonth(), today.getDate()); const dow = d.getDay(); const isWeekend = dow === 0 || dow === 6;
                      return (
                        <tr key={h.id} className={`border-t transition-colors ${MONTH_TINTS[d.getMonth()]} ${isPast ? "opacity-60" : ""} ${isToday ? "ring-1 ring-primary" : ""}`}>
                          <td className="px-4 py-3"><span className="font-mono text-xs px-2 py-1 rounded-md bg-background border">{fmtCode(d)}</span></td>
                          <td className="px-4 py-3 font-medium">{h.name}{isToday && <Badge className="ml-2 bg-primary text-primary-foreground border-transparent">Today</Badge>}</td>
                          <td className="px-4 py-3 text-muted-foreground">{fmtDDMMYYYY(d)}</td>
                          <td className="px-4 py-3"><span className={`inline-flex px-2 py-0.5 rounded-md text-xs ${isWeekend ? "bg-destructive/10 text-destructive" : "bg-secondary text-secondary-foreground"}`}>{WEEKDAY_FULL[dow]}</span></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MONTHS.map((mName, mIdx) => <MiniMonth key={mIdx} year={year} monthIdx={mIdx} monthName={mName} holidays={filtered.filter((h) => parseDate(h.holiday_date).getMonth() === mIdx)} today={today} />)}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MiniMonth({ year, monthIdx, monthName, holidays, today }: { year: number; monthIdx: number; monthName: string; holidays: Holiday[]; today: Date; }) {
  const first = new Date(year, monthIdx, 1);
  const startDow = first.getDay();
  const daysInMonth = new Date(year, monthIdx + 1, 0).getDate();
  const cells: (number | null)[] = [];
  for (let i = 0; i < startDow; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  const holidayMap = new Map(holidays.map((h) => [parseDate(h.holiday_date).getDate(), h]));
  return (
    <Card className={`p-3 rounded-xl ${MONTH_TINTS[monthIdx]}`}>
      <div className="flex items-center justify-between mb-2"><div className="font-semibold text-sm">{monthName}</div><div className="text-xs text-muted-foreground">{holidays.length} holiday{holidays.length === 1 ? "" : "s"}</div></div>
      <div className="grid grid-cols-7 gap-1 text-[10px] text-muted-foreground mb-1">{WEEKDAYS.map((w) => <div key={w} className="text-center">{w}</div>)}</div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((c, i) => {
          if (c === null) return <div key={i} />;
          const dt = new Date(year, monthIdx, c); const h = holidayMap.get(c); const isToday = isSameDay(dt, today); const dow = dt.getDay(); const isWeekend = dow === 0 || dow === 6;
          const cell = (<div className={`relative h-8 grid place-items-center rounded-md text-xs cursor-default ${h ? "bg-primary text-primary-foreground font-semibold cursor-pointer" : isToday ? "bg-accent text-accent-foreground font-semibold" : isWeekend ? "text-destructive/70" : "text-foreground"}`}>{c}{h && <span className="absolute bottom-0.5 right-0.5 h-1 w-1 rounded-full bg-primary-foreground" />}</div>);
          if (!h) return <div key={i}>{cell}</div>;
          return (
            <Popover key={i}>
              <PopoverTrigger asChild>{cell}</PopoverTrigger>
              <PopoverContent className="w-64 text-sm"><div className="font-semibold">{h.name}</div><div className="text-xs text-muted-foreground mt-1">{fmtDDMMYYYY(dt)} · {WEEKDAY_FULL[dow]}</div>{h.note && <div className="text-xs mt-2">{h.note}</div>}</PopoverContent>
            </Popover>
          );
        })}
      </div>
    </Card>
  );
}
