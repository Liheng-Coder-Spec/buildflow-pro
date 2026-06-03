// E-Leave year-end batch: carry forward up to max, expire excess, create next-year balances.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const ANON = Deno.env.get("SUPABASE_ANON_KEY")!;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  const auth = req.headers.get("Authorization") || "";
  const token = auth.replace("Bearer ", "");
  const userClient = createClient(SUPABASE_URL, ANON, { global: { headers: { Authorization: `Bearer ${token}` } } });
  const { data: u } = await userClient.auth.getUser();
  if (!u.user) return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: corsHeaders });
  const db = createClient(SUPABASE_URL, SERVICE_ROLE, { auth: { persistSession: false } });
  const { data: roles } = await db.from("user_roles").select("role").eq("user_id", u.user.id);
  if (!roles?.some((r: any) => r.role === "admin")) {
    return new Response(JSON.stringify({ error: "forbidden" }), { status: 403, headers: corsHeaders });
  }

  const { from_year, to_year } = await req.json();
  const { data: balances } = await db.from("eleave_leave_balances")
    .select("*, eleave_leave_types(*)").eq("year", from_year);
  let carried = 0, expired = 0, created = 0;

  for (const b of balances ?? []) {
    const lt = (b as any).eleave_leave_types;
    const remaining = Number(b.carried_over) + Number(b.yearly_allowance) + Number(b.adjustments) - Number(b.used) - Number(b.expired);
    const carry = Math.min(Math.max(remaining, 0), Number(lt.carry_forward_max ?? 0));
    const exp = Math.max(remaining - carry, 0);
    if (exp > 0) {
      await db.from("eleave_leave_balances").update({ expired: Number(b.expired) + exp }).eq("id", b.id);
      expired += exp;
    }
    await db.from("eleave_leave_balances").upsert(
      { user_id: b.user_id, leave_type_id: b.leave_type_id, year: to_year, yearly_allowance: Number(lt.days_per_year ?? 0), carried_over: carry },
      { onConflict: "user_id,leave_type_id,year" },
    );
    if (carry > 0) carried += carry;
    created++;
  }
  await db.from("eleave_audit_log").insert({
    actor_id: u.user.id, action: "year_end_run", entity: "year",
    details: { from_year, to_year, carried, expired, created },
  });
  return new Response(JSON.stringify({ ok: true, carried, expired, created }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
