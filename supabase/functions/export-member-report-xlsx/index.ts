// Edge function: export-member-report-xlsx
// Exports a per-member performance report (admin-only):
//   - Summary sheet: org-wide KPIs per member
//   - Tasks sheet: filtered task list with status & due dates
//   - Timesheets sheet: approved/submitted hours per day
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as ExcelJS from "https://esm.sh/exceljs@4.4.0";
import { encode as b64encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Filters {
  project_id?: string | null;
  date_from?: string | null;
  date_to?: string | null;
}

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
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const { data: rolesRows } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
    const roles = (rolesRows ?? []).map((r: { role: string }) => r.role);
    if (!roles.includes("admin")) {
      return new Response(JSON.stringify({ error: "Forbidden" }), {
        status: 403,
        headers: { ...cors, "content-type": "application/json" },
      });
    }

    const filters: Filters = (await req.json().catch(() => ({}))) as Filters;
    const today = new Date().toISOString().slice(0, 10);

    // Fetch base data
    let tasksQ = supabase.from("tasks").select(
      "id, code, title, status, priority, progress_pct, planned_end, actual_end, created_by, project_id, estimated_hours, actual_hours",
    );
    if (filters.project_id && filters.project_id !== "all") tasksQ = tasksQ.eq("project_id", filters.project_id);
    const { data: tasks, error: tErr } = await tasksQ;
    if (tErr) throw tErr;

    let tsQ = supabase.from("timesheet_entries").select(
      "id, user_id, project_id, work_date, regular_hours, overtime_hours, status",
    );
    if (filters.project_id && filters.project_id !== "all") tsQ = tsQ.eq("project_id", filters.project_id);
    if (filters.date_from) tsQ = tsQ.gte("work_date", filters.date_from);
    if (filters.date_to) tsQ = tsQ.lte("work_date", filters.date_to);
    const { data: ts, error: tsErr } = await tsQ;
    if (tsErr) throw tsErr;

    // Assignments to map tasks -> users
    const taskIds = (tasks ?? []).map((t: { id: string }) => t.id);
    const { data: assigns } = taskIds.length
      ? await supabase
          .from("task_assignments")
          .select("user_id, task_id, unassigned_at")
          .in("task_id", taskIds)
          .is("unassigned_at", null)
      : { data: [] };

    // Profiles
    const allUserIds = Array.from(new Set([
      ...(assigns ?? []).map((a: { user_id: string }) => a.user_id),
      ...(ts ?? []).map((e: { user_id: string }) => e.user_id),
    ]));
    const { data: profiles } = allUserIds.length
      ? await supabase.from("profiles").select("id, full_name, employee_id, job_title").in("id", allUserIds)
      : { data: [] };
    const profMap = new Map(
      (profiles ?? []).map((p: { id: string; full_name: string; employee_id: string | null; job_title: string | null }) => [p.id, p]),
    );

    // Projects
    const projIds = Array.from(new Set([
      ...((tasks ?? []).map((t: { project_id: string }) => t.project_id)),
      ...((ts ?? []).map((e: { project_id: string }) => e.project_id)),
    ]));
    const { data: projs } = projIds.length
      ? await supabase.from("projects").select("id, code, name").in("id", projIds)
      : { data: [] };
    const projMap = new Map((projs ?? []).map((p: { id: string; code: string; name: string }) => [p.id, p]));

    // Per-member aggregation
    type Member = {
      user_id: string;
      total_tasks: number;
      completed: number;
      in_progress: number;
      overdue: number;
      on_time: number;
      regular_hours: number;
      overtime_hours: number;
      approved_hours: number;
    };
    const members = new Map<string, Member>();
    const ensure = (uid: string): Member => {
      let m = members.get(uid);
      if (!m) {
        m = {
          user_id: uid,
          total_tasks: 0,
          completed: 0,
          in_progress: 0,
          overdue: 0,
          on_time: 0,
          regular_hours: 0,
          overtime_hours: 0,
          approved_hours: 0,
        };
        members.set(uid, m);
      }
      return m;
    };

    const tasksByUser = new Map<string, Set<string>>();
    (assigns ?? []).forEach((a: { user_id: string; task_id: string }) => {
      let s = tasksByUser.get(a.user_id);
      if (!s) {
        s = new Set();
        tasksByUser.set(a.user_id, s);
      }
      s.add(a.task_id);
    });

    const taskMap = new Map((tasks ?? []).map((t: any) => [t.id, t]));

    tasksByUser.forEach((tIds, uid) => {
      const m = ensure(uid);
      tIds.forEach((tid) => {
        const t: any = taskMap.get(tid);
        if (!t) return;
        m.total_tasks += 1;
        if (t.status === "completed" || t.status === "closed") m.completed += 1;
        if (t.status === "in_progress") m.in_progress += 1;
        const isClosed = ["completed", "closed", "approved"].includes(t.status);
        if (t.planned_end && t.planned_end < today && !isClosed) m.overdue += 1;
        if (
          (t.status === "completed" || t.status === "closed") &&
          t.planned_end && t.actual_end &&
          new Date(t.actual_end) <= new Date(t.planned_end)
        ) {
          m.on_time += 1;
        }
      });
    });

    (ts ?? []).forEach((e: { user_id: string; regular_hours: number; overtime_hours: number; status: string }) => {
      const m = ensure(e.user_id);
      m.regular_hours += Number(e.regular_hours);
      m.overtime_hours += Number(e.overtime_hours);
      if (e.status === "approved") m.approved_hours += Number(e.regular_hours) + Number(e.overtime_hours);
    });

    // Build workbook
    const wb = new ExcelJS.Workbook();
    wb.creator = "BuildTrack";
    wb.created = new Date();

    // ───── SUMMARY SHEET ─────
    const sum = wb.addWorksheet("Member Performance");
    sum.columns = [
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Name", key: "name", width: 28 },
      { header: "Job Title", key: "job", width: 22 },
      { header: "Total Tasks", key: "tt", width: 12 },
      { header: "Completed", key: "cp", width: 12 },
      { header: "In Progress", key: "ip", width: 12 },
      { header: "Overdue", key: "od", width: 10 },
      { header: "On-time %", key: "ot", width: 12 },
      { header: "Completion %", key: "cmp", width: 14 },
      { header: "Regular Hours", key: "rh", width: 14 },
      { header: "Overtime Hours", key: "oh", width: 15 },
      { header: "Approved Hours", key: "ah", width: 15 },
    ];

    sum.spliceRows(1, 0, []);
    sum.spliceRows(1, 0, []);
    sum.spliceRows(1, 0, []);
    sum.getCell("A1").value = "MEMBER PERFORMANCE REPORT";
    sum.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    sum.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    sum.getCell("A1").alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    sum.mergeCells("A1:L1");
    sum.getRow(1).height = 28;

    sum.getCell("A2").value =
      `Project: ${
        filters.project_id && filters.project_id !== "all"
          ? (projMap.get(filters.project_id)?.code + " · " + projMap.get(filters.project_id)?.name)
          : "All projects"
      }   ·   Period: ${filters.date_from ?? "—"} → ${filters.date_to ?? "—"}`;
    sum.getCell("A2").font = { bold: true, size: 11 };
    sum.mergeCells("A2:L2");

    sum.getCell("A3").value = `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
    sum.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
    sum.mergeCells("A3:L3");

    const hdrRow = sum.getRow(4);
    hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    hdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    hdrRow.alignment = { vertical: "middle", horizontal: "center" };
    hdrRow.height = 22;

    const memberRows = Array.from(members.values()).sort((a, b) => b.total_tasks - a.total_tasks);
    memberRows.forEach((m) => {
      const p = profMap.get(m.user_id);
      const otRate = m.completed > 0 ? m.on_time / m.completed : 0;
      const cmpRate = m.total_tasks > 0 ? m.completed / m.total_tasks : 0;
      sum.addRow({
        emp: p?.employee_id ?? "",
        name: p?.full_name ?? "Unknown",
        job: p?.job_title ?? "",
        tt: m.total_tasks,
        cp: m.completed,
        ip: m.in_progress,
        od: m.overdue,
        ot: otRate,
        cmp: cmpRate,
        rh: m.regular_hours,
        oh: m.overtime_hours,
        ah: m.approved_hours,
      });
    });

    const dStart = 5;
    const dEnd = 4 + memberRows.length;
    if (dEnd >= dStart) {
      sum.getColumn("ot").numFmt = "0.0%";
      sum.getColumn("cmp").numFmt = "0.0%";
      sum.getColumn("rh").numFmt = "0.00";
      sum.getColumn("oh").numFmt = "0.00";
      sum.getColumn("ah").numFmt = "0.00";

      for (let r = dStart; r <= dEnd; r++) {
        if ((r - dStart) % 2 === 1) {
          sum.getRow(r).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
          });
        }
        const overdueCell = sum.getRow(r).getCell("od");
        if (Number(overdueCell.value) > 0) overdueCell.font = { bold: true, color: { argb: "FF991B1B" } };
      }

      // Totals
      const tr = dEnd + 1;
      sum.getCell(`A${tr}`).value = "TOTAL";
      sum.getCell(`A${tr}`).font = { bold: true };
      sum.mergeCells(`A${tr}:C${tr}`);
      sum.getCell(`D${tr}`).value = { formula: `SUM(D${dStart}:D${dEnd})` };
      sum.getCell(`E${tr}`).value = { formula: `SUM(E${dStart}:E${dEnd})` };
      sum.getCell(`F${tr}`).value = { formula: `SUM(F${dStart}:F${dEnd})` };
      sum.getCell(`G${tr}`).value = { formula: `SUM(G${dStart}:G${dEnd})` };
      sum.getCell(`J${tr}`).value = { formula: `SUM(J${dStart}:J${dEnd})` };
      sum.getCell(`K${tr}`).value = { formula: `SUM(K${dStart}:K${dEnd})` };
      sum.getCell(`L${tr}`).value = { formula: `SUM(L${dStart}:L${dEnd})` };
      sum.getRow(tr).font = { bold: true };
      sum.getRow(tr).eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        c.border = { top: { style: "medium" } };
      });
    }
    for (let r = 4; r <= Math.max(dEnd, 4); r++) {
      sum.getRow(r).eachCell((c) => {
        c.border = { ...(c.border ?? {}), bottom: { style: "thin", color: { argb: "FFE5E7EB" } } };
      });
    }
    sum.autoFilter = { from: "A4", to: `L${Math.max(dEnd, 4)}` };
    sum.views = [{ state: "frozen", ySplit: 4 }];

    // ───── TASKS SHEET ─────
    const tWs = wb.addWorksheet("Tasks");
    tWs.columns = [
      { header: "Project", key: "proj", width: 14 },
      { header: "Code", key: "code", width: 14 },
      { header: "Title", key: "title", width: 40 },
      { header: "Assignees", key: "as", width: 30 },
      { header: "Status", key: "st", width: 14 },
      { header: "Priority", key: "pr", width: 10 },
      { header: "Progress %", key: "pg", width: 12 },
      { header: "Planned End", key: "pe", width: 14 },
      { header: "Actual End", key: "ae", width: 18 },
      { header: "Est. Hours", key: "eh", width: 12 },
      { header: "Actual Hours", key: "ah", width: 13 },
    ];
    tWs.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    tWs.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    tWs.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    tWs.getRow(1).height = 22;

    const assignsByTask = new Map<string, string[]>();
    (assigns ?? []).forEach((a: { user_id: string; task_id: string }) => {
      let arr = assignsByTask.get(a.task_id);
      if (!arr) {
        arr = [];
        assignsByTask.set(a.task_id, arr);
      }
      arr.push(profMap.get(a.user_id)?.full_name ?? "Unknown");
    });

    (tasks ?? []).forEach((t: any) => {
      const pr = projMap.get(t.project_id);
      tWs.addRow({
        proj: pr?.code ?? "",
        code: t.code ?? "",
        title: t.title,
        as: (assignsByTask.get(t.id) ?? []).join(", "),
        st: t.status,
        pr: t.priority,
        pg: t.progress_pct,
        pe: t.planned_end ?? "",
        ae: t.actual_end ? new Date(t.actual_end).toISOString().slice(0, 10) : "",
        eh: t.estimated_hours ?? 0,
        ah: t.actual_hours ?? 0,
      });
    });
    tWs.getColumn("eh").numFmt = "0.00";
    tWs.getColumn("ah").numFmt = "0.00";
    tWs.autoFilter = { from: "A1", to: `K${(tasks?.length ?? 0) + 1}` };
    tWs.views = [{ state: "frozen", ySplit: 1 }];

    // ───── TIMESHEETS SHEET ─────
    const tsWs = wb.addWorksheet("Timesheets");
    tsWs.columns = [
      { header: "Date", key: "d", width: 12 },
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Employee", key: "name", width: 26 },
      { header: "Project", key: "proj", width: 14 },
      { header: "Status", key: "st", width: 12 },
      { header: "Regular Hours", key: "rh", width: 14 },
      { header: "Overtime Hours", key: "oh", width: 15 },
    ];
    tsWs.getRow(1).font = { bold: true, color: { argb: "FFFFFFFF" } };
    tsWs.getRow(1).fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    tsWs.getRow(1).alignment = { vertical: "middle", horizontal: "center" };
    tsWs.getRow(1).height = 22;

    (ts ?? []).forEach((e: { user_id: string; project_id: string; work_date: string; status: string; regular_hours: number; overtime_hours: number }) => {
      const p = profMap.get(e.user_id);
      const pr = projMap.get(e.project_id);
      tsWs.addRow({
        d: e.work_date,
        emp: p?.employee_id ?? "",
        name: p?.full_name ?? "Unknown",
        proj: pr?.code ?? "",
        st: e.status,
        rh: Number(e.regular_hours),
        oh: Number(e.overtime_hours),
      });
    });
    tsWs.getColumn("rh").numFmt = "0.00";
    tsWs.getColumn("oh").numFmt = "0.00";
    tsWs.autoFilter = { from: "A1", to: `G${(ts?.length ?? 0) + 1}` };
    tsWs.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await wb.xlsx.writeBuffer();
    const file = b64encode(new Uint8Array(buffer));
    return new Response(JSON.stringify({ file, members: memberRows.length }), {
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
