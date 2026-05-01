import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { computeBlockedness, type DepLink, type SchedTask } from "@/lib/schedule";

export function useTaskBlockedness(projectId: string | null | undefined) {
  const [tasks, setTasks] = useState<SchedTask[]>([]);
  const [deps, setDeps] = useState<DepLink[]>([]);

  useEffect(() => {
    if (!projectId) {
      setTasks([]);
      setDeps([]);
      return;
    }
    let cancelled = false;
    (async () => {
      const { data: ts } = await supabase
        .from("tasks")
        .select("id, planned_start, planned_end, status, actual_end, progress_pct")
        .eq("project_id", projectId);
      if (cancelled) return;
      const taskRows = (ts ?? []) as SchedTask[];
      setTasks(taskRows);
      if (taskRows.length === 0) { setDeps([]); return; }
      const ids = taskRows.map((t) => t.id);
      const { data: ds } = await supabase
        .from("task_predecessors")
        .select("task_id, predecessor_id, relation_type, lag_days, is_hard_block")
        .in("task_id", ids);
      if (cancelled) return;
      setDeps((ds ?? []) as DepLink[]);
    })();
    return () => { cancelled = true; };
  }, [projectId]);

  const blockedMap = useMemo(() => computeBlockedness(tasks, deps), [tasks, deps]);
  return { blockedMap, tasks, deps };
}
