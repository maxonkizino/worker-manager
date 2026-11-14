import { ROUTES } from "@/shared/model/routes";
import { Navigate, Outlet, redirect } from "react-router-dom";
import { getAccessToken, useSession } from "@/shared/model/session";

export function ProtectedRoute() {
  const { token } = useSession();
  if (!token) {
    return <Navigate to={ROUTES.LOGIN} replace />;
  }
  return <Outlet />;
}

export async function protectedLoader() {
  const token = await getAccessToken();
  if (!token) {
    return redirect(ROUTES.LOGIN);
  }
  return null;
}
