// Edge function: export-payroll-xlsx
// Generates a formatted Excel workbook for a payroll period and returns it base64-encoded.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as ExcelJS from "https://esm.sh/exceljs@4.4.0";
import { encode as b64encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: { ...cors, "content-type": "application/json" } });

    // Permission check: must be admin or accountant
    const { data: rolesRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (rolesRows ?? []).map((r: { role: string }) => r.role);
    if (!roles.includes("admin") && !roles.includes("accountant")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), { status: 403, headers: { ...cors, "content-type": "application/json" } });
    }

    const { period_id } = await req.json();
    if (!period_id) {
      return new Response(JSON.stringify({ error: "period_id required" }), { status: 400, headers: { ...cors, "content-type": "application/json" } });
    }

    // Fetch period, lines, profiles
    const { data: period, error: pErr } = await supabase.from("payroll_periods").select("*").eq("id", period_id).single();
    if (pErr || !period) throw new Error(pErr?.message ?? "Period not found");

    const { data: lines, error: lErr } = await supabase.from("payroll_lines").select("*").eq("period_id", period_id).order("total_pay", { ascending: false });
    if (lErr) throw lErr;

    const userIds = (lines ?? []).map((l: { user_id: string }) => l.user_id);
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, employee_id, job_title").in("id", userIds)
      : { data: [] };
    const profMap = new Map((profiles ?? []).map((p: { id: string; full_name: string; employee_id: string | null; job_title: string | null }) => [p.id, p]));

    // Timesheet entries detail
    const { data: entries } = await supabase
      .from("timesheet_entries")
      .select("user_id, project_id, work_date, regular_hours, overtime_hours, notes")
      .gte("work_date", period.period_start)
      .lte("work_date", period.period_end)
      .eq("status", "approved")
      .order("work_date");
    const projectIds = Array.from(new Set((entries ?? []).map((e: { project_id: string }) => e.project_id)));
    const { data: projs } = projectIds.length
      ? await supabase.from("projects").select("id, code, name").in("id", projectIds)
      : { data: [] };
    const projMap = new Map((projs ?? []).map((p: { id: string; code: string; name: string }) => [p.id, p]));

    // Build workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "BuildTrack";
    wb.created = new Date();

    // SUMMARY SHEET
    const sum = wb.addWorksheet("Summary");
    sum.columns = [
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Name", key: "name", width: 28 },
      { header: "Job Title", key: "job", width: 22 },
      { header: "Regular Hours", key: "reg_h", width: 14 },
      { header: "Overtime Hours", key: "ot_h", width: 15 },
      { header: "Hourly Rate", key: "rate", width: 13 },
      { header: "OT Multiplier", key: "mult", width: 14 },
      { header: "Regular Pay", key: "reg_p", width: 14 },
      { header: "Overtime Pay", key: "ot_p", width: 14 },
      { header: "Total Pay", key: "total", width: 15 },
      { header: "Currency", key: "cur", width: 10 },
    ];

    // Title block
    sum.spliceRows(1, 0, []);
    sum.spliceRows(1, 0, []);
    sum.spliceRows(1, 0, []);
    sum.getCell("A1").value = "PAYROLL REPORT";
    sum.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    sum.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    sum.getCell("A1").alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    sum.mergeCells("A1:K1");
    sum.getRow(1).height = 28;

    sum.getCell("A2").value = `Period: ${period.name}  (${period.period_start} → ${period.period_end})`;
    sum.getCell("A2").font = { bold: true, size: 11 };
    sum.mergeCells("A2:K2");
    sum.getCell("A3").value = `Status: ${String(period.status).toUpperCase()}    Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
    sum.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
    sum.mergeCells("A3:K3");

    // Header row formatting (row 4)
    const hdrRow = sum.getRow(4);
    hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    hdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    hdrRow.alignment = { vertical: "middle", horizontal: "center" };
    hdrRow.height = 22;

    // Data
    (lines ?? []).forEach((l: {
      user_id: string; regular_hours: number; overtime_hours: number;
      hourly_rate: number; overtime_multiplier: number;
      regular_pay: number; overtime_pay: number; total_pay: number; currency: string;
    }) => {
      const p = profMap.get(l.user_id);
      sum.addRow({
        emp: p?.employee_id ?? "",
        name: p?.full_name ?? "",
        job: p?.job_title ?? "",
        reg_h: Number(l.regular_hours),
        ot_h: Number(l.overtime_hours),
        rate: Number(l.hourly_rate),
        mult: Number(l.overtime_multiplier),
        reg_p: Number(l.regular_pay),
        ot_p: Number(l.overtime_pay),
        total: Number(l.total_pay),
        cur: l.currency,
      });
    });

    // Number formats
    const dataStart = 5;
    const dataEnd = 4 + (lines?.length ?? 0);
    if (dataEnd >= dataStart) {
      sum.getColumn("reg_h").numFmt = "0.00";
      sum.getColumn("ot_h").numFmt = "0.00";
      sum.getColumn("rate").numFmt = '"$"#,##0.00;("$"#,##0.00);-';
      sum.getColumn("mult").numFmt = "0.00";
      sum.getColumn("reg_p").numFmt = '"$"#,##0.00;("$"#,##0.00);-';
      sum.getColumn("ot_p").numFmt = '"$"#,##0.00;("$"#,##0.00);-';
      sum.getColumn("total").numFmt = '"$"#,##0.00;("$"#,##0.00);-';

      // Zebra stripes
      for (let r = dataStart; r <= dataEnd; r++) {
        if ((r - dataStart) % 2 === 1) {
          sum.getRow(r).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
          });
        }
        sum.getRow(r).getCell("total").font = { bold: true };
      }

      // Totals row with formulas
      const totalRow = dataEnd + 1;
      sum.getCell(`A${totalRow}`).value = "TOTAL";
      sum.getCell(`A${totalRow}`).font = { bold: true };
      sum.mergeCells(`A${totalRow}:C${totalRow}`);
      sum.getCell(`D${totalRow}`).value = { formula: `SUM(D${dataStart}:D${dataEnd})` };
      sum.getCell(`E${totalRow}`).value = { formula: `SUM(E${dataStart}:E${dataEnd})` };
      sum.getCell(`H${totalRow}`).value = { formula: `SUM(H${dataStart}:H${dataEnd})` };
      sum.getCell(`I${totalRow}`).value = { formula: `SUM(I${dataStart}:I${dataEnd})` };
      sum.getCell(`J${totalRow}`).value = { formula: `SUM(J${dataStart}:J${dataEnd})` };
      sum.getRow(totalRow).font = { bold: true };
      sum.getRow(totalRow).eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        c.border = { top: { style: "medium" } };
      });
    }

    // Borders for data
    if (dataEnd >= 4) {
      for (let r = 4; r <= dataEnd; r++) {
        sum.getRow(r).eachCell((c) => {
          c.border = {
            ...(c.border ?? {}),
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      }
    }
    sum.views = [{ state: "frozen", ySplit: 4 }];

    // DETAIL SHEET (per-day entries)
    const det = wb.addWorksheet("Time Entries");
    det.columns = [
      { header: "Date", key: "date", width: 12 },
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Employee", key: "name", width: 26 },
      { header: "Project", key: "proj", width: 14 },
      { header: "Project Name", key: "pname", width: 30 },
      { header: "Regular Hours", key: "reg", width: 14 },
      { header: "Overtime Hours", key: "ot", width: 15 },
      { header: "Notes", key: "notes", width: 40 },
    ];
    const detHdr = det.getRow(1);
    detHdr.font = { bold: true, color: { argb: "FFFFFFFF" } };
    detHdr.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    detHdr.alignment = { vertical: "middle", horizontal: "center" };
    detHdr.height = 22;

    (entries ?? []).forEach((e: {
      user_id: string; project_id: string; work_date: string;
      regular_hours: number; overtime_hours: number; notes: string | null;
    }) => {
      const p = profMap.get(e.user_id);
      const pr = projMap.get(e.project_id);
      det.addRow({
        date: e.work_date,
        emp: p?.employee_id ?? "",
        name: p?.full_name ?? "",
        proj: pr?.code ?? "",
        pname: pr?.name ?? "",
        reg: Number(e.regular_hours),
        ot: Number(e.overtime_hours),
        notes: e.notes ?? "",
      });
    });
    det.getColumn("reg").numFmt = "0.00";
    det.getColumn("ot").numFmt = "0.00";
    det.autoFilter = { from: "A1", to: `H${(entries?.length ?? 0) + 1}` };
    det.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await wb.xlsx.writeBuffer();
    const file = b64encode(new Uint8Array(buffer));

    return new Response(JSON.stringify({ file }), {
      status: 200,
      headers: { ...cors, "content-type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err instanceof Error ? err.message : String(err) }), {
      status: 500,
      headers: { ...cors, "content-type": "application/json" },
    });
  }
});
