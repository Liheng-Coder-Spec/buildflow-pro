import { Check, X, Circle, Clock } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

export type ApprovalStep = {
  level: number;
  approver_name?: string | null;
  approver_email?: string | null;
  decision: "approved" | "rejected" | null;
  comment?: string | null;
  decided_at?: string | null;
};

interface Props {
  approvals: ApprovalStep[];
  current_level: number;
  total_levels: number;
  variant?: "full" | "compact";
  isCancellation?: boolean;
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export function ApprovalChainTimeline({
  approvals,
  current_level,
  total_levels,
  variant = "full",
  isCancellation = false,
}: Props) {
  const byLevel = new Map<number, ApprovalStep>();
  for (const a of approvals) byLevel.set(a.level, a);
  const steps: ApprovalStep[] = [];
  for (let i = 1; i <= total_levels; i++) {
    steps.push(byLevel.get(i) ?? { level: i, decision: null, approver_name: null });
  }

  const rejectIdx = steps.findIndex((s) => s.decision === "rejected");
  const visibleSteps = rejectIdx >= 0 ? steps.slice(0, rejectIdx + 1) : steps;

  if (variant === "compact") {
    return (
      <TooltipProvider delayDuration={150}>
        <div className="flex items-center gap-1.5">
          {visibleSteps.map((s) => {
            const isCurrent = s.level === current_level && !s.decision;
            const isApproved = s.decision === "approved";
            const isRejected = s.decision === "rejected";
            const dotClass = cn(
              "h-2 w-2 rounded-full",
              isApproved && "bg-cat-green-fg",
              isRejected && "bg-destructive",
              isCurrent && "bg-cat-amber-fg animate-pulse",
              !isApproved && !isRejected && !isCurrent && "bg-muted-foreground/30",
            );
            const label = isApproved
              ? "Approved"
              : isRejected
                ? "Rejected"
                : isCurrent
                  ? "Awaiting decision"
                  : "Not started";
            return (
              <Tooltip key={s.level}>
                <TooltipTrigger asChild>
                  <span className={dotClass} />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  L{s.level} · {s.approver_name ?? "Approver"} — {label}
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider delayDuration={150}>
      <div className="space-y-1.5">
        {isCancellation && (
          <div className="text-[11px] font-medium text-cat-amber-fg bg-cat-amber/10 border border-cat-amber-fg/20 rounded px-2 py-1 mb-1">
            Cancellation review
          </div>
        )}
        {visibleSteps.map((s) => {
          const isCurrent = s.level === current_level && !s.decision;
          const isApproved = s.decision === "approved";
          const isRejected = s.decision === "rejected";
          const isUpcoming = !isApproved && !isRejected && !isCurrent;

          const Icon = isApproved ? Check : isRejected ? X : isCurrent ? Clock : Circle;
          const iconWrapClass = cn(
            "h-4 w-4 rounded-full grid place-items-center shrink-0 mt-0.5",
            isApproved && "bg-cat-green/20 text-cat-green-fg",
            isRejected && "bg-destructive/15 text-destructive",
            isCurrent && "bg-cat-amber/20 text-cat-amber-fg",
            isUpcoming && "bg-muted text-muted-foreground/60",
          );

          const name = s.approver_name ?? (
            <span className="italic text-muted-foreground">Approver not assigned — contact admin</span>
          );

          return (
            <div key={s.level} className="flex items-start gap-2 text-xs">
              <div className={iconWrapClass}>
                <Icon className="h-2.5 w-2.5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline gap-1.5 flex-wrap">
                  <span className="font-medium text-muted-foreground">L{s.level}</span>
                  {s.approver_email ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="font-medium text-foreground truncate cursor-help">{name}</span>
                      </TooltipTrigger>
                      <TooltipContent side="top" className="text-xs">{s.approver_email}</TooltipContent>
                    </Tooltip>
                  ) : (
                    <span className="font-medium text-foreground truncate">{name}</span>
                  )}
                  {isApproved && (
                    <span className="text-cat-green-fg">
                      · Approved{s.decided_at ? ` · ${timeAgo(s.decided_at)}` : ""}
                    </span>
                  )}
                  {isRejected && (
                    <span className="text-destructive">
                      · Rejected{s.decided_at ? ` · ${timeAgo(s.decided_at)}` : ""}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-cat-amber-fg">
                      · Awaiting{s.decided_at ? "" : " decision"}
                    </span>
                  )}
                  {isUpcoming && <span className="text-muted-foreground">· Not started yet</span>}
                </div>
                {s.comment && (
                  <div className="text-muted-foreground italic mt-0.5">"{s.comment}"</div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </TooltipProvider>
  );
}
