import { NavLink } from "react-router-dom";
import { useAdminAuth } from "../shared/rbac/AdminAuthCtx";
import { canAccess } from "../shared/rbac/roles";
import { ROLE_LABELS } from "../shared/rbac/roles";

const SECTIONS = [
  {
    title: "Accounting",
    icon: "ti ti-coin",
    path: "/admin/accounting",
    permission: "access_accounting" as const,
  },
  {
    title: "Marketing",
    icon: "ti ti-bullhorn",
    path: "/admin/marketing",
    permission: "access_marketing" as const,
  },
  {
    title: "Website Protection",
    icon: "ti ti-shield",
    path: "/admin/website-protection",
    permission: "access_website_protection" as const,
  },
];

export function AdminSidebar() {
  const { role, isAuthenticated } = useAdminAuth();

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-header">
        <div className="admin-sidebar-brand">Sesotho Fashioning</div>
        <div className="admin-sidebar-brand-sub">Super Admin</div>
      </div>

      <nav className="admin-sidebar-nav">
        <div className="admin-nav-section">
          <div className="admin-nav-section-title">Modules</div>

          <NavLink to="/admin" end className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}>
            <i className="ti ti-dashboard" aria-hidden="true" />
            Dashboard
          </NavLink>

          {SECTIONS.map((section) => {
            if (!isAuthenticated || !canAccess(role, section.permission)) return null;
            return (
              <NavLink
                key={section.path}
                to={section.path}
                className={({ isActive }) => `admin-nav-item ${isActive ? "active" : ""}`}
              >
                <i className={section.icon} aria-hidden="true" />
                {section.title}
              </NavLink>
            );
          })}
        </div>
      </nav>

      <div className="admin-sidebar-footer">
        <div style={{ padding: "4px 8px" }}>
          <div style={{ fontSize: "10px", color: "var(--color-text-tertiarity)" }}>Signed in as</div>
          <div style={{ fontSize: "11px", fontWeight: 500, marginTop: "2px" }}>
            {isAuthenticated ? "admin@sesothofashioning.ls" : "Not signed in"}
          </div>
          {isAuthenticated && (
            <span className="admin-user-role">{ROLE_LABELS[role]}</span>
          )}
        </div>
      </div>
    </aside>
  );
}
