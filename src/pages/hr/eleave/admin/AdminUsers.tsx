import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

export default function AdminUsers() {
  useSEO({ title: "Users — Admin" });
  const [rows, setRows] = useState<any[]>([]);
  const [depts, setDepts] = useState<any[]>([]);
  const [roles, setRoles] = useState<Record<string, string[]>>({});

  const load = useCallback(async () => {
    const [p, d, r] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("departments").select("*"),
      supabase.from("user_roles").select("user_id,role"),
    ]);
    setRows(p.data ?? []); setDepts(d.data ?? []);
    const map: Record<string, string[]> = {};
    (r.data ?? []).forEach((x) => { (map[x.user_id] ||= []).push(x.role); });
    setRoles(map);
  }, []);
  useEffect(() => { load(); }, [load]);

  const update = async (id: string, patch: any) => { const { error } = await supabase.from("profiles").update(patch).eq("id", id); if (error) toast.error(error.message); else load(); };

  const setRole = async (uid: string, newRole: string) => {
    // remove all then add
    await supabase.from("user_roles").delete().eq("user_id", uid);
    await supabase.from("user_roles").insert({ user_id: uid, role: newRole as any });
    toast.success("Role updated"); load();
  };

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Users</h1>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Department</TableHead><TableHead>Gender</TableHead><TableHead>Years</TableHead><TableHead>Probation end</TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((p) => {
              const role = roles[p.id]?.[0] ?? "employee";
              return (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.full_name}</TableCell>
                  <TableCell className="text-sm">{p.email}</TableCell>
                  <TableCell>
                    <Select value={role} onValueChange={(v) => setRole(p.id, v)}>
                      <SelectTrigger className="h-8 w-32"><SelectValue /></SelectTrigger>
                      <SelectContent>{["admin", "supervisor", "employee"].map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={p.department_id ?? "__none__"} onValueChange={(v) => update(p.id, { department_id: v === "__none__" ? null : v })}>
                      <SelectTrigger className="h-8 w-40"><SelectValue /></SelectTrigger>
                      <SelectContent><SelectItem value="__none__">—</SelectItem>{depts.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select value={p.gender} onValueChange={(v) => update(p.id, { gender: v })}>
                      <SelectTrigger className="h-8 w-28"><SelectValue /></SelectTrigger>
                      <SelectContent>{["any", "male", "female"].map((g) => <SelectItem key={g} value={g}>{g}</SelectItem>)}</SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell><Input className="h-8 w-20" type="number" step="0.5" defaultValue={p.years_of_service} onBlur={(e) => update(p.id, { years_of_service: Number(e.target.value) })} /></TableCell>
                  <TableCell><Input className="h-8 w-36" type="date" defaultValue={p.probation_end_date ?? ""} onBlur={(e) => update(p.id, { probation_end_date: e.target.value || null })} /></TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
