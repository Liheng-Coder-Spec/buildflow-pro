import { useEffect, useState } from "react";
import { format } from "date-fns";
import { CalendarIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

export type ReportFiltersValue = {
  from?: Date;
  to?: Date;
  leaveTypeId: string;
  status: string;
  departmentId: string;
  search: string;
};

export type FilterOption = { id: string; name: string };

export function ReportFilters({
  value,
  onChange,
  onReset,
  leaveTypes,
  departments,
}: {
  value: ReportFiltersValue;
  onChange: (next: ReportFiltersValue) => void;
  onReset: () => void;
  leaveTypes: FilterOption[];
  departments: FilterOption[];
}) {
  const [search, setSearch] = useState(value.search);

  useEffect(() => setSearch(value.search), [value.search]);

  // Debounce search
  useEffect(() => {
    const t = setTimeout(() => {
      if (search !== value.search) onChange({ ...value, search });
    }, 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  return (
    <div className="sticky top-14 z-20 -mx-4 md:-mx-8 px-4 md:px-8 py-3 bg-background/85 backdrop-blur border-b">
      <div className="flex flex-wrap items-end gap-3">
        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">From</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[160px] justify-start font-normal", !value.from && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.from ? format(value.from, "MMM d, yyyy") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={value.from} onSelect={(d) => onChange({ ...value, from: d ?? undefined })} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">To</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className={cn("w-[160px] justify-start font-normal", !value.to && "text-muted-foreground")}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {value.to ? format(value.to, "MMM d, yyyy") : "Pick date"}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar mode="single" selected={value.to} onSelect={(d) => onChange({ ...value, to: d ?? undefined })} initialFocus className={cn("p-3 pointer-events-auto")} />
            </PopoverContent>
          </Popover>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Leave Type</Label>
          <Select value={value.leaveTypeId} onValueChange={(v) => onChange({ ...value, leaveTypeId: v })}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All types</SelectItem>
              {leaveTypes.map((t) => <SelectItem key={t.id} value={t.id}>{t.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Status</Label>
          <Select value={value.status} onValueChange={(v) => onChange({ ...value, status: v })}>
            <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="withdrawn">Withdrawn</SelectItem>
              <SelectItem value="pending_cancellation">Pending cancellation</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <Label className="text-xs text-muted-foreground">Department</Label>
          <Select value={value.departmentId} onValueChange={(v) => onChange({ ...value, departmentId: v })}>
            <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All departments</SelectItem>
              {departments.map((d) => <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1 flex-1 min-w-[200px]">
          <Label className="text-xs text-muted-foreground">Search employee</Label>
          <Input placeholder="Name or email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>

        <Button variant="ghost" onClick={onReset} className="gap-1">
          <X className="h-4 w-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
