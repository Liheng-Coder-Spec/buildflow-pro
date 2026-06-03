import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Sparkles, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import { useSEO } from "@/hooks/useSEO";

type Holiday = {
  id: string;
  holiday_date: string;
  name: string;
  note: string | null;
};

const MONTHS_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
const WEEKDAY_FULL = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

function parseDate(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}
function fmtDDMMYYYY(d: Date) {
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

// Cambodia 2026 reference for bulk seed (same set as migration)
const CAMBODIA_HOLIDAYS_REF: { mmdd: string; name: string }[] = [
  { mmdd: "01-01", name: "International New Year Day" },
  { mmdd: "01-07", name: "Victory Day over the Genocidal Regime" },
  { mmdd: "03-08", name: "International Women's Day" },
  { mmdd: "04-14", name: "Khmer New Year Day" },
  { mmdd: "04-15", name: "Khmer New Year Day" },
  { mmdd: "04-16", name: "Khmer New Year Day" },
  { mmdd: "05-01", name: "International Labor Day" },
  { mmdd: "05-05", name: "Royal Plowing Ceremony" },
  { mmdd: "05-14", name: "King Norodom Sihamoni's Birthday" },
  { mmdd: "05-20", name: "Peace Day in Cambodia" },
  { mmdd: "06-18", name: "Queen Mother Norodom Monineath's Birthday" },
  { mmdd: "09-24", name: "Constitutional Day" },
  { mmdd: "10-09", name: "Pchum Ben Day" },
  { mmdd: "10-10", name: "Pchum Ben Day" },
  { mmdd: "10-11", name: "Pchum Ben Day" },
  { mmdd: "10-15", name: "Commemoration Day of King's Father" },
  { mmdd: "10-29", name: "Coronation Day of King Norodom Sihamoni" },
  { mmdd: "11-09", name: "National Independence Day" },
  { mmdd: "11-23", name: "Water Festival" },
  { mmdd: "11-24", name: "Water Festival" },
  { mmdd: "11-25", name: "Water Festival" },
];

export default function AdminPublicHolidays() {
  useSEO({ title: "Manage Public Holidays — Admin" });

  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [loading, setLoading] = useState(false);

  const [editing, setEditing] = useState<Holiday | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState({ name: "", holiday_date: "", note: "" });
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const yearOptions = useMemo(() => {
    const base = today.getFullYear();
    const arr: number[] = [];
    for (let y = base - 2; y <= base + 5; y++) arr.push(y);
    return arr;
  }, [today]);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from("eleave_public_holidays")
      .select("*")
      .gte("holiday_date", `${year}-01-01`)
      .lte("holiday_date", `${year}-12-31`)
      .order("holiday_date", { ascending: true });
    setHolidays((data ?? []) as Holiday[]);
    setLoading(false);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [year]);

  function openAdd() {
    setEditing(null);
    setForm({ name: "", holiday_date: `${year}-01-01`, note: "" });
    setDialogOpen(true);
  }

  function openEdit(h: Holiday) {
    setEditing(h);
    setForm({ name: h.name, holiday_date: h.holiday_date, note: h.note ?? "" });
    setDialogOpen(true);
  }

  async function save() {
    if (!form.name.trim() || !form.holiday_date) {
      toast.error("Name and date are required");
      return;
    }
    if (editing) {
      const { error } = await supabase
        .from("eleave_public_holidays")
        .update({
          name: form.name.trim(),
          holiday_date: form.holiday_date,
          note: form.note.trim() || null,
        })
        .eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Holiday updated");
    } else {
      const { error } = await supabase.from("eleave_public_holidays").insert({
        name: form.name.trim(),
        holiday_date: form.holiday_date,
        note: form.note.trim() || null,
      });
      if (error) return toast.error(error.message);
      toast.success("Holiday added");
    }
    setDialogOpen(false);
    load();
  }

  async function confirmDelete() {
    if (!deleteId) return;
    const { error } = await supabase.from("eleave_public_holidays").delete().eq("id", deleteId);
    if (error) toast.error(error.message);
    else toast.success("Holiday deleted");
    setDeleteId(null);
    load();
  }

  async function bulkSeed() {
    const rows = CAMBODIA_HOLIDAYS_REF.map((h) => ({
      holiday_date: `${year}-${h.mmdd}`,
      name: h.name,
    }));
    const { error } = await supabase
      .from("eleave_public_holidays")
      .upsert(rows, { onConflict: "holiday_date", ignoreDuplicates: true });
    if (error) return toast.error(error.message);
    toast.success(`Seeded ${rows.length} Cambodia holidays for ${year}`);
    load();
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold flex items-center gap-2">
            <CalendarDays className="h-6 w-6 text-primary" />
            Manage Public Holidays
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Add, edit or remove holidays. Use bulk seed for Cambodia presets.
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {yearOptions.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={bulkSeed}>
            <Sparkles className="h-4 w-4" />
            Seed Cambodia {year}
          </Button>
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add holiday
          </Button>
        </div>
      </div>

      <Card className="overflow-hidden rounded-xl">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground">Loading...</div>
        ) : holidays.length === 0 ? (
          <div className="p-12 text-center text-muted-foreground">
            <CalendarDays className="h-10 w-10 mx-auto mb-3 opacity-40" />
            No holidays for {year}. Click <span className="font-medium">Seed Cambodia {year}</span> or add manually.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-muted/50">
                <tr className="text-left">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Day</th>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Note</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {holidays.map((h) => {
                  const d = parseDate(h.holiday_date);
                  return (
                    <tr key={h.id} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-3">
                        <span className="font-mono text-xs px-2 py-1 rounded-md bg-background border">
                          {String(d.getDate()).padStart(2, "0")} {MONTHS_SHORT[d.getMonth()]} {d.getFullYear()}
                        </span>
                        <div className="text-xs text-muted-foreground mt-1">{fmtDDMMYYYY(d)}</div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{WEEKDAY_FULL[d.getDay()]}</td>
                      <td className="px-4 py-3 font-medium">{h.name}</td>
                      <td className="px-4 py-3 text-muted-foreground">{h.note ?? "—"}</td>
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex gap-1">
                          <Button size="icon" variant="ghost" onClick={() => openEdit(h)} aria-label="Edit">
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => setDeleteId(h.id)}
                            aria-label="Delete"
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Edit holiday" : "Add holiday"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="h-name">Name</Label>
              <Input
                id="h-name"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="e.g. Khmer New Year Day"
              />
            </div>
            <div>
              <Label htmlFor="h-date">Date</Label>
              <Input
                id="h-date"
                type="date"
                value={form.holiday_date}
                onChange={(e) => setForm({ ...form, holiday_date: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="h-note">Note (optional)</Label>
              <Textarea
                id="h-note"
                value={form.note}
                onChange={(e) => setForm({ ...form, note: e.target.value })}
                placeholder="Additional details"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={save}>{editing ? "Save changes" : "Add holiday"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this holiday?</AlertDialogTitle>
            <AlertDialogDescription>
              This will remove it from everyone's holiday list. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
