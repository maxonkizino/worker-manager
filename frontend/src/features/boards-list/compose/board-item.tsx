import { ApiSchemas } from "@/shared/api/schema";
import { BoardsFavoriteToggle } from "../ui/task/boards-favorite-toggle";
import { BoardsListItem } from "../ui/task/boards-list-item";
import { DropdownMenuItem } from "@/shared/ui/kit/dropdown-menu";
import { useDeleteBoard } from "../model/task/use-delete-board";
import { useUpdateFavorite } from "../model/task/use-update-favorite";
import { useIsAdmin } from "@/shared/model/session"; // Import useIsAdmin hook

export function BoardItem({ board }: { board: ApiSchemas["Board"] }) {
  const deleteBoard = useDeleteBoard();
  const updateFavorite = useUpdateFavorite();
  const isAdmin = useIsAdmin(); // Get admin status

  return (
    <BoardsListItem
      key={board.id}
      board={board}
      rightActions={
        <BoardsFavoriteToggle
          isFavorite={updateFavorite.isOptimisticFavorite(board)}
          onToggle={() => updateFavorite.toggle(board)}
        />
      }
      menuActions={
        isAdmin ? (
          <DropdownMenuItem
            variant="destructive"
            disabled={deleteBoard.getIsPending(board.id)}
            onClick={() => deleteBoard.deleteBoard(board.id)}
          >
            Удалить
          </DropdownMenuItem>
        ) : null
      }
    />
  );
}
