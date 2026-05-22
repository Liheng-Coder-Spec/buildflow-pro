import { createClient, SupabaseClient } from "@supabase/supabase-js";

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhnZmd0c3hqemZiYWx6cWdvc3JuIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3OTI2MjkxOSwiZXhwIjoyMDk0ODM4OTE5fQ.CAYB_8bDGPYaQ4cEwnzEVJ49ennzBCUomSWtPmdaMSQ";

let adminClient: SupabaseClient | null = null;

export function getAdminClient(): SupabaseClient {
  if (!adminClient) {
    adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return adminClient;
}

let seededProjectId: string | null = null;
let seededUserId: string | null = null;

export async function seedProject(): Promise<string> {
  if (seededProjectId) return seededProjectId;
  const client = getAdminClient();
  const { data, error } = await client
    .from("projects")
    .insert({ name: "Test Project", code: `TEST-${Date.now()}`, status: "active" })
    .select()
    .single();
  if (error) throw error;
  seededProjectId = data.id;
  return data.id;
}

export async function seedAuthUser(): Promise<string> {
  if (seededUserId) return seededUserId;
  const client = getAdminClient();
  const { data, error } = await client.auth.admin.createUser({
    email: `test-${Date.now()}@example.com`,
    password: "test-password-123",
    email_confirm: true,
  });
  if (error) throw error;
  seededUserId = data.user.id;
  return data.user.id;
}

export async function cleanupSeedData(): Promise<void> {
  const client = getAdminClient();
  if (seededProjectId) {
    await client.from("projects").delete().eq("id", seededProjectId);
    seededProjectId = null;
  }
  if (seededUserId) {
    await client.auth.admin.deleteUser(seededUserId);
    seededUserId = null;
  }
}
