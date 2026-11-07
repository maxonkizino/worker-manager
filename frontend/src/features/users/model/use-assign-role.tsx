import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";

export function useAssignRole(onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("put", "/auth/assign-role", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/me/profile"] });
      queryClient.invalidateQueries({ queryKey: ["get", "/users"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  return mutation;
}
