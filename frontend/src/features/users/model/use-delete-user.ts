import { useQueryClient } from "@tanstack/react-query";
import { rqClient } from "@/shared/api/instance";

export function useDeleteUser(onSuccess?: () => void, onError?: (error: Error) => void) {
    const queryClient = useQueryClient();

    const deleteMutation = rqClient.useMutation("delete", "/users/{id}", {
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["get", "/users"] });
            onSuccess?.();
        },
        onError: (error) => {
            onError?.(new Error(error.message));
        },
    });

    const deleteUser = (userId: string) => {
        // ✅ ПРАВИЛЬНО - используем params вместо path
        deleteMutation.mutate({
            params: {
                path: { id: userId }
            }
        });
    };

    return {
        deleteUser,
        isPending: deleteMutation.isPending,
        errorMessage: deleteMutation.error?.message,
    };
}