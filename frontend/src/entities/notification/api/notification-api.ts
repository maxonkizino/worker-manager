import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/shared/api";
import type { NotificationItem } from "@/shared/api/types";

export const notificationKeys = {
  all: ["notifications"] as const,
};

export function useNotificationsInbox() {
  return useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => apiRequest<NotificationItem[]>("/notifications"),
  });
}
