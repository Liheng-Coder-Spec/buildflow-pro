import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { WbsNode, buildWbsTree, WbsTreeNode } from "@/lib/wbsMeta";

export function useWbsTree(projectId: string | null | undefined) {
  const [nodes, setNodes] = useState<WbsNode[]>([]);
  const [tree, setTree] = useState<WbsTreeNode[]>([]);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!projectId) {
      setNodes([]);
      setTree([]);
      return;
    }
    setLoading(true);
    const { data, error } = await supabase
      .from("wbs_nodes")
      .select("*")
      .eq("project_id", projectId)
      .order("sort_order", { ascending: true });
    if (!error) {
      const rows = (data ?? []) as WbsNode[];
      setNodes(rows);
      setTree(buildWbsTree(rows));
    }
    setLoading(false);
  }, [projectId]);

  useEffect(() => {
    load();
  }, [load]);

  return { nodes, tree, loading, refresh: load };
}
