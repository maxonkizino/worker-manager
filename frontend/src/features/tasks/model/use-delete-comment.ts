import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteComment(taskId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("delete", "/comments/task/{taskId}/{commentId}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ["get", "/comments/task/{taskId}"],
        exact: false 
      });
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks", { id: taskId }] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const deleteComment = (commentId: string) => {
    mutation.mutate({
      params: {
        path: { taskId, commentId },
      },
    });
  };

  return {
    deleteComment,
    isPending: mutation.isPending,
    errorMessage: mutation.error?.message,
  };
}

