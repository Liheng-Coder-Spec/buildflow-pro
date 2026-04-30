import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface GanttTask {
  id: string;
  title: string;
  code: string | null;
  wbs_node_id: string | null;
  planned_start: string | null;
  planned_end: string | null;
  actual_start: string | null;
  actual_end: string | null;
  progress_pct: number;
  status: string;
}

export function useWbsGantt(projectId: string | null | undefined) {
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) {
      setTasks([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("tasks")
      .select("id, title, code, wbs_node_id, planned_start, planned_end, actual_start, actual_end, progress_pct, status")
      .eq("project_id", projectId)
      .order("planned_start", { ascending: true, nullsFirst: false });
    if (!error) {
      setTasks((data ?? []) as GanttTask[]);
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { tasks, loading, refresh: load };
}
