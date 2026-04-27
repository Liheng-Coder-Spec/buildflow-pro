import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowUpDown,
  ChevronDown,
  ChevronRight,
  Search,
  Clock,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";
import { Department } from "@/lib/departmentMeta";
import { DepartmentBadge } from "@/components/DepartmentBadge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MemberRow } from "./MemberPerformanceTable";

type SortKey =
  | "full_name"
  | "total_tasks"
  | "completed"
  | "overdue"
  | "on_time_rate"
  | "completion_rate"
  | "approved_hours";

const GROUP_ORDER: (Department | "unassigned")[] = [
  "architecture",
  "structure",
  "mep",
  "procurement",
  "construction",
  "unassigned",
];

const SORT_LABELS: Record<SortKey, string> = {
  full_name: "Name",
  total_tasks: "Tasks",
  completed: "Completed",
  overdue: "Overdue",
  on_time_rate: "On-time %",
  completion_rate: "Done %",
  approved_hours: "Hours",
};

export function MemberPerformanceCards({
  rows,
  onSelect,
}: {
  rows: MemberRow[];
  onSelect: (m: MemberRow) => void;
}) {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("total_tasks");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());

  const filtered = useMemo(
    () =>
      rows.filter(
        (r) =>
          !search ||
          r.full_name.toLowerCase().includes(search.toLowerCase()) ||
          (r.job_title ?? "").toLowerCase().includes(search.toLowerCase()),
      ),
    [rows, search],
  );

  const grouped = useMemo(() => {
    const map = new Map<Department | "unassigned", MemberRow[]>();
    filtered.forEach((r) => {
      const k = (r.department ?? "unassigned") as Department | "unassigned";
      let arr = map.get(k);
      if (!arr) {
        arr = [];
        map.set(k, arr);
      }
      arr.push(r);
    });
    map.forEach((arr) => {
      arr.sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        if (typeof av === "string" && typeof bv === "string") {
          return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
        }
        return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
      });
    });
    return GROUP_ORDER.filter((g) => map.has(g)).map((g) => ({ key: g, rows: map.get(g)! }));
  }, [filtered, sortKey, sortDir]);

  const toggle = (k: string) => {
    const next = new Set(collapsed);
    next.has(k) ? next.delete(k) : next.add(k);
    setCollapsed(next);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative max-w-xs flex-1 min-w-[200px]">
          <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
          <Input
            placeholder="Search member…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-8"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">Sort by</span>
          <Select value={sortKey} onValueChange={(v) => setSortKey(v as SortKey)}>
            <SelectTrigger className="w-40 h-9">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {(Object.keys(SORT_LABELS) as SortKey[]).map((k) => (
                <SelectItem key={k} value={k}>
                  {SORT_LABELS[k]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            className="h-9"
          >
            <ArrowUpDown className="h-3.5 w-3.5 mr-1" />
            {sortDir === "asc" ? "Asc" : "Desc"}
          </Button>
        </div>
      </div>

      {grouped.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-sm text-muted-foreground">
            No members match.
          </CardContent>
        </Card>
      ) : (
        grouped.map((group) => {
          const isCollapsed = collapsed.has(group.key);
          const sub = group.rows.reduce(
            (a, r) => ({
              total: a.total + r.total_tasks,
              done: a.done + r.completed,
              overdue: a.overdue + r.overdue,
              hours: a.hours + r.approved_hours,
            }),
            { total: 0, done: 0, overdue: 0, hours: 0 },
          );
          return (
            <div key={group.key} className="flex flex-col gap-3">
              <button
                type="button"
                onClick={() => toggle(group.key)}
                className="flex items-center gap-2 text-sm group w-full text-left"
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
                {group.key === "unassigned" ? (
                  <span className="font-semibold text-muted-foreground">
                    Unassigned (no department)
                  </span>
                ) : (
                  <DepartmentBadge department={group.key as Department} />
                )}
                <span className="text-xs text-muted-foreground ml-1">
                  {group.rows.length} members · {sub.total} tasks · {sub.done} done
                  {sub.overdue > 0 && (
                    <>
                      {" · "}
                      <span className="text-destructive font-medium">
                        {sub.overdue} overdue
                      </span>
                    </>
                  )}
                  {" · "}
                  {sub.hours.toFixed(1)} hrs approved
                </span>
              </button>

              {!isCollapsed && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {group.rows.map((m) => (
                    <MemberCard key={`${m.user_id}-${m.department ?? "none"}`} m={m} onSelect={onSelect} />
                  ))}
                </div>
              )}
            </div>
          );
        })
      )}

      <p className="text-xs text-muted-foreground">
        Members in multiple departments appear in each group; org-wide totals count each member once.
      </p>
    </div>
  );
}

function MemberCard({ m, onSelect }: { m: MemberRow; onSelect: (m: MemberRow) => void }) {
  const completionPct = Math.round(m.completion_rate * 100);
  const onTimePct = Math.round(m.on_time_rate * 100);
  const initials = m.full_name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const activeCount = m.open + m.assigned + m.in_progress + m.pending_approval;

  return (
    <Card
      onClick={() => onSelect(m)}
      className="cursor-pointer hover:shadow-md hover:border-primary/40 transition-all group"
    >
      <CardContent className="p-4 flex flex-col gap-3">
        {/* Header: Avatar + name + overdue flag */}
        <div className="flex items-start gap-3">
          <Avatar className="h-11 w-11 shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-semibold text-sm">
              {initials || "?"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm truncate group-hover:text-primary transition-colors">
              {m.full_name}
            </div>
            {m.job_title && (
              <div className="text-xs text-muted-foreground truncate">{m.job_title}</div>
            )}
          </div>
          {m.overdue > 0 && (
            <Badge variant="destructive" className="gap-1 shrink-0">
              <AlertTriangle className="h-3 w-3" />
              {m.overdue}
            </Badge>
          )}
        </div>

        {/* Headline metrics */}
        <div className="grid grid-cols-3 gap-2 pt-1">
          <Metric label="Tasks" value={m.total_tasks} />
          <Metric label="Done" value={m.completed} tone="success" />
          <Metric label="Active" value={activeCount} tone="info" />
        </div>

        {/* Completion */}
        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground inline-flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Completion
            </span>
            <span className="font-medium tabular-nums">{completionPct}%</span>
          </div>
          <Progress value={completionPct} className="h-1.5" />
        </div>

        {/* Status pills */}
        <div className="flex flex-wrap gap-1">
          {m.in_progress > 0 && <StatusPill label="In prog" value={m.in_progress} tone="info" />}
          {m.pending_approval > 0 && (
            <StatusPill label="Pending" value={m.pending_approval} tone="warning" />
          )}
          {m.approved > 0 && <StatusPill label="Approved" value={m.approved} tone="success" />}
          {m.rejected > 0 && (
            <StatusPill label="Rejected" value={m.rejected} tone="destructive" />
          )}
          {m.closed > 0 && <StatusPill label="Closed" value={m.closed} tone="muted" />}
          {(m.open + m.assigned) > 0 && (
            <StatusPill label="Open" value={m.open + m.assigned} tone="muted" />
          )}
        </div>

        {/* Footer: on-time + hours */}
        <div className="flex items-center justify-between pt-2 border-t text-xs">
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground tabular-nums">{onTimePct}%</span>
            on-time
          </span>
          <span className="inline-flex items-center gap-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-medium text-foreground tabular-nums">
              {m.approved_hours.toFixed(1)}
            </span>
            hrs
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

function Metric({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "success" | "info";
}) {
  const toneCls =
    tone === "success"
      ? "text-success"
      : tone === "info"
        ? "text-info"
        : "text-foreground";
  return (
    <div className="flex flex-col items-center justify-center rounded-md bg-muted/40 py-2">
      <span className={`text-lg font-bold tabular-nums leading-none ${toneCls}`}>{value}</span>
      <span className="text-[10px] uppercase tracking-wide text-muted-foreground mt-1">
        {label}
      </span>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "info" | "warning" | "success" | "destructive" | "muted";
}) {
  const cls = {
    info: "bg-info/10 text-info border-info/20",
    warning: "bg-warning/10 text-warning border-warning/20",
    success: "bg-success/10 text-success border-success/20",
    destructive: "bg-destructive/10 text-destructive border-destructive/20",
    muted: "bg-muted text-muted-foreground border-transparent",
  }[tone];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[11px] font-medium ${cls}`}
    >
      <span className="tabular-nums">{value}</span>
      <span>{label}</span>
    </span>
  );
}
