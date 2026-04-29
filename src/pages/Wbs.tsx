import { useEffect, useMemo, useState } from "react";
import { useProjects } from "@/contexts/ProjectContext";
import { useAuth } from "@/contexts/AuthContext";
import { useWbsTree } from "@/hooks/useWbsTree";
import { useWbsSchedule } from "@/hooks/useWbsSchedule";
import { useProjectHolidays } from "@/hooks/useProjectHolidays";
import { supabase } from "@/integrations/supabase/client";
import {
  ResizablePanelGroup, ResizablePanel, ResizableHandle,
} from "@/components/ui/resizable";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { WbsTree } from "@/components/wbs/WbsTree";
import { WbsNodeEditor } from "@/components/wbs/WbsNodeEditor";
import { WbsAssignmentsTab } from "@/components/wbs/WbsAssignmentsTab";
import { WbsScheduleCard } from "@/components/wbs/WbsScheduleCard";
import { WbsGantt } from "@/components/wbs/WbsGantt";
import {
  Search, PanelLeftClose, PanelLeftOpen, ChevronRight,
} from "lucide-react";
import { WBS_NODE_TYPE_LABELS } from "@/lib/wbsMeta";

type EditMode =
  | { kind: "view" }
  | { kind: "edit"; nodeId: string }
  | { kind: "create"; parentId: string | null };

const STORAGE_KEY = "buildtrack.wbs.layout";

