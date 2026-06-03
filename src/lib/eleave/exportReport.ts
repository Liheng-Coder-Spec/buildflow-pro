import * as XLSX from "xlsx";

export type ReportRow = {
  employee: string;
  email: string;
  department: string;
  leave_type: string;
  start_date: string;
  end_date: string;
  days: number;
  status: string;
  supervisor: string;
  admin: string;
  applied_at: string;
  updated_at: string;
};

export type ReportKpis = {
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  cancelled: number;
  totalDaysUsed: number;
};

const HEADERS: { key: keyof ReportRow; label: string }[] = [
  { key: "employee", label: "Employee" },
  { key: "email", label: "Email" },
  { key: "department", label: "Department" },
  { key: "leave_type", label: "Leave Type" },
  { key: "start_date", label: "Start Date" },
  { key: "end_date", label: "End Date" },
  { key: "days", label: "Total Days" },
  { key: "status", label: "Status" },
  { key: "supervisor", label: "Supervisor" },
  { key: "admin", label: "Admin" },
  { key: "applied_at", label: "Applied" },
  { key: "updated_at", label: "Last Updated" },
];

function escapeCsv(value: any): string {
  if (value == null) return "";
  const s = String(value);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export function exportToCSV(rows: ReportRow[], filename: string) {
  const header = HEADERS.map((h) => h.label).join(",");
  const body = rows.map((r) => HEADERS.map((h) => escapeCsv(r[h.key])).join(",")).join("\n");
  const csv = `${header}\n${body}`;
  triggerDownload(new Blob([csv], { type: "text/csv;charset=utf-8;" }), filename);
}

export function exportToXLSX(rows: ReportRow[], kpis: ReportKpis, filename: string) {
  const wb = XLSX.utils.book_new();
  const recordsData = rows.map((r) =>
    HEADERS.reduce<Record<string, any>>((acc, h) => {
      acc[h.label] = r[h.key];
      return acc;
    }, {})
  );
  const ws = XLSX.utils.json_to_sheet(recordsData);
  XLSX.utils.book_append_sheet(wb, ws, "Leave Records");

  const summaryRows = [
    { Metric: "Total Requests", Value: kpis.total },
    { Metric: "Approved", Value: kpis.approved },
    { Metric: "Pending", Value: kpis.pending },
    { Metric: "Rejected", Value: kpis.rejected },
    { Metric: "Cancelled / Withdrawn", Value: kpis.cancelled },
    { Metric: "Total Leave Days Used", Value: kpis.totalDaysUsed },
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws2, "Summary KPIs");

  XLSX.writeFile(wb, filename);
}
