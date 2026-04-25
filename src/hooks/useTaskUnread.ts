import { useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";
import {
  NotificationRow,
  isDirectTaskNotification,
} from "@/lib/notificationMeta";

/**
 * Aggregates unread "direct task" notifications for the current user
 * and exposes helpers for clearing them when the user opens a task.
 *
 * Counts only notifications where the current user is the direct recipient
 * of a task action (assigned-to-me, approval-requested-from-me, etc.).
 */
export function useTaskUnread() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { notifications } = useNotifications(50);

  const directUnread = useMemo(
    () =>
      (notifications as NotificationRow[]).filter(
        (n) => !n.read_at && isDirectTaskNotification(n),
      ),
    [notifications],
  );

  const totalTaskUnread = directUnread.length;

  const unreadByTaskId = useMemo(() => {
    const map = new Map<string, number>();
    for (const n of directUnread) {
      if (!n.entity_id) continue;
      map.set(n.entity_id, (map.get(n.entity_id) ?? 0) + 1);
    }
    return map;
  }, [directUnread]);

  /** Mark every unread direct-task notification for this task as read. */
  async function markTaskRead(taskId: string) {
    if (!user?.id) return;
    const ids = directUnread
      .filter((n) => n.entity_id === taskId)
      .map((n) => n.id);
    if (ids.length === 0) return;
    const { error } = await supabase
      .from("notifications")
      .update({ read_at: new Date().toISOString() })
      .in("id", ids)
      .is("read_at", null);
    if (!error) {
      qc.invalidateQueries({ queryKey: ["notifications"] });
    }
  }

  return {
    totalTaskUnread,
    unreadByTaskId,
    markTaskRead,
  };
}
