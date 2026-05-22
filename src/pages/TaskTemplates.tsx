import * as React from "react";
import { ClipboardList, Filter, Layers3, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

const TASK_ITEMS = ["Design review", "Site inspection", "Procurement follow-up", "Daily progress update"];
const ELEMENT_CATEGORIES = ["Structure", "Archiecture", "MEP"] as const;
const TEMPLATE_DISCIPLINES = ["STR - Structural", "ARC - Architecture", "MEP - MEP"] as const;
const TEMPLATE_PHASES = ["CON - Construction", "DES - Design", "PRC - Procurement", "QAC - QA/QC", "HND - Handover"] as const;
const TASK_GROUPING_METHODS = ["Generate by Quantity", "Generate by Location", "Generate by Floor / Level", "Generate as Single Task Package"] as const;
const QUANTITY_UNITS = ["Each", "m2", "m3", "m", "Set"] as const;
const TASK_STATUSES = ["Open", "Assigned", "On Hold"] as const;

const DEFAULT_TASK_STEPS = [
  { no: "01", code: "TPL-STR-001-CON-01", name: "Survey Setting Out", duration: "0.5 day", role: "Surveyor", required: true },
  { no: "02", code: "TPL-STR-001-CON-02", name: "Borehole Drilling", duration: "1 day", role: "Site Engineer", required: true },
  { no: "03", code: "TPL-STR-001-CON-03", name: "Rebar Cage Installation", duration: "0.5 day", role: "Steel Fixer Team", required: true },
  { no: "04", code: "TPL-STR-001-CON-04", name: "Concrete Pouring", duration: "0.5 day", role: "Site Engineer", required: true }
];

const DEFAULT_TASK_DEPENDENCIES = [
  { predecessor: "Survey Setting Out", type: "FS", successor: "Borehole Drilling", lag: "0 day" },
  { predecessor: "Borehole Drilling", type: "FS", successor: "Rebar Cage Installation", lag: "0 day" },
  { predecessor: "Rebar Cage Installation", type: "FS", successor: "Concrete Pouring", lag: "0 day" }
];

const DEFAULT_TASK_CHECKLIST = [
  "Approved drawing available before start",
  "Reinforcement inspection required",
  "Concrete slump test required",
  "Cube test record required",
  "Client witness point required"
];

const DEFAULT_TASK_DOCUMENTS = [
  "Approved Drawing",
  "Method Statement",
  "Inspection Test Plan",
  "Material Approval",
  "Risk Assessment"
];

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

  React.useEffect(() => {
    void loadElements();
  }, [loadElements]);

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
        <h1 className="text-3xl font-bold">Task Template</h1>
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
              <TabsTrigger value="tasks">Task Template</TabsTrigger>
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
              <DialogTitle>Create Task Template</DialogTitle>
              <DialogDescription>
                Register a reusable task template with element, steps, dependencies, and control rules.
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
                    <Select value={taskElement} onValueChange={setTaskElement}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="STR-001 | Bored Pile">STR-001 | Bored Pile</SelectItem>
                        <SelectItem value="STR-004 | Pile Cap">STR-004 | Pile Cap</SelectItem>
                        <SelectItem value="STR-014 | Column">STR-014 | Column</SelectItem>
                        <SelectItem value="ARC-017 | Door">ARC-017 | Door</SelectItem>
                        <SelectItem value="MEP-007 | Power Cable">MEP-007 | Power Cable</SelectItem>
                      </SelectContent>
                    </Select>
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
                          <TableCell>{step.name}</TableCell>
                          <TableCell>{step.duration}</TableCell>
                          <TableCell>{step.role}</TableCell>
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
                          <TableCell>{dependency.predecessor}</TableCell>
                          <TableCell>
                            <Badge variant="secondary">{dependency.type}</Badge>
                          </TableCell>
                          <TableCell>{dependency.successor}</TableCell>
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
                      <label key={`${item}-${index}`} className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                        <span className="flex-1">{item}</span>
                        <button type="button" onClick={() => removeChecklistItem(index)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </label>
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
                      <label key={`${item}-${index}`} className="flex items-center gap-3 rounded-md border bg-muted/30 px-3 py-2 text-sm">
                        <input type="checkbox" defaultChecked className="h-4 w-4" />
                        <span className="flex-1">{item}</span>
                        <button type="button" onClick={() => removeDocument(index)} className="text-muted-foreground hover:text-destructive">
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </label>
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
                onClick={() => {
                  setTaskTemplateOpen(false);
                  toast.success("Task template registered");
                }}
              >
                Register Task Template
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
                        <div className="flex justify-end gap-2">
                          <Button type="button" variant="outline" size="sm" onClick={() => openEditElement(item)}>
                            <Pencil className="mr-1 h-3.5 w-3.5" />
                            Edit
                          </Button>
                          <Button type="button" variant="outline" size="sm" onClick={() => handleDeleteElement(item)}>
                            <Trash2 className="mr-1 h-3.5 w-3.5" />
                            Delete
                          </Button>
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
                <CardTitle>Task Template</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Prebuilt task templates ready to use across construction workflows.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button type="button" variant="outline" onClick={() => setTaskTemplateOpen(true)}>
                  Register Task Template
                </Button>
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                  <ClipboardList className="h-5 w-5" />
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {TASK_ITEMS.map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                    <span className="text-sm font-medium">{item}</span>
                    <Badge variant="outline">Template</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
