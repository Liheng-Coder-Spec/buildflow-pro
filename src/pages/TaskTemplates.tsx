import * as React from "react";
import { Check, ChevronsUpDown, ClipboardList, Filter, Layers3, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList,
} from "@/components/ui/command";
import {
  Popover, PopoverContent, PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
const ELEMENT_CATEGORIES = ["Structure", "Archiecture", "MEP"] as const;
const TEMPLATE_DISCIPLINES = ["STR - Structural", "ARC - Architecture", "MEP - MEP"] as const;
const TEMPLATE_PHASES = ["CON - Construction", "DES - Design", "PRC - Procurement", "QAC - QA/QC", "HND - Handover"] as const;
const TASK_GROUPING_METHODS = ["Generate by Quantity", "Generate by Location", "Generate by Floor / Level", "Generate as Single Task Package"] as const;
const QUANTITY_UNITS = ["Each", "m2", "m3", "m", "Set"] as const;
const TASK_STATUSES = ["Open", "Assigned", "On Hold"] as const;

interface DesignStageOption {
  id: string;
  code: string;
  name: string;
}

interface DesignTaskTemplate {
  id: string;
  task_code: string;
  task_name: string;
  design_stage_id: string | null;
  note: string | null;
  design_stages?: { code: string; name: string } | null;
}

interface ProcurementTaskTemplate {
  id: string;
  package_number: string;
  package_description: string;
  trade: string | null;
  brief_scope: string | null;
  note: string | null;
}

const DEFAULT_TASK_STEPS: Array<{
  no: string; code: string; name: string; duration: string; role: string; required: boolean;
}> = [];

const DEFAULT_TASK_DEPENDENCIES: Array<{
  predecessor: string; type: string; successor: string; lag: string;
}> = [];

const DEFAULT_TASK_CHECKLIST: string[] = [];

const DEFAULT_TASK_DOCUMENTS: string[] = [];

type ElementCategory = typeof ELEMENT_CATEGORIES[number];

interface ElementTemplate {
  id: string;
  code: string;
  category: ElementCategory;
  name: string;
  note: string;
}

interface ElementTemplateRow {
  id: string;
  element_code: string;
  category: ElementCategory;
  element_name: string;
  note: string | null;
}

const mapElementTemplate = (row: ElementTemplateRow): ElementTemplate => ({
  id: row.id,
  code: row.element_code,
  category: row.category,
  name: row.element_name,
  note: row.note ?? ""
});

export default function TaskTemplates() {
  const [activeTab, setActiveTab] = React.useState("elements");
  const [elements, setElements] = React.useState<ElementTemplate[]>([]);
  const [templates, setTemplates] = React.useState<Array<{
    id: string; template_code: string; template_name: string; discipline: string; phase: string;
    element_code: string | null; description: string | null;
  }>>([]);
  const [templateLoading, setTemplateLoading] = React.useState(false);
  const [taskTemplateOpen, setTaskTemplateOpen] = React.useState(false);
  const [categoryFilter, setCategoryFilter] = React.useState<ElementCategory | "all">("all");
  const [loadingElements, setLoadingElements] = React.useState(true);
  const [creatingElement, setCreatingElement] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingElement, setEditingElement] = React.useState<ElementTemplate | null>(null);
  const [elementCode, setElementCode] = React.useState("");
  const [category, setCategory] = React.useState<ElementCategory | "">("");
  const [elementName, setElementName] = React.useState("");
  const [note, setNote] = React.useState("");
  const [taskTemplateCode, setTaskTemplateCode] = React.useState("TPL-STR-001-CON");
  const [taskDiscipline, setTaskDiscipline] = React.useState<(typeof TEMPLATE_DISCIPLINES)[number]>(TEMPLATE_DISCIPLINES[0]);
  const [taskPhase, setTaskPhase] = React.useState<(typeof TEMPLATE_PHASES)[number]>(TEMPLATE_PHASES[0]);
  const [taskElement, setTaskElement] = React.useState("STR-001 | Bored Pile");
  const [taskTemplateName, setTaskTemplateName] = React.useState("Bored Pile Construction Template");
  const [taskDescription, setTaskDescription] = React.useState(
    "Standard task template for bored pile construction including survey, drilling, reinforcement, concreting, testing, QA/QC checklist, and required documents."
  );
  const [taskGroupingMethod, setTaskGroupingMethod] = React.useState<(typeof TASK_GROUPING_METHODS)[number]>(TASK_GROUPING_METHODS[0]);
  const [taskUnit, setTaskUnit] = React.useState<(typeof QUANTITY_UNITS)[number]>(QUANTITY_UNITS[0]);
  const [taskStatus, setTaskStatus] = React.useState<(typeof TASK_STATUSES)[number]>(TASK_STATUSES[0]);
  const [taskSteps, setTaskSteps] = React.useState(DEFAULT_TASK_STEPS);
  const [taskDependencies, setTaskDependencies] = React.useState(DEFAULT_TASK_DEPENDENCIES);
  const [taskChecklist, setTaskChecklist] = React.useState(DEFAULT_TASK_CHECKLIST);
  const [taskDocuments, setTaskDocuments] = React.useState(DEFAULT_TASK_DOCUMENTS);

  // Design Task Templates state
  const [designStages, setDesignStages] = React.useState<DesignStageOption[]>([]);
  const [designTasks, setDesignTasks] = React.useState<DesignTaskTemplate[]>([]);
  const [designLoading, setDesignLoading] = React.useState(false);
  const [designDialogOpen, setDesignDialogOpen] = React.useState(false);
  const [designSaving, setDesignSaving] = React.useState(false);
  const [editingDesignId, setEditingDesignId] = React.useState<string | null>(null);
  const [designTaskCode, setDesignTaskCode] = React.useState("");
  const [designTaskName, setDesignTaskName] = React.useState("");
  const [designStageId, setDesignStageId] = React.useState<string>("");
  const [designNote, setDesignNote] = React.useState("");

  // Procurement Task Templates state
  const [procurementTasks, setProcurementTasks] = React.useState<ProcurementTaskTemplate[]>([]);
  const [procurementLoading, setProcurementLoading] = React.useState(false);
  const [procurementDialogOpen, setProcurementDialogOpen] = React.useState(false);
  const [procurementSaving, setProcurementSaving] = React.useState(false);
  const [editingProcurementId, setEditingProcurementId] = React.useState<string | null>(null);
  const [procPackageNumber, setProcPackageNumber] = React.useState("");
  const [procPackageDescription, setProcPackageDescription] = React.useState("");
  const [procTrade, setProcTrade] = React.useState("");
  const [procBriefScope, setProcBriefScope] = React.useState("");
  const [procNote, setProcNote] = React.useState("");

  const resetProcurementForm = () => {
    setEditingProcurementId(null);
    setProcPackageNumber("");
    setProcPackageDescription("");
    setProcTrade("");
    setProcBriefScope("");
    setProcNote("");
  };

  const loadProcurementTasks = React.useCallback(async () => {
    setProcurementLoading(true);
    const { data, error } = await (supabase as any)
      .from("master_procurement_task_templates")
      .select("id, package_number, package_description, trade, brief_scope, note")
      .eq("is_active", true)
      .order("package_number");
    setProcurementLoading(false);
    if (error) { toast.error(error.message); return; }
    setProcurementTasks((data ?? []) as ProcurementTaskTemplate[]);
  }, []);

  const handleSaveProcurementTask = async () => {
    if (!procPackageNumber.trim()) { toast.error("Package Number is required"); return; }
    if (!procPackageDescription.trim()) { toast.error("Package Description is required"); return; }

    setProcurementSaving(true);
    const payload = {
      package_number: procPackageNumber.trim(),
      package_description: procPackageDescription.trim(),
      trade: procTrade.trim() || null,
      brief_scope: procBriefScope.trim() || null,
      note: procNote.trim() || null,
    };
    const query = editingProcurementId
      ? (supabase as any).from("master_procurement_task_templates").update(payload).eq("id", editingProcurementId)
      : (supabase as any).from("master_procurement_task_templates").insert(payload);
    const { error } = await query;
    setProcurementSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "That Package Number is already in use." : error.message);
      return;
    }
    toast.success(editingProcurementId ? "Procurement task updated" : "Procurement task created");
    setProcurementDialogOpen(false);
    resetProcurementForm();
    void loadProcurementTasks();
  };

  const handleEditProcurementTask = (row: ProcurementTaskTemplate) => {
    setEditingProcurementId(row.id);
    setProcPackageNumber(row.package_number);
    setProcPackageDescription(row.package_description);
    setProcTrade(row.trade ?? "");
    setProcBriefScope(row.brief_scope ?? "");
    setProcNote(row.note ?? "");
    setProcurementDialogOpen(true);
  };

  const handleDeleteProcurementTask = async (id: string) => {
    if (!confirm("Delete this procurement task template?")) return;
    const { error } = await (supabase as any)
      .from("master_procurement_task_templates")
      .update({ is_active: false })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Procurement task deleted");
    void loadProcurementTasks();
  };

  const resetDesignForm = () => {
    setEditingDesignId(null);
    setDesignTaskCode("");
    setDesignTaskName("");
    setDesignStageId("");
    setDesignNote("");
  };


  const loadDesignStages = React.useCallback(async () => {
    const { data, error } = await (supabase as any)
      .from("design_stages")
      .select("id, code, name")
      .eq("is_active", true)
      .order("sort_order");
    if (error) {
      toast.error(error.message);
      return;
    }
    setDesignStages((data ?? []) as DesignStageOption[]);
  }, []);

  const loadDesignTasks = React.useCallback(async () => {
    setDesignLoading(true);
    const { data, error } = await (supabase as any)
      .from("master_design_task_templates")
      .select("id, task_code, task_name, design_stage_id, note, design_stages(code, name)")
      .eq("is_active", true);
    setDesignLoading(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const rows = (data ?? []) as DesignTaskTemplate[];
    rows.sort((a, b) => {
      const extract = (code: string) => {
        const match = code.match(/^([A-Za-z]+)-(\d+)$/);
        if (match) return { prefix: match[1].toUpperCase(), num: parseInt(match[2], 10) };
        const numMatch = code.match(/(\d+)/);
        return { prefix: code.replace(/\d+/g, "").toUpperCase(), num: numMatch ? parseInt(numMatch[1], 10) : 0 };
      };
      const aa = extract(a.task_code);
      const bb = extract(b.task_code);
      if (aa.prefix !== bb.prefix) return aa.prefix.localeCompare(bb.prefix);
      return aa.num - bb.num;
    });
    setDesignTasks(rows);
  }, []);

  const handleSaveDesignTask = async () => {
    if (!designTaskCode.trim()) { toast.error("Task Code is required"); return; }
    if (!designTaskName.trim()) { toast.error("Task Name is required"); return; }
    if (!designStageId) { toast.error("Design Stage is required"); return; }

    setDesignSaving(true);
    const payload = {
      task_code: designTaskCode.trim(),
      task_name: designTaskName.trim(),
      design_stage_id: designStageId,
      note: designNote.trim() || null,
    };
    const query = editingDesignId
      ? (supabase as any).from("master_design_task_templates").update(payload).eq("id", editingDesignId)
      : (supabase as any).from("master_design_task_templates").insert(payload);
    const { error } = await query;
    setDesignSaving(false);
    if (error) {
      toast.error(error.message.includes("duplicate") ? "That Task Code is already in use." : error.message);
      return;
    }
    toast.success(editingDesignId ? "Design task updated" : "Design task created");
    setDesignDialogOpen(false);
    resetDesignForm();
    void loadDesignTasks();
  };

  const handleEditDesignTask = (row: DesignTaskTemplate) => {
    setEditingDesignId(row.id);
    setDesignTaskCode(row.task_code);
    setDesignTaskName(row.task_name);
    setDesignStageId(row.design_stage_id ?? "");
    setDesignNote(row.note ?? "");
    setDesignDialogOpen(true);
  };

  const handleDeleteDesignTask = async (id: string) => {
    if (!confirm("Delete this design task template?")) return;
    const { error } = await (supabase as any)
      .from("master_design_task_templates")
      .update({ is_active: false })
      .eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Design task deleted");
    void loadDesignTasks();
  };

  const resetElementForm = () => {
    setElementCode("");
    setCategory("");
    setElementName("");
    setNote("");
  };

  const resetTaskTemplateForm = () => {
    setTaskTemplateCode("TPL-STR-001-CON");
    setTaskDiscipline(TEMPLATE_DISCIPLINES[0]);
    setTaskPhase(TEMPLATE_PHASES[0]);
    setTaskElement("STR-001 | Bored Pile");
    setTaskTemplateName("Bored Pile Construction Template");
    setTaskDescription(
      "Standard task template for bored pile construction including survey, drilling, reinforcement, concreting, testing, QA/QC checklist, and required documents."
    );
    setTaskGroupingMethod(TASK_GROUPING_METHODS[0]);
    setTaskUnit(QUANTITY_UNITS[0]);
    setTaskStatus(TASK_STATUSES[0]);
  };

  const addTaskStep = () => {
    const nextNo = String(taskSteps.length + 1).padStart(2, "0");
    const lastCode = taskSteps[taskSteps.length - 1]?.code ?? "TPL-STR-001-CON-00";
    const parts = lastCode.split("-");
    const nextNum = String(Number(parts[parts.length - 1]) + 1).padStart(2, "0");
    parts[parts.length - 1] = nextNum;
    setTaskSteps([...taskSteps, {
      no: nextNo,
      code: parts.join("-"),
      name: "New Step",
      duration: "1 day",
      role: "Engineer",
      required: true,
    }]);
  };

  const addDependency = () => {
    setTaskDependencies([...taskDependencies, {
      predecessor: "Previous Step",
      type: "FS",
      successor: "Next Step",
      lag: "0 day",
    }]);
  };

  const addChecklistItem = () => {
    setTaskChecklist([...taskChecklist, "New checklist item"]);
  };

  const addDocument = () => {
    setTaskDocuments([...taskDocuments, "New required document"]);
  };

  const removeTaskStep = (index: number) => {
    setTaskSteps(taskSteps.filter((_, i) => i !== index));
  };

  const removeDependency = (index: number) => {
    setTaskDependencies(taskDependencies.filter((_, i) => i !== index));
  };

  const removeChecklistItem = (index: number) => {
    setTaskChecklist(taskChecklist.filter((_, i) => i !== index));
  };

  const removeDocument = (index: number) => {
    setTaskDocuments(taskDocuments.filter((_, i) => i !== index));
  };

  const updateTaskStep = (index: number, field: string, value: string | boolean) => {
    setTaskSteps(taskSteps.map((step, i) => i === index ? { ...step, [field]: value } : step));
  };

  const updateDependency = (index: number, field: string, value: string) => {
    setTaskDependencies(taskDependencies.map((dep, i) => i === index ? { ...dep, [field]: value } : dep));
  };

  const updateChecklistItem = (index: number, value: string) => {
    setTaskChecklist(taskChecklist.map((item, i) => i === index ? value : item));
  };

  const updateDocument = (index: number, value: string) => {
    setTaskDocuments(taskDocuments.map((item, i) => i === index ? value : item));
  };

  const [registerLoading, setRegisterLoading] = React.useState(false);
  const [editingTemplateId, setEditingTemplateId] = React.useState<string | null>(null);
  const [taskSearchQuery, setTaskSearchQuery] = React.useState("");
  const [taskDisciplineFilter, setTaskDisciplineFilter] = React.useState<string>("all");

  const handleRegisterTemplate = async () => {
    if (!taskTemplateCode.trim()) {
      toast.error("Task Template Code is required");
      return;
    }
    if (!taskTemplateName.trim()) {
      toast.error("Task Template Name is required");
      return;
    }

    setRegisterLoading(true);
    try {
      const payload = {
        template_code: taskTemplateCode.trim(),
        template_name: taskTemplateName.trim(),
        discipline: taskDiscipline || null,
        phase: taskPhase || null,
        element_code: taskElement || null,
        description: taskDescription.trim() || null,
        grouping_method: taskGroupingMethod || null,
        default_quantity_unit: taskUnit || null,
        default_task_status: taskStatus || null,
      };

      let templateId: string;

      if (editingTemplateId) {
        const { error: updateError } = await (supabase as any)
          .from("master_task_templates")
          .update(payload)
          .eq("id", editingTemplateId);

        if (updateError) throw updateError;
        templateId = editingTemplateId;

        for (const table of [
          "master_task_template_steps",
          "master_task_template_dependencies",
          "master_task_template_checklist",
          "master_task_template_documents",
        ]) {
          const { error: delError } = await (supabase as any)
            .from(table)
            .delete()
            .eq("template_id", templateId);
          if (delError) throw delError;
        }
      } else {
        const { data: header, error: headerError } = await (supabase as any)
          .from("master_task_templates")
          .insert(payload)
          .select("id")
          .single();

        if (headerError) throw headerError;
        templateId = header.id;
      }

      if (taskSteps.length > 0) {
        const stepsPayload = taskSteps.map((step, i) => ({
          template_id: templateId,
          step_no: step.no,
          step_code: step.code,
          step_name: step.name,
          duration: step.duration,
          default_role: step.role,
          required: step.required,
          sort_order: i + 1,
        }));
        const { error: stepsError } = await (supabase as any)
          .from("master_task_template_steps")
          .insert(stepsPayload);
        if (stepsError) throw stepsError;
      }

      if (taskDependencies.length > 0) {
        const depsPayload = taskDependencies.map((dep) => ({
          template_id: templateId,
          predecessor: dep.predecessor,
          dependency_type: dep.type,
          successor: dep.successor,
          lag: dep.lag,
        }));
        const { error: depsError } = await (supabase as any)
          .from("master_task_template_dependencies")
          .insert(depsPayload);
        if (depsError) throw depsError;
      }

      if (taskChecklist.length > 0) {
        const checklistPayload = taskChecklist.map((item) => ({
          template_id: templateId,
          item: item,
        }));
        const { error: clError } = await (supabase as any)
          .from("master_task_template_checklist")
          .insert(checklistPayload);
        if (clError) throw clError;
      }

      if (taskDocuments.length > 0) {
        const docsPayload = taskDocuments.map((item) => ({
          template_id: templateId,
          document_name: item,
        }));
        const { error: docsError } = await (supabase as any)
          .from("master_task_template_documents")
          .insert(docsPayload);
        if (docsError) throw docsError;
      }

      toast.success(editingTemplateId ? "Task template updated successfully" : "Task template registered successfully");
      setTaskTemplateOpen(false);
      setEditingTemplateId(null);
      resetTaskTemplateForm();
      void loadTemplates();
    } catch (err: any) {
      toast.error(err.message ?? "Failed to register task template");
    } finally {
      setRegisterLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm("Delete this task template? This cannot be undone.")) return;
    const { error } = await (supabase as any)
      .from("master_task_templates")
      .delete()
      .eq("id", id);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Task template deleted");
      void loadTemplates();
    }
  };

  const handleEditTemplate = (tpl: typeof templates[number]) => {
    resetTaskTemplateForm();
    setTaskTemplateCode(tpl.template_code);
    setTaskDiscipline(tpl.discipline as (typeof TEMPLATE_DISCIPLINES)[number]);
    setTaskPhase(tpl.phase as (typeof TEMPLATE_PHASES)[number]);
    setTaskElement(tpl.element_code ?? "");
    setTaskTemplateName(tpl.template_name);
    setTaskDescription(tpl.description ?? "");
    setEditingTemplateId(tpl.id);
    setTaskTemplateOpen(true);
  };

  const openEditElement = (element: ElementTemplate) => {
    setEditingElement(element);
    setElementCode(element.code);
    setCategory(element.category);
    setElementName(element.name);
    setNote(element.note);
    setCreateDialogOpen(true);
  };

  const filteredElements = React.useMemo(() => (
    categoryFilter === "all"
      ? elements
      : elements.filter((item) => item.category === categoryFilter)
  ), [categoryFilter, elements]);

  const loadElements = React.useCallback(async () => {
    setLoadingElements(true);
    const { data, error } = await (supabase as any)
      .from("master_element_templates")
      .select("id, element_code, category, element_name, note")
      .eq("is_active", true)
      .order("element_code", { ascending: true });

    if (error) {
      toast.error(error.message);
      setLoadingElements(false);
      return;
    }

    setElements(((data ?? []) as ElementTemplateRow[]).map(mapElementTemplate));
    setLoadingElements(false);
  }, []);

  const loadTemplates = React.useCallback(async () => {
    setTemplateLoading(true);
    const { data, error } = await (supabase as any)
      .from("master_task_templates")
      .select("id, template_code, template_name, discipline, phase, element_code, description")
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error(error.message);
      setTemplateLoading(false);
      return;
    }

    setTemplates(data ?? []);
    setTemplateLoading(false);
  }, []);

  const filteredTemplates = React.useMemo(() => {
    return templates.filter((tpl) => {
      const matchesSearch = !taskSearchQuery.trim()
        || tpl.template_name.toLowerCase().includes(taskSearchQuery.toLowerCase())
        || tpl.template_code.toLowerCase().includes(taskSearchQuery.toLowerCase())
        || (tpl.element_code ?? "").toLowerCase().includes(taskSearchQuery.toLowerCase());
      const matchesDiscipline = taskDisciplineFilter === "all" || tpl.discipline === taskDisciplineFilter;
      return matchesSearch && matchesDiscipline;
    });
  }, [templates, taskSearchQuery, taskDisciplineFilter]);

  React.useEffect(() => {
    void loadElements();
    void loadTemplates();
    void loadDesignStages();
    void loadDesignTasks();
    void loadProcurementTasks();
  }, [loadElements, loadTemplates, loadDesignStages, loadDesignTasks, loadProcurementTasks]);

  const handleCreateElement = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const code = elementCode.trim();
    const name = elementName.trim();
    const cleanNote = note.trim();

    if (!code) {
      toast.error("Element Code is required");
      return;
    }
    if (!category) {
      toast.error("Select a category");
      return;
    }
    if (!name) {
      toast.error("Element name is required");
      return;
    }

    setCreatingElement(true);
    const payload = {
      element_code: code,
      category,
      element_name: name,
      note: cleanNote || null
    };
    const query = editingElement
      ? (supabase as any)
        .from("master_element_templates")
        .update(payload)
        .eq("id", editingElement.id)
      : (supabase as any)
        .from("master_element_templates")
        .insert(payload);

    const { data, error } = await query
      .select("id, element_code, category, element_name, note")
      .single();

    setCreatingElement(false);

    if (error) {
      toast.error(error.message);
      return;
    }

    const savedElement = mapElementTemplate(data as ElementTemplateRow);
    setElements((current) => editingElement
      ? current.map((item) => item.id === savedElement.id ? savedElement : item)
      : [...current, savedElement].sort((first, second) => first.code.localeCompare(second.code)));
    resetElementForm();
    setEditingElement(null);
    setCreateDialogOpen(false);
    toast.success(editingElement ? "Element template updated" : "Element template created");
  };

  const handleDeleteElement = async (element: ElementTemplate) => {
    const confirmed = window.confirm(`Delete element template ${element.code}?`);
    if (!confirmed) {
      return;
    }

    const { error } = await (supabase as any)
      .from("master_element_templates")
      .update({ is_active: false })
      .eq("id", element.id);

    if (error) {
      toast.error(error.message);
      return;
    }

    setElements((current) => current.filter((item) => item.id !== element.id));
    toast.success("Element template deleted");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Templates</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reusable construction task structures for project setup and repeat work.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <Dialog
          open={createDialogOpen}
          onOpenChange={(open) => {
            setCreateDialogOpen(open);
            if (!open) {
              setEditingElement(null);
              resetElementForm();
            }
          }}
        >
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <TabsList>
              <TabsTrigger value="elements">Elements Template</TabsTrigger>
              <TabsTrigger value="tasks">Construction Task Template</TabsTrigger>
              <TabsTrigger value="design">Design Task Template</TabsTrigger>
              <TabsTrigger value="procurement">Procurement Task Template</TabsTrigger>
            </TabsList>
            {activeTab === "elements" && (
              <DialogTrigger asChild>
                <Button type="button">Create Element</Button>
              </DialogTrigger>
            )}
          </div>

          <DialogContent className="sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>{editingElement ? "Edit Element Template" : "Create Element Template"}</DialogTitle>
              <DialogDescription>
                Define a reusable element before combining it into task templates.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleCreateElement} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="element-code">Element Code</Label>
                <Input
                  id="element-code"
                  value={elementCode}
                  onChange={(event) => setElementCode(event.target.value)}
                  placeholder="STR-001"
                />
              </div>

              <div className="space-y-2">
                <Label>Categories</Label>
                <Select value={category} onValueChange={(value) => setCategory(value as ElementCategory)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {ELEMENT_CATEGORIES.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="element-name">Element name</Label>
                <Input
                  id="element-name"
                  value={elementName}
                  onChange={(event) => setElementName(event.target.value)}
                  placeholder="Concrete column inspection"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="element-note">Note</Label>
                <Textarea
                  id="element-note"
                  value={note}
                  onChange={(event) => setNote(event.target.value)}
                  placeholder="Add template notes or usage guidance"
                  rows={4}
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    resetElementForm();
                    setEditingElement(null);
                    setCreateDialogOpen(false);
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={creatingElement}>
                  {creatingElement ? "Saving..." : editingElement ? "Save" : "Create"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog
          open={taskTemplateOpen}
          onOpenChange={(open) => {
            setTaskTemplateOpen(open);
            if (!open) {
              resetTaskTemplateForm();
            }
          }}
        >
          <DialogContent className="max-w-6xl flex max-h-[85vh] flex-col">
            <DialogHeader>
              <DialogTitle>{editingTemplateId ? "Edit Task Template" : "Create Task Template"}</DialogTitle>
              <DialogDescription>
                {editingTemplateId ? "Update the task template details below." : "Register a reusable task template with element, steps, dependencies, and control rules."}
              </DialogDescription>
            </DialogHeader>

            <div className="flex-1 space-y-5 overflow-auto pr-1">
              <section className="rounded-lg border bg-muted/20 p-4">
                <h3 className="text-sm font-semibold">1. Template Identity</h3>
                <p className="mt-1 text-xs text-muted-foreground">
                  Set the base data for this task template before saving.
                </p>

                <div className="mt-4 grid gap-4 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label htmlFor="task-template-code">Template Code</Label>
                    <Input
                      id="task-template-code"
                      value={taskTemplateCode}
                      onChange={(event) => setTaskTemplateCode(event.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Discipline</Label>
                    <Select value={taskDiscipline} onValueChange={(value) => setTaskDiscipline(value as (typeof TEMPLATE_DISCIPLINES)[number])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_DISCIPLINES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Phase</Label>
                    <Select value={taskPhase} onValueChange={(value) => setTaskPhase(value as (typeof TEMPLATE_PHASES)[number])}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {TEMPLATE_PHASES.map((item) => (
                          <SelectItem key={item} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  <div className="space-y-2">
                    <Label>Element Code / Element Name</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className="w-full justify-between font-normal"
                        >
                          {taskElement || "Search element..."}
                          <ChevronsUpDown className="h-4 w-4 opacity-50 shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
                        <Command
                          filter={(value, search) =>
                            value.toLowerCase().includes(search.toLowerCase()) ? 1 : 0
                          }
                        >
                          <CommandInput placeholder="Search by code or name..." />
                          <CommandList>
                            <CommandEmpty>No elements found.</CommandEmpty>
                            <CommandGroup>
                              {elements.map((el) => (
                                <CommandItem
                                  key={el.id}
                                  value={`${el.code} | ${el.name}`}
                                  onSelect={(currentValue) => {
                                    setTaskElement(currentValue);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "h-4 w-4 mr-2 shrink-0",
                                      taskElement === `${el.code} | ${el.name}` ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  <span className="font-mono text-xs text-muted-foreground mr-2">{el.code}</span>
                                  <span>{el.name}</span>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="task-template-name">Template Name</Label>
                    <Input
                      id="task-template-name"
                      value={taskTemplateName}
                      onChange={(event) => setTaskTemplateName(event.target.value)}
                    />
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <Label htmlFor="task-description">Description</Label>
                  <Textarea
                    id="task-description"
                    value={taskDescription}
                    onChange={(event) => setTaskDescription(event.target.value)}
                    rows={4}
                  />
                </div>
              </section>

              <section className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">2. Task Steps</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Define the standard execution sequence. Each row can later become one generated task.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addTaskStep}>
                    + Add Step
                  </Button>
                </div>
                <div className="mt-4 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Step Code</TableHead>
                        <TableHead>Step Name</TableHead>
                        <TableHead>Duration</TableHead>
                        <TableHead>Default Role</TableHead>
                        <TableHead>Required</TableHead>
                        <TableHead className="w-16 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskSteps.map((step, index) => (
                        <TableRow key={step.code}>
                          <TableCell>{step.no}</TableCell>
                          <TableCell className="font-mono text-xs text-muted-foreground">{step.code}</TableCell>
                          <TableCell>
                            <Input
                              value={step.name}
                              onChange={(e) => updateTaskStep(index, "name", e.target.value)}
                              className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={step.duration}
                              onChange={(e) => updateTaskStep(index, "duration", e.target.value)}
                              className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                            />
                          </TableCell>
                          <TableCell>
                            <Input
                              value={step.role}
                              onChange={(e) => updateTaskStep(index, "role", e.target.value)}
                              className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{step.required ? "Yes" : "No"}</Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeTaskStep(index)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <section className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-semibold">3. Dependencies</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Define predecessor and successor links for the generated task flow.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addDependency}>
                    + Add Dependency
                  </Button>
                </div>
                <div className="mt-4 overflow-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Predecessor</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Successor</TableHead>
                        <TableHead>Lag</TableHead>
                        <TableHead className="w-16 text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {taskDependencies.map((dependency, index) => (
                        <TableRow key={`${dependency.predecessor}-${dependency.successor}-${index}`}>
                          <TableCell>
                            <Input
                              value={dependency.predecessor}
                              onChange={(e) => updateDependency(index, "predecessor", e.target.value)}
                              className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                            />
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{dependency.type}</Badge>
                          </TableCell>
                          <TableCell>
                            <Input
                              value={dependency.successor}
                              onChange={(e) => updateDependency(index, "successor", e.target.value)}
                              className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                            />
                          </TableCell>
                          <TableCell>{dependency.lag}</TableCell>
                          <TableCell className="text-right">
                            <Button type="button" variant="ghost" size="sm" onClick={() => removeDependency(index)}>
                              <Trash2 className="h-3.5 w-3.5 text-destructive" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </section>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-lg border bg-white p-4">
                  <h3 className="text-sm font-semibold">4. Generation Rules</h3>
                  <div className="mt-4 space-y-4">
                    <div className="space-y-2">
                      <Label>Task Grouping Method</Label>
                      <Select value={taskGroupingMethod} onValueChange={(value) => setTaskGroupingMethod(value as (typeof TASK_GROUPING_METHODS)[number])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_GROUPING_METHODS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Quantity Unit</Label>
                      <Select value={taskUnit} onValueChange={(value) => setTaskUnit(value as (typeof QUANTITY_UNITS)[number])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {QUANTITY_UNITS.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Default Task Status</Label>
                      <Select value={taskStatus} onValueChange={(value) => setTaskStatus(value as (typeof TASK_STATUSES)[number])}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {TASK_STATUSES.map((item) => (
                            <SelectItem key={item} value={item}>
                              {item}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </section>

                <section className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold">5. QA/QC Checklist</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addChecklistItem}>
                      + Add
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {taskChecklist.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                        <Input
                          value={item}
                          onChange={(e) => updateChecklistItem(index, e.target.value)}
                          className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                        />
                        <button type="button" onClick={() => removeChecklistItem(index)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>
              </div>

              <div className="grid gap-5 lg:grid-cols-2">
                <section className="rounded-lg border bg-white p-4">
                  <div className="flex items-center justify-between gap-4">
                    <h3 className="text-sm font-semibold">6. Required Documents</h3>
                    <Button type="button" variant="outline" size="sm" onClick={addDocument}>
                      + Add
                    </Button>
                  </div>
                  <div className="mt-4 space-y-3">
                    {taskDocuments.map((item, index) => (
                      <div key={`${item}-${index}`} className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                        <Input
                          value={item}
                          onChange={(e) => updateDocument(index, e.target.value)}
                          className="h-7 border-transparent bg-transparent px-0 text-sm hover:border-input hover:bg-background focus:border-input focus:bg-background"
                        />
                        <button type="button" onClick={() => removeDocument(index)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </section>

                <section className="rounded-lg border bg-slate-950 p-4 text-slate-100">
                  <h3 className="text-sm font-semibold">7. Preview</h3>
                  <div className="mt-4 space-y-3 border-t border-slate-800 pt-4 text-sm">
                    <div className="flex justify-between gap-4">
                      <strong>Template Code</strong>
                      <span>{taskTemplateCode}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <strong>Total Steps</strong>
                      <span>{taskSteps.length}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <strong>Dependencies</strong>
                      <span>{taskDependencies.length}</span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <strong>QA Items</strong>
                      <span>{taskChecklist.length}</span>
                    </div>
                    <div className="mt-4 rounded-md bg-slate-900 p-4 font-mono text-xs leading-7 text-slate-200">
                      Project: 24GDTT
                      <br />
                      WBS: B01 / L02 / Zone A
                      <br />
                      Element: {taskElement}
                      <br />
                      Quantity: 20 piles
                      <br />
                      <br />
                      System will generate:
                      <br />
                      &#8594; {taskSteps.length} task groups
                      <br />
                      &#8594; {taskSteps.length * 20} child tasks
                      <br />
                      &#8594; QA checklist per pile
                      <br />
                      &#8594; FS dependency chain
                      <br />
                      &#8594; Required document control
                    </div>
                  </div>
                </section>
              </div>
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  resetTaskTemplateForm();
                  setTaskTemplateOpen(false);
                }}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetTaskTemplateForm}
              >
                Clear
              </Button>
              <Button
                type="button"
                disabled={registerLoading}
                onClick={handleRegisterTemplate}
              >
                {registerLoading ? "Registering..." : "Register Task Template"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <TabsContent value="elements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Elements Template</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Standard elements that can be combined into task templates.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button type="button" variant="outline">
                      <Filter className="mr-2 h-4 w-4" />
                      {categoryFilter === "all" ? "Filter Categories" : categoryFilter}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setCategoryFilter("all")}>
                      All Categories
                    </DropdownMenuItem>
                    {ELEMENT_CATEGORIES.map((item) => (
                      <DropdownMenuItem key={item} onClick={() => setCategoryFilter(item)}>
                        {item}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                  <Layers3 className="h-5 w-5" />
                </span>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-32">Code</TableHead>
                    <TableHead className="w-36">Categories</TableHead>
                    <TableHead>Element Name</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-36 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loadingElements && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        Loading element templates...
                      </TableCell>
                    </TableRow>
                  )}
                  {!loadingElements && filteredElements.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-muted-foreground">
                        No element templates found.
                      </TableCell>
                    </TableRow>
                  )}
                  {!loadingElements && filteredElements.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{item.code}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">{item.category}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">{item.name}</TableCell>
                      <TableCell className="text-muted-foreground">{item.note || "-"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => openEditElement(item)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteElement(item)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tasks">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Construction Task Template</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prebuilt task templates ready to use across construction workflows.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => { resetTaskTemplateForm(); setEditingTemplateId(null); setTaskTemplateOpen(true); }}>
                  Register Task Template
                </Button>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <ClipboardList className="h-5 w-5" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search templates..."
                    value={taskSearchQuery}
                    onChange={(e) => setTaskSearchQuery(e.target.value)}
                    className="h-9 pr-8"
                  />
                  {taskSearchQuery && (
                    <button
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      onClick={() => setTaskSearchQuery("")}
                    >
                      ×
                    </button>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {["all", "STR", "ARC", "MEP"].map((d) => (
                    <button
                      key={d}
                      onClick={() => setTaskDisciplineFilter(d)}
                      className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
                        taskDisciplineFilter === d
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                      }`}
                    >
                      {d === "all" ? "All" : d}
                    </button>
                  ))}
                </div>
              </div>
              {templateLoading ? (
                <p className="text-sm text-muted-foreground">Loading...</p>
              ) : filteredTemplates.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  {templates.length === 0
                    ? 'No task templates registered yet. Click "Register Task Template" to create one.'
                    : "No templates match your search or filter."}
                </p>
              ) : (
                <div className="space-y-3">
                  {filteredTemplates.map((tpl) => (
                    <div key={tpl.id} className="flex items-center justify-between rounded-md border bg-card px-4 py-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{tpl.template_name}</p>
                        <p className="truncate text-xs text-muted-foreground">
                          {tpl.template_code}
                          {tpl.element_code ? ` — ${tpl.element_code}` : ""}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">{tpl.discipline ?? "—"}</Badge>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <button
                              className="text-muted-foreground hover:text-foreground"
                              title="More options"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditTemplate(tpl)}>
                              <Pencil className="mr-2 h-3.5 w-3.5" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDeleteTemplate(tpl.id)} className="text-destructive focus:text-destructive">
                              <Trash2 className="mr-2 h-3.5 w-3.5" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="design">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Design Task Template</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Standalone design tasks linked to a Design Stage. Use them as quick-pick templates for design work.
                </p>
              </div>
              <Button type="button" onClick={() => { resetDesignForm(); setDesignDialogOpen(true); }}>
                + New Task
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Task Code</TableHead>
                    <TableHead>Task Name</TableHead>
                    <TableHead className="w-48">Design Stage</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-32 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {designLoading && (
                    <TableRow><TableCell colSpan={5} className="text-muted-foreground">Loading...</TableCell></TableRow>
                  )}
                  {!designLoading && designTasks.length === 0 && (
                    <TableRow><TableCell colSpan={5} className="text-muted-foreground">No design tasks yet. Click "New Task" to add one.</TableCell></TableRow>
                  )}
                  {!designLoading && designTasks.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{row.task_code}</TableCell>
                      <TableCell className="font-medium">{row.task_name}</TableCell>
                      <TableCell>
                        {row.design_stages ? (
                          <Badge variant="secondary">{row.design_stages.code} · {row.design_stages.name}</Badge>
                        ) : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.note || "-"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditDesignTask(row)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteDesignTask(row.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="procurement">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Procurement Task Template</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Reusable procurement packages defined by package number, trade and scope.
                </p>
              </div>
              <Button type="button" onClick={() => { resetProcurementForm(); setProcurementDialogOpen(true); }}>
                + Create Task
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-40">Package Number</TableHead>
                    <TableHead>Package Description</TableHead>
                    <TableHead className="w-40">Trade</TableHead>
                    <TableHead>Brief Scope</TableHead>
                    <TableHead>Note</TableHead>
                    <TableHead className="w-32 text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {procurementLoading && (
                    <TableRow><TableCell colSpan={6} className="text-muted-foreground">Loading...</TableCell></TableRow>
                  )}
                  {!procurementLoading && procurementTasks.length === 0 && (
                    <TableRow><TableCell colSpan={6} className="text-muted-foreground">No procurement tasks yet. Click "Create Task" to add one.</TableCell></TableRow>
                  )}
                  {!procurementLoading && procurementTasks.map((row) => (
                    <TableRow key={row.id}>
                      <TableCell className="font-mono text-xs text-muted-foreground">{row.package_number}</TableCell>
                      <TableCell className="font-medium">{row.package_description}</TableCell>
                      <TableCell>
                        {row.trade ? <Badge variant="secondary">{row.trade}</Badge> : <span className="text-muted-foreground">—</span>}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{row.brief_scope || "-"}</TableCell>
                      <TableCell className="text-muted-foreground">{row.note || "-"}</TableCell>
                      <TableCell>
                        <div className="flex justify-end">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button type="button" variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleEditProcurementTask(row)}>
                                <Pencil className="mr-2 h-3.5 w-3.5" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleDeleteProcurementTask(row.id)} className="text-destructive focus:text-destructive">
                                <Trash2 className="mr-2 h-3.5 w-3.5" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <Dialog open={procurementDialogOpen} onOpenChange={(open) => { setProcurementDialogOpen(open); if (!open) resetProcurementForm(); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingProcurementId ? "Edit Procurement Task" : "Create Procurement Task"}</DialogTitle>
              <DialogDescription>
                Define a reusable procurement package with trade and brief scope.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="proc-package-number">Package Number</Label>
                <Input id="proc-package-number" value={procPackageNumber} onChange={(e) => setProcPackageNumber(e.target.value)} placeholder="PKG-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proc-package-description">Package Description</Label>
                <Input id="proc-package-description" value={procPackageDescription} onChange={(e) => setProcPackageDescription(e.target.value)} placeholder="Aluminium & Glazing Works" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proc-trade">Trade</Label>
                <Input id="proc-trade" value={procTrade} onChange={(e) => setProcTrade(e.target.value)} placeholder="Facade / MEP / Civil ..." />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proc-brief-scope">Brief Scope</Label>
                <Textarea id="proc-brief-scope" value={procBriefScope} onChange={(e) => setProcBriefScope(e.target.value)} rows={3} placeholder="Summarize what is included in this package" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proc-note">Note</Label>
                <Textarea id="proc-note" value={procNote} onChange={(e) => setProcNote(e.target.value)} rows={2} placeholder="Optional remarks or internal notes" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setProcurementDialogOpen(false); resetProcurementForm(); }}>Cancel</Button>
              <Button type="button" onClick={handleSaveProcurementTask} disabled={procurementSaving}>
                {procurementSaving ? "Saving..." : editingProcurementId ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={designDialogOpen} onOpenChange={(open) => { setDesignDialogOpen(open); if (!open) resetDesignForm(); }}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingDesignId ? "Edit Design Task" : "Create Design Task"}</DialogTitle>
              <DialogDescription>
                Define a reusable design task tagged to a Design Stage from Admin Configuration.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="design-task-code">Task Code</Label>
                <Input id="design-task-code" value={designTaskCode} onChange={(e) => setDesignTaskCode(e.target.value)} placeholder="DTK-001" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="design-task-name">Task Name</Label>
                <Input id="design-task-name" value={designTaskName} onChange={(e) => setDesignTaskName(e.target.value)} placeholder="Schematic floor plan markup" />
              </div>
              <div className="space-y-2">
                <Label>Design Stage</Label>
                <Select value={designStageId} onValueChange={setDesignStageId}>
                  <SelectTrigger>
                    <SelectValue placeholder={designStages.length === 0 ? "No stages — set in Admin Configuration" : "Select design stage"} />
                  </SelectTrigger>
                  <SelectContent>
                    {designStages.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.code} · {s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="design-task-note">Note</Label>
                <Textarea id="design-task-note" value={designNote} onChange={(e) => setDesignNote(e.target.value)} rows={3} placeholder="Optional notes or usage guidance" />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => { setDesignDialogOpen(false); resetDesignForm(); }}>Cancel</Button>
              <Button type="button" onClick={handleSaveDesignTask} disabled={designSaving}>
                {designSaving ? "Saving..." : editingDesignId ? "Save" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </Tabs>
    </div>
  );
}
