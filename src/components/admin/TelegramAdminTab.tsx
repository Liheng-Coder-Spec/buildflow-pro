import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Loader2, Clock } from "lucide-react";
import { toast } from "sonner";
import {
  getTelegramAdminConfig,
  updateTelegramAdminConfig,
  type TelegramAdminConfig,
} from "@/services/telegramAdminConfigService";

function toTimeInput(v: string): string {
  // convert "HH:MM:SS" to "HH:MM"
  return v.slice(0, 5);
}

function toDbTime(v: string): string {
  // convert "HH:MM" to "HH:MM:00"
  if (!v || !v.match(/^\d{2}:\d{2}$/)) return "00:00:00";
  return `${v}:00`;
}

export function TelegramAdminTab() {
  const [loading, setLoading] = React.useState(true);
  const [morningDefault, setMorningDefault] = React.useState("08:00");
  const [eveningDefault, setEveningDefault] = React.useState("18:00");
  const [saving, setSaving] = React.useState(false);
  const [initialState, setInitialState] = React.useState("");

  const currentState = JSON.stringify({ morningDefault, eveningDefault });
  const dirty = currentState !== initialState;

  const load = React.useCallback(async () => {
    setLoading(true);
    try {
      const config = await getTelegramAdminConfig();
      const mT = toTimeInput(config.morning_default);
      const eT = toTimeInput(config.evening_default);
      setMorningDefault(mT);
      setEveningDefault(eT);
      setInitialState(JSON.stringify({ morningDefault: mT, eveningDefault: eT }));
    } catch (e: any) {
      toast.error(e.message ?? "Failed to load config");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    load();
  }, [load]);

  const onSave = async () => {
    setSaving(true);
    try {
      await updateTelegramAdminConfig({
        morning_default: toDbTime(morningDefault),
        evening_default: toDbTime(eveningDefault),
      });
      toast.success("Telegram defaults updated");
      setInitialState(currentState);
    } catch (e: any) {
      toast.error(e.message ?? "Failed to save config");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Default Brief Times
        </CardTitle>
        <CardDescription>
          Set system-wide default times for morning and evening Telegram briefs. Users can override these in their personal settings.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Morning default */}
        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="morning-default" className="text-sm font-medium">
              Morning Brief Default
            </Label>
            <p className="text-xs text-muted-foreground">
              Morning Brief (Due Today) is sent to all linked members at this time. Sundays are skipped.
            </p>
          </div>
          <input
            id="morning-default"
            type="time"
            step={900}
            value={morningDefault}
            onChange={(e) => setMorningDefault(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>

        {/* Evening default */}
        <div className="flex items-center justify-between gap-3 rounded-md border p-3">
          <div className="space-y-0.5">
            <Label htmlFor="evening-default" className="text-sm font-medium">
              Evening Brief Default
            </Label>
            <p className="text-xs text-muted-foreground">
              Users will see this as their default time when configuring preferences
            </p>
          </div>
          <input
            id="evening-default"
            type="time"
            step={900}
            value={eveningDefault}
            onChange={(e) => setEveningDefault(e.target.value)}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
          />
        </div>

        <div className="flex justify-end pt-2">
          <Button onClick={onSave} disabled={!dirty || saving} className="gap-2">
            {saving && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
            Save defaults
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
