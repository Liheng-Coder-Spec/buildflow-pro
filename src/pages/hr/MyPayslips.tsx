import * as React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Download, FileText, Search } from "lucide-react";
import { toast } from "sonner";
import { format } from "date-fns";
import { useSEO } from "@/hooks/useSEO";
import { PayrollLifecycleStepper } from "@/components/payroll/PayrollLifecycleStepper";
import {
  PAYROLL_LIFECYCLE_ORDER,
  PAYROLL_LIFECYCLE_LABELS,
  PayrollLifecycleStatus,
} from "@/lib/payrollMeta";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

function CompactLifecycle({ status }: { status: string }) {
  const normalized: PayrollLifecycleStatus =
    (status as PayrollLifecycleStatus) === "open"
      ? "draft"
      : (status as PayrollLifecycleStatus);
  const idx = PAYROLL_LIFECYCLE_ORDER.indexOf(normalized);
  return (
    <TooltipProvider delayDuration={150}>
      <div className="flex items-center gap-1">
        {PAYROLL_LIFECYCLE_ORDER.map((s, i) => {
          const done = i < idx;
          const active = i === idx;
          return (
            <Tooltip key={s}>
              <TooltipTrigger asChild>
                <span
                  className={cn(
                    "h-2 w-2 rounded-full",
                    done && "bg-success",
                    active && "bg-primary ring-2 ring-primary/30 animate-pulse",
                    !done && !active && "bg-muted-foreground/30",
                  )}
                />
              </TooltipTrigger>
              <TooltipContent side="top" className="text-xs">
                {i + 1}. {PAYROLL_LIFECYCLE_LABELS[s]}
                {active ? " · current" : done ? " · done" : ""}
              </TooltipContent>
            </Tooltip>
          );
        })}
        <span className="ml-2 text-xs text-muted-foreground">
          {PAYROLL_LIFECYCLE_LABELS[normalized] ?? status}
        </span>
      </div>
    </TooltipProvider>
  );
}

interface MyPayslipRow {
  id: string;
  period_id: string;
  payroll_line_id: string;
  user_id: string;
  storage_path: string | null;
  generated_at: string;
  downloaded_at: string | null;
  period: {
    name: string;
    period_start: string;
    period_end: string;
    status: string;
  } | null;
  line: {
    base_salary: number;
    allowances_total: number;
    deductions_total: number;
    gross_salary: number;
    tax_relief: number;
    taxable_salary: number;
    tos_amount: number;
    nssf_employee: number;
    nssf_employer: number;
    net_salary: number;
    regular_hours: number;
    overtime_hours: number;
    currency: string;
    calc_breakdown: Record<string, unknown> | null;
  } | null;
}

const PAYSLIP_BUCKET = "payslips";

