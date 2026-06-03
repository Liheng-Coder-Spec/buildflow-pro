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

export default function AdminSeniority() {
  useSEO({ title: "Seniority rules — Admin" });
  const [rows, setRows] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [type, setType] = useState("");
  const [years, setYears] = useState("0");
  const [days, setDays] = useState("14");

  const load = useCallback(async () => {
    const [r, t] = await Promise.all([supabase.from("seniority_rules").select("*, leave_types(name)").order("min_years"), supabase.from("leave_types").select("*").eq("seniority_based", true)]);
    setRows(r.data ?? []); setTypes(t.data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!type) return toast.error("Pick a leave type.");
    const { error } = await supabase.from("seniority_rules").insert({ leave_type_id: type, min_years: Number(years), days: Number(days) });
    if (error) return toast.error(error.message);
    load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Seniority rules</h1>
      <Card className="p-4 grid sm:grid-cols-5 gap-3 items-end">
        <div className="sm:col-span-2"><Label>Leave type</Label>
          <Select value={type} onValueChange={setType}><SelectTrigger><SelectValue placeholder="…" /></SelectTrigger>
            <SelectContent>{types.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label>Min years</Label><Input type="number" value={years} onChange={(e) => setYears(e.target.value)} /></div>
        <div><Label>Days</Label><Input type="number" value={days} onChange={(e) => setDays(e.target.value)} /></div>
        <Button onClick={add}>Add tier</Button>
      </Card>
      <Card className="overflow-hidden">
        <Table><TableHeader><TableRow><TableHead>Type</TableHead><TableHead>Min years</TableHead><TableHead>Days</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>{rows.map((r) => (
            <TableRow key={r.id}><TableCell>{r.leave_types?.name}</TableCell><TableCell>{r.min_years}</TableCell><TableCell>{r.days}</TableCell>
              <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={async () => { await supabase.from("seniority_rules").delete().eq("id", r.id); load(); }}><Trash2 className="h-4 w-4" /></Button></TableCell></TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </div>
  );
}
