import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export function StatusPill({ status }: { status: string }) {
  const map: Record<string, string> = {
    pending: "bg-cat-amber text-cat-amber-fg",
    approved: "bg-cat-green text-cat-green-fg",
    rejected: "bg-cat-red text-cat-red-fg",
    withdrawn: "bg-cat-gray text-cat-gray-fg",
    pending_cancellation: "bg-cat-purple text-cat-purple-fg",
  };
  const label = status.replace(/_/g, " ");
  return <Badge className={cn("border-transparent capitalize", map[status] ?? "bg-cat-gray text-cat-gray-fg")}>{label}</Badge>;
}
