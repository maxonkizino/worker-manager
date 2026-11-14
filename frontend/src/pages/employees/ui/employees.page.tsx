import { Link } from "react-router-dom";
import { useEmployeesList, UserAvatar } from "@/entities/employee";
import { ListPageLayout } from "@/widgets/list-page-layout";
import { ROUTES } from "@/shared/model/routes";
import { canViewEmployees } from "@/shared/lib/roles";
import { useSession } from "@/shared/model/session";
import { RequireAccess } from "@/shared/ui/require-access";
import { Badge } from "@/shared/ui/kit/badge";

export function Component() {
  const { session } = useSession();
  return (
    <RequireAccess allow={canViewEmployees(session?.roles)}>
      <EmployeesPage />
    </RequireAccess>
  );
}

function EmployeesPage() {
  const { data: employees = [], isPending, isError } = useEmployeesList();

  return (
    <ListPageLayout
      title="Сотрудники"
      description="Каталог сотрудников и их профилей"
    >
      {isPending ? <p>Загрузка...</p> : null}
      {isError ? (
        <p className="text-sm text-red-600">Не удалось загрузить сотрудников</p>
      ) : null}
      <ul className="divide-y">
        {employees.map((e) => (
          <li key={e.id} className="flex items-center justify-between gap-3 py-3">
            <div className="flex min-w-0 items-center gap-3">
              <UserAvatar
                name={e.fullName}
                employeeId={e.id}
                avatarPreset={e.avatarPreset}
                customAvatar={e.customAvatar}
                avatarRevision={e.avatarRevision}
                className="size-10 text-xs"
              />
              <div className="min-w-0">
                <Link
                  className="font-medium text-teal-800 hover:underline"
                  to={ROUTES.EMPLOYEE_DETAILS.replace(":id", e.id)}
                >
                  {e.fullName}
                </Link>
                <p className="truncate text-sm text-slate-600">{e.email}</p>
              </div>
            </div>
            <Badge variant={e.active ? "default" : "secondary"}>
              {e.active ? "Активен" : "Неактивен"}
            </Badge>
          </li>
        ))}
      </ul>
    </ListPageLayout>
  );
}
