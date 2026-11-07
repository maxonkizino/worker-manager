import "react-router-dom";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  REGISTER: "/register",
  BOARDS: "/boards",
  BOARD: "/boards/:boardId",
  FAVORITE_BOARDS: "/boards/favorite",
  RECENT_BOARDS: "/boards/recent",
  ANALYTIC_BOARDS: "/boards/analytic",
  USER_BOARDS: "/boards/user",
  USER_DETAILS: "/users/:id",
  USER_PROFILE: "/profile/:id",
  TASKS: "/tasks",
  TASK_DETAILS: "/tasks/:id",
  FAVORITE_TASKS: "/tasks/favorite",
  URGENT_TASKS: "/tasks/urgent",
  ANALYTIC_TASKS: "/tasks/analytic"
} as const;

export type PathParams = {
  [ROUTES.BOARD]: {
    boardId: string;
  };
  [ROUTES.USER_DETAILS]: {
    id: string;
  };
  [ROUTES.USER_PROFILE]: {
    id: string;
  };
  [ROUTES.TASK_DETAILS]: {
    id: string;
  };
};

declare module "react-router-dom" {
  interface Register {
    params: PathParams;
  }
}