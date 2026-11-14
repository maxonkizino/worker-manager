import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { ROUTES } from "@/shared/model/routes";

export function RequireAccess({ allow, children }: { allow: boolean; children: ReactNode }) {
  if (!allow) {
    return <Navigate to={ROUTES.DASHBOARD} replace />;
  }
  return children;
}