function money(n: number | null | undefined, ccy = "USD") {
  const v = Number(n ?? 0);
  return `${ccy} ${v.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function MyPayslips() {
  useSEO({
    title: "My Payslips",
    description: "View and download your payslip history.",
  });
  const { user } = useAuth();
  const [rows, setRows] = React.useState<MyPayslipRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [yearFilter, setYearFilter] = React.useState<string>("all");
  const [selected, setSelected] = React.useState<MyPayslipRow | null>(null);

  React.useEffect(() => {
    if (!user) return;
    let alive = true;
    (async () => {
      setLoading(true);
      try {
        const { data, error } = await (supabase as any)
          .from("payroll_payslips")
          .select(
            `id, period_id, payroll_line_id, user_id, storage_path, generated_at, downloaded_at,
             period:payroll_periods!payroll_payslips_period_id_fkey(name, period_start, period_end, status),
             line:payroll_lines!payroll_payslips_payroll_line_id_fkey(
               base_salary, allowances_total, deductions_total, gross_salary,
               tax_relief, taxable_salary, tos_amount, nssf_employee, nssf_employer,
               net_salary, regular_hours, overtime_hours, currency, calc_breakdown
             )`,
          )
          .eq("user_id", user.id)
          .order("generated_at", { ascending: false });
        if (error) throw error;
        if (alive) setRows((data ?? []) as MyPayslipRow[]);
      } catch (e: any) {
        toast.error(e?.message ?? "Failed to load payslips");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [user]);

  const years = React.useMemo(() => {
    const s = new Set<string>();
    rows.forEach((r) => {
      const d = r.period?.period_start ?? r.generated_at;
      if (d) s.add(String(new Date(d).getFullYear()));
    });
    return Array.from(s).sort((a, b) => Number(b) - Number(a));
  }, [rows]);

  const filtered = React.useMemo(() => {
    return rows.filter((r) => {
      if (yearFilter !== "all") {
        const y = String(
          new Date(r.period?.period_start ?? r.generated_at).getFullYear(),
        );
        if (y !== yearFilter) return false;
      }
      if (search) {
        const q = search.toLowerCase();
        if (!(r.period?.name ?? "").toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [rows, search, yearFilter]);

  async function downloadPayslip(row: MyPayslipRow) {
    if (!row.storage_path) {
      toast.error("Payslip file not generated yet");
      return;
    }
    try {
      const { data, error } = await supabase.storage
        .from(PAYSLIP_BUCKET)
        .createSignedUrl(row.storage_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank");
      await (supabase as any)
        .from("payroll_payslips")
        .update({ downloaded_at: new Date().toISOString() })
        .eq("id", row.id);
    } catch (e: any) {
      toast.error(e?.message ?? "Download failed");
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">My Payslips</h1>
        <p className="text-muted-foreground text-sm">
          Browse and download your payslip history.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 items-end">
            <div className="relative flex-1 min-w-[220px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by period name…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-40">
              <Select value={yearFilter} onValueChange={setYearFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All years</SelectItem>
                  {years.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            {filtered.length} payslip{filtered.length === 1 ? "" : "s"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              Loading…
            </p>
          ) : filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileText className="h-10 w-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No payslips found.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Dates</TableHead>
                  <TableHead className="text-right">Gross</TableHead>
                  <TableHead className="text-right">Tax / NSSF</TableHead>
                  <TableHead className="text-right">Net</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((r) => {
                  const ccy = r.line?.currency ?? "USD";
                  return (
                    <TableRow key={r.id}>
                      <TableCell className="font-medium">
                        {r.period?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {r.period
                          ? `${format(new Date(r.period.period_start), "MMM d")} – ${format(new Date(r.period.period_end), "MMM d, yyyy")}`
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        {money(r.line?.gross_salary, ccy)}
                      </TableCell>
                      <TableCell className="text-right text-sm text-muted-foreground">
                        {money(
                          (r.line?.tos_amount ?? 0) + (r.line?.nssf_employee ?? 0),
                          ccy,
                        )}
                      </TableCell>
                      <TableCell className="text-right font-semibold">
                        {money(r.line?.net_salary, ccy)}
                      </TableCell>
                      <TableCell>
                        {r.period?.status ? (
                          <CompactLifecycle status={r.period.status} />
                        ) : (
                          <Badge variant="secondary">—</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setSelected(r)}
                          >
                            View
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => downloadPayslip(r)}
                            disabled={!r.storage_path}
                          >
                            <Download className="h-4 w-4 mr-1" /> PDF
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Payslip · {selected?.period?.name ?? ""}
            </DialogTitle>
          </DialogHeader>
          {selected && (
            <PayslipDetail row={selected} onDownload={() => downloadPayslip(selected)} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function PayslipDetail({
  row,
  onDownload,
}: {
  row: MyPayslipRow;
  onDownload: () => void;
}) {
  const l = row.line;
  const ccy = l?.currency ?? "USD";
  const Row = ({ label, value, strong }: { label: string; value: string; strong?: boolean }) => (
    <div className={`flex justify-between py-2 border-b border-border/50 ${strong ? "font-semibold text-base" : "text-sm"}`}>
      <span className="text-muted-foreground">{label}</span>
      <span>{value}</span>
    </div>
  );
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <div className="text-muted-foreground">Period</div>
          <div className="font-medium">{row.period?.name}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Dates</div>
          <div className="font-medium">
            {row.period &&
              `${format(new Date(row.period.period_start), "MMM d, yyyy")} – ${format(new Date(row.period.period_end), "MMM d, yyyy")}`}
          </div>
        </div>
        <div>
          <div className="text-muted-foreground">Regular hours</div>
          <div className="font-medium">{l?.regular_hours ?? 0}</div>
        </div>
        <div>
          <div className="text-muted-foreground">Overtime hours</div>
          <div className="font-medium">{l?.overtime_hours ?? 0}</div>
        </div>
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Earnings</h4>
        <Row label="Base salary" value={money(l?.base_salary, ccy)} />
        <Row label="Allowances" value={money(l?.allowances_total, ccy)} />
        <Row label="Gross salary" value={money(l?.gross_salary, ccy)} strong />
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Deductions</h4>
        <Row label="Tax relief" value={`- ${money(l?.tax_relief, ccy)}`} />
        <Row label="Taxable salary" value={money(l?.taxable_salary, ccy)} />
        <Row label="TOS (income tax)" value={`- ${money(l?.tos_amount, ccy)}`} />
        <Row label="NSSF (employee)" value={`- ${money(l?.nssf_employee, ccy)}`} />
        <Row label="Other deductions" value={`- ${money(l?.deductions_total, ccy)}`} />
      </div>

      <div>
        <h4 className="text-sm font-semibold mb-2">Employer contributions</h4>
        <Row label="NSSF (employer)" value={money(l?.nssf_employer, ccy)} />
      </div>

      <div className="bg-muted rounded-md p-4">
        <Row label="Net pay" value={money(l?.net_salary, ccy)} strong />
      </div>

      <div className="flex justify-end">
        <Button onClick={onDownload} disabled={!row.storage_path}>
          <Download className="h-4 w-4 mr-2" /> Download PDF
        </Button>
      </div>
    </div>
  );
}
