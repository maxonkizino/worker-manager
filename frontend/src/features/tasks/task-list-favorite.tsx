import { useState, RefObject } from "react";
import { Button } from "@/shared/ui/kit/button";
import { PlusIcon } from "lucide-react";
import { useTasksByAssignee } from "./model/use-tasks-by-assignee";
import { useTasksFilters } from "./model/use-tasks-filters";
import {
    TasksListLayout,
    TasksListLayoutContent,
    TasksListLayoutFilters,
    TasksListLayoutHeader,
} from "./ui/tasks-list-layout";
import { ViewMode, ViewModeToggle } from "@/features/boards-list/ui/view-mode-toggle";
import { TasksSortSelect } from "./ui/tasks-sort-select";
import { TasksSearchInput } from "./ui/tasks-search-input";
import { TasksStatusFilterSelect } from "./ui/tasks-status-filter-select";
import { TasksPriorityFilterSelect } from "./ui/tasks-priority-filter-select";
import { TasksDepartmentFilterSelect } from "./ui/tasks-department-filter-select";
import { TaskItem } from "./ui/task-item";
import { TaskCard } from "./ui/task-card";
import type { components } from "@/shared/api/schema/generated";

type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/shared/ui/kit/dialog";
import { CreateTaskForm } from "./ui/create-task-form";
import { Link } from "react-router-dom";
import { useDeleteTask } from "./model/use-delete-task";
import { BoardsSidebar } from "@/features/boards-list/ui/task/boards-sidebar.tsx";
import { useSession } from "@/shared/model/session";

function TaskListFavorite() {
    const { session } = useSession();
    const userId = session?.userId || "";

    const tasksFilters = useTasksFilters();
    const tasksQuery = useTasksByAssignee({
        userId,
        status: tasksFilters.status as "AVAILABLE" | "IN_PROGRESS" | "COMPLETED" | "BLOCKED" | null,
        department: tasksFilters.department as "IT" | "HR" | "FINANCE" | "MARKETING" | "SALES" | "CUSTOMER_SERVICE" | "PRODUCTION" | "LOGISTICS" | "RESEARCH_AND_DEVELOPMENT" | "OTHER" | null,
        creatorId: tasksFilters.creatorId,
    });

    // Хук удаления
    const { deleteTask, isPending: isDeleting } = useDeleteTask();
    const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

    const handleDelete = (taskId: string) => {
        console.log(taskId);
        setDeletingTaskId(taskId);
        deleteTask(taskId);
    };

    const [viewMode, setViewMode] = useState<ViewMode>("list");
    const [isOpen, setIsOpen] = useState(false);
    const [formData, setFormData] = useState<CreateTaskRequest>({
        title: "",
        description: "",
        priority: "MEDIUM",
        department: "IT",
        tags: [],
        assigneeIds: [],
    });


    const renderList = () =>
        tasksQuery.tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
                <TaskItem
                    task={task}
                    onDelete={handleDelete}
                    isDeleting={deletingTaskId === task.id && isDeleting}
                    className="mb-4 cursor-pointer hover:bg-gray-100 transition-colors"
                />
            </Link>
        ));

    const renderGrid = () =>
        tasksQuery.tasks.map((task) => (
            <Link key={task.id} to={`/tasks/${task.id}`}>
                <TaskCard
                    task={task}
                    onDelete={handleDelete}
                    isDeleting={deletingTaskId === task.id && isDeleting}
                    className="mb-4 cursor-pointer hover:shadow-md hover:bg-gray-50 transition-all"
                />
            </Link>
        ));

    return (
        <TasksListLayout
            sidebar={<BoardsSidebar />}
            header={
                <TasksListLayoutHeader
                    title="Избранные задачи"
                    description="Здесь вы можете просматривать задачи, назначенные на вас"
                    actions={
                        <Dialog open={isOpen} onOpenChange={setIsOpen}>
                            <DialogTrigger asChild>
                                <Button>
                                    <PlusIcon />
                                    Создать задачу
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle>Создать новую задачу</DialogTitle>
                                </DialogHeader>
                                <CreateTaskForm
                                    formData={formData}
                                    setFormData={setFormData}
                                    onClose={() => setIsOpen(false)}
                                />
                            </DialogContent>
                        </Dialog>
                    }
                />
            }
            filters={
                <TasksListLayoutFilters
                    sort={
                        <TasksSortSelect
                            value={tasksFilters.sort}
                            onValueChange={tasksFilters.setSort}
                        />
                    }
                    filters={
                        <div className="flex gap-4">
                            <TasksSearchInput
                                value={tasksFilters.search}
                                onChange={tasksFilters.setSearch}
                            />
                            <TasksStatusFilterSelect
                                value={tasksFilters.status}
                                onValueChange={tasksFilters.setStatus}
                            />
                            <TasksPriorityFilterSelect
                                value={tasksFilters.priority}
                                onValueChange={tasksFilters.setPriority}
                            />
                            <TasksDepartmentFilterSelect
                                value={tasksFilters.department}
                                onValueChange={tasksFilters.setDepartment}
                            />
                        </div>
                    }
                    actions={
                        <ViewModeToggle
                            value={viewMode}
                            onChange={(value) => setViewMode(value)}
                        />
                    }
                />
            }
        >
            <TasksListLayoutContent
                isEmpty={tasksQuery.tasks.length === 0}
                isPending={tasksQuery.isPending}
                isPendingNext={tasksQuery.isFetchingNextPage}
                cursorRef={tasksQuery.cursorRef as unknown as RefObject<HTMLDivElement>}
                hasCursor={tasksQuery.hasNextPage}
                mode={viewMode}
                renderList={renderList}
                renderGrid={renderGrid}
            />
        </TasksListLayout>
    );
}

export const Component = TaskListFavorite;

