import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";
import { Pencil, Plus, Trash2 } from "lucide-react";

const empty = {
  name: "", color: "blue", days_per_year: 0, carry_forward_max: 0, expiry_month: null as number | null,
  probation_required: false, doc_required: false, half_day_allowed: true, skip_capacity_check: false,
  max_days_per_request: null as number | null, advance_notice_days: 0, gender_restriction: "any",
  monthly_accrual: false, seniority_based: false, deduct_from: "balance", is_replacement: false, paid: true, active: true,
  cancel_cutoff_days: 2,
};

export default function AdminLeaveTypes() {
  useSEO({ title: "Leave types — Admin" });
  const [rows, setRows] = useState<any[]>([]);
  const [editing, setEditing] = useState<any | null>(null);

  const load = useCallback(() => { supabase.from("leave_types").select("*").order("name").then(({ data }) => setRows(data ?? [])); }, []);
  useEffect(() => { load(); }, [load]);

  const save = async () => {
    const { id, ...payload } = editing;
    const fn = id ? supabase.from("leave_types").update(payload).eq("id", id) : supabase.from("leave_types").insert(payload);
    const { error } = await fn; if (error) return toast.error(error.message);
    toast.success("Saved"); setEditing(null); load();
  };
  const del = async (id: string) => { if (!confirm("Delete this leave type?")) return; const { error } = await supabase.from("leave_types").delete().eq("id", id); if (error) toast.error(error.message); else load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-semibold tracking-tight">Leave types</h1><Button onClick={() => setEditing({ ...empty })}><Plus className="h-4 w-4 mr-1" />New type</Button></div>
      <Card className="overflow-hidden">
        <Table>
          <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Days/yr</TableHead><TableHead>Carry max</TableHead><TableHead>Cancel window (days)</TableHead><TableHead>Gender</TableHead><TableHead>Paid</TableHead><TableHead>Active</TableHead><TableHead></TableHead></TableRow></TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">{r.name}</TableCell>
                <TableCell>{r.days_per_year}</TableCell>
                <TableCell>{r.carry_forward_max}</TableCell>
                <TableCell>{r.cancel_cutoff_days === 0 ? <span className="text-muted-foreground">Disabled</span> : `${r.cancel_cutoff_days} day(s)`}</TableCell>
                <TableCell className="capitalize">{r.gender_restriction}</TableCell>
                <TableCell>{r.paid ? "Yes" : "No"}</TableCell>
                <TableCell>{r.active ? "Yes" : "No"}</TableCell>
                <TableCell className="text-right space-x-1"><Button size="icon" variant="ghost" onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button><Button size="icon" variant="ghost" onClick={() => del(r.id)}><Trash2 className="h-4 w-4" /></Button></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Edit" : "New"} leave type</DialogTitle></DialogHeader>
          {editing && (
            <div className="grid sm:grid-cols-2 gap-3">
              <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div><Label>Color</Label>
                <Select value={editing.color} onValueChange={(v) => setEditing({ ...editing, color: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["blue", "green", "amber", "red", "purple", "gray"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Days per year</Label><Input type="number" value={editing.days_per_year} onChange={(e) => setEditing({ ...editing, days_per_year: Number(e.target.value) })} /></div>
              <div><Label>Carry-forward max</Label><Input type="number" value={editing.carry_forward_max} onChange={(e) => setEditing({ ...editing, carry_forward_max: Number(e.target.value) })} /></div>
              <div><Label>Max days per request</Label><Input type="number" value={editing.max_days_per_request ?? ""} onChange={(e) => setEditing({ ...editing, max_days_per_request: e.target.value ? Number(e.target.value) : null })} /></div>
              <div><Label>Advance notice (days)</Label><Input type="number" value={editing.advance_notice_days} onChange={(e) => setEditing({ ...editing, advance_notice_days: Number(e.target.value) })} /></div>
              <div className="sm:col-span-2">
                <Label>Cancel window (days after submission)</Label>
                <Input type="number" min={0} value={editing.cancel_cutoff_days ?? 0} onChange={(e) => setEditing({ ...editing, cancel_cutoff_days: Math.max(0, Number(e.target.value) || 0) })} />
                <p className="text-xs text-muted-foreground mt-1">Employees can request cancellation within this many days after submitting the leave request. Set 0 to disable.</p>
              </div>
              <div><Label>Gender restriction</Label>
                <Select value={editing.gender_restriction} onValueChange={(v) => setEditing({ ...editing, gender_restriction: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["any", "male", "female"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Deduct from</Label>
                <Select value={editing.deduct_from} onValueChange={(v) => setEditing({ ...editing, deduct_from: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{["balance", "none"].map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              {[
                ["probation_required", "Probation required"],
                ["doc_required", "Document required"],
                ["half_day_allowed", "Half-day allowed"],
                ["skip_capacity_check", "Skip capacity check"],
                ["monthly_accrual", "Monthly accrual"],
                ["seniority_based", "Seniority based"],
                ["is_replacement", "Replacement leave"],
                ["paid", "Paid"],
                ["active", "Active"],
              ].map(([k, l]) => (
                <label key={k} className="flex items-center justify-between rounded-lg border p-3"><span className="text-sm">{l}</span><Switch checked={!!editing[k]} onCheckedChange={(v) => setEditing({ ...editing, [k]: v })} /></label>
              ))}
            </div>
          )}
          <DialogFooter><Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button><Button onClick={save}>Save</Button></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
