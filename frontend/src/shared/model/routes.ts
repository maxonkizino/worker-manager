import "react-router-dom";

export const ROUTES = {
  HOME: "/",
  DASHBOARD: "/dashboard",
  LOGIN: "/login",
  REGISTER: "/register",
  EMPLOYEES: "/employees",
  EMPLOYEE_DETAILS: "/employees/:id",
  PROJECTS: "/projects",
  PROJECT_DETAILS: "/projects/:id",
  TASKS: "/tasks",
  TASK_DETAILS: "/tasks/:id",
  ABSENCES: "/absences",
  ANALYTICS: "/analytics",
  OPTIMIZATION: "/optimization",
  NOTIFICATIONS: "/notifications",
  SETTINGS: "/settings",
  PROFILE: "/profile",
} as const;

export type PathParams = {
  [ROUTES.EMPLOYEE_DETAILS]: { id: string };
  [ROUTES.PROJECT_DETAILS]: { id: string };
  [ROUTES.TASK_DETAILS]: { id: string };
};

declare module "react-router-dom" {
  interface Register {
    params: PathParams;
  }
}
