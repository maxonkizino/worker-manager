import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";
import { components } from "@/shared/api/schema/generated";

interface UseUnsubscribeFromTaskOptions {
  taskId: string;
}

export function useUnsubscribeFromTask() {
  const queryClient = useQueryClient();
  return useMutation<components["schemas"]["TaskResponse"], Error, UseUnsubscribeFromTaskOptions>({
    mutationFn: async ({ taskId }) => {
      const { data, error } = await fetchClient.PATCH("/v1/me/tasks/{id}/unsubscribe", {
        params: { path: { id: taskId } },
      });
      if (error) {
        throw new Error("Failed to unsubscribe from task");
      }
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}
