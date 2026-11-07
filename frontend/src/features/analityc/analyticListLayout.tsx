import { Skeleton } from "@/shared/ui/kit/skeleton";
import React from "react";
import { ViewMode } from "../boards-list/ui/view-mode-toggle";

export function AnalyticListLayout({
  header,
  children,
  sidebar,
}: {
  header: React.ReactNode;
  children: React.ReactNode;
  sidebar?: React.ReactNode;
}) {
  return (
    <div className="container mx-auto">
      <div className="flex gap-4">
        {sidebar}
        <div className="flex-1  p-4 flex flex-col gap-6">
          {header}
          {children}
        </div>
      </div>
    </div>
  );
}

export function AnalyticListLayoutHeader({
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


export function AnalyticListLayoutContent({
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
        <AnalyticListLayoutList>{renderList?.()}</AnalyticListLayoutList>
      )}
      {mode === "grid" && renderGrid && (
        <AnalyticListLayoutCards>{renderGrid?.()}</AnalyticListLayoutCards>
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

export function AnalyticListLayoutCards({
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

export function AnalyticListLayoutList({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="flex flex-col gap-2">{children}</div>;
}

export function AnalyticLayoutContentGroups({
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
