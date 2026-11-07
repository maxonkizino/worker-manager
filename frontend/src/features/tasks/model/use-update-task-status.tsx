import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateStatusRequest } from "@/shared/api/schema/generated";

export function useUpdateTaskStatus(taskId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("patch", "/tasks/{id}/status", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks", { id: taskId }] });
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const updateStatus = (data: UpdateStatusRequest) => {
    mutation.mutate({
      params: {
        path: { id: taskId },
      },
      body: data,
    });
  };

  return {
    updateStatus,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
