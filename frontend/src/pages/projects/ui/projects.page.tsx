import { Link } from "react-router-dom";
import { useProjectsList } from "@/entities/project";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { ROUTES } from "@/shared/model/routes";
import { Badge } from "@/shared/ui/kit/badge";

export function Component() {
  const { data: projects = [], isPending } = useProjectsList();

  return (
    <ListPageLayout title="Проекты" description="Активные и архивные проекты">
      {isPending ? <p>Загрузка...</p> : null}
      <ul className="divide-y">
        {projects.map((p) => (
          <li key={p.id} className="flex items-center justify-between py-3">
            <div>
              <Link
                className="font-medium text-teal-800 hover:underline"
                to={ROUTES.PROJECT_DETAILS.replace(":id", p.id)}
              >
                {p.name}
              </Link>
              <p className="text-sm text-slate-600">{p.description ?? "Без описания"}</p>
            </div>
            <Badge>{p.status}</Badge>
          </li>
        ))}
        {!isPending && projects.length === 0 ? (
          <li className="py-4 text-slate-500">Проекты не найдены</li>
        ) : null}
      </ul>
    </ListPageLayout>
  );
}
