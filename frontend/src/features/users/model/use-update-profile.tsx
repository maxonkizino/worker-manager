import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
//import { ApiSchemas } from "@/shared/api/schema";

export function useUpdateProfile(onSuccess?: () => void, onError?: (error: Error) => void) {
  const queryClient = useQueryClient();

  const mutation = rqClient.useMutation("put", "/me/profile", {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["get", "/me/profile"] });
      onSuccess?.();
    },
    onError: (error) => {
      onError?.(new Error(error.message));
    },
  });

  return mutation;
}
