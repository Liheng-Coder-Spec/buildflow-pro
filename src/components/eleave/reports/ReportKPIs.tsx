import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Clock, XCircle, Ban, FileStack, CalendarClock } from "lucide-react";
import { ReportKpis } from "@/lib/eleave/exportReport";
import { cn } from "@/lib/utils";

const items = [
  { key: "total" as const, label: "Total Requests", icon: FileStack, tone: "bg-primary/10 text-primary" },
  { key: "approved" as const, label: "Approved", icon: CheckCircle2, tone: "bg-cat-green text-cat-green-fg" },
  { key: "pending" as const, label: "Pending", icon: Clock, tone: "bg-cat-amber text-cat-amber-fg" },
  { key: "rejected" as const, label: "Rejected", icon: XCircle, tone: "bg-cat-red text-cat-red-fg" },
  { key: "cancelled" as const, label: "Cancelled / Withdrawn", icon: Ban, tone: "bg-cat-gray text-cat-gray-fg" },
  { key: "totalDaysUsed" as const, label: "Total Days Used", icon: CalendarClock, tone: "bg-cat-blue text-cat-blue-fg" },
];

export function ReportKPIs({ kpis }: { kpis: ReportKpis }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {items.map((it) => {
        const Icon = it.icon;
        return (
          <Card key={it.key}>
            <CardContent className="p-4 flex items-center gap-3">
              <div className={cn("h-10 w-10 rounded-lg grid place-items-center shrink-0", it.tone)}>
                <Icon className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <div className="text-xs text-muted-foreground truncate">{it.label}</div>
                <div className="text-2xl font-semibold tabular-nums">{kpis[it.key]}</div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
