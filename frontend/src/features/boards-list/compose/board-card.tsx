import { ApiSchemas } from "@/shared/api/schema";
import { BoardsFavoriteToggle } from "../ui/task/boards-favorite-toggle";
import { BoardsListCard } from "../ui/task/boards-list-card";
import { Button } from "@/shared/ui/kit/button";
import { useUpdateFavorite } from "../model/task/use-update-favorite";
import { useDeleteBoard } from "../model/task/use-delete-board";

export function BoardCard({ board }: { board: ApiSchemas["Board"] }) {
  const deleteBoard = useDeleteBoard();
  const updateFavorite = useUpdateFavorite();

  return (
    <BoardsListCard
      key={board.id}
      board={board}
      rightTopActions={
        <BoardsFavoriteToggle
          isFavorite={updateFavorite.isOptimisticFavorite(board)}
          onToggle={() => updateFavorite.toggle(board)}
        />
      }
      bottomActions={
        <Button
          variant="destructive"
          disabled={deleteBoard.getIsPending(board.id)}
          onClick={() => deleteBoard.deleteBoard(board.id)}
        >
          Удалить
        </Button>
      }
    />
  );
}
