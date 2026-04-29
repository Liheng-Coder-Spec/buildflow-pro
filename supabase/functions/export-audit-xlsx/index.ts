// Edge function: export-audit-xlsx
// Exports filtered audit log entries as a formatted Excel workbook (admin-only).
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
import * as ExcelJS from "https://esm.sh/exceljs@4.4.0";
import { encode as b64encode } from "https://deno.land/std@0.224.0/encoding/base64.ts";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface Filters {
  entity_type?: string | null;
  action?: string | null;
  user_id?: string | null;
  date_from?: string | null; // ISO
  date_to?: string | null;   // ISO
  search?: string | null;
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

    // Build query (RLS is admin-only on audit_log; query with user JWT)
    let q = supabase.from("audit_log").select("*").order("created_at", { ascending: false }).limit(5000);
    if (filters.entity_type && filters.entity_type !== "all") q = q.eq("entity_type", filters.entity_type);
    if (filters.action && filters.action !== "all") q = q.eq("action", filters.action);
    if (filters.user_id && filters.user_id !== "all") q = q.eq("user_id", filters.user_id);
    if (filters.date_from) q = q.gte("created_at", filters.date_from);
    if (filters.date_to) q = q.lte("created_at", filters.date_to);
    const { data: rows, error: qErr } = await q;
    if (qErr) throw qErr;

    let filtered = rows ?? [];
    if (filters.search) {
      const s = filters.search.toLowerCase();
      filtered = filtered.filter((r: { entity_type: string; entity_id: string | null }) =>
        `${r.entity_type} ${r.entity_id ?? ""}`.toLowerCase().includes(s),
      );
    }

    // Hydrate actor names
    const userIds = Array.from(new Set(filtered.map((r: { user_id: string | null }) => r.user_id).filter(Boolean) as string[]));
    const { data: profiles } = userIds.length
      ? await supabase.from("profiles").select("id, full_name, employee_id").in("id", userIds)
      : { data: [] };
    const profMap = new Map(
      (profiles ?? []).map((p: { id: string; full_name: string; employee_id: string | null }) => [p.id, p]),
    );

    const wb = new ExcelJS.Workbook();
    wb.creator = "BuildTrack";
    wb.created = new Date();

    const ws = wb.addWorksheet("Audit Log");
    ws.columns = [
      { header: "When", key: "when", width: 22 },
      { header: "Entity", key: "entity", width: 22 },
      { header: "Action", key: "action", width: 12 },
      { header: "Actor", key: "actor", width: 28 },
      { header: "Employee ID", key: "emp", width: 14 },
      { header: "Entity ID", key: "eid", width: 38 },
      { header: "Before (JSON)", key: "before", width: 60 },
      { header: "After (JSON)", key: "after", width: 60 },
    ];

    // Title block
    ws.spliceRows(1, 0, []);
    ws.spliceRows(1, 0, []);
    ws.spliceRows(1, 0, []);
    ws.getCell("A1").value = "AUDIT LOG EXPORT";
    ws.getCell("A1").font = { bold: true, size: 16, color: { argb: "FFFFFFFF" } };
    ws.getCell("A1").fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF1E3A8A" } };
    ws.getCell("A1").alignment = { vertical: "middle", horizontal: "left", indent: 1 };
    ws.mergeCells("A1:H1");
    ws.getRow(1).height = 28;

    const fLabel = `Filters: entity=${filters.entity_type ?? "all"}, action=${filters.action ?? "all"}, actor=${
      filters.user_id ? (profMap.get(filters.user_id)?.full_name ?? filters.user_id) : "all"
    }, from=${filters.date_from ?? "—"}, to=${filters.date_to ?? "—"}${filters.search ? `, search="${filters.search}"` : ""}`;
    ws.getCell("A2").value = fLabel;
    ws.getCell("A2").font = { bold: true, size: 11 };
    ws.mergeCells("A2:H2");

    ws.getCell("A3").value = `Generated: ${new Date().toISOString().slice(0, 19).replace("T", " ")}  ·  Rows: ${filtered.length}`;
    ws.getCell("A3").font = { italic: true, size: 10, color: { argb: "FF6B7280" } };
    ws.mergeCells("A3:H3");

    // Header row at row 4
    const hdrRow = ws.getRow(4);
    hdrRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
    hdrRow.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FF374151" } };
    hdrRow.alignment = { vertical: "middle", horizontal: "center" };
    hdrRow.height = 22;

    filtered.forEach((r: {
      created_at: string; entity_type: string; entity_id: string | null;
      action: string; user_id: string | null; before_data: unknown; after_data: unknown;
    }) => {
      const p = r.user_id ? profMap.get(r.user_id) : null;
      ws.addRow({
        when: new Date(r.created_at).toISOString().slice(0, 19).replace("T", " "),
        entity: r.entity_type,
        action: r.action,
        actor: p?.full_name ?? (r.user_id ? "Unknown" : "System"),
        emp: p?.employee_id ?? "",
        eid: r.entity_id ?? "",
        before: r.before_data ? JSON.stringify(r.before_data) : "",
        after: r.after_data ? JSON.stringify(r.after_data) : "",
      });
    });

    const dataStart = 5;
    const dataEnd = 4 + filtered.length;
    if (dataEnd >= dataStart) {
      for (let r = dataStart; r <= dataEnd; r++) {
        if ((r - dataStart) % 2 === 1) {
          ws.getRow(r).eachCell((c) => {
            c.fill = { type: "pattern", pattern: "solid", fgColor: { argb: "FFF9FAFB" } };
          });
        }
        // color action column
        const actionCell = ws.getRow(r).getCell("action");
        const colors: Record<string, string> = {
          create: "FF065F46",
          update: "FF1E3A8A",
          delete: "FF991B1B",
        };
        const color = colors[String(actionCell.value)] ?? "FF374151";
        actionCell.font = { bold: true, color: { argb: color } };
      }
      for (let r = 4; r <= dataEnd; r++) {
        ws.getRow(r).eachCell((c) => {
          c.border = {
            ...(c.border ?? {}),
            bottom: { style: "thin", color: { argb: "FFE5E7EB" } },
          };
        });
      }
    }

    ws.autoFilter = { from: "A4", to: `H${Math.max(dataEnd, 4)}` };
    ws.views = [{ state: "frozen", ySplit: 4 }];

    const buffer = await wb.xlsx.writeBuffer();
    const file = b64encode(new Uint8Array(buffer));

    return new Response(JSON.stringify({ file, count: filtered.length }), {
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
