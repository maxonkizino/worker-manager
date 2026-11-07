import { useState, RefObject } from "react";
import { Button } from "@/shared/ui/kit/button";
import { PlusIcon } from "lucide-react";
import {
  TasksListLayout,
  TasksListLayoutContent,
  TasksListLayoutFilters,
  TasksListLayoutHeader,
} from "./ui/tasks-list-layout";
import { ViewMode, ViewModeToggle } from "@/features/boards-list/ui/view-mode-toggle";
import { TasksStatusFilterSelect } from "./ui/tasks-status-filter-select";
import { TasksUserFilterSelect } from "./ui/tasks-user-filter-select";
import { TaskItem } from "./ui/task-item";
import { TaskCard } from "./ui/task-card";
import type { components } from "@/shared/api/schema/generated";
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
import { BoardsSidebar } from "@/features/boards-list/ui/task/boards-sidebar";
import { useUrgentTasksFilters } from "./model/use-urgent-tasks-filters";
import { useUrgentTasksList } from "./model/use-urgent-tasks-list";
import { Input } from "@/shared/ui/kit/input";
import { Label } from "@/shared/ui/kit/label";

type CreateTaskRequest = components["schemas"]["CreateTaskRequest"];

function UrgentTasksListPage() {
  const filters = useUrgentTasksFilters();
  const tasksQuery = useUrgentTasksList({
    hours: filters.hours,
    status: filters.status,
    assigneeId: filters.assigneeId,
  });

  const { deleteTask, isPending: isDeleting } = useDeleteTask();
  const [deletingTaskId, setDeletingTaskId] = useState<string | null>(null);

  const handleDelete = (taskId: string) => {
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

  const handleHoursChange = (value: string) => {
    const parsed = Number(value);
    if (Number.isNaN(parsed)) {
      filters.setHours(filters.DEFAULT_HOURS);
      return;
    }
    filters.setHours(parsed);
  };

  const isFiltersApplied =
    filters.hours !== filters.DEFAULT_HOURS ||
    filters.status !== null ||
    filters.assigneeId !== null;

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
          title="Срочные задачи"
          description="Задачи, срок выполнения которых наступает в ближайшее время"
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
          filters={
            <div className="flex flex-wrap items-end gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="hours">Часы до срока</Label>
                <Input
                  id="hours"
                  type="number"
                  min={1}
                  max={168}
                  value={filters.hours}
                  onChange={(event) => handleHoursChange(event.target.value)}
                  className="w-32"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Статус</Label>
                <TasksStatusFilterSelect
                  value={filters.status}
                  onValueChange={filters.setStatus}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label>Исполнитель</Label>
                <TasksUserFilterSelect
                  value={filters.assigneeId}
                  onValueChange={filters.setAssigneeId}
                  placeholder="Исполнитель"
                  noneLabel="Все исполнители"
                />
              </div>
            </div>
          }
          actions={
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={filters.clearFilters}
                disabled={!isFiltersApplied}
              >
                Сбросить фильтры
              </Button>
              <ViewModeToggle
                value={viewMode}
                onChange={(value) => setViewMode(value)}
              />
            </div>
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

export const Component = UrgentTasksListPage;


