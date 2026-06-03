import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSEO } from "@/hooks/useSEO";

export default function AdminYearEnd() {
  useSEO({ title: "Year-end run — Admin" });
  const now = new Date().getFullYear();
  const [from_year, setFrom] = useState(String(now));
  const [to_year, setTo] = useState(String(now + 1));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<any>(null);

  const run = async () => {
    if (!confirm("Run the year-end batch? This will carry forward, expire, and create next-year balances.")) return;
    setBusy(true);
    const { data, error } = await supabase.functions.invoke("year-end-run", { body: { from_year: Number(from_year), to_year: Number(to_year) } });
    setBusy(false);
    if (error) return toast.error(error.message);
    if ((data as any)?.error) return toast.error((data as any).error);
    setResult(data);
    toast.success("Year-end completed.");
  };

  return (
    <div className="max-w-xl space-y-4">
      <h1 className="text-2xl font-semibold tracking-tight">Year-end run</h1>
      <Card className="p-6 space-y-4">
        <p className="text-sm text-muted-foreground">Calculates remaining balances, carries forward up to each leave type's max, expires the rest, then creates next-year balances and writes an audit entry.</p>
        <div className="grid grid-cols-2 gap-3">
          <div><Label>From year</Label><Input type="number" value={from_year} onChange={(e) => setFrom(e.target.value)} /></div>
          <div><Label>To year</Label><Input type="number" value={to_year} onChange={(e) => setTo(e.target.value)} /></div>
        </div>
        <Button disabled={busy} onClick={run}>{busy ? "Running…" : "Run year-end"}</Button>
        {result && (
          <Card className="p-4 bg-cat-green/40 border-cat-green text-sm">
            <div>Carried over: <b>{result.carried}</b> day(s)</div>
            <div>Expired: <b>{result.expired}</b> day(s)</div>
            <div>Balances created/updated: <b>{result.created}</b></div>
          </Card>
        )}
      </Card>
    </div>
  );
}
