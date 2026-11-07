import { useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchClient } from "@/shared/api/instance";
import { components } from "@/shared/api/schema/generated";

interface UseSubscribeToTaskOptions {
  taskId: string;
}

export function useSubscribeToTask() {
  const queryClient = useQueryClient();
  return useMutation<components["schemas"]["TaskResponse"], Error, UseSubscribeToTaskOptions>({
    mutationFn: async ({ taskId }) => {
      const { data, error } = await fetchClient.PATCH("/v1/me/tasks/{id}/subscribe", {
        params: { path: { id: taskId } },
      });
      if (error) {
        throw new Error("Failed to subscribe to task");
      }
      return data;
    },
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] });
    },
  });
}
