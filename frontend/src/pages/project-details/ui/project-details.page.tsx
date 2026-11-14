import { Link, useParams } from "react-router-dom";
import { useProject, useProjectMembers } from "@/entities/project";
import { useTasksList } from "@/entities/task";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { ROUTES } from "@/shared/model/routes";

export function Component() {
  const { id = "" } = useParams();
  const { data: project } = useProject(id);
  const { data: members = [] } = useProjectMembers(id);
  const { data: tasks = [] } = useTasksList({ projectId: id });

  if (!project) {
    return <p>Загрузка проекта...</p>;
  }

  return (
    <ListPageLayout title={project.name} description={project.description ?? ""}>
      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <section>
          <h2 className="mb-2 font-semibold">Участники</h2>
          <ul className="text-sm text-slate-700">
            {members.map((m) => (
              <li key={m.employeeId}>
                {m.employeeId.slice(0, 8)}… · {m.projectRole}
              </li>
            ))}
            {members.length === 0 ? <li>Участники не добавлены</li> : null}
          </ul>
        </section>
        <section className="text-sm">
          <p>Статус: {project.status}</p>
          <p>
            Период: {project.startDate} — {project.endDate ?? "∞"}
          </p>
        </section>
      </div>
      <h2 className="mb-2 font-semibold">Задачи проекта</h2>
      <ul className="divide-y text-sm">
        {tasks.map((t) => (
          <li key={t.id} className="py-2">
            <Link
              className="text-teal-800 hover:underline"
              to={ROUTES.TASK_DETAILS.replace(":id", t.id)}
            >
              {t.title}
            </Link>
            <span className="ml-2 text-slate-500">{t.status}</span>
          </li>
        ))}
        {tasks.length === 0 ? <li className="text-slate-500">Задач нет</li> : null}
      </ul>
    </ListPageLayout>
  );
}
