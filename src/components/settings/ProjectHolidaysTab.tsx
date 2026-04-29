import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import { useProjectHolidays } from "@/hooks/useProjectHolidays";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { CalendarOff, Loader2, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, isValid } from "date-fns";

export function ProjectHolidaysTab() {
  const { user, roles } = useAuth();
  const { activeProject } = useProjects();
  const { holidays, loading, refresh } = useProjectHolidays(activeProject?.id ?? null);
  const [date, setDate] = useState("");
  const [label, setLabel] = useState("");
  const [adding, setAdding] = useState(false);

  const canEdit = roles.includes("admin") || roles.includes("project_manager");

  const onAdd = async () => {
    if (!activeProject) return;
    if (!date) { toast.error("Pick a date"); return; }
    setAdding(true);
    const { error } = await supabase.from("project_holidays").insert({
      project_id: activeProject.id,
      holiday_date: date,
      label: label.trim() || null,
      created_by: user?.id ?? null,
    } as any);
    setAdding(false);
    if (error) { toast.error(error.message); return; }
    toast.success("Holiday added");
    setDate("");
    setLabel("");
    refresh();
  };

  const onRemove = async (id: string) => {
    const { error } = await supabase.from("project_holidays").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Holiday removed");
    refresh();
  };

  if (!activeProject) {
    return (
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          Select a project to manage its holidays.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <CalendarOff className="h-4 w-4" /> Project holidays
        </CardTitle>
        <CardDescription>
          Non-working days for {activeProject.code}. Used by the schedule and Gantt to skip days.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canEdit && (
          <div className="grid grid-cols-12 gap-2 items-end border rounded-md p-3 bg-muted/20">
            <div className="col-span-4">
              <Label className="text-xs">Date</Label>
              <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </div>
            <div className="col-span-6">
              <Label className="text-xs">Label (optional)</Label>
              <Input
                placeholder="New Year's Day"
                value={label}
                onChange={(e) => setLabel(e.target.value)}
              />
            </div>
            <div className="col-span-2">
              <Button onClick={onAdd} disabled={adding || !date} className="w-full">
                {adding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                Add
              </Button>
            </div>
          </div>
        )}

        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : holidays.length === 0 ? (
          <div className="text-sm text-muted-foreground italic text-center py-6">
            No holidays defined yet.
          </div>
        ) : (
          <ul className="divide-y border rounded-md">
            {holidays.map((h) => {
              const d = parseISO(h.holiday_date);
              return (
                <li key={h.id} className="flex items-center justify-between px-3 py-2 text-sm">
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {isValid(d) ? format(d, "EEE, MMM d, yyyy") : h.holiday_date}
                    </Badge>
                    {h.label && <span>{h.label}</span>}
                  </div>
                  {canEdit && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onRemove(h.id)}
                      className="text-destructive hover:bg-destructive/10"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
