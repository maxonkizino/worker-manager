import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import { UpdateAssigneesRequest } from "@/shared/api/schema/generated";

export function useUpdateTaskAssignees(taskId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("patch", "/tasks/{id}/assignees", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks", { id: taskId }] });
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const updateAssignees = (data: UpdateAssigneesRequest) => {
    mutation.mutate({
      params: {
        path: { id: taskId },
      },
      body: data,
    });
  };

  return {
    updateAssignees,
    isPending: mutation.isPending,
    error: mutation.error,
  };
}
