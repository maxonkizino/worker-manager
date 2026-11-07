import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";

export function useDeleteBoard() {
  const queryClient = useQueryClient();
  const deleteBoardMutation = rqClient.useMutation(
    "delete",
    "/boards/{boardId}",
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        );
      },
    },
  );

  return {
    deleteBoard: (boardId: string) =>
      deleteBoardMutation.mutate({
        params: { path: { boardId } },
      }),
    getIsPending: (boardId: string) =>
      deleteBoardMutation.isPending &&
      deleteBoardMutation.variables?.params?.path?.boardId === boardId,
  };
}
