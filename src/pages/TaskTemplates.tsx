import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { ClipboardList, Layers3 } from "lucide-react";

const TASK_ITEMS = ["Design review", "Site inspection", "Procurement follow-up", "Daily progress update"];
const ELEMENT_CATEGORIES = ["Structure", "Archiecture", "MEP"] as const;

type ElementCategory = typeof ELEMENT_CATEGORIES[number];

interface ElementTemplate {
  code: string;
  category: ElementCategory;
  name: string;
  note: string;
}

const DEFAULT_ELEMENT_TEMPLATES: ElementTemplate[] = [
  { code: "STR-001", category: "Structure", name: "Work package", note: "Core structural work element." },
  { code: "ARC-001", category: "Archiecture", name: "Quality checkpoint", note: "Architectural finish review." },
  { code: "MEP-001", category: "MEP", name: "Safety activity", note: "MEP safety coordination." }
];

export default function TaskTemplates() {
  const [elements, setElements] = React.useState<ElementTemplate[]>(DEFAULT_ELEMENT_TEMPLATES);
  const [elementCode, setElementCode] = React.useState("");
  const [category, setCategory] = React.useState<ElementCategory | "">("");
  const [elementName, setElementName] = React.useState("");
  const [note, setNote] = React.useState("");

  const handleCreateElement = (event: React.FormEvent<HTMLFormElement>) => {
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

    setElements((current) => [
      { code, category, name, note: cleanNote },
      ...current
    ]);
    setElementCode("");
    setCategory("");
    setElementName("");
    setNote("");
    toast.success("Element template created");
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Task Template</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Reusable construction task structures for project setup and repeat work.
        </p>
      </div>

      <Tabs defaultValue="elements" className="space-y-4">
        <TabsList>
          <TabsTrigger value="elements">Elements Template</TabsTrigger>
          <TabsTrigger value="tasks">Task Template</TabsTrigger>
        </TabsList>

        <TabsContent value="elements">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-4">
              <div>
                <CardTitle>Elements Template</CardTitle>
                <p className="mt-1 text-sm text-muted-foreground">
                  Standard elements that can be combined into task templates.
                </p>
              </div>
              <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-primary-foreground">
                <Layers3 className="h-5 w-5" />
              </span>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 xl:grid-cols-[minmax(0,420px)_1fr]">
                <form onSubmit={handleCreateElement} className="space-y-4 rounded-lg border bg-muted/20 p-4">
                  <div>
                    <h3 className="text-sm font-semibold">Create Element Template</h3>
                    <p className="mt-1 text-xs text-muted-foreground">
                      Define a reusable element before combining it into task templates.
                    </p>
                  </div>

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

                  <Button type="submit" className="w-full">
                    Create Element Template
                  </Button>
                </form>

                <div className="space-y-2">
                  {elements.map((item) => (
                    <div
                      key={`${item.code}-${item.name}`}
                      className="rounded-md border bg-card px-3 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-muted-foreground">{item.code}</span>
                            <Badge variant="secondary">{item.category}</Badge>
                          </div>
                          <p className="mt-1 text-sm font-medium">{item.name}</p>
                        </div>
                        <Badge variant="outline">Element</Badge>
                      </div>
                      {item.note && (
                        <p className="mt-2 text-sm text-muted-foreground">{item.note}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
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
