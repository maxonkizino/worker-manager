import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import type { components } from "@/shared/api/schema/generated";

type UpdateCommentRequest = components["schemas"]["UpdateCommentRequest"];

export function useUpdateComment(taskId: string, commentId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("put", "/comments/task/{taskId}/{commentId}", {
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

  const updateComment = (data: UpdateCommentRequest) => {
    mutation.mutate({
      params: {
        path: { taskId, commentId },
      },
      body: data,
    });
  };

  return {
    updateComment,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.error?.message,
  };
}

