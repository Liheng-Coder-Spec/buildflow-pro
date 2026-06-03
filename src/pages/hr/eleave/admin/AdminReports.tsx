import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, subDays, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { StatusPill } from "@/components/eleave/StatusPill";
import { Badge } from "@/components/ui/badge";
import { ReportFilters, ReportFiltersValue } from "@/components/eleave/reports/ReportFilters";
import { ReportKPIs } from "@/components/eleave/reports/ReportKPIs";
import { ReportCharts } from "@/components/eleave/reports/ReportCharts";
import { ReportDetailDialog, DetailRequest } from "@/components/eleave/reports/ReportDetailDialog";
import { exportToCSV, exportToXLSX, ReportRow, ReportKpis } from "@/lib/eleave/exportReport";
import { Download, FileSpreadsheet, ChevronLeft, ChevronRight, ArrowUpDown, ExternalLink } from "lucide-react";
import { toast } from "sonner";

type RawRequest = {
  id: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  reason: string;
  cancellation_reason: string | null;
  created_at: string;
  updated_at: string;
  attachment_urls: string[];
  user_id: string;
  leave_type_id: string;
  leave_type?: { name: string; color: string } | null;
  profile?: { full_name: string; email: string; department_id: string | null; supervisor_id: string | null; department_name: string | null } | null;
};

type SortKey = "employee" | "department" | "leave_type" | "start_date" | "end_date" | "days" | "status" | "created_at" | "updated_at";

const PAGE_SIZE = 25;

function parseDate(s: string | null): Date | undefined {
  if (!s) return undefined;
  const d = new Date(s);
  return isNaN(d.getTime()) ? undefined : d;
}

