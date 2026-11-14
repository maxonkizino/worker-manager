import { ProfileEditor } from "@/features/edit-profile";
import { useEmployee } from "@/entities/employee";
import { useSession } from "@/shared/model/session";
import { Badge } from "@/shared/ui/kit/badge";
import { Button } from "@/shared/ui/kit/button";

const ROLE_LABELS: Record<string, string> = {
  ROLE_ADMIN: "Администратор",
  ROLE_MANAGER: "Руководитель",
  ROLE_EMPLOYEE: "Сотрудник",
};

export function Component() {
  const { session, logout } = useSession();
  const { data: employee, isPending, isError } = useEmployee(session?.sub ?? "");

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Профиль</h1>
          <p className="text-sm text-slate-600">
            {session?.username ? `Учётная запись ${session.username}` : "Данные сотрудника"}
          </p>
        </div>
        <Button variant="outline" onClick={() => void logout()}>
          Выйти
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(session?.roles ?? []).map((role) => (
          <Badge key={role} variant="secondary">
            {ROLE_LABELS[role] ?? role}
          </Badge>
        ))}
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-6">
        {isPending ? <p>Загрузка...</p> : null}
        {isError || (!isPending && !employee) ? (
          <p className="text-sm text-slate-600">Профиль сотрудника ещё не синхронизирован.</p>
        ) : null}
        {employee ? <ProfileEditor employee={employee} /> : null}
      </div>
    </div>
  );
}
