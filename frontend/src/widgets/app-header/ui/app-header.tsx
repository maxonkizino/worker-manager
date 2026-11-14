import { Link } from "react-router-dom";
import { Bell, LogOut } from "lucide-react";
import { useEmployee, UserAvatar } from "@/entities/employee";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import { Button } from "@/shared/ui/kit/button";

export function AppHeader() {
  const { session, logout } = useSession();
  const { data: employee } = useEmployee(session?.sub ?? "");
  const name = employee?.fullName ?? session?.username ?? "Профиль";

  return (
    <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-teal-700">TaskFlow</p>
        <h2 className="text-sm font-semibold text-slate-800">Планировщик активности</h2>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" asChild>
          <Link to={ROUTES.NOTIFICATIONS} aria-label="Уведомления">
            <Bell className="size-4" />
          </Link>
        </Button>
        <Button variant="ghost" className="px-2" asChild>
          <Link to={ROUTES.PROFILE} aria-label="Профиль" className="flex items-center gap-2">
            <UserAvatar
              name={name}
              employeeId={employee?.id}
              avatarPreset={employee?.avatarPreset}
              customAvatar={employee?.customAvatar}
              avatarRevision={employee?.avatarRevision}
              className="size-8 text-[10px]"
            />
            <span className="hidden text-sm text-slate-700 sm:inline">{name}</span>
          </Link>
        </Button>
        <Button variant="outline" size="sm" onClick={() => void logout()}>
          <LogOut className="mr-1 size-4" />
          Выйти
        </Button>
      </div>
    </header>
  );
}
