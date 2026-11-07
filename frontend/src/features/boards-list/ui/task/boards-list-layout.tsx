import { Skeleton } from "@/shared/ui/kit/skeleton";
import React from "react";
import { ViewMode } from "../view-mode-toggle";

export function BoardsListLayout({
  header,
  filters,
  children,
  sidebar,
}: {
  header: React.ReactNode;
  filters?: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="flex gap-4">
        {sidebar}
        <div className="flex-1  p-4 flex flex-col gap-6">
          {header}
          {filters}
          {children}
        </div>
      </div>
    </div>
  );
}

export function BoardsListLayoutHeader({
  title,
  description,
  actions,
}: {
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-2xl font-bold">{title}</h1>
        {description && <p className="text-gray-500">{description}</p>}
      </div>

      <div className="flex gap-2">{actions}</div>
    </div>
  );
}

export function BoardsListLayoutFilters({
  sort,
  filters,
  actions,
}: {
  sort?: React.ReactNode;
  filters?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4">
      {filters && (
        <div className="flex items-center gap-2">
          <div className="text-sm text-gray-500 whitespace-nowrap">
            Filter by
          </div>
          {filters}
        </div>
      )}
      {sort && (
        <div className="flex items-center gap-2 ">
          <div className="text-sm text-gray-500 whitespace-nowrap">Sort by</div>
          {sort}
        </div>
      )}
      {actions && <div className="ml-auto">{actions}</div>}
    </div>
  );
}

export function BoardsListLayoutContent({
  children,
  cursorRef,
  hasCursor,
  isEmpty,
  isPending,
  isPendingNext,
  mode,
  renderList,
  renderGrid,
}: {
  children?: React.ReactNode;
  isEmpty?: boolean;
  isPending?: boolean;
  isPendingNext?: boolean;
  cursorRef?: React.Ref<HTMLDivElement>;
  hasCursor?: boolean;
  mode: ViewMode;
  renderList?: () => React.ReactNode;
  renderGrid?: () => React.ReactNode;
}) {
  return (
    <div>
      {isPending && <div className="text-center py-10">Загрузка...</div>}
      {mode === "list" && renderList && (
        <BoardsListLayoutList>{renderList?.()}</BoardsListLayoutList>
      )}
      {mode === "grid" && renderGrid && (
        <BoardsListLayoutCards>{renderGrid?.()}</BoardsListLayoutCards>
      )}
      {!isPending && children}

      {isEmpty && !isPending && (
        <div className="text-center py-10">Доски не найдены</div>
      )}

      {hasCursor && (
        <div ref={cursorRef} className="text-center py-8">
          {isPendingNext &&
            {
              list: (
                <div className="flex flex-col gap-2">
                  <Skeleton className="h-10 w-full" />
                  <Skeleton className="h-10 w-full" />
                </div>
              ),
              grid: (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                  <Skeleton className="h-40 w-full" />
                </div>
              ),
            }[mode]}
        </div>
      )}
    </div>
  );
}

export function BoardsListLayoutCards({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {children}
    </div>
  );
}

export function BoardsListLayoutList({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export function BoardsLayoutContentGroups({
  groups,
}: {
  groups: {
    title: string;
    items: React.ReactNode;
  }[];
}) {
  return (
    <div className="flex flex-col gap-2">
      {groups.map((group) => (
        <div key={group.title}>
          <div className="text-lg font-bold mb-2">{group.title}</div>
          {group.items}
        </div>
      ))}
    </div>
  );
}
