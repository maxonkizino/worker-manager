import { keepPreviousData } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useTaskAttachments(taskId?: string) {
  return rqClient.useQuery("get", "/attachments/task/{taskId}", {
    params: {
      path: {
        taskId: taskId!,
      },
    },
  }, {
    enabled: !!taskId,
    placeholderData: keepPreviousData,
  });
}

