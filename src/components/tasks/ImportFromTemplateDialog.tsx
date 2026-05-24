import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useProjects } from "@/contexts/ProjectContext";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
  DialogFooter, DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FolderInput, Loader2, Info, Search, X, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { WbsNodePicker } from "@/components/wbs/WbsNodePicker";
import { WbsTreeNode } from "@/lib/wbsMeta";
import { Department, DEPT_INITIAL_STAGE } from "@/lib/departmentMeta";
import {
  TaskWorkflowType, TaskCategory, CATEGORIES_BY_WORKFLOW,
} from "@/lib/taskCategoryMeta";
import { TaskStatus } from "@/lib/taskMeta";
import { recordAuditEventSafe } from "@/services/auditService";
import { cn } from "@/lib/utils";

type SourceKind = "construction" | "design" | "procurement";

interface TemplateRow {
  id: string;
  template_code: string;
  template_name: string;
  discipline: string;
  phase: string;
  element_code: string | null;
  description: string | null;
  grouping_method: string;
  default_quantity_unit: string;
  default_task_status: string;
}

interface DesignTaskRow {
  id: string;
  task_code: string;
  task_name: string;
  note: string | null;
  design_stage_id: string | null;
  design_stages: { code: string; name: string } | null;
}

interface ProcurementTaskRow {
  id: string;
  package_number: string;
  package_description: string;
  trade: string | null;
  brief_scope: string | null;
  note: string | null;
}

interface StepRow {
  id: string;
  step_no: string;
  step_code: string;
  step_name: string;
  duration: string;
  default_role: string;
  sort_order: number;
}

const disciplineToDept = (d: string): Department => {
  const k = (d || "").toUpperCase();
  if (k.startsWith("STR")) return "structure";
  if (k.startsWith("ARC")) return "architecture";
  if (k.startsWith("MEP")) return "mep";
  return "construction";
};

const phaseToWorkflow = (p: string): TaskWorkflowType => {
  const k = (p || "").toUpperCase();
  if (k.startsWith("DES")) return "design";
  if (k.startsWith("PRC")) return "procurement";
  if (k.startsWith("QAC") || k.startsWith("HND")) return "approval";
  return "execution";
};

const mapStatus = (s: string): TaskStatus => {
  const k = (s || "").toLowerCase();
  if (k.includes("assign")) return "assigned";
  if (k.includes("hold")) return "blocked";
  return "open";
};

const parseDurationHours = (d: string): number => {
  const m = (d || "").trim().match(/^(\d+(?:\.\d+)?)\s*(day|days|d|hour|hours|h|wk|week|weeks)?/i);
  if (!m) return 8;
  const n = parseFloat(m[1]);
  const unit = (m[2] || "day").toLowerCase();
  if (unit.startsWith("h")) return n;
  if (unit.startsWith("w")) return n * 5 * 8;
  return n * 8;
};

