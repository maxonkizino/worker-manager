import { keepPreviousData } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useTask(taskId?: string) {
  return rqClient.useQuery("get", "/tasks/{id}", {
    params: {
      path: {
        id: taskId!,
      },
    },
  }, {
    enabled: !!taskId,
    placeholderData: keepPreviousData,
  });
}
