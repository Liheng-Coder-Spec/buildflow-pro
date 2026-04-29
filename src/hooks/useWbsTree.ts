import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WbsNode, buildWbsTree, WbsTreeNode } from "@/lib/wbsMeta";

export interface WbsNodeStat {
  avgProgress: number;
  taskCount: number;
  minStart: string | null;
  maxEnd: string | null;
}

export function useWbsTree(projectId: string | null | undefined) {
  const [nodes, setNodes] = useState<WbsNode[]>([]);
  const [tree, setTree] = useState<WbsTreeNode[]>([]);
  const [nodeStats, setNodeStats] = useState<Map<string, WbsNodeStat>>(new Map());
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) {
      setNodes([]);
      setTree([]);
      setNodeStats(new Map());
      return;
    }
    setLoading(true);

    const [nodesRes, tasksRes] = await Promise.all([
      supabase
        .from("wbs_nodes")
        .select("*")
        .eq("project_id", projectId)
        .order("sort_order", { ascending: true }),
      supabase
        .from("tasks")
        .select("wbs_node_id, progress_pct, planned_start, planned_end")
        .eq("project_id", projectId)
        .not("wbs_node_id", "is", null),
    ]);

    if (!nodesRes.error) {
      const rows = (nodesRes.data ?? []) as WbsNode[];
      setNodes(rows);
      setTree(buildWbsTree(rows));
    }

    if (!tasksRes.error) {
      const statsMap = new Map<string, WbsNodeStat>();
      const taskData = tasksRes.data ?? [];

      // Group tasks by wbs_node_id
      const grouped = new Map<string, typeof taskData>();
      taskData.forEach((t) => {
        if (!t.wbs_node_id) return;
        if (!grouped.has(t.wbs_node_id)) grouped.set(t.wbs_node_id, []);
        grouped.get(t.wbs_node_id)!.push(t);
      });

      grouped.forEach((tasks, nodeId) => {
        const avgProgress =
          tasks.reduce((sum, t) => sum + (t.progress_pct ?? 0), 0) / tasks.length;
        const starts = tasks.map((t) => t.planned_start).filter(Boolean) as string[];
        const ends = tasks.map((t) => t.planned_end).filter(Boolean) as string[];
        statsMap.set(nodeId, {
          avgProgress: Math.round(avgProgress),
          taskCount: tasks.length,
          minStart: starts.length ? [...starts].sort()[0] : null,
          maxEnd: ends.length ? [...ends].sort().at(-1)! : null,
        });
      });

      setNodeStats(statsMap);
    }

    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { nodes, tree, nodeStats, loading, refresh: load };
}