const addDays = (iso: string, days: number): string => {
  const d = new Date(`${iso}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
};

const sortByCodeSeries = <T extends { code: string }>(items: T[]): T[] => {
  const extract = (code: string) => {
    const match = code.match(/^([A-Za-z]+)-(\d+)$/);
    if (match) return { prefix: match[1].toUpperCase(), num: parseInt(match[2], 10) };
    const numMatch = code.match(/\d+/);
    return { prefix: code.replace(/\d+/g, "").toUpperCase(), num: numMatch ? parseInt(numMatch[0], 10) : 0 };
  };
  return [...items].sort((a, b) => {
    const ea = extract(a.code); const eb = extract(b.code);
    if (ea.prefix !== eb.prefix) return ea.prefix.localeCompare(eb.prefix);
    return ea.num - eb.num;
  });
};

export function ImportFromTemplateDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const { activeProject } = useProjects();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);

  const [source, setSource] = useState<SourceKind>("construction");
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [designTasks, setDesignTasks] = useState<DesignTaskRow[]>([]);
  const [procurementTasks, setProcurementTasks] = useState<ProcurementTaskRow[]>([]);

  // Filters
  const [search, setSearch] = useState("");
  const [disciplineFilter, setDisciplineFilter] = useState<string>("all");
  const [stageFilter, setStageFilter] = useState<string>("all");
  const [tradeFilter, setTradeFilter] = useState<string>("all");

  // Selection
  const [templateId, setTemplateId] = useState("");
  const [designTaskId, setDesignTaskId] = useState("");
  const [procurementTaskId, setProcurementTaskId] = useState("");

  const [wbsNodeId, setWbsNodeId] = useState<string | null>(null);
  const [wbsNode, setWbsNode] = useState<WbsTreeNode | null>(null);
  const [plannedStart, setPlannedStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState<string>("1");
  const [groupList, setGroupList] = useState<string>("");
  const [designDuration, setDesignDuration] = useState<string>("1");
  const [procurementDuration, setProcurementDuration] = useState<string>("1");

  const selectedTemplate = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId]);
  const selectedDesign = useMemo(() => designTasks.find((t) => t.id === designTaskId), [designTasks, designTaskId]);
  const selectedProcurement = useMemo(() => procurementTasks.find((t) => t.id === procurementTaskId), [procurementTasks, procurementTaskId]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    Promise.all([
      (supabase as any)
        .from("master_task_templates")
        .select("id, template_code, template_name, discipline, phase, element_code, description, grouping_method, default_quantity_unit, default_task_status")
        .eq("is_active", true)
        .order("template_code", { ascending: true }),
      (supabase as any)
        .from("master_design_task_templates")
        .select("id, task_code, task_name, note, design_stage_id, design_stages:design_stage_id(code, name)")
        .eq("is_active", true),
    ]).then(([tpl, dsn]: any[]) => {
      setLoading(false);
      if (tpl.error) toast.error(tpl.error.message);
      else setTemplates(tpl.data ?? []);
      if (dsn.error) toast.error(dsn.error.message);
      else {
        const rows = (dsn.data ?? []) as DesignTaskRow[];
        setDesignTasks(sortByCodeSeries(rows.map((r) => ({ ...r, code: r.task_code }))) as any);
      }
    });
  }, [open]);

  const reset = () => {
    setSource("construction");
    setTemplateId(""); setDesignTaskId("");
    setWbsNodeId(null); setWbsNode(null);
    setPlannedStart(new Date().toISOString().slice(0, 10));
    setQuantity("1"); setGroupList(""); setDesignDuration("1");
    setSearch(""); setDisciplineFilter("all"); setStageFilter("all");
  };

  // Distinct filter options
  const disciplineOptions = useMemo(() => {
    const set = new Set(templates.map((t) => t.discipline).filter(Boolean));
    return Array.from(set).sort();
  }, [templates]);

  const stageOptions = useMemo(() => {
    const map = new Map<string, string>();
    designTasks.forEach((t) => {
      if (t.design_stages) map.set(t.design_stages.code, t.design_stages.name);
    });
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [designTasks]);

  const filteredTemplates = useMemo(() => {
    const q = search.trim().toLowerCase();
    return templates.filter((t) => {
      if (disciplineFilter !== "all" && t.discipline !== disciplineFilter) return false;
      if (!q) return true;
      return (
        t.template_code.toLowerCase().includes(q) ||
        t.template_name.toLowerCase().includes(q) ||
        (t.description ?? "").toLowerCase().includes(q) ||
        (t.phase ?? "").toLowerCase().includes(q)
      );
    });
  }, [templates, search, disciplineFilter]);

  const filteredDesigns = useMemo(() => {
    const q = search.trim().toLowerCase();
    return designTasks.filter((t) => {
      if (stageFilter !== "all" && t.design_stages?.code !== stageFilter) return false;
      if (!q) return true;
      return (
        t.task_code.toLowerCase().includes(q) ||
        t.task_name.toLowerCase().includes(q) ||
        (t.note ?? "").toLowerCase().includes(q) ||
        (t.design_stages?.name ?? "").toLowerCase().includes(q)
      );
    });
  }, [designTasks, search, stageFilter]);

  const groupingKind = (selectedTemplate?.grouping_method || "").toLowerCase();
  const isByQty = groupingKind.includes("quantity");
  const isByLoc = groupingKind.includes("location");
  const isByFloor = groupingKind.includes("floor") || groupingKind.includes("level");

  const computeGroups = (): string[] => {
    if (source === "design") return ["Single Package"];
    if (!selectedTemplate) return [];
    if (isByQty) {
      const n = Math.max(1, Math.floor(Number(quantity) || 1));
      return Array.from({ length: n }, (_, i) => `Qty ${i + 1} of ${n}`);
    }
    if (isByLoc || isByFloor) {
      const items = groupList.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean);
      return items.length ? items.map((x) => (isByFloor ? `Floor: ${x}` : `Loc: ${x}`)) : ["Group 1"];
    }
    return ["Single Package"];
  };

  const handleImport = async () => {
    if (!activeProject) return toast.error("Select a project first");
    if (!wbsNodeId || !wbsNode) return toast.error("Pick a WBS location");

    setImporting(true);
    try {
      const rows: any[] = [];

      if (source === "construction") {
        if (!selectedTemplate) throw new Error("Pick a template");
        const { data: stepsData, error: stepsErr } = await (supabase as any)
          .from("master_task_template_steps")
          .select("id, step_no, step_code, step_name, duration, default_role, sort_order")
          .eq("template_id", selectedTemplate.id)
          .order("sort_order", { ascending: true });
        if (stepsErr) throw stepsErr;
        const steps = (stepsData ?? []) as StepRow[];
        if (steps.length === 0) throw new Error("Template has no steps to import");

        const department = disciplineToDept(selectedTemplate.discipline);
        const workflow_type = phaseToWorkflow(selectedTemplate.phase);
        const category: TaskCategory = CATEGORIES_BY_WORKFLOW[workflow_type][0];
        const status = mapStatus(selectedTemplate.default_task_status);
        const groups = computeGroups();

        for (const groupLabel of groups) {
          let cursor = plannedStart;
          for (const step of steps) {
            const hours = parseDurationHours(step.duration);
            const days = Math.max(1, Math.ceil(hours / 8));
            const start = cursor;
            const end = addDays(start, days - 1);
            rows.push({
              project_id: activeProject.id,
              wbs_node_id: wbsNodeId,
              location_zone: `${wbsNode.path_text} · ${groupLabel}`,
              title: `${selectedTemplate.template_name} · ${step.step_name}`,
              description: `${selectedTemplate.description ?? ""}\n[${step.step_code}] ${step.step_name}`.trim(),
              task_type: "other",
              priority: "medium",
              status,
              department,
              dept_status: DEPT_INITIAL_STAGE[department],
              discipline_meta: {},
              workflow_type,
              category,
              planned_start: start,
              planned_end: end,
              estimated_hours: hours,
              created_by: user?.id,
            });
            cursor = addDays(end, 1);
          }
        }

        await recordAuditEventSafe({
          moduleCode: "TASK",
          entityType: "task_template_import",
          entityId: selectedTemplate.id,
          actionType: "CREATE",
          actionLabel: "Tasks Imported from Template",
          projectId: activeProject.id,
          wbsNodeId,
          newValues: { template: selectedTemplate.template_code, count: rows.length, groups: groups.length },
          severity: "medium",
        });
      } else {
        if (!selectedDesign) throw new Error("Pick a design task");
        const days = Math.max(1, Math.floor(Number(designDuration) || 1));
        const hours = days * 8;
        const workflow_type: TaskWorkflowType = "design";
        const category: TaskCategory = CATEGORIES_BY_WORKFLOW[workflow_type][0];
        const stageLabel = selectedDesign.design_stages
          ? `${selectedDesign.design_stages.code} · ${selectedDesign.design_stages.name}`
          : "Design";
        rows.push({
          project_id: activeProject.id,
          wbs_node_id: wbsNodeId,
          location_zone: `${wbsNode.path_text} · ${stageLabel}`,
          title: `${selectedDesign.task_code} · ${selectedDesign.task_name}`,
          description: `${selectedDesign.note ?? ""}\n[${stageLabel}]`.trim(),
          task_type: "other",
          priority: "medium",
          status: "open" as TaskStatus,
          department: "architecture" as Department,
          dept_status: DEPT_INITIAL_STAGE["architecture"],
          discipline_meta: {},
          workflow_type,
          category,
          planned_start: plannedStart,
          planned_end: addDays(plannedStart, days - 1),
          estimated_hours: hours,
          created_by: user?.id,
        });

        await recordAuditEventSafe({
          moduleCode: "TASK",
          entityType: "design_task_template_import",
          entityId: selectedDesign.id,
          actionType: "CREATE",
          actionLabel: "Design Task Imported from Template",
          projectId: activeProject.id,
          wbsNodeId,
          newValues: { task: selectedDesign.task_code, stage: stageLabel },
          severity: "low",
        });
      }

      const { error: insErr } = await (supabase as any).from("tasks").insert(rows);
      if (insErr) throw insErr;

      toast.success(`Created ${rows.length} task(s) from template`);
      setOpen(false);
      reset();
      onCreated?.();
    } catch (e: any) {
      toast.error(e.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  };

  const list = source === "construction" ? filteredTemplates : filteredDesigns;
  const selectedId = source === "construction" ? templateId : designTaskId;
  const setSelectedId = source === "construction" ? setTemplateId : setDesignTaskId;

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!activeProject}>
          <FolderInput className="h-4 w-4" /> From Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Import tasks from template</DialogTitle>
          <DialogDescription>
            Instantiate a Master Task Template into {activeProject?.code}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <Tabs value={source} onValueChange={(v) => { setSource(v as SourceKind); setSearch(""); }}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="construction">Construction Templates</TabsTrigger>
              <TabsTrigger value="design">Design Task Templates</TabsTrigger>
            </TabsList>
          </Tabs>

          {/* Search + Filter row */}
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                className="pl-8 pr-8"
                placeholder={source === "construction" ? "Search code, name, phase…" : "Search code, name, stage…"}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            {source === "construction" ? (
              <Select value={disciplineFilter} onValueChange={setDisciplineFilter}>
                <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Discipline" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All disciplines</SelectItem>
                  {disciplineOptions.map((d) => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Select value={stageFilter} onValueChange={setStageFilter}>
                <SelectTrigger className="w-full sm:w-52"><SelectValue placeholder="Design Stage" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All stages</SelectItem>
                  {stageOptions.map(([code, name]) => (
                    <SelectItem key={code} value={code}>{code} · {name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          {/* Results list */}
          <div>
            <Label className="text-xs text-muted-foreground">
              {loading ? "Loading…" : `${list.length} result${list.length === 1 ? "" : "s"}`}
            </Label>
            <div className="mt-1 max-h-60 overflow-y-auto rounded-md border divide-y">
              {list.length === 0 && !loading && (
                <div className="p-4 text-sm text-muted-foreground text-center">No templates match your filters.</div>
              )}
              {source === "construction" && filteredTemplates.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "w-full text-left p-2.5 hover:bg-muted/60 transition-colors flex items-start gap-2",
                    templateId === t.id && "bg-primary/5 ring-1 ring-primary/40"
                  )}
                >
                  {templateId === t.id ? (
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {t.template_code} · {t.template_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {t.discipline} · {t.phase} · {t.grouping_method}
                    </div>
                  </div>
                </button>
              ))}
              {source === "design" && filteredDesigns.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setSelectedId(t.id)}
                  className={cn(
                    "w-full text-left p-2.5 hover:bg-muted/60 transition-colors flex items-start gap-2",
                    designTaskId === t.id && "bg-primary/5 ring-1 ring-primary/40"
                  )}
                >
                  {designTaskId === t.id ? (
                    <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <div className="h-4 w-4 mt-0.5 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">
                      {t.task_code} · {t.task_name}
                    </div>
                    <div className="text-[11px] text-muted-foreground truncate">
                      {t.design_stages ? `${t.design_stages.code} · ${t.design_stages.name}` : "No stage"}
                      {t.note ? ` — ${t.note}` : ""}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <Label>WBS location *</Label>
            {activeProject && (
              <WbsNodePicker
                projectId={activeProject.id}
                value={wbsNodeId}
                onChange={(id, n) => { setWbsNodeId(id); setWbsNode(n); }}
                required
              />
            )}
            {wbsNode && (
              <p className="text-[11px] text-muted-foreground mt-1 font-mono">{wbsNode.path_text}</p>
            )}
          </div>

          {source === "construction" && selectedTemplate && (
            <>
              {isByQty && (
                <div>
                  <Label>Quantity ({selectedTemplate.default_quantity_unit})</Label>
                  <Input
                    type="number"
                    min={1}
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                  />
                  <p className="text-[11px] text-muted-foreground mt-1">
                    Creates one task-group per unit — each containing all template steps.
                  </p>
                </div>
              )}
              {(isByLoc || isByFloor) && (
                <div>
                  <Label>{isByFloor ? "Floors / Levels" : "Locations"} (one per line)</Label>
                  <Textarea
                    rows={3}
                    placeholder={isByFloor ? "L1\nL2\nL3" : "Block A\nBlock B"}
                    value={groupList}
                    onChange={(e) => setGroupList(e.target.value)}
                  />
                </div>
              )}
            </>
          )}

          {source === "design" && selectedDesign && (
            <div>
              <Label>Duration (days)</Label>
              <Input
                type="number"
                min={1}
                value={designDuration}
                onChange={(e) => setDesignDuration(e.target.value)}
              />
              <p className="text-[11px] text-muted-foreground mt-1">
                Used to set the planned end date (8h per day).
              </p>
            </div>
          )}

          <div>
            <Label>Planned start</Label>
            <Input
              type="date"
              value={plannedStart}
              onChange={(e) => setPlannedStart(e.target.value)}
            />
            {source === "construction" && (
              <p className="text-[11px] text-muted-foreground mt-1">
                Step durations roll forward from this date.
              </p>
            )}
          </div>

          <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/30 p-2 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Step dependencies, checklist items and required documents are not copied in this version.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={importing || !selectedId || !wbsNodeId}>
            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
