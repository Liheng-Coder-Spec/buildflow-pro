import { useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowUpDown, ChevronDown, ChevronRight, Search } from "lucide-react";
import { Department, DEPARTMENT_LABELS } from "@/lib/departmentMeta";
import { DepartmentBadge } from "@/components/DepartmentBadge";

export interface MemberRow {
  user_id: string;
  full_name: string;
  job_title: string | null;
  department: Department | null;
  total_tasks: number;
  open: number;
  assigned: number;
  in_progress: number;
  pending_approval: number;
  approved: number;
  rejected: number;
  completed: number;
  closed: number;
  overdue: number;
  on_time_rate: number; // 0..1
  completion_rate: number; // 0..1
  regular_hours: number;
  overtime_hours: number;
  approved_hours: number;
}

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

export function MemberPerformanceTable({
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

  const flipSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "full_name" ? "asc" : "desc");
    }
  };

  const toggle = (k: string) => {
    const next = new Set(collapsed);
    next.has(k) ? next.delete(k) : next.add(k);
    setCollapsed(next);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="relative max-w-xs">
        <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-muted-foreground" />
        <Input
          placeholder="Search member…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-8"
        />
      </div>
      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead label="Member" k="full_name" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} />
              <SortHead label="Tasks" k="total_tasks" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <TableHead className="text-right">Open</TableHead>
              <TableHead className="text-right">In Prog</TableHead>
              <TableHead className="text-right">Pending</TableHead>
              <TableHead className="text-right">Approved</TableHead>
              <TableHead className="text-right">Rejected</TableHead>
              <SortHead label="Done" k="completed" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <TableHead className="text-right">Closed</TableHead>
              <SortHead label="Overdue" k="overdue" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="On-time" k="on_time_rate" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="Done %" k="completion_rate" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="Hours" k="approved_hours" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {grouped.length === 0 ? (
              <TableRow>
                <TableCell colSpan={13} className="text-center text-muted-foreground py-6">
                  No members match.
                </TableCell>
              </TableRow>
            ) : (
              grouped.map((group) => {
                const isCollapsed = (collapsed ?? new Set<string>()).has(group.key);
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
                  <>
                    <TableRow
                      key={`${group.key}-header`}
                      className="bg-muted/40 hover:bg-muted/60 cursor-pointer"
                      onClick={() => toggle(group.key)}
                    >
                      <TableCell colSpan={13}>
                        <div className="flex items-center gap-2 text-sm">
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
                          <span className="text-xs text-muted-foreground ml-2">
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
                        </div>
                      </TableCell>
                    </TableRow>
                    {!isCollapsed &&
                      group.rows.map((m) => (
                        <TableRow
                          key={m.user_id}
                          className="cursor-pointer"
                          onClick={() => onSelect(m)}
                        >
                          <TableCell>
                            <div className="font-medium">{m.full_name}</div>
                            {m.job_title && (
                              <div className="text-xs text-muted-foreground">{m.job_title}</div>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{m.total_tasks}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{m.open + m.assigned}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.in_progress}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.pending_approval}</TableCell>
                          <TableCell className="text-right tabular-nums">{m.approved}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {m.rejected > 0 ? (
                              <span className="text-destructive">{m.rejected}</span>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">{m.completed}</TableCell>
                          <TableCell className="text-right tabular-nums text-muted-foreground">{m.closed}</TableCell>
                          <TableCell className="text-right tabular-nums">
                            {m.overdue > 0 ? (
                              <Badge variant="destructive">{m.overdue}</Badge>
                            ) : (
                              <span className="text-muted-foreground">0</span>
                            )}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {Math.round(m.on_time_rate * 100)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {Math.round(m.completion_rate * 100)}%
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {m.approved_hours.toFixed(1)}
                          </TableCell>
                        </TableRow>
                      ))}
                  </>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
      <p className="text-xs text-muted-foreground">
        Members in multiple departments appear in each group; org-wide totals count each member once.
      </p>
    </div>
  );
}

function SortHead({
  label,
  k,
  sortKey,
  sortDir,
  onClick,
  className = "",
}: {
  label: string;
  k: SortKey;
  sortKey: SortKey;
  sortDir: "asc" | "desc";
  onClick: (k: SortKey) => void;
  className?: string;
}) {
  const active = sortKey === k;
  return (
    <TableHead className={className}>
      <button
        type="button"
        onClick={() => onClick(k)}
        className="inline-flex items-center gap-1 hover:text-foreground transition-colors"
      >
        {label}
        <ArrowUpDown
          className={`h-3 w-3 ${active ? "opacity-100" : "opacity-30"} ${
            active && sortDir === "asc" ? "rotate-180" : ""
          }`}
        />
      </button>
    </TableHead>
  );
}
