import * as React from "react";
import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  PAYROLL_LIFECYCLE_ORDER,
  PAYROLL_LIFECYCLE_LABELS,
  PayrollLifecycleStatus,
} from "@/lib/payrollMeta";

interface Props {
  current: PayrollLifecycleStatus;
}

export function PayrollLifecycleStepper({ current }: Props) {
  // Treat legacy "open" as "draft" for stepper purposes
  const normalized: PayrollLifecycleStatus =
    current === "open" ? "draft" : current;
  const idx = PAYROLL_LIFECYCLE_ORDER.indexOf(normalized);

  return (
    <div className="w-full overflow-x-auto">
      <ol className="flex items-start gap-1 min-w-max py-2">
        {PAYROLL_LIFECYCLE_ORDER.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <li key={s} className="flex items-start gap-1">
              <div className="flex flex-col items-center w-24 text-center">
                <div
                  className={cn(
                    "h-7 w-7 rounded-full flex items-center justify-center border-2 transition-colors",
                    done && "bg-success border-success text-success-foreground",
                    active && "bg-primary border-primary text-primary-foreground",
                    !done && !active && "bg-background border-muted text-muted-foreground",
                  )}
                >
                  {done ? (
                    <Check className="h-3.5 w-3.5" />
                  ) : active ? (
                    <Circle className="h-3 w-3 fill-current" />
                  ) : (
                    <span className="text-[10px] font-medium">{i + 1}</span>
                  )}
                </div>
                <span
                  className={cn(
                    "mt-1.5 text-[11px] leading-tight",
                    active ? "font-semibold text-foreground" : "text-muted-foreground",
                  )}
                >
                  {PAYROLL_LIFECYCLE_LABELS[s]}
                </span>
              </div>
              {i < PAYROLL_LIFECYCLE_ORDER.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 mt-3.5",
                    done ? "bg-success" : "bg-muted",
                  )}
                />
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