export default function WbsPage() {
  const { activeProject } = useProjects();
  const { roles } = useAuth();
  const projectId = activeProject?.id ?? null;
  const { nodes, tree, loading, refresh } = useWbsTree(projectId);
  const { tasks, rollupByNode } = useWbsSchedule(projectId, nodes);
  const { dateSet: holidaySet } = useProjectHolidays(projectId);
  const [predecessors, setPredecessors] = useState<any[]>([]);

  useEffect(() => {
    if (!projectId || tasks.length === 0) { setPredecessors([]); return; }
    const ids = tasks.map((t) => t.id);
    supabase
      .from("task_predecessors")
      .select("task_id, predecessor_id, relation_type, lag_days")
      .in("task_id", ids)
      .then(({ data }) => setPredecessors(data ?? []));
  }, [projectId, tasks]);

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"tree" | "gantt">("tree");
  const [treeOpen, setTreeOpen] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved).treeOpen ?? true : true;
  });
  const [mode, setMode] = useState<EditMode>({ kind: "view" });

  const canEdit = roles.includes("admin") || roles.includes("project_manager");
  const canManage = canEdit;

  const selectedNode = useMemo(
    () => nodes.find((n) => n.id === selectedId) ?? null,
    [nodes, selectedId],
  );

  const getRollup = (id: string) => rollupByNode.get(id);

  const toggleTree = () => {
    const next = !treeOpen;
    setTreeOpen(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ treeOpen: next }));
  };

  if (!activeProject) {
    return (
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">Work Breakdown Structure</h1>
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            Select a project from the top bar to manage its WBS.
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4 h-[calc(100vh-9rem)] flex flex-col">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Work Breakdown Structure</h1>
          <p className="text-muted-foreground">
            {activeProject.code} · {activeProject.name}
            <span className="ml-2 text-xs">{nodes.length} node{nodes.length === 1 ? "" : "s"}</span>
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={toggleTree}>
          {treeOpen ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
          {treeOpen ? "Hide tree" : "Show tree"}
        </Button>
      </div>

      <Card className="flex-1 min-h-0 overflow-hidden">
        <ResizablePanelGroup direction="horizontal" className="h-full">
          {treeOpen && (
            <>
              <ResizablePanel defaultSize={32} minSize={20} maxSize={55} className="flex flex-col">
                <div className="p-2 border-b">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search nodes..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-9 h-9"
                    />
                  </div>
                </div>
                <div className="flex-1 overflow-auto p-2">
                  {loading ? (
                    <div className="space-y-2 px-2">
                      {[...Array(6)].map((_, i) => <Skeleton key={i} className="h-7 w-full" />)}
                    </div>
                  ) : (
                    <WbsTree
                      nodes={tree}
                      selectedId={selectedId}
                      onSelect={(id) => {
                        setSelectedId(id);
                        setMode({ kind: "view" });
                      }}
                      onAddChild={(parentId) => {
                        setSelectedId(parentId);
                        setMode({ kind: "create", parentId });
                      }}
                      canEdit={canEdit}
                      search={search}
                    />
                  )}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}

          <ResizablePanel defaultSize={treeOpen ? 68 : 100} minSize={40}>
            <div className="h-full overflow-auto p-4">
              {mode.kind === "create" ? (
                <WbsNodeEditor
                  projectId={projectId!}
                  node={null}
                  parentId={mode.parentId}
                  parentPath={mode.parentId ? nodes.find((n) => n.id === mode.parentId)?.path_text ?? null : null}
                  canEdit={canEdit}
                  onSaved={async () => {
                    await refresh();
                    setMode({ kind: "view" });
                  }}
                  onDeleted={() => setMode({ kind: "view" })}
                  onCancel={() => setMode({ kind: "view" })}
                />
              ) : selectedNode ? (
                <div className="space-y-4">
                  {/* Breadcrumb */}
                  <div className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground">
                    {selectedNode.path.map((c, i) => (
                      <span key={i} className="inline-flex items-center gap-1">
                        {i > 0 && <ChevronRight className="h-3 w-3" />}
                        <span className={i === selectedNode.path.length - 1 ? "text-foreground font-medium" : ""}>
                          {c}
                        </span>
                      </span>
                    ))}
                  </div>

                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-2xl font-semibold">{selectedNode.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary">{WBS_NODE_TYPE_LABELS[selectedNode.node_type]}</Badge>
                        <span className="font-mono text-xs text-muted-foreground">{selectedNode.code}</span>
                      </div>
                    </div>
                    {canEdit && mode.kind !== "edit" && (
                      <Button variant="outline" onClick={() => setMode({ kind: "edit", nodeId: selectedNode.id })}>
                        Edit details
                      </Button>
                    )}
                  </div>

                  <Tabs defaultValue={mode.kind === "edit" ? "edit" : "details"}>
                    <TabsList>
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="permissions">Permissions</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="mt-4">
                      <Card>
                        <CardContent className="p-6 space-y-3 text-sm">
                          <Row label="Type">{WBS_NODE_TYPE_LABELS[selectedNode.node_type]}</Row>
                          <Row label="Code"><span className="font-mono">{selectedNode.code}</span></Row>
                          <Row label="Full path"><span className="font-mono">{selectedNode.path_text}</span></Row>
                          <Row label="Depth">{selectedNode.depth}</Row>
                          <Row label="Description">
                            {selectedNode.description || <span className="text-muted-foreground italic">None</span>}
                          </Row>
                        </CardContent>
                      </Card>
                    </TabsContent>

                    <TabsContent value="edit" className="mt-4">
                      <WbsNodeEditor
                        projectId={projectId!}
                        node={selectedNode}
                        parentId={selectedNode.parent_id}
                        parentPath={null}
                        canEdit={canEdit}
                        onSaved={refresh}
                        onDeleted={async () => {
                          setSelectedId(null);
                          setMode({ kind: "view" });
                          await refresh();
                        }}
                        onCancel={() => setMode({ kind: "view" })}
                      />
                    </TabsContent>

                    <TabsContent value="permissions" className="mt-4">
                      <WbsAssignmentsTab
                        nodeId={selectedNode.id}
                        nodePath={selectedNode.path_text}
                        canManage={canManage}
                      />
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <div className="h-full flex items-center justify-center text-center text-muted-foreground p-12">
                  <div>
                    <p>Select a node from the tree to view details</p>
                    {canEdit && tree.length === 0 && (
                      <Button className="mt-4" onClick={() => setMode({ kind: "create", parentId: null })}>
                        Create first WBS node
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>
      </Card>
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div>{children}</div>
    </div>
  );
}
