import { useQueryClient } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useCreateUser() {
    const queryClient = useQueryClient();

    return rqClient.useMutation("post", "/users", {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["users"] });
        },
    });
}