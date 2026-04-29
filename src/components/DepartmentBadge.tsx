import { Department, DEPARTMENT_LABELS, DEPARTMENT_TONE } from "@/lib/departmentMeta";
import { cn } from "@/lib/utils";

export function DepartmentBadge({
  department,
  className,
  size = "sm",
}: {
  department: Department;
  className?: string;
  size?: "sm" | "xs";
}) {
  const tone = DEPARTMENT_TONE[department];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs",
        tone.bg,
        tone.fg,
        className,
      )}
    >
      <span className={cn("rounded-full", size === "xs" ? "h-1 w-1" : "h-1.5 w-1.5", tone.dot)} />
      {DEPARTMENT_LABELS[department]}
    </span>
  );
}
