import { supabase } from "@/integrations/supabase/client";

export async function replacementAction(action: "submit" | "approve" | "reject", body: Record<string, unknown> = {}) {
  const { data, error } = await supabase.functions.invoke("eleave-replacement-action", { body: { action, ...body } });
  if (error) {
    let message = error.message;
    try {
      const ctx: any = (error as any).context;
      if (ctx && typeof ctx.json === "function") {
        const parsed = await ctx.json();
        if (parsed?.error) message = parsed.error;
      } else if (ctx && typeof ctx.text === "function") {
        const txt = await ctx.text();
        try { const parsed = JSON.parse(txt); if (parsed?.error) message = parsed.error; } catch { if (txt) message = txt; }
      }
    } catch { /* noop */ }
    throw new Error(message);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
}
