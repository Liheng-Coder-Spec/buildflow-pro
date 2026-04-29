import { useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { NotificationRow, NotificationType } from "@/lib/notificationMeta";

const TASK_APPROVAL_TYPES: NotificationType[] = ["task_submitted_for_approval"];
const TIMESHEET_APPROVAL_TYPES: NotificationType[] = [
  "timesheet_submitted",
  "timesheet_flagged",
];

/**
 * Aggregates unread "approval inbox" notifications for the current user.
 *
 * Reads from the same React Query cache populated by `useNotifications`
 * (which owns the realtime subscription) — does NOT open its own channel.
 */
export function useApprovalUnread() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications", user?.id, 50],
    enabled: !!user?.id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      if (error) throw error;
      return (data ?? []) as NotificationRow[];
    },
  });

  const taskApprovalUnread = useMemo(
    () =>
      (notifications as NotificationRow[]).filter(
        (n) => !n.read_at && TASK_APPROVAL_TYPES.includes(n.type),
      ),
    [notifications],
  );

  const timesheetApprovalUnread = useMemo(
    () =>
      (notifications as NotificationRow[]).filter(
        (n) => !n.read_at && TIMESHEET_APPROVAL_TYPES.includes(n.type),
      ),
    [notifications],
  );

  const taskApprovalCount = taskApprovalUnread.length;
  const timesheetApprovalCount = timesheetApprovalUnread.length;
  const totalApprovalUnread = taskApprovalCount + timesheetApprovalCount;

  async function markIdsRead(ids: string[]) {
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

  async function markTaskApprovalsRead() {
    await markIdsRead(taskApprovalUnread.map((n) => n.id));
  }

  async function markTimesheetApprovalsRead() {
    await markIdsRead(timesheetApprovalUnread.map((n) => n.id));
  }

  async function markAllApprovalsRead() {
    await markIdsRead([
      ...taskApprovalUnread.map((n) => n.id),
      ...timesheetApprovalUnread.map((n) => n.id),
    ]);
  }

  return {
    taskApprovalCount,
    timesheetApprovalCount,
    totalApprovalUnread,
    markTaskApprovalsRead,
    markTimesheetApprovalsRead,
    markAllApprovalsRead,
  };
}
