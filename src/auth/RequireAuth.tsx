import { Navigate, useLocation } from "react-router-dom";
import { useAdminAuth } from "../shared/rbac/AdminAuthCtx";

export function RequireAuth({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAdminAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
