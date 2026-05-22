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
  const [categoryFilter, setCategoryFilter] = React.useState<ElementCategory | "all">("all");
  const [loadingElements, setLoadingElements] = React.useState(true);
  const [creatingElement, setCreatingElement] = React.useState(false);
  const [createDialogOpen, setCreateDialogOpen] = React.useState(false);
  const [editingElement, setEditingElement] = React.useState<ElementTemplate | null>(null);
  const [elementCode, setElementCode] = React.useState("");
  const [category, setCategory] = React.useState<ElementCategory | "">("");
  const [elementName, setElementName] = React.useState("");
  const [note, setNote] = React.useState("");

  const resetElementForm = () => {
    setElementCode("");
    setCategory("");
    setElementName("");
    setNote("");
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
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent text-accent-foreground">
                <ClipboardList className="h-5 w-5" />
              </span>
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
