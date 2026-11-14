import { createBrowserRouter, redirect } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";
import { App } from "./app";
import { Providers } from "./providers";
import { ProtectedRoute, protectedLoader } from "./protected-route";
import { MainLayout } from "./main-layout";

function HydrateFallback() {
  return <p className="p-6 text-sm text-slate-600">Загрузка...</p>;
}

export const router = createBrowserRouter([
  {
    HydrateFallback,
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        loader: protectedLoader,
        element: <ProtectedRoute />,
        children: [
          {
            element: <MainLayout />,
            children: [
          {
            path: ROUTES.DASHBOARD,
            lazy: () => import("@/pages/dashboard"),
          },
          {
            path: ROUTES.EMPLOYEES,
            lazy: () => import("@/pages/employees"),
          },
          {
            path: ROUTES.EMPLOYEE_DETAILS,
            lazy: () => import("@/pages/employee-details"),
          },
          {
            path: ROUTES.PROJECTS,
            lazy: () => import("@/pages/projects"),
          },
          {
            path: ROUTES.PROJECT_DETAILS,
            lazy: () => import("@/pages/project-details"),
          },
          {
            path: ROUTES.TASKS,
            lazy: () => import("@/pages/tasks"),
          },
          {
            path: ROUTES.TASK_DETAILS,
            lazy: () => import("@/pages/task-details"),
          },
          {
            path: ROUTES.ABSENCES,
            lazy: () => import("@/pages/absences"),
          },
          {
            path: ROUTES.ANALYTICS,
            lazy: () => import("@/pages/analytics"),
          },
          {
            path: ROUTES.OPTIMIZATION,
            lazy: () => import("@/pages/optimization"),
          },
          {
            path: ROUTES.NOTIFICATIONS,
            lazy: () => import("@/pages/notifications"),
          },
          {
            path: ROUTES.SETTINGS,
            lazy: () => import("@/pages/settings"),
          },
          {
            path: ROUTES.PROFILE,
            lazy: () => import("@/pages/profile"),
          },
            ],
          },
        ],
      },
      {
        path: ROUTES.LOGIN,
        lazy: () => import("@/pages/login"),
      },
      {
        path: ROUTES.REGISTER,
        lazy: () => import("@/pages/register"),
      },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.DASHBOARD),
      },
    ],
  },
]);
