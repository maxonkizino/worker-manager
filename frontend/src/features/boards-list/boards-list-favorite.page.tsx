import { useState } from "react";
import { useBoardsList } from "./model/task/use-boards-list";

import {
  BoardsListLayout,
  BoardsListLayoutContent,
  BoardsListLayoutHeader,
} from "./ui/task/boards-list-layout";
import { ViewMode, ViewModeToggle } from "./ui/view-mode-toggle";

import { BoardItem } from "./compose/board-item";
import { BoardCard } from "./compose/board-card";
import { BoardsSidebar } from "./ui/task/boards-sidebar";

function BoardsListPage() {
  const boardsQuery = useBoardsList({
    isFavorite: true,
  });

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  return (
    <BoardsListLayout
      sidebar={<BoardsSidebar />}
      header={
        <BoardsListLayoutHeader
          title="Избранные доски"
          description="Здесь вы можете просматривать и управлять своими избранными досками"
          actions={
            <ViewModeToggle
              value={viewMode}
              onChange={(value) => setViewMode(value)}
            />
          }
        />
      }
    >
      <BoardsListLayoutContent
        isEmpty={boardsQuery.boards.length === 0}
        isPending={boardsQuery.isPending}
        isPendingNext={boardsQuery.isFetchingNextPage}
        cursorRef={boardsQuery.cursorRef}
        hasCursor={boardsQuery.hasNextPage}
        mode={viewMode}
        renderList={() =>
          boardsQuery.boards.map((board) => (
            <BoardItem key={board.id} board={board} />
          ))
        }
        renderGrid={() =>
          boardsQuery.boards.map((board) => (
            <BoardCard key={board.id} board={board} />
          ))
        }
      />
    </BoardsListLayout>
  );
}

export const Component = BoardsListPage;
