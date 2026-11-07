import { useQueryClient } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useSubscribeTask(onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const subscribeMutation = rqClient.useMutation("patch", "/me/tasks/{id}/subscribe", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/me/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const unsubscribeMutation = rqClient.useMutation("patch", "/me/tasks/{id}/unsubscribe", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/tasks"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/me/tasks"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  const subscribe = (taskId: string) => {
    subscribeMutation.mutate({
      params: {
        path: { id: taskId },
      },
    });
  };

  const unsubscribe = (taskId: string) => {
    unsubscribeMutation.mutate({
      params: {
        path: { id: taskId },
      },
    });
  };

  return {
    subscribe,
    unsubscribe,
    isPending: subscribeMutation.isPending || unsubscribeMutation.isPending,
    errorMessage: subscribeMutation.error?.message || unsubscribeMutation.error?.message,
  };
}

