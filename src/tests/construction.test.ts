import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { supabase } from "@/integrations/supabase/client";
import { getAdminClient, seedProject, seedAuthUser, cleanupSeedData } from "@/test/setupHelpers";

let adminClient: ReturnType<typeof getAdminClient>;
let TEST_PROJECT_ID: string;
let TEST_USER_ID: string;

beforeAll(async () => {
  adminClient = getAdminClient();
  TEST_PROJECT_ID = await seedProject();
  TEST_USER_ID = await seedAuthUser();
});

afterAll(async () => {
  await cleanupSeedData();
});

describe("Construction Module - Task Status Flow (Module 14.3)", () => {
  let taskId: string;

  async function createTask() {
    const { data, error } = await adminClient
      .from("construction_tasks")
      .insert({
        project_id: TEST_PROJECT_ID,
        task_code: `TEST-${Date.now()}`,
        title: "Test Construction Task",
        status: "open",
        priority: "medium",
        created_by: TEST_USER_ID,
      })
      .select()
      .single();
    if (error) throw error;
    return data.id;
  }

  it("should create task with default status 'open'", async () => {
    taskId = await createTask();
    const { data, error } = await adminClient
      .from("construction_tasks")
      .select("status")
      .eq("id", taskId)
      .single();
    expect(error).toBeNull();
    expect(data?.status).toBe("open");
    await adminClient.from("construction_tasks").delete().eq("id", taskId);
  });

  it("should transition from open → assigned → in_progress → completed", async () => {
    taskId = await createTask();

    let { error } = await adminClient
      .from("construction_tasks")
      .update({ status: "assigned", assigned_to: TEST_USER_ID })
      .eq("id", taskId);
    expect(error).toBeNull();

    ({ error } = await adminClient
      .from("construction_tasks")
      .update({ status: "in_progress", actual_start: new Date().toISOString() })
      .eq("id", taskId));
    expect(error).toBeNull();

    ({ error } = await adminClient
      .from("construction_tasks")
      .update({ status: "completed", progress_pct: 100 })
      .eq("id", taskId));
    expect(error).toBeNull();

    const { data } = await adminClient
      .from("construction_tasks")
      .select("status")
      .eq("id", taskId)
      .single();
    expect(data?.status).toBe("completed");
    await adminClient.from("construction_tasks").delete().eq("id", taskId);
  });

  it("should not allow submit for approval with progress < 100%", async () => {
    taskId = await createTask();
    const { error } = await adminClient
      .from("construction_tasks")
      .update({ status: "submitted_for_approval", progress_pct: 50 })
      .eq("id", taskId);
    expect(error).not.toBeNull();
    await adminClient.from("construction_tasks").delete().eq("id", taskId);
  });

  it("should allow submit for approval with progress = 100%", async () => {
    taskId = await createTask();
    await adminClient
      .from("construction_tasks")
      .update({ status: "in_progress", assigned_to: TEST_USER_ID, actual_start: new Date().toISOString() })
      .eq("id", taskId);
    const { error } = await adminClient
      .from("construction_tasks")
      .update({ status: "submitted_for_approval", progress_pct: 100 })
      .eq("id", taskId);
    expect(error).toBeNull();
    await adminClient.from("construction_tasks").delete().eq("id", taskId);
  });
});

describe("Construction Module - WBS Progress Roll-up (Module 8.4, 8.6)", () => {
  it("should create WBS node and link construction task", async () => {
    const { data: wbsNode, error: wbsError } = await adminClient
      .from("wbs_nodes")
      .insert({
        project_id: TEST_PROJECT_ID,
        node_type: "element",
        code: "TEST-E001",
        name: "Test Element",
        path: ["P001", "B01", "L01", "TEST-E001"],
        path_text: "P001-B01-L01-TEST-E001",
        depth: 3,
      })
      .select()
      .single();
    expect(wbsError).toBeNull();
    expect(wbsNode).not.toBeNull();

    const { data: task, error: taskError } = await adminClient
      .from("construction_tasks")
      .insert({
        project_id: TEST_PROJECT_ID,
        wbs_node_id: wbsNode!.id,
        task_code: `TEST-ROLLUP-${Date.now()}`,
        title: "Rollup Test Task",
        status: "in_progress",
        progress_pct: 50,
        created_by: TEST_USER_ID,
      })
      .select()
      .single();
    expect(taskError).toBeNull();
    expect(task?.wbs_node_id).toBe(wbsNode!.id);

    await adminClient.from("construction_tasks").delete().eq("id", task!.id);
    await adminClient.from("wbs_nodes").delete().eq("id", wbsNode!.id);
  });
});

describe("Construction Module - Site Issues (Module 14.2)", () => {
  it("should create site issue with correct severity", async () => {
    const { data, error } = await adminClient
      .from("site_issue_logs")
      .insert({
        project_id: TEST_PROJECT_ID,
        issue_number: `ISS-TEST-${Date.now()}`,
        title: "Test Site Issue",
        description: "Test issue description",
        severity: "high",
        status: "open",
        reported_by: TEST_USER_ID,
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data?.severity).toBe("high");
    expect(data?.status).toBe("open");
    await adminClient.from("site_issue_logs").delete().eq("id", data!.id);
  });
});

describe("Construction Module - Concrete Pour Records (Module 14.2)", () => {
  it("should create concrete pour record", async () => {
    const { data, error } = await adminClient
      .from("concrete_pour_records")
      .insert({
        project_id: TEST_PROJECT_ID,
        pour_number: `POUR-TEST-${Date.now()}`,
        pour_date: new Date().toISOString().split("T")[0],
        concrete_grade: "C30",
        quantity_m3: 50.5,
        created_by: TEST_USER_ID,
      })
      .select()
      .single();
    expect(error).toBeNull();
    expect(data?.concrete_grade).toBe("C30");
    expect(data?.quantity_m3).toBe(50.5);
    await adminClient.from("concrete_pour_records").delete().eq("id", data!.id);
  });
});
