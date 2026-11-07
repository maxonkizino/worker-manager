import { useState } from "react";
import { useBoardsList } from "./model/task/use-boards-list";

import {
  BoardsLayoutContentGroups,
  BoardsListLayout,
  BoardsListLayoutCards,
  BoardsListLayoutContent,
  BoardsListLayoutHeader,
  BoardsListLayoutList,
} from "./ui/task/boards-list-layout";
import { ViewMode, ViewModeToggle } from "./ui/view-mode-toggle";

import { useRecentGroups } from "./model/task/use-recent-groups";

import { BoardCard } from "./compose/board-card";
import { BoardItem } from "./compose/board-item";
import { BoardsSidebar } from "./ui/task/boards-sidebar";

function BoardsListPage() {
  const boardsQuery = useBoardsList({
    sort: "lastOpenedAt",
  });

  const [viewMode, setViewMode] = useState<ViewMode>("list");

  const recentGroups = useRecentGroups(boardsQuery.boards);

  return (
    <BoardsListLayout
      sidebar={<BoardsSidebar />}
      header={
        <BoardsListLayoutHeader
          title="Последние доски"
          description="Здесь вы можете просматривать и управлять своими последними досками"
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
      >
        <BoardsLayoutContentGroups
          groups={recentGroups.map((group) => ({
            items: {
              list: (
                <BoardsListLayoutList>
                  {group.items.map((board) => (
                    <BoardItem key={board.id} board={board} />
                  ))}
                </BoardsListLayoutList>
              ),
              cards: (
                <BoardsListLayoutCards>
                  {group.items.map((board) => (
                    <BoardCard key={board.id} board={board} />
                  ))}
                </BoardsListLayoutCards>
              ),
            }[viewMode],
            title: group.title,
          }))}
        />
      </BoardsListLayoutContent>
    </BoardsListLayout>
  );
}

export const Component = BoardsListPage;
