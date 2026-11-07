import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateTaskRequest } from "@/shared/api/schema/generated";

export function useUpdateTask(taskId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("put", "/tasks/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks", { id: taskId }] });
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const updateTask = (data: UpdateTaskRequest) => {
    mutation.mutate({
      params: {
        path: { id: taskId },
      },
      body: data,
    });
  };

  return {
    updateTask,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
