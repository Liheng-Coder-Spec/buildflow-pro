import { useState } from "react";
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
import { ArrowUpDown, Search } from "lucide-react";

export interface MemberRow {
  user_id: string;
  full_name: string;
  job_title: string | null;
  total_tasks: number;
  completed: number;
  in_progress: number;
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

  const filtered = rows.filter((r) =>
    !search ||
    r.full_name.toLowerCase().includes(search.toLowerCase()) ||
    (r.job_title ?? "").toLowerCase().includes(search.toLowerCase()),
  );

  const sorted = [...filtered].sort((a, b) => {
    const av = a[sortKey];
    const bv = b[sortKey];
    if (typeof av === "string" && typeof bv === "string") {
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av);
    }
    return sortDir === "asc" ? Number(av) - Number(bv) : Number(bv) - Number(av);
  });

  const flipSort = (key: SortKey) => {
    if (key === sortKey) setSortDir(sortDir === "asc" ? "desc" : "asc");
    else {
      setSortKey(key);
      setSortDir(key === "full_name" ? "asc" : "desc");
    }
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
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <SortHead label="Member" k="full_name" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} />
              <SortHead label="Tasks" k="total_tasks" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="Done" k="completed" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="Overdue" k="overdue" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="On-time" k="on_time_rate" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="Completion" k="completion_rate" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
              <SortHead label="Approved hrs" k="approved_hours" sortKey={sortKey} sortDir={sortDir} onClick={flipSort} className="text-right" />
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center text-muted-foreground py-6">
                  No members match.
                </TableCell>
              </TableRow>
            ) : (
              sorted.map((m) => (
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
                  <TableCell className="text-right tabular-nums">{m.completed}</TableCell>
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
              ))
            )}
          </TableBody>
        </Table>
      </div>
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
