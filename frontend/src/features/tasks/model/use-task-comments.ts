import { keepPreviousData } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useTaskComments(taskId?: string, page: number = 0, size: number = 10) {
  return rqClient.useQuery("get", "/comments/task/{taskId}", {
    params: {
      path: {
        taskId: taskId!,
      },
      query: {
        page,
        size,
      },
    },
  }, {
    enabled: !!taskId,
    placeholderData: keepPreviousData,
  });
}

