import { ReactNode } from "react";

interface TasksListLayoutProps {
    sidebar?: ReactNode;
    header?: ReactNode;
    filters?: ReactNode;
    children: ReactNode;
}

export function TasksListLayout({
                                    sidebar,
                                    header,
                                    filters,
                                    children,
                                }: TasksListLayoutProps) {
    return (
        <div className="flex h-screen w-full overflow-hidden">
            {sidebar && <div className="flex-shrink-0">{sidebar}</div>}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {header && <div className="p-6 border-b min-w-0 overflow-x-auto">{header}</div>}
                {filters && <div className="p-4 border-b min-w-0 overflow-x-auto">{filters}</div>}
                <div className="flex-1 p-6 overflow-auto min-w-0">{children}</div>
            </div>
        </div>
    );
}

interface TasksListLayoutHeaderProps {
    title: string;
    description: string;
    actions?: ReactNode;
}

export function TasksListLayoutHeader({
                                          title,
                                          description,
                                          actions,
                                      }: TasksListLayoutHeaderProps) {
    return (
        <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="min-w-0 flex-1">
                <h1 className="text-2xl font-bold truncate">{title}</h1>
                <p className="text-gray-600 truncate">{description}</p>
            </div>
            <div className="flex gap-2 flex-shrink-0">{actions}</div>
        </div>
    );
}

interface TasksListLayoutFiltersProps {
    sort?: ReactNode;
    filters?: ReactNode;
    actions?: ReactNode;
}

export function TasksListLayoutFilters({
                                           sort,
                                           filters,
                                           actions,
                                       }: TasksListLayoutFiltersProps) {
    return (
        <div className="flex justify-between items-center gap-4 min-w-0">
            <div className="flex gap-4 min-w-0 flex-1 overflow-x-auto">
                {sort}
                {filters}
            </div>
            <div className="flex-shrink-0">{actions}</div>
        </div>
    );
}

interface TasksListLayoutContentProps {
    isEmpty: boolean;
    isPending: boolean;
    isPendingNext: boolean;
    cursorRef: React.RefObject<HTMLDivElement | null>;
    hasCursor: boolean;
    mode: "list" | "grid";
    renderList: () => ReactNode;
    renderGrid: () => ReactNode;
}

export function TasksListLayoutContent({
                                           isEmpty,
                                           isPending,
                                           isPendingNext,
                                           cursorRef,
                                           hasCursor,
                                           mode,
                                           renderList,
                                           renderGrid,
                                       }: TasksListLayoutContentProps) {
    if (isPending) return <div>Загрузка...</div>;
    if (isEmpty) return <div>Задачи не найдены</div>;

    return (
        <div className="w-full max-w-full">
            <div
                className={
                    mode === "grid"
                        ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 w-full"
                        : "space-y-4 w-full"
                }
            >
                {mode === "list" ? renderList() : renderGrid()}
            </div>
            {hasCursor && (
                <div ref={cursorRef} className="h-10">
                    {isPendingNext && <div>Загрузка...</div>}
                </div>
            )}
        </div>
    );
}
