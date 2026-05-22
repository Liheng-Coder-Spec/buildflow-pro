import { supabase } from "@/integrations/supabase/client";

export interface TelegramAdminConfig {
  morning_default: string; // "HH:MM:SS"
  evening_default: string; // "HH:MM:SS"
}

export async function getTelegramAdminConfig(): Promise<TelegramAdminConfig> {
  const { data, error } = await (supabase as any)
    .from("telegram_admin_config")
    .select("morning_default, evening_default")
    .maybeSingle();
  if (error) throw error;
  return (
    data ?? {
      morning_default: "08:00:00",
      evening_default: "18:00:00",
    }
  );
}

export async function updateTelegramAdminConfig(config: {
  morning_default?: string;
  evening_default?: string;
}): Promise<void> {
  const { error } = await (supabase as any)
    .from("telegram_admin_config")
    .update({
      ...config,
      updated_at: new Date().toISOString(),
    })
    .eq(
      "id",
      "00000000-0000-0000-0000-000000000000"
    );
  if (error) throw error;
}
