import { useEffect, useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import useSEO from "@/hooks/useSEO";
import { Bell, Check } from "lucide-react";

const typeColor: Record<string, string> = {
  new_request: "bg-cat-blue text-cat-blue-fg",
  approved: "bg-cat-green text-cat-green-fg",
  rejected: "bg-cat-red text-cat-red-fg",
  withdrawn: "bg-cat-gray text-cat-gray-fg",
  cancellation_requested: "bg-cat-amber text-cat-amber-fg",
  cancellation_approved: "bg-cat-green text-cat-green-fg",
  cancellation_denied: "bg-cat-red text-cat-red-fg",
};

const TABLE = "eleave_notifications";

export default function EleaveNotifications() {
  useSEO({ title: "E-Leave notifications" });
  const { user } = useAuth();
  const sb = supabase as any;
  const [items, setItems] = useState<any[]>([]);

  const load = useCallback(() => {
    if (!user) return;
    sb.from(TABLE).select("*").eq("user_id", user.id).order("created_at", { ascending: false }).then(({ data }: any) => setItems(data ?? []));
  }, [user]);
  useEffect(() => { load(); }, [load]);

  const markRead = async (id: string) => { await sb.from(TABLE).update({ read: true }).eq("id", id); load(); };
  const markAll = async () => { await sb.from(TABLE).update({ read: true }).eq("user_id", user!.id).eq("read", false); load(); };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">E-Leave notifications</h1>
        <Button variant="outline" size="sm" onClick={markAll}><Check className="h-4 w-4 mr-1" />Mark all read</Button>
      </div>
      {items.length === 0 ? <Card className="p-8 text-center text-muted-foreground"><Bell className="mx-auto h-6 w-6 mb-2" />No notifications.</Card> : (
        <div className="space-y-2">
          {items.map((n) => (
            <Card key={n.id} className={`p-4 ${n.read ? "" : "border-primary/40 bg-primary/5"}`}>
              <div className="flex items-start gap-3">
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${typeColor[n.type] ?? "bg-cat-gray text-cat-gray-fg"}`}>{n.type.replace(/_/g, " ")}</span>
                <div className="flex-1">
                  <div className="text-sm font-medium">{n.title}</div>
                  <div className="text-sm text-muted-foreground">{n.body}</div>
                  <div className="text-xs text-muted-foreground mt-1">{new Date(n.created_at).toLocaleString()}</div>
                </div>
                {!n.read && <Button size="sm" variant="ghost" onClick={() => markRead(n.id)}>Mark read</Button>}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
