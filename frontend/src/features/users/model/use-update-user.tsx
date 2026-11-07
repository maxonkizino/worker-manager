
import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";

export function useUpdateUser(userId: string, onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("put", "/users/{id}", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/users", { id: userId }] });
      queryClient.invalidateQueries({ queryKey: ["get", "/users"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  return mutation;
}

