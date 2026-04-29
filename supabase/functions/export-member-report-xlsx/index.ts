// Edge function: export-member-report-xlsx
// Exports a per-member performance report (admin-only):
//   - Summary sheet: org-wide KPIs per member with full status breakdown + dept
//   - By Department sheet: per-department status breakdown
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

const DEPT_LABELS: Record<string, string> = {
  architecture: "Architecture",
  structure: "Structural",
  mep: "MEP",
  procurement: "Procurement",
  construction: "Construction",
};
const DEPT_ORDER = ["architecture", "structure", "mep", "procurement", "construction", "unassigned"];

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

    let tasksQ = supabase.from("tasks").select(
      "id, code, title, status, priority, progress_pct, planned_end, actual_end, created_by, project_id, estimated_hours, actual_hours, department, dept_status",
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

    const taskIds = (tasks ?? []).map((t: { id: string }) => t.id);
    const { data: assigns } = taskIds.length
      ? await supabase
          .from("task_assignments")
          .select("user_id, task_id, unassigned_at")
          .in("task_id", taskIds)
          .is("unassigned_at", null)
      : { data: [] };

    const { data: deptMembersData } = await supabase
      .from("department_members")
      .select("user_id, department");
    const deptMembers = (deptMembersData ?? []) as Array<{ user_id: string; department: string }>;

    const allUserIds = Array.from(new Set([
      ...(assigns ?? []).map((a: { user_id: string }) => a.user_id),
      ...(ts ?? []).map((e: { user_id: string }) => e.user_id),
      ...deptMembers.map((d) => d.user_id),
    ]));
    const { data: profiles } = allUserIds.length
      ? await supabase.from("profiles").select("id, full_name, employee_id, job_title").in("id", allUserIds)
      : { data: [] };
    const profMap = new Map(
      (profiles ?? []).map((p: { id: string; full_name: string; employee_id: string | null; job_title: string | null }) => [p.id, p]),
    );

    const projIds = Array.from(new Set([
      ...((tasks ?? []).map((t: { project_id: string }) => t.project_id)),
      ...((ts ?? []).map((e: { project_id: string }) => e.project_id)),
    ]));
    const { data: projs } = projIds.length
      ? await supabase.from("projects").select("id, code, name").in("id", projIds)
      : { data: [] };
    const projMap = new Map((projs ?? []).map((p: { id: string; code: string; name: string }) => [p.id, p]));

    // Per-member aggregation with full status breakdown
    type Member = {
      user_id: string;
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
      on_time: number;
      regular_hours: number;
      overtime_hours: number;
      approved_hours: number;
    };
    const members = new Map<string, Member>();
    const ensureM = (uid: string): Member => {
      let m = members.get(uid);
      if (!m) {
        m = {
          user_id: uid, total_tasks: 0,
          open: 0, assigned: 0, in_progress: 0, pending_approval: 0,
          approved: 0, rejected: 0, completed: 0, closed: 0,
          overdue: 0, on_time: 0,
          regular_hours: 0, overtime_hours: 0, approved_hours: 0,
        };
        members.set(uid, m);
      }
      return m;
    };

    const tasksByUser = new Map<string, Set<string>>();
    (assigns ?? []).forEach((a: { user_id: string; task_id: string }) => {
      let s = tasksByUser.get(a.user_id);
      if (!s) { s = new Set(); tasksByUser.set(a.user_id, s); }
      s.add(a.task_id);
    });

    const taskMap = new Map((tasks ?? []).map((t: any) => [t.id, t]));

    const bumpStatus = (m: Member, status: string) => {
      switch (status) {
        case "open": m.open++; break;
        case "assigned": m.assigned++; break;
        case "in_progress": m.in_progress++; break;
        case "pending_approval": m.pending_approval++; break;
        case "approved": m.approved++; break;
        case "rejected": m.rejected++; break;
        case "completed": m.completed++; break;
        case "closed": m.closed++; break;
      }
    };

    tasksByUser.forEach((tIds, uid) => {
      const m = ensureM(uid);
      tIds.forEach((tid) => {
        const t: any = taskMap.get(tid);
        if (!t) return;
        m.total_tasks += 1;
        bumpStatus(m, t.status);
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
      const m = ensureM(e.user_id);
      m.regular_hours += Number(e.regular_hours);
      m.overtime_hours += Number(e.overtime_hours);
      if (e.status === "approved") m.approved_hours += Number(e.regular_hours) + Number(e.overtime_hours);
    });

    // Department for each user (first dept)
    const userDept = new Map<string, string>();
    deptMembers.forEach((dm) => {
      if (!userDept.has(dm.user_id)) userDept.set(dm.user_id, dm.department);
    });

    // Department-level aggregation
    type DeptAgg = {
      members: Set<string>;
      total: number;
      open: number; assigned: number; in_progress: number; pending_approval: number;
      approved: number; rejected: number; completed: number; closed: number;
      overdue: number; hours: number;
    };
    const deptAgg = new Map<string, DeptAgg>();
    const ensureD = (k: string): DeptAgg => {
      let a = deptAgg.get(k);
      if (!a) {
        a = {
          members: new Set(), total: 0,
          open: 0, assigned: 0, in_progress: 0, pending_approval: 0,
          approved: 0, rejected: 0, completed: 0, closed: 0,
          overdue: 0, hours: 0,
        };
        deptAgg.set(k, a);
      }
      return a;
    };

    const assignsByTask = new Map<string, string[]>();
    (assigns ?? []).forEach((a: { user_id: string; task_id: string }) => {
      let arr = assignsByTask.get(a.task_id);
      if (!arr) { arr = []; assignsByTask.set(a.task_id, arr); }
      arr.push(a.user_id);
    });

    (tasks ?? []).forEach((t: any) => {
      const k = t.department ?? "unassigned";
      const a = ensureD(k);
      a.total += 1;
      const isClosed = ["completed", "closed", "approved"].includes(t.status);
      if (t.planned_end && t.planned_end < today && !isClosed) a.overdue += 1;
      switch (t.status) {
        case "open": a.open++; break;
        case "assigned": a.assigned++; break;
        case "in_progress": a.in_progress++; break;
        case "pending_approval": a.pending_approval++; break;
        case "approved": a.approved++; break;
        case "rejected": a.rejected++; break;
        case "completed": a.completed++; break;
        case "closed": a.closed++; break;
      }
      (assignsByTask.get(t.id) ?? []).forEach((uid) => a.members.add(uid));
    });
    deptMembers.forEach((dm) => ensureD(dm.department).members.add(dm.user_id));
    (ts ?? []).forEach((e: { user_id: string; regular_hours: number; overtime_hours: number }) => {
      const k = userDept.get(e.user_id) ?? "unassigned";
      ensureD(k).hours += Number(e.regular_hours) + Number(e.overtime_hours);
    });

    // ────────────── Build workbook ──────────────
    const wb = new ExcelJS.Workbook();
    wb.creator = "BuildTrack";
    wb.created = new Date();

    const filterLine =
      `Project: ${
        filters.project_id && filters.project_id !== "all"
          ? (projMap.get(filters.project_id)?.code + " · " + projMap.get(filters.project_id)?.name)
          : "All projects"
      }   ·   Period: ${filters.date_from ?? "—"} → ${filters.date_to ?? "—"}`;

    // ───── MEMBER PERFORMANCE SHEET ─────
    const sum = wb.addWorksheet("Member Performance");
    sum.columns = [
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Name", key: "name", width: 26 },
      { header: "Department", key: "dept", width: 14 },
      { header: "Job Title", key: "job", width: 22 },
      { header: "Total", key: "tt", width: 8 },
      { header: "Open", key: "op", width: 8 },
      { header: "Assigned", key: "as", width: 10 },
      { header: "In Progress", key: "ip", width: 12 },
      { header: "Pending", key: "pa", width: 10 },
      { header: "Approved", key: "ap", width: 10 },
      { header: "Rejected", key: "rj", width: 10 },
      { header: "Completed", key: "cp", width: 11 },
      { header: "Closed", key: "cl", width: 9 },
      { header: "Overdue", key: "od", width: 10 },
      { header: "On-time %", key: "ot", width: 11 },
      { header: "Done %", key: "cmp", width: 10 },
      { header: "Regular Hrs", key: "rh", width: 12 },
      { header: "Overtime Hrs", key: "oh", width: 13 },
      { header: "Approved Hrs", key: "ah", width: 13 },
    ];

    const LAST_COL = "S"; // 19 columns
    sum.spliceRows(1, 0, []);
    sum.spliceRows(1, 0, []);
    sum.spliceRows(1, 0, []);
    sum.getCell("A1").value = "MEMBER PERFORMANCE REPORT";
    sum.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    sum.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    sum.getCell("A1").alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    sum.mergeCells(`A1:${LAST_COL}1`);
    sum.getRow(1).height = 28;

    sum.getCell("A2").value = filterLine;
    sum.getCell("A2").font = { bold: true, size: 11 };
    sum.mergeCells(`A2:${LAST_COL}2`);

    sum.getCell("A3").value = `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}`;
    sum.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
    sum.mergeCells(`A3:${LAST_COL}3`);

    const hdrRow = sum.getRow(4);
    hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    hdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    hdrRow.alignment = { vertical: "middle", horizontal: "center" };
    hdrRow.height = 22;

    const memberRows = Array.from(members.values()).sort((a, b) => b.total_tasks - a.total_tasks);
    memberRows.forEach((m) => {
      const p = profMap.get(m.user_id);
      const doneTotal = m.completed + m.closed;
      const otRate = doneTotal > 0 ? m.on_time / doneTotal : 0;
      const cmpRate = m.total_tasks > 0 ? doneTotal / m.total_tasks : 0;
      const dept = userDept.get(m.user_id);
      sum.addRow({
        emp: p?.employee_id ?? "",
        name: p?.full_name ?? "Unknown",
        dept: dept ? (DEPT_LABELS[dept] ?? dept) : "—",
        job: p?.job_title ?? "",
        tt: m.total_tasks,
        op: m.open,
        as: m.assigned,
        ip: m.in_progress,
        pa: m.pending_approval,
        ap: m.approved,
        rj: m.rejected,
        cp: m.completed,
        cl: m.closed,
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
        const rejCell = sum.getRow(r).getCell("rj");
        if (Number(rejCell.value) > 0) rejCell.font = { bold: true, color: { argb: "FF991B1B" } };
      }

      // Totals: sum numeric cols (E..N, Q..S)
      const tr = dEnd + 1;
      sum.getCell(`A${tr}`).value = "TOTAL";
      sum.getCell(`A${tr}`).font = { bold: true };
      sum.mergeCells(`A${tr}:D${tr}`);
      ["E","F","G","H","I","J","K","L","M","N","Q","R","S"].forEach((col) => {
        sum.getCell(`${col}${tr}`).value = { formula: `SUM(${col}${dStart}:${col}${dEnd})` };
      });
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
    sum.autoFilter = { from: "A4", to: `${LAST_COL}${Math.max(dEnd, 4)}` };
    sum.views = [{ state: "frozen", ySplit: 4, xSplit: 2 }];

    // ───── BY DEPARTMENT SHEET ─────
    const dWs = wb.addWorksheet("By Department");
    dWs.columns = [
      { header: "Department", key: "dept", width: 18 },
      { header: "Members", key: "mb", width: 10 },
      { header: "Total Tasks", key: "tt", width: 12 },
      { header: "Open", key: "op", width: 8 },
      { header: "Assigned", key: "as", width: 10 },
      { header: "In Progress", key: "ip", width: 12 },
      { header: "Pending", key: "pa", width: 10 },
      { header: "Approved", key: "ap", width: 10 },
      { header: "Rejected", key: "rj", width: 10 },
      { header: "Completed", key: "cp", width: 11 },
      { header: "Closed", key: "cl", width: 9 },
      { header: "Overdue", key: "od", width: 10 },
      { header: "Done %", key: "dr", width: 9 },
      { header: "Hours", key: "hr", width: 10 },
    ];
    const D_LAST = "N";

    dWs.spliceRows(1, 0, []);
    dWs.spliceRows(1, 0, []);
    dWs.getCell("A1").value = "DEPARTMENT BREAKDOWN";
    dWs.getCell("A1").font = { bold: true, size: 14, color: { argb: "FFFFFFFF" } };
    dWs.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    dWs.getCell("A1").alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    dWs.mergeCells(`A1:${D_LAST}1`);
    dWs.getRow(1).height = 24;
    dWs.getCell("A2").value = filterLine;
    dWs.getCell("A2").font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
    dWs.mergeCells(`A2:${D_LAST}2`);

    const dHdr = dWs.getRow(3);
    dHdr.font = { bold: true, color: { argb: "FFFFFFFF" } };
    dHdr.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    dHdr.alignment = { vertical: "middle", horizontal: "center" };
    dHdr.height = 22;

    const orderedDepts = DEPT_ORDER.filter((k) => deptAgg.has(k));
    orderedDepts.forEach((k) => {
      const a = deptAgg.get(k)!;
      const dr = a.total > 0 ? (a.completed + a.closed) / a.total : 0;
      dWs.addRow({
        dept: k === "unassigned" ? "Unassigned" : (DEPT_LABELS[k] ?? k),
        mb: a.members.size,
        tt: a.total,
        op: a.open,
        as: a.assigned,
        ip: a.in_progress,
        pa: a.pending_approval,
        ap: a.approved,
        rj: a.rejected,
        cp: a.completed,
        cl: a.closed,
        od: a.overdue,
        dr,
        hr: a.hours,
      });
    });
    const dStartR = 4;
    const dEndR = 3 + orderedDepts.length;
    if (dEndR >= dStartR) {
      dWs.getColumn("dr").numFmt = "0.0%";
      dWs.getColumn("hr").numFmt = "0.00";
      for (let r = dStartR; r <= dEndR; r++) {
        if ((r - dStartR) % 2 === 1) {
          dWs.getRow(r).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
          });
        }
        const od = dWs.getRow(r).getCell("od");
        if (Number(od.value) > 0) od.font = { bold: true, color: { argb: "FF991B1B" } };
      }
      const tr = dEndR + 1;
      dWs.getCell(`A${tr}`).value = "TOTAL";
      dWs.getCell(`A${tr}`).font = { bold: true };
      ["B","C","D","E","F","G","H","I","J","K","L","N"].forEach((col) => {
        dWs.getCell(`${col}${tr}`).value = { formula: `SUM(${col}${dStartR}:${col}${dEndR})` };
      });
      dWs.getRow(tr).font = { bold: true };
      dWs.getRow(tr).eachCell((c) => {
        c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFFEF3C7" } };
        c.border = { top: { style: "medium" } };
      });
    }
    dWs.autoFilter = { from: "A3", to: `${D_LAST}${Math.max(dEndR, 3)}` };
    dWs.views = [{ state: "frozen", ySplit: 3 }];

    // ───── TASKS SHEET ─────
    const tWs = wb.addWorksheet("Tasks");
    tWs.columns = [
      { header: "Project", key: "proj", width: 14 },
      { header: "Code", key: "code", width: 14 },
      { header: "Title", key: "title", width: 40 },
      { header: "Department", key: "dept", width: 14 },
      { header: "Dept Status", key: "ds", width: 16 },
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

    const assigneesByTask = new Map<string, string[]>();
    (assigns ?? []).forEach((a: { user_id: string; task_id: string }) => {
      let arr = assigneesByTask.get(a.task_id);
      if (!arr) { arr = []; assigneesByTask.set(a.task_id, arr); }
      arr.push(profMap.get(a.user_id)?.full_name ?? "Unknown");
    });

    (tasks ?? []).forEach((t: any) => {
      const pr = projMap.get(t.project_id);
      tWs.addRow({
        proj: pr?.code ?? "",
        code: t.code ?? "",
        title: t.title,
        dept: t.department ? (DEPT_LABELS[t.department] ?? t.department) : "—",
        ds: t.dept_status ?? "—",
        as: (assigneesByTask.get(t.id) ?? []).join(", "),
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
    tWs.autoFilter = { from: "A1", to: `M${(tasks?.length ?? 0) + 1}` };
    tWs.views = [{ state: "frozen", ySplit: 1 }];

    // ───── TIMESHEETS SHEET ─────
    const tsWs = wb.addWorksheet("Timesheets");
    tsWs.columns = [
      { header: "Date", key: "d", width: 12 },
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Employee", key: "name", width: 26 },
      { header: "Department", key: "dept", width: 14 },
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
      const dept = userDept.get(e.user_id);
      tsWs.addRow({
        d: e.work_date,
        emp: p?.employee_id ?? "",
        name: p?.full_name ?? "Unknown",
        dept: dept ? (DEPT_LABELS[dept] ?? dept) : "—",
        proj: pr?.code ?? "",
        st: e.status,
        rh: Number(e.regular_hours),
        oh: Number(e.overtime_hours),
      });
    });
    tsWs.getColumn("rh").numFmt = "0.00";
    tsWs.getColumn("oh").numFmt = "0.00";
    tsWs.autoFilter = { from: "A1", to: `H${(ts?.length ?? 0) + 1}` };
    tsWs.views = [{ state: "frozen", ySplit: 1 }];

    const buffer = await wb.xlsx.writeBuffer();
    const file = b64encode(new Uint8Array(buffer));
    return new Response(JSON.stringify({ file, members: memberRows.length, departments: orderedDepts.length }), {
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
