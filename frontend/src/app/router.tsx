import { ROUTES } from "../shared/model/routes";
import { createBrowserRouter, redirect } from "react-router-dom";
import { App } from "./app";
import { Providers } from "./providers";
import { protectedLoader, ProtectedRoute } from "./protected-route";
import { AppHeader } from "@/features/header";

export const router = createBrowserRouter([
  {
    element: (
      <Providers>
        <App />
      </Providers>
    ),
    children: [
      {
        loader: protectedLoader,
        element: (
          <>
            <AppHeader />
            <ProtectedRoute />
          </>
        ),
        children: [
          {
            path: ROUTES.FAVORITE_BOARDS,
            lazy: () =>
              import("@/features/boards-list/boards-list-favorite.page"),
          },
          {
            path: ROUTES.RECENT_BOARDS,
            lazy: () =>
              import("@/features/boards-list/boards-list-myTasks.page"),
          },
          {
            path: ROUTES.ANALYTIC_BOARDS,
            lazy: () =>
                import("@/features/analityc/boards-list-analytic.page"),
          },
          {
            path: ROUTES.USER_BOARDS,
            lazy: () =>
                import("@/features/users/boards-list-user.page.tsx"),
          },
          {
            path: ROUTES.BOARD,
            lazy: () => import("@/features/board/board.page"),
          },
          {
            path: ROUTES.USER_DETAILS,
            lazy: () => import("@/features/users/user-details.page"),
          },
          {
            path: ROUTES.USER_PROFILE,
            lazy: () => import("@/features/users/user-profile.page"),
          },
          {
            path: ROUTES.TASKS,
            lazy: () => import("@/features/tasks/tasks-list.page"),
          },
          {
            path: ROUTES.URGENT_TASKS,
            lazy: () => import("@/features/tasks/task-list-urgent.page"),
          },
          {
            path: ROUTES.FAVORITE_TASKS,
            lazy: () => import("@/features/tasks/task-list-favorite"),
          },
          {
            path: ROUTES.TASK_DETAILS,
            lazy: () => import("@/features/tasks/task-details.page"),
          },
        ],
      },

      {
        path: ROUTES.LOGIN,
        lazy: () => import("@/features/auth/login.page"),
      },
      {
        path: ROUTES.REGISTER,
        lazy: () => import("@/features/auth/register.page"),
      },
      {
        path: ROUTES.HOME,
        loader: () => redirect(ROUTES.TASKS),
      },
    ],
  },
]);
