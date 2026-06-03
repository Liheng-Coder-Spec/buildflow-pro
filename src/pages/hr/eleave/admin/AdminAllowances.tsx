import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

export default function AdminAllowances() {
  useSEO({ title: "Allowances — Admin" });
  const [rows, setRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const year = new Date().getFullYear();

  const load = useCallback(async () => {
    const [b, p, t] = await Promise.all([
      supabase.from("eleave_leave_balances").select("*, profiles!leave_balances_user_id_fkey(full_name,email,years_of_service), leave_types(name,seniority_based,id)").eq("year", year),
      supabase.from("profiles").select("id,full_name,email,years_of_service"),
      supabase.from("eleave_leave_types").select("*"),
    ]);
    setRows(b.data ?? []); setProfiles(p.data ?? []); setTypes(t.data ?? []);
  }, [year]);
  useEffect(() => { load(); }, [load]);

  const update = async (id: string, field: string, value: number) => {
    const patch: any = { [field]: value };
    const { error } = await supabase.from("eleave_leave_balances").update(patch).eq("id", id);
    if (error) toast.error(error.message); else load();
  };

  const autoBySeniority = async () => {
    const { data: rules } = await supabase.from("eleave_seniority_rules").select("*").order("min_years", { ascending: false });
    let n = 0;
    for (const p of profiles) {
      const ys = Number(p.years_of_service ?? 0);
      for (const t of types.filter((x) => x.seniority_based)) {
        const tier = (rules ?? []).find((r) => r.leave_type_id === t.id && Number(r.min_years) <= ys);
        if (!tier) continue;
        await supabase.from("eleave_leave_balances").upsert({ user_id: p.id, leave_type_id: t.id, year, yearly_allowance: Number(tier.days) }, { onConflict: "user_id,leave_type_id,year" });
        n++;
      }
    }
    toast.success(`Updated ${n} balances.`); load();
  };

  const exportCSV = () => {
    const header = "Employee,Email,Type,Year,Yearly,Carried,Used,Expired,Adjustments\n";
    const lines = rows.map((r) => [r.profiles?.full_name, r.profiles?.email, r.leave_types?.name, r.year, r.yearly_allowance, r.carried_over, r.used, r.expired, r.adjustments].join(","));
    const blob = new Blob([header + lines.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `allowances-${year}.csv`; a.click(); URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Allowances · {year}</h1>
        <div className="flex gap-2"><Button variant="outline" onClick={exportCSV}>Export CSV</Button><Button onClick={autoBySeniority}>Auto-assign by seniority</Button></div>
      </div>
      <Card className="overflow-hidden">
        <Table><TableHeader><TableRow><TableHead>Employee</TableHead><TableHead>Type</TableHead><TableHead>Yearly</TableHead><TableHead>Carried</TableHead><TableHead>Used</TableHead><TableHead>Adjustments</TableHead></TableRow></TableHeader>
          <TableBody>{rows.map((r) => (
            <TableRow key={r.id}>
              <TableCell><div className="text-sm font-medium">{r.profiles?.full_name}</div><div className="text-xs text-muted-foreground">{r.profiles?.email}</div></TableCell>
              <TableCell>{r.leave_types?.name}</TableCell>
              <TableCell><Input className="h-8 w-20" type="number" defaultValue={r.yearly_allowance} onBlur={(e) => update(r.id, "yearly_allowance", Number(e.target.value))} /></TableCell>
              <TableCell><Input className="h-8 w-20" type="number" defaultValue={r.carried_over} onBlur={(e) => update(r.id, "carried_over", Number(e.target.value))} /></TableCell>
              <TableCell>{r.used}</TableCell>
              <TableCell><Input className="h-8 w-20" type="number" defaultValue={r.adjustments} onBlur={(e) => update(r.id, "adjustments", Number(e.target.value))} /></TableCell>
            </TableRow>
          ))}</TableBody>
        </Table>
      </Card>
    </div>
  );
}
