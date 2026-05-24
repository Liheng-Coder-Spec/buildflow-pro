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
import { FolderInput, Loader2, Info } from "lucide-react";
import { toast } from "sonner";
import { WbsNodePicker } from "@/components/wbs/WbsNodePicker";
import { WbsTreeNode } from "@/lib/wbsMeta";
import { Department, DEPT_INITIAL_STAGE } from "@/lib/departmentMeta";
import {
  TaskWorkflowType, TaskCategory, CATEGORIES_BY_WORKFLOW,
} from "@/lib/taskCategoryMeta";
import { TaskStatus } from "@/lib/taskMeta";
import { recordAuditEventSafe } from "@/services/auditService";

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

/** Parse "2 days" / "1 day" / "8 h" → hours (default 8). */
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

export function ImportFromTemplateDialog({ onCreated }: { onCreated?: () => void }) {
  const { user } = useAuth();
  const { activeProject } = useProjects();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [importing, setImporting] = useState(false);
  const [templates, setTemplates] = useState<TemplateRow[]>([]);
  const [templateId, setTemplateId] = useState("");
  const [wbsNodeId, setWbsNodeId] = useState<string | null>(null);
  const [wbsNode, setWbsNode] = useState<WbsTreeNode | null>(null);
  const [plannedStart, setPlannedStart] = useState<string>(new Date().toISOString().slice(0, 10));
  const [quantity, setQuantity] = useState<string>("1");
  const [groupList, setGroupList] = useState<string>("");

  const selected = useMemo(() => templates.find((t) => t.id === templateId), [templates, templateId]);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    (supabase as any)
      .from("master_task_templates")
      .select("id, template_code, template_name, discipline, phase, element_code, description, grouping_method, default_quantity_unit, default_task_status")
      .eq("is_active", true)
      .order("template_code", { ascending: true })
      .then(({ data, error }: any) => {
        setLoading(false);
        if (error) { toast.error(error.message); return; }
        setTemplates(data ?? []);
      });
  }, [open]);

  const reset = () => {
    setTemplateId("");
    setWbsNodeId(null);
    setWbsNode(null);
    setPlannedStart(new Date().toISOString().slice(0, 10));
    setQuantity("1");
    setGroupList("");
  };

  const groupingKind = (selected?.grouping_method || "").toLowerCase();
  const isByQty = groupingKind.includes("quantity");
  const isByLoc = groupingKind.includes("location");
  const isByFloor = groupingKind.includes("floor") || groupingKind.includes("level");

  const computeGroups = (): string[] => {
    if (!selected) return [];
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
    if (!selected) return toast.error("Pick a template");
    if (!wbsNodeId || !wbsNode) return toast.error("Pick a WBS location");

    setImporting(true);
    try {
      const { data: stepsData, error: stepsErr } = await (supabase as any)
        .from("master_task_template_steps")
        .select("id, step_no, step_code, step_name, duration, default_role, sort_order")
        .eq("template_id", selected.id)
        .order("sort_order", { ascending: true });
      if (stepsErr) throw stepsErr;
      const steps = (stepsData ?? []) as StepRow[];
      if (steps.length === 0) throw new Error("Template has no steps to import");

      const department = disciplineToDept(selected.discipline);
      const workflow_type = phaseToWorkflow(selected.phase);
      const category: TaskCategory = CATEGORIES_BY_WORKFLOW[workflow_type][0];
      const status = mapStatus(selected.default_task_status);
      const groups = computeGroups();

      const rows: any[] = [];
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
            title: `${selected.template_name} · ${step.step_name}`,
            description: `${selected.description ?? ""}\n[${step.step_code}] ${step.step_name}`.trim(),
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

      const { error: insErr } = await (supabase as any).from("tasks").insert(rows);
      if (insErr) throw insErr;

      toast.success(`Created ${rows.length} task(s) from template`);
      await recordAuditEventSafe({
        moduleCode: "TASK",
        entityType: "task_template_import",
        entityId: selected.id,
        actionType: "CREATE",
        actionLabel: "Tasks Imported from Template",
        projectId: activeProject.id,
        wbsNodeId,
        newValues: { template: selected.template_code, count: rows.length, groups: groups.length },
        severity: "medium",
      });
      setOpen(false);
      reset();
      onCreated?.();
    } catch (e: any) {
      toast.error(e.message ?? "Import failed");
    } finally {
      setImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={!activeProject}>
          <FolderInput className="h-4 w-4" /> From Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Import tasks from template</DialogTitle>
          <DialogDescription>
            Instantiate a Master Task Template into {activeProject?.code}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label>Template *</Label>
            <Select value={templateId} onValueChange={setTemplateId}>
              <SelectTrigger>
                <SelectValue placeholder={loading ? "Loading…" : "Choose a template"} />
              </SelectTrigger>
              <SelectContent>
                {templates.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.template_code} · {t.template_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selected && (
              <div className="mt-2 rounded-md border bg-muted/40 p-2 text-xs text-muted-foreground space-y-1">
                <div><span className="font-medium text-foreground">Discipline:</span> {selected.discipline} · <span className="font-medium text-foreground">Phase:</span> {selected.phase}</div>
                <div><span className="font-medium text-foreground">Grouping:</span> {selected.grouping_method} · <span className="font-medium text-foreground">Unit:</span> {selected.default_quantity_unit}</div>
                {selected.description && <div className="italic">{selected.description}</div>}
              </div>
            )}
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

          {selected && (
            <>
              {isByQty && (
                <div>
                  <Label>Quantity ({selected.default_quantity_unit})</Label>
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

          <div>
            <Label>Planned start</Label>
            <Input
              type="date"
              value={plannedStart}
              onChange={(e) => setPlannedStart(e.target.value)}
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Step durations roll forward from this date.
            </p>
          </div>

          <div className="flex items-start gap-2 rounded-md border border-dashed bg-muted/30 p-2 text-[11px] text-muted-foreground">
            <Info className="h-3.5 w-3.5 mt-0.5 shrink-0" />
            <span>Step dependencies, checklist items and required documents are not copied in this version.</span>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleImport} disabled={importing || !templateId || !wbsNodeId}>
            {importing && <Loader2 className="h-4 w-4 animate-spin" />}
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
