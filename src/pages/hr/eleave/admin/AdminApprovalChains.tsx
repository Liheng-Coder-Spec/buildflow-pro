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

export default function AdminApprovalChains() {
  useSEO({ title: "Approval chains — Admin" });
  const [rows, setRows] = useState<any[]>([]);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [scope, setScope] = useState("company");
  const [user_id, setUserId] = useState<string | null>(null);
  const [department_id, setDeptId] = useState<string | null>(null);
  const [approver_id, setApprover] = useState("");
  const [level, setLevel] = useState("1");

  const load = useCallback(async () => {
    const [a, p, d] = await Promise.all([
      supabase.from("approval_chains").select("*").order("scope").order("level"),
      supabase.from("profiles").select("id,full_name,email"),
      supabase.from("departments").select("*"),
    ]);
    setRows(a.data ?? []); setProfiles(p.data ?? []); setDepts(d.data ?? []);
  }, []);
  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!approver_id) return toast.error("Pick an approver.");
    const { error } = await supabase.from("approval_chains").insert({
      scope, approver_id, level: Number(level),
      user_id: scope === "personal" ? user_id : null,
      department_id: scope === "department" ? department_id : null,
    });
    if (error) return toast.error(error.message);
    toast.success("Added"); load();
  };
  const del = async (id: string) => { await supabase.from("approval_chains").delete().eq("id", id); load(); };

  const nameOf = (id: string) => profiles.find((p) => p.id === id)?.full_name ?? id;
  const deptOf = (id: string | null) => depts.find((d) => d.id === id)?.name ?? "—";

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Approval chains</h1>
      <p className="text-sm text-muted-foreground">Resolution order: personal → department → company → org-chart supervisor → admin fallback.</p>
      <Card className="p-4 grid sm:grid-cols-6 gap-3 items-end">
        <div className="sm:col-span-1"><Label>Scope</Label>
          <Select value={scope} onValueChange={setScope}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["personal", "department", "company"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
        </div>
        {scope === "personal" && <div className="sm:col-span-2"><Label>For employee</Label>
          <Select value={user_id ?? ""} onValueChange={setUserId}><SelectTrigger><SelectValue placeholder="…" /></SelectTrigger><SelectContent>{profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}</SelectContent></Select>
        </div>}
        {scope === "department" && <div className="sm:col-span-2"><Label>Department</Label>
          <Select value={department_id ?? ""} onValueChange={setDeptId}><SelectTrigger><SelectValue placeholder="…" /></SelectTrigger><SelectContent>{depts.map((p) => <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>)}</SelectContent></Select>
        </div>}
        <div className="sm:col-span-2"><Label>Approver</Label>
          <Select value={approver_id} onValueChange={setApprover}><SelectTrigger><SelectValue placeholder="…" /></SelectTrigger><SelectContent>{profiles.map((p) => <SelectItem key={p.id} value={p.id}>{p.full_name || p.email}</SelectItem>)}</SelectContent></Select>
        </div>
        <div><Label>Level</Label><Input type="number" min="1" value={level} onChange={(e) => setLevel(e.target.value)} /></div>
        <Button onClick={add}>Add</Button>
      </Card>

      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Scope</TableHead><TableHead>Target</TableHead><TableHead>Approver</TableHead><TableHead>Level</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="capitalize">{r.scope}</TableCell>
                <TableCell>{r.scope === "personal" ? nameOf(r.user_id) : r.scope === "department" ? deptOf(r.department_id) : "All"}</TableCell>
                <TableCell>{nameOf(r.approver_id)}</TableCell>
                <TableCell>{r.level}</TableCell>
                <TableCell className="text-right"><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
