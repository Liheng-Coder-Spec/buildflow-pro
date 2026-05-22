import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ClipboardList, Layers3 } from "lucide-react";

const ELEMENT_ITEMS = ["Work package", "Quality checkpoint", "Safety activity", "Material control"];
const TASK_ITEMS = ["Design review", "Site inspection", "Procurement follow-up", "Daily progress update"];

export default function TaskTemplates() {
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
              <div className="space-y-2">
                {ELEMENT_ITEMS.map((item) => (
                  <div key={item} className="flex items-center justify-between rounded-md border bg-card px-3 py-2">
                    <span className="text-sm font-medium">{item}</span>
                    <Badge variant="secondary">Element</Badge>
                  </div>
                ))}
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
