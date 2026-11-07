import { useQueryClient } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useUpdateUser() {
    const queryClient = useQueryClient();

    return rqClient.useMutation("put", "/users/{id}", {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["currentUser"] });
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}