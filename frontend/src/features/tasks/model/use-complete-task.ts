import { useQueryClient } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useCompleteTask(onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const completeMutation = rqClient.useMutation("patch", "/tasks/{id}/complete", {
    onSuccess: (_, variables) => {
      const taskId = variables.params.path.id;
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks", { id: taskId }] });
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks/assignee"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/me/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const completeTask = (taskId: string) => {
    completeMutation.mutate({
      params: {
        path: { id: taskId }
      }
    });
  };

  return {
    completeTask,
    isPending: completeMutation.isPending,
    errorMessage: completeMutation.error?.message,
  };
}

