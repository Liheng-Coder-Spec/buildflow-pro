import { supabase } from "@/integrations/supabase/client";

export async function invokeXlsxDownload(
  fnName: string,
  body: Record<string, unknown>,
  filename: string,
): Promise<void> {
  const { data, error } = await supabase.functions.invoke(fnName, { body });
  if (error) throw error;
  const file = (data as { file?: string })?.file;
  if (!file) throw new Error("Empty response from server");
  const bin = atob(file);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  const blob = new Blob([bytes], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
