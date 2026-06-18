import { Outlet, useLocation } from "react-router-dom";
import { AdminSidebar } from "./AdminSidebar";
import { useAdminAuth } from "../shared/rbac/AdminAuthCtx";
import { ROLE_LABELS } from "../shared/rbac/roles";

function getPageTitle(pathname: string): string {
  if (pathname === "/admin") return "Dashboard";
  if (pathname.startsWith("/admin/accounting")) return "Accounting";
  if (pathname.startsWith("/admin/marketing")) return "Marketing";
  if (pathname.startsWith("/admin/website-protection")) return "Website Protection";
  return "Admin";
}

export function AdminLayout() {
  const { role, isAuthenticated } = useAdminAuth();
  const location = useLocation();
  const title = getPageTitle(location.pathname);

  return (
    <div className="admin-shell">
      <AdminSidebar />
      <main className="admin-main">
        <div className="admin-main-header">
          <h1 style={{ fontSize: "16px", fontWeight: 600, margin: 0 }}>{title}</h1>
          <div className="admin-user-badge">
            {isAuthenticated && (
              <>
                <span>admin@sesothofashioning.ls</span>
                <span className="admin-user-role">{ROLE_LABELS[role]}</span>
              </>
            )}
          </div>
        </div>
        <div className="admin-main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
