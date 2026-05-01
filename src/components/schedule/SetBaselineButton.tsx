import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Loader2, Flag } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Props {
  projectId: string;
  canEdit: boolean;
  onDone?: () => void;
}

export function SetBaselineButton({ projectId, canEdit, onDone }: Props) {
  const [busy, setBusy] = useState(false);

  const apply = async () => {
    setBusy(true);
    // Copy planned_start/end → baseline_start/end for every task in this project
    const { data: ts, error } = await supabase
      .from("tasks")
      .select("id, planned_start, planned_end")
      .eq("project_id", projectId);
    if (error) { toast.error(error.message); setBusy(false); return; }
    let ok = 0; let fail = 0;
    for (const t of ts ?? []) {
      const { error: e } = await supabase
        .from("tasks")
        .update({ baseline_start: t.planned_start, baseline_end: t.planned_end } as any)
        .eq("id", t.id);
      if (e) fail++; else ok++;
    }
    setBusy(false);
    if (fail) toast.error(`Set ${ok} baseline${ok === 1 ? "" : "s"}, ${fail} failed`);
    else toast.success(`Baseline set for ${ok} task${ok === 1 ? "" : "s"}`);
    onDone?.();
  };

  if (!canEdit) return null;

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5">
          <Flag className="h-3.5 w-3.5" /> Set baseline
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Set project baseline?</AlertDialogTitle>
          <AlertDialogDescription>
            This snapshots the current planned dates for every task into the baseline. Variance bars on
            the Gantt will be measured from this point. You can re-baseline later, but this overwrites
            any previous baseline.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={busy}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={apply} disabled={busy}>
            {busy && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Set baseline
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