export default function AdminReports() {
  useSEO({ title: "Leave Reports", description: "Admin master report for all leave records — filter, analyze, export." });

  const [params, setParams] = useSearchParams();
  const [raw, setRaw] = useState<RawRequest[]>([]);
  const [approvalsByReq, setApprovalsByReq] = useState<Map<string, { level: number; approver_id: string }[]>>(new Map());
  const [profileMap, setProfileMap] = useState<Map<string, { full_name: string; email: string }>>(new Map());
  const [leaveTypes, setLeaveTypes] = useState<{ id: string; name: string }[]>([]);
  const [departments, setDepartments] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);

  const [sort, setSort] = useState<{ key: SortKey; dir: "asc" | "desc" }>({ key: "created_at", dir: "desc" });
  const [page, setPage] = useState(1);
  const [detail, setDetail] = useState<DetailRequest | null>(null);

  const filters: ReportFiltersValue = useMemo(() => ({
    from: parseDate(params.get("from")) ?? subDays(new Date(), 30),
    to: parseDate(params.get("to")) ?? new Date(),
    leaveTypeId: params.get("leaveType") ?? "all",
    status: params.get("status") ?? "all",
    departmentId: params.get("dept") ?? "all",
    search: params.get("q") ?? "",
  }), [params]);

  const setFilters = (next: ReportFiltersValue) => {
    const p = new URLSearchParams();
    if (next.from) p.set("from", format(next.from, "yyyy-MM-dd"));
    if (next.to) p.set("to", format(next.to, "yyyy-MM-dd"));
    if (next.leaveTypeId !== "all") p.set("leaveType", next.leaveTypeId);
    if (next.status !== "all") p.set("status", next.status);
    if (next.departmentId !== "all") p.set("dept", next.departmentId);
    if (next.search) p.set("q", next.search);
    setParams(p, { replace: true });
    setPage(1);
  };

  const resetFilters = () => {
    setParams(new URLSearchParams(), { replace: true });
    setPage(1);
  };

  useEffect(() => {
    (async () => {
      setLoading(true);
      const [reqsRes, lt, depts] = await Promise.all([
        supabase
          .from("leave_requests")
          .select("id, start_date, end_date, days, status, reason, cancellation_reason, created_at, updated_at, attachment_urls, user_id, leave_type_id")
          .order("created_at", { ascending: false }),
        supabase.from("leave_types").select("id, name, color").order("name"),
        supabase.from("departments").select("id, name").order("name"),
      ]);

      if (reqsRes.error) {
        console.error("Leave records load error:", reqsRes.error);
        toast.error(`Failed to load leave records: ${reqsRes.error.message}`);
        setLoading(false);
        return;
      }

      const baseRequests = (reqsRes.data ?? []) as Array<Omit<RawRequest, "leave_type" | "profile">>;
      const leaveTypesData = (lt.data ?? []) as { id: string; name: string; color: string }[];
      const deptsData = (depts.data ?? []) as { id: string; name: string }[];
      setLeaveTypes(leaveTypesData.map((t) => ({ id: t.id, name: t.name })));
      setDepartments(deptsData);

      const ltMap = new Map(leaveTypesData.map((t) => [t.id, { name: t.name, color: t.color }]));
      const deptMap = new Map(deptsData.map((d) => [d.id, d.name]));

      // Fetch profiles for all employees in the requests
      const userIds = Array.from(new Set(baseRequests.map((r) => r.user_id)));
      let profilesData: any[] = [];
      if (userIds.length) {
        const { data: pData, error: pErr } = await supabase
          .from("profiles")
          .select("id, full_name, email, department_id, supervisor_id")
          .in("id", userIds);
        if (pErr) console.error("Profiles load error:", pErr);
        profilesData = pData ?? [];
      }
      const empMap = new Map(profilesData.map((p: any) => [p.id, p]));

      const requests: RawRequest[] = baseRequests.map((r) => {
        const emp = empMap.get(r.user_id);
        return {
          ...r,
          leave_type: ltMap.get(r.leave_type_id) ?? null,
          profile: emp
            ? {
                full_name: emp.full_name,
                email: emp.email,
                department_id: emp.department_id,
                supervisor_id: emp.supervisor_id,
                department_name: emp.department_id ? deptMap.get(emp.department_id) ?? null : null,
              }
            : null,
        };
      });
      setRaw(requests);

      const ids = requests.map((r) => r.id);
      let approvals: { request_id: string; level: number; approver_id: string }[] = [];
      if (ids.length) {
        const { data: aData } = await supabase
          .from("request_approvals")
          .select("request_id, level, approver_id")
          .in("request_id", ids)
          .order("level");
        approvals = (aData as any) ?? [];
      }
      const map = new Map<string, { level: number; approver_id: string }[]>();
      approvals.forEach((a) => {
        const arr = map.get(a.request_id) ?? [];
        arr.push({ level: a.level, approver_id: a.approver_id });
        map.set(a.request_id, arr);
      });
      setApprovalsByReq(map);

      // Build profile map for approvers + supervisors + employees (display names)
      const profileIds = new Set<string>();
      profilesData.forEach((p: any) => {
        profileIds.add(p.id);
        if (p.supervisor_id) profileIds.add(p.supervisor_id);
      });
      approvals.forEach((a) => profileIds.add(a.approver_id));
      if (profileIds.size) {
        const { data: pData } = await supabase
          .from("profiles")
          .select("id, full_name, email")
          .in("id", Array.from(profileIds));
        const pm = new Map<string, { full_name: string; email: string }>();
        (pData ?? []).forEach((p: any) => pm.set(p.id, { full_name: p.full_name || p.email, email: p.email }));
        setProfileMap(pm);
      }

      setLoading(false);
    })();
  }, []);

  // Build display rows
  const allRows = useMemo(() => {
    return raw.map((r) => {
      const apps = approvalsByReq.get(r.id) ?? [];
      const sortedApps = [...apps].sort((a, b) => a.level - b.level);
      const supervisorId = sortedApps.find((a) => a.level === 1)?.approver_id;
      const adminId = sortedApps.find((a) => a.level === 2)?.approver_id;
      return {
        id: r.id,
        raw: r,
        employee: r.profile?.full_name || r.profile?.email || "—",
        email: r.profile?.email || "",
        department: r.profile?.department_name || "—",
        leave_type: r.leave_type?.name || "—",
        leave_color: r.leave_type?.color || "blue",
        start_date: r.start_date,
        end_date: r.end_date,
        days: Number(r.days),
        status: r.status,
        supervisor: supervisorId ? (profileMap.get(supervisorId)?.full_name ?? "—") : "—",
        admin: adminId ? (profileMap.get(adminId)?.full_name ?? "—") : "—",
        created_at: r.created_at,
        updated_at: r.updated_at,
      };
    });
  }, [raw, approvalsByReq, profileMap]);

  // Filtering
  const filteredRows = useMemo(() => {
    const fromTs = filters.from ? new Date(format(filters.from, "yyyy-MM-dd") + "T00:00:00").getTime() : -Infinity;
    const toTs = filters.to ? new Date(format(filters.to, "yyyy-MM-dd") + "T23:59:59").getTime() : Infinity;
    const q = filters.search.trim().toLowerCase();
    return allRows.filter((r) => {
      // date overlap on start_date..end_date with from..to
      const s = parseISO(r.start_date).getTime();
      const e = parseISO(r.end_date).getTime();
      if (e < fromTs || s > toTs) return false;
      if (filters.leaveTypeId !== "all" && r.raw.leave_type_id !== filters.leaveTypeId) return false;
      if (filters.status !== "all" && r.status !== filters.status) return false;
      if (filters.departmentId !== "all" && r.raw.profile?.department_id !== filters.departmentId) return false;
      if (q) {
        const hay = `${r.employee} ${r.email}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allRows, filters]);

  // Sorting
  const sortedRows = useMemo(() => {
    const arr = [...filteredRows];
    arr.sort((a: any, b: any) => {
      const av = a[sort.key];
      const bv = b[sort.key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      if (typeof av === "number" && typeof bv === "number") return sort.dir === "asc" ? av - bv : bv - av;
      return sort.dir === "asc" ? String(av).localeCompare(String(bv)) : String(bv).localeCompare(String(av));
    });
    return arr;
  }, [filteredRows, sort]);

  const totalPages = Math.max(1, Math.ceil(sortedRows.length / PAGE_SIZE));
  const pagedRows = sortedRows.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const kpis: ReportKpis = useMemo(() => ({
    total: filteredRows.length,
    approved: filteredRows.filter((r) => r.status === "approved").length,
    pending: filteredRows.filter((r) => r.status === "pending" || r.status === "pending_cancellation").length,
    rejected: filteredRows.filter((r) => r.status === "rejected").length,
    cancelled: filteredRows.filter((r) => r.status === "withdrawn").length,
    totalDaysUsed: Number(filteredRows.filter((r) => r.status === "approved").reduce((s, r) => s + Number(r.days || 0), 0).toFixed(1)),
  }), [filteredRows]);

  const exportRows: ReportRow[] = sortedRows.map((r) => ({
    employee: r.employee,
    email: r.email,
    department: r.department,
    leave_type: r.leave_type,
    start_date: r.start_date,
    end_date: r.end_date,
    days: r.days,
    status: r.status,
    supervisor: r.supervisor,
    admin: r.admin,
    applied_at: format(new Date(r.created_at), "yyyy-MM-dd HH:mm"),
    updated_at: format(new Date(r.updated_at), "yyyy-MM-dd HH:mm"),
  }));

  const fileTag = `${filters.from ? format(filters.from, "yyyyMMdd") : "all"}_to_${filters.to ? format(filters.to, "yyyyMMdd") : "all"}`;

  const toggleSort = (key: SortKey) => {
    setSort((s) => s.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" });
  };

  const openDetail = (r: typeof allRows[number]) => {
    setDetail({
      id: r.id,
      employee: r.employee,
      email: r.email,
      department: r.department,
      supervisor: r.supervisor,
      leave_type: r.leave_type,
      start_date: r.start_date,
      end_date: r.end_date,
      days: r.days,
      status: r.status,
      reason: r.raw.reason,
      cancellation_reason: r.raw.cancellation_reason,
      attachment_urls: r.raw.attachment_urls ?? [],
      created_at: r.created_at,
      updated_at: r.updated_at,
    });
  };

  const SortHead = ({ k, label }: { k: SortKey; label: string }) => (
    <button onClick={() => toggleSort(k)} className="inline-flex items-center gap-1 hover:text-foreground">
      {label}<ArrowUpDown className="h-3 w-3 opacity-60" />
    </button>
  );

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Leave Master Report</h1>
          <p className="text-sm text-muted-foreground">Filter, analyze, and export every leave record.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={() => exportToCSV(exportRows, `leave-report_${fileTag}.csv`)}>
            <Download className="h-4 w-4 mr-2" /> Export CSV
          </Button>
          <Button onClick={() => exportToXLSX(exportRows, kpis, `leave-report_${fileTag}.xlsx`)}>
            <FileSpreadsheet className="h-4 w-4 mr-2" /> Export Excel
          </Button>
        </div>
      </div>

      <ReportKPIs kpis={kpis} />

      <ReportFilters
        value={filters}
        onChange={setFilters}
        onReset={resetFilters}
        leaveTypes={leaveTypes}
        departments={departments}
      />

      <Tabs defaultValue="table">
        <TabsList>
          <TabsTrigger value="table">Table</TabsTrigger>
          <TabsTrigger value="charts">Charts</TabsTrigger>
        </TabsList>

        <TabsContent value="table" className="mt-4">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead><SortHead k="employee" label="Employee" /></TableHead>
                      <TableHead><SortHead k="department" label="Department" /></TableHead>
                      <TableHead><SortHead k="leave_type" label="Type" /></TableHead>
                      <TableHead><SortHead k="start_date" label="Start" /></TableHead>
                      <TableHead><SortHead k="end_date" label="End" /></TableHead>
                      <TableHead className="text-right"><SortHead k="days" label="Days" /></TableHead>
                      <TableHead><SortHead k="status" label="Status" /></TableHead>
                      <TableHead>Supervisor</TableHead>
                      <TableHead>Admin</TableHead>
                      <TableHead><SortHead k="created_at" label="Applied" /></TableHead>
                      <TableHead><SortHead k="updated_at" label="Updated" /></TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow><TableCell colSpan={12} className="h-24 text-center text-muted-foreground">Loading…</TableCell></TableRow>
                    ) : pagedRows.length === 0 ? (
                      <TableRow><TableCell colSpan={12} className="h-24 text-center text-muted-foreground">No records match your filters.</TableCell></TableRow>
                    ) : pagedRows.map((r) => (
                      <TableRow key={r.id} className="cursor-pointer" onClick={() => openDetail(r)}>
                        <TableCell>
                          <div className="font-medium">{r.employee}</div>
                          <div className="text-xs text-muted-foreground">{r.email}</div>
                        </TableCell>
                        <TableCell>{r.department}</TableCell>
                        <TableCell>
                          <div className="inline-flex items-center gap-2">
                            <span className={`h-2.5 w-2.5 rounded-full bg-cat-${r.leave_color}`} />
                            {r.leave_type}
                          </div>
                        </TableCell>
                        <TableCell>{format(new Date(r.start_date), "MMM d, yyyy")}</TableCell>
                        <TableCell>{format(new Date(r.end_date), "MMM d, yyyy")}</TableCell>
                        <TableCell className="text-right tabular-nums">{r.days}</TableCell>
                        <TableCell><StatusPill status={r.status} /></TableCell>
                        <TableCell><Badge variant="secondary">{r.supervisor}</Badge></TableCell>
                        <TableCell><Badge variant="secondary">{r.admin}</Badge></TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(r.created_at), "MMM d, HH:mm")}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{format(new Date(r.updated_at), "MMM d, HH:mm")}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openDetail(r); }}>
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between p-3 border-t">
                <div className="text-xs text-muted-foreground">
                  {sortedRows.length === 0 ? "0" : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, sortedRows.length)}`} of {sortedRows.length}
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="text-sm tabular-nums">Page {page} / {totalPages}</span>
                  <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="charts" className="mt-4">
          <ReportCharts rows={filteredRows.map((r) => ({ start_date: r.start_date, days: r.days, status: r.status, department: r.department, employee: r.employee }))} />
        </TabsContent>
      </Tabs>

      <ReportDetailDialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)} request={detail} profileMap={profileMap} />
    </div>
  );
}
