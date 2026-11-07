import { useQueryClient } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useDeleteTask(onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const deleteMutation = rqClient.useMutation("delete", "/tasks/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const deleteTask = (taskId: string) => {
    deleteMutation.mutate({
      params: {
        path: { id: taskId }
      }
    });
  };

  return {
    deleteTask,
    isPending: deleteMutation.isPending,
    errorMessage: deleteMutation.error?.message,
  };
}
