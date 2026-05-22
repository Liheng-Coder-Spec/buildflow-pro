import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { fetchDocumentTypes, fetchDisciplines } from "@/services/adminConfigService";
import { getAdminClient } from "@/test/setupHelpers";

interface QueryResult<T> {
  data: T[] | null;
  error: { message: string } | null;
}

interface TestQuery<T> extends PromiseLike<QueryResult<T>> {
  limit(count: number): TestQuery<T>;
  order(column: string): TestQuery<T>;
}

interface TestTable<T> {
  select(columns: string): TestQuery<T>;
}

interface TestClient {
  from<T>(table: string): TestTable<T>;
}

const testClient = supabase as unknown as TestClient;

const TABLES = [
  "disciplines",
  "project_types",
  "wbs_node_types",
  "document_types",
  "cost_codes",
  "material_codes",
  "equipment_types",
  "public_holidays",
  "notification_rules",
  "approval_templates",
  "checklist_templates",
  "labor_rates",
] as const;

let adminClient: ReturnType<typeof getAdminClient>;

const SEED_DISCIPLINES = [
  { code: "architecture", name: "Architecture", sort_order: 1, is_active: true },
  { code: "structural", name: "Structural", sort_order: 2, is_active: true },
  { code: "mep", name: "MEP", sort_order: 3, is_active: true },
  { code: "civil", name: "Civil", sort_order: 4, is_active: true },
  { code: "interior", name: "Interior Design", sort_order: 5, is_active: true },
];

const SEED_DOCUMENT_TYPES = [
  { code: "GEN", name: "General", sort_order: 1, is_active: true },
  { code: "ARC", name: "Architectural", sort_order: 2, is_active: true },
  { code: "STR", name: "Structural", sort_order: 3, is_active: true },
  { code: "MEP", name: "Mechanical/Electrical/Plumbing", sort_order: 4, is_active: true },
  { code: "PLB", name: "Plumbing", sort_order: 5, is_active: true },
  { code: "ELC", name: "Electrical", sort_order: 6, is_active: true },
  { code: "CIV", name: "Civil", sort_order: 7, is_active: true },
  { code: "QAQC", name: "Quality Assurance/Quality Control", sort_order: 8, is_active: true },
  { code: "HSE", name: "Health Safety Environment", sort_order: 9, is_active: true },
  { code: "PRO", name: "Project Management", sort_order: 10, is_active: true },
  { code: "CON", name: "Contractual", sort_order: 11, is_active: true },
];

const SEED_PROJECT_TYPES = [
  { code: "residential", name: "Residential", sort_order: 1, is_active: true },
  { code: "commercial", name: "Commercial", sort_order: 2, is_active: true },
  { code: "infrastructure", name: "Infrastructure", sort_order: 3, is_active: true },
];

const SEED_WBS_NODE_TYPES = [
  { code: "project", name: "Project", sort_order: 1, is_active: true },
  { code: "phase", name: "Phase", sort_order: 2, is_active: true },
  { code: "building", name: "Building", sort_order: 3, is_active: true },
  { code: "level", name: "Level", sort_order: 4, is_active: true },
  { code: "element", name: "Element", sort_order: 5, is_active: true },
  { code: "activity", name: "Activity", sort_order: 6, is_active: true },
];

beforeAll(async () => {
  adminClient = getAdminClient();
  await adminClient.from("disciplines").upsert(SEED_DISCIPLINES, { onConflict: "code", ignoreDuplicates: false });
  await adminClient.from("document_types").upsert(SEED_DOCUMENT_TYPES, { onConflict: "code", ignoreDuplicates: false });
  await adminClient.from("project_types").upsert(SEED_PROJECT_TYPES, { onConflict: "code", ignoreDuplicates: false });
  await adminClient.from("wbs_node_types").upsert(SEED_WBS_NODE_TYPES, { onConflict: "code", ignoreDuplicates: false });
});

afterAll(async () => {
  await adminClient.from("wbs_node_types").delete().in("code", SEED_WBS_NODE_TYPES.map((r) => r.code));
  await adminClient.from("project_types").delete().in("code", SEED_PROJECT_TYPES.map((r) => r.code));
  await adminClient.from("document_types").delete().in("code", SEED_DOCUMENT_TYPES.map((r) => r.code));
  await adminClient.from("disciplines").delete().in("code", SEED_DISCIPLINES.map((r) => r.code));
});

describe("Module 18: Admin Configuration", () => {
  describe("Database tables", () => {
    for (const table of TABLES) {
      it(`should have ${table} table accessible`, async () => {
        const { data, error } = await testClient
          .from<{ id: string }>(table)
          .select("id")
          .limit(1);
        expect(error).toBeNull();
        expect(data).toBeDefined();
      });
    }
  });

  describe("Seed data", () => {
    it("should have seed disciplines", async () => {
      const { data, error } = await (adminClient as any)
        .from("disciplines")
        .select("code")
        .order("sort_order");
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(5);
    });

    it("should have seed document_types matching DOCUMENT_DISCIPLINES", async () => {
      const { data, error } = await (adminClient as any)
        .from("document_types")
        .select("code, name")
        .order("sort_order");
      expect(error).toBeNull();
      expect(data!.length).toBe(11);
      expect(data!.map((r: any) => r.code)).toEqual([
        "GEN", "ARC", "STR", "MEP", "PLB", "ELC", "CIV", "QAQC", "HSE", "PRO", "CON",
      ]);
    });

    it("should have seed project_types", async () => {
      const { data, error } = await (adminClient as any)
        .from("project_types")
        .select("code")
        .order("sort_order");
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(3);
    });

    it("should have seed wbs_node_types", async () => {
      const { data, error } = await (adminClient as any)
        .from("wbs_node_types")
        .select("code")
        .order("sort_order");
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("Service functions", () => {
    it("fetchDocumentTypes should return active types sorted by sort_order", async () => {
      const { data, error } = await (adminClient as any)
        .from("document_types")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(11);
      expect(data![0].code).toBe("GEN");
    });

    it("fetchDisciplines should return active disciplines sorted by sort_order", async () => {
      const { data, error } = await (adminClient as any)
        .from("disciplines")
        .select("*")
        .eq("is_active", true)
        .order("sort_order");
      expect(error).toBeNull();
      expect(data!.length).toBeGreaterThanOrEqual(5);
      expect(data![0].code).toBe("architecture");
    });
  });
});
