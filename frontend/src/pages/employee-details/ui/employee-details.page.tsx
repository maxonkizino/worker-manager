import { useParams } from "react-router-dom";
import {
  useAbsencesList,
  useEmployee,
  useSkillsList,
  UserAvatar,
} from "@/entities/employee";
import { canViewAbsences, canViewEmployees } from "@/shared/lib/roles";
import { useSession } from "@/shared/model/session";
import { RequireAccess } from "@/shared/ui/require-access";
import { ListPageLayout } from "@/widgets/list-page-layout";

export function Component() {
  const { session } = useSession();
  return (
    <RequireAccess allow={canViewEmployees(session?.roles)}>
      <EmployeeDetails showAbsences={canViewAbsences(session?.roles)} />
    </RequireAccess>
  );
}

function EmployeeDetails({ showAbsences }: { showAbsences: boolean }) {
  const { id = "" } = useParams();
  const { data: employee, isPending } = useEmployee(id);
  const { data: skills = [] } = useSkillsList();

  if (isPending) {
    return <p>Загрузка...</p>;
  }

  if (!employee) {
    return <p className="text-red-600">Сотрудник не найден</p>;
  }

  return (
    <ListPageLayout title={employee.fullName} description={employee.position ?? "—"}>
      <div className="mb-6 flex items-center gap-4">
        <UserAvatar
          name={employee.fullName}
          employeeId={employee.id}
          avatarPreset={employee.avatarPreset}
          customAvatar={employee.customAvatar}
          avatarRevision={employee.avatarRevision}
          className="size-16 text-lg"
        />
        <p className="text-sm text-slate-600">{employee.email}</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-2 text-sm">
          <h2 className="font-semibold">Профиль</h2>
          <p>Коэф. полезного времени: {employee.usefulTimeFactor}</p>
          <p>Канал: {employee.preferredChannel}</p>
        </section>
        <section className="space-y-2">
          <h2 className="font-semibold">Навыки (справочник)</h2>
          <ul className="list-disc pl-5 text-sm text-slate-700">
            {skills.slice(0, 8).map((s) => (
              <li key={s.id}>{s.name}</li>
            ))}
            {skills.length === 0 ? <li>Нет данных о навыках</li> : null}
          </ul>
        </section>
        {showAbsences ? <EmployeeAbsences employeeId={id} /> : null}
      </div>
    </ListPageLayout>
  );
}

function EmployeeAbsences({ employeeId }: { employeeId: string }) {
  const { data: absences = [] } = useAbsencesList();
  const employeeAbsences = absences.filter((a) => a.employeeId === employeeId);

  return (
    <section className="space-y-2 md:col-span-2">
      <h2 className="font-semibold">Отсутствия</h2>
      <ul className="divide-y text-sm">
        {employeeAbsences.map((a) => (
          <li key={a.id} className="py-2">
            {a.type} · {a.startDate} — {a.endDate} · {a.status}
          </li>
        ))}
        {employeeAbsences.length === 0 ? <li className="text-slate-500">Заявок нет</li> : null}
      </ul>
    </section>
  );
}
