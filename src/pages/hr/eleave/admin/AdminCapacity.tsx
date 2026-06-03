import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { Trash2 } from "lucide-react";

export default function AdminCapacity() {
  useSEO({ title: "Team capacity — Admin" });
  const [rules, setRules] = useState<any[]>([]);
  const [overrides, setOverrides] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [dept, setDept] = useState<string>("__all__");
  const [pct, setPct] = useState("50");
  const [oDate, setODate] = useState("");
  const [oPct, setOPct] = useState("50");

  const load = useCallback(async () => {
    const [r, o, d] = await Promise.all([
      supabase.from("team_capacity_rules").select("*"),
      supabase.from("capacity_overrides").select("*").order("date"),
      supabase.from("departments").select("*"),
    ]);
    setRules(r.data ?? []); setOverrides(o.data ?? []); setDepts(d.data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const addRule = async () => {
    const department_id = dept === "__all__" ? null : dept;
    const { error } = await supabase.from("team_capacity_rules").insert({ department_id, max_percent: Number(pct) });
    if (error) return toast.error(error.message);
    load();
  };
  const addOverride = async () => {
    const department_id = dept === "__all__" ? null : dept;
    const { error } = await supabase.from("capacity_overrides").insert({ department_id, date: oDate, max_percent: Number(oPct) });
    if (error) return toast.error(error.message);
    load();
  };

  const deptName = (id: string | null) => id ? (depts.find((d) => d.id === id)?.name ?? "—") : "All";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Team capacity</h1>
      <Card className="p-4 grid sm:grid-cols-4 gap-3 items-end">
        <div><Label>Department</Label>
          <Select value={dept} onValueChange={setDept}><SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent><SelectItem value="__all__">All (company-wide)</SelectItem>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
          </Select>
        </div>
        <div><Label>Max % on leave</Label><Input type="number" value={pct} onChange={(e) => setPct(e.target.value)} /></div>
        <Button onClick={addRule}>Add rule</Button>
      </Card>
      <Card className="overflow-hidden">
        <Table><TableHeader><TableRow><TableHead>Department</TableHead><TableHead>Max %</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{rules.map((r) => (
            <TableRow key={r.id}><TableCell>{deptName(r.department_id)}</TableCell><TableCell>{r.max_percent}%</TableCell>
              <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={async () => { await supabase.from("team_capacity_rules").delete().eq("id", r.id); load(); }}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </Card>

      <h2 className="text-lg font-medium">Date-specific overrides</h2>
      <Card className="p-4 grid sm:grid-cols-4 gap-3 items-end">
        <div><Label>Date</Label><Input type="date" value={oDate} onChange={(e) => setODate(e.target.value)} /></div>
        <div><Label>Max %</Label><Input type="number" value={oPct} onChange={(e) => setOPct(e.target.value)} /></div>
        <Button onClick={addOverride}>Add override</Button>
      </Card>
      <Card className="overflow-hidden">
        <Table><TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Department</TableHead><TableHead>Max %</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{overrides.map((r) => (
            <TableRow key={r.id}><TableCell>{r.date}</TableCell><TableCell>{deptName(r.department_id)}</TableCell><TableCell>{r.max_percent}%</TableCell>
              <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={async () => { await supabase.from("capacity_overrides").delete().eq("id", r.id); load(); }}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </div>
  );
}
