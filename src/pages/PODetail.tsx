import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle } from "lucide-react";

export default function StubPage() {
  return (
    <div className="space-y-4">
      <h1 className="text-3xl font-bold">Purchase Order</h1>
      <Card>
        <CardContent className="p-12 text-center text-muted-foreground">
          <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p className="font-medium">Module not yet wired to backend</p>
          <p className="text-sm">This page is a placeholder while the underlying tables are being redesigned.</p>
        </CardContent>
      </Card>
    </div>
  );
}
