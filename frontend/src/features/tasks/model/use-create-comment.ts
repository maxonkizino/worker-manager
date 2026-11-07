import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import type { components } from "@/shared/api/schema/generated";

type CreateCommentRequest = components["schemas"]["CreateCommentRequest"];

export function useCreateComment(taskId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("post", "/comments/task/{taskId}", {
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

  const createComment = (data: CreateCommentRequest) => {
    mutation.mutate({
      params: {
        path: { taskId },
      },
      body: data,
    });
  };

  return {
    createComment,
    isPending: mutation.isPending,
    error: mutation.error,
    errorMessage: mutation.error?.message,
  };
}

