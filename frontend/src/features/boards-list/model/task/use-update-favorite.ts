import { rqClient } from "@/shared/api/instance";
import { useQueryClient } from "@tanstack/react-query";
import { startTransition, useOptimistic } from "react";

export function useUpdateFavorite() {
  const queryClient = useQueryClient();

  const [favorite, setFavorite] = useOptimistic<Record<string, boolean>>({});

  const updateFavoriteMutation = rqClient.useMutation(
    "put",
    "/boards/{boardId}/favorite",
    {
      onSettled: async () => {
        await queryClient.invalidateQueries(
          rqClient.queryOptions("get", "/boards"),
        );
      },
    },
  );

  const toggle = (board: { id: string; isFavorite: boolean }) => {
    startTransition(async () => {
      setFavorite((prev) => ({
        ...prev,
        [board.id]: !board.isFavorite,
      }));
      await updateFavoriteMutation.mutateAsync({
        params: { path: { boardId: board.id } },
        body: { isFavorite: !board.isFavorite },
      });
    });
  };

  const isOptimisticFavorite = (board: { id: string; isFavorite: boolean }) =>
    favorite[board.id] ?? board.isFavorite;

  return {
    toggle,
    isOptimisticFavorite,
  };
}
