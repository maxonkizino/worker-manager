import { Link } from "react-router-dom";
import { useTasksList } from "@/entities/task";
import { TaskFilters, useTaskFilters } from "@/features/filter-tasks";
import { CreateTaskForm } from "@/features/create-task";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { ROUTES } from "@/shared/model/routes";
import type { TaskPriority, TaskStatus } from "@/shared/api/types";
import { canManageTasks, canViewTasks } from "@/shared/lib/roles";
import { useSession } from "@/shared/model/session";
import { RequireAccess } from "@/shared/ui/require-access";

export function Component() {
  const { session } = useSession();
  const roles = session?.roles;

  return (
    <RequireAccess allow={canViewTasks(roles)}>
      <TasksPage canCreate={canManageTasks(roles)} />
    </RequireAccess>
  );
}

function TasksPage({ canCreate }: { canCreate: boolean }) {
  const {
    filters,
    projectId,
    setProjectId,
    status,
    setStatus,
    priority,
    setPriority,
    search,
    setSearch,
  } = useTaskFilters();
  const { data: tasks = [], isPending } = useTasksList(filters);

  return (
    <ListPageLayout
      title="Задачи"
      description={canCreate ? "Список задач с фильтрами" : "Назначенные вам задачи"}
      filters={
        <TaskFilters
          projectId={projectId}
          onProjectId={setProjectId}
          status={status}
          onStatus={(v) => setStatus(v as TaskStatus | "")}
          priority={priority}
          onPriority={(v) => setPriority(v as TaskPriority | "")}
          search={search}
          onSearch={setSearch}
        />
      }
    >
      {canCreate ? (
        <details className="mb-4 rounded border p-3">
          <summary className="cursor-pointer font-medium">Создать задачу</summary>
          <div className="mt-3">
            <CreateTaskForm />
          </div>
        </details>
      ) : null}
      {isPending ? <p>Загрузка...</p> : null}
      <ul className="divide-y text-sm">
        {tasks.map((t) => (
          <li key={t.id} className="flex items-center justify-between py-3">
            <Link
              className="font-medium text-teal-800 hover:underline"
              to={ROUTES.TASK_DETAILS.replace(":id", t.id)}
            >
              {t.title}
            </Link>
            <span className="text-slate-500">
              {t.status} · {t.priority}
            </span>
          </li>
        ))}
        {!isPending && tasks.length === 0 ? (
          <li className="py-3 text-slate-500">Задачи не найдены</li>
        ) : null}
      </ul>
    </ListPageLayout>
  );
}
