import { NavLink } from "react-router-dom";
import {
  BarChart3,
  Bell,
  CalendarOff,
  ClipboardList,
  FolderKanban,
  LayoutDashboard,
  Settings,
  Sparkles,
  Users,
} from "lucide-react";
import { ROUTES } from "@/shared/model/routes";
import { useSession } from "@/shared/model/session";
import {
  canEditSettings,
  canRunOptimization,
  canViewAbsences,
  canViewEmployees,
  canViewProjects,
  canViewTasks,
  canViewTeamLoad,
} from "@/shared/lib/roles";
import { cn } from "@/shared/lib/css";

const links = [
  { to: ROUTES.DASHBOARD, label: "Дашборд", icon: LayoutDashboard, allow: (_roles?: string[]) => true },
  { to: ROUTES.TASKS, label: "Задачи", icon: ClipboardList, allow: canViewTasks },
  { to: ROUTES.PROJECTS, label: "Проекты", icon: FolderKanban, allow: canViewProjects },
  { to: ROUTES.EMPLOYEES, label: "Сотрудники", icon: Users, allow: canViewEmployees },
  { to: ROUTES.ABSENCES, label: "Отсутствия", icon: CalendarOff, allow: canViewAbsences },
  { to: ROUTES.ANALYTICS, label: "Аналитика", icon: BarChart3, allow: canViewTeamLoad },
  { to: ROUTES.OPTIMIZATION, label: "Оптимизация", icon: Sparkles, allow: canRunOptimization },
  { to: ROUTES.NOTIFICATIONS, label: "Уведомления", icon: Bell, allow: (_roles?: string[]) => true },
] as const;

export function AppSidebar() {
  const { session } = useSession();
  const roles = session?.roles;
  const visible = links.filter((link) => link.allow(roles));

  return (
    <aside className="hidden w-60 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-100 md:flex md:flex-col">
      <div className="border-b border-slate-700 px-5 py-4">
        <p className="text-lg font-semibold">TaskFlow Planner</p>
        <p className="text-xs text-slate-400">Распределение нагрузки</p>
      </div>
      <nav className="flex flex-1 flex-col gap-1 p-3">
        {visible.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Icon className="size-4 shrink-0" />
            {label}
          </NavLink>
        ))}
        {canEditSettings(roles) && (
          <NavLink
            to={ROUTES.SETTINGS}
            className={({ isActive }) =>
              cn(
                "mt-auto flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-teal-600 text-white"
                  : "text-slate-300 hover:bg-slate-800 hover:text-white",
              )
            }
          >
            <Settings className="size-4" />
            Настройки
          </NavLink>
        )}
      </nav>
    </aside>
  );
}
