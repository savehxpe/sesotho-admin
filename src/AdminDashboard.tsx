import { useAdminAuth } from "./shared/rbac/AdminAuthCtx";
import { canAccess, ROLE_LABELS } from "./shared/rbac/roles";
import { Link } from "react-router-dom";

const MODULES = [
  {
    title: "Accounting",
    description: "Orders, payments, revenue, payouts, invoices, and refunds.",
    icon: "ti ti-coin",
    path: "/admin/accounting",
    permission: "access_accounting" as const,
    color: "var(--color-gold)",
  },
  {
    title: "Marketing",
    description: "Campaigns, promo codes, homepage announcements, featured products.",
    icon: "ti ti-bullhorn",
    path: "/admin/marketing",
    permission: "access_marketing" as const,
    color: "#22c55e",
  },
  {
    title: "Website Protection",
    description: "Audit logs, security events, rate limits, and protection settings.",
    icon: "ti ti-shield",
    path: "/admin/website-protection",
    permission: "access_website_protection" as const,
    color: "#6366f1",
  },
];

export function AdminDashboard() {
  const { role, isAuthenticated } = useAdminAuth();

  return (
    <div className="sf-shell" style={{ padding: 0, margin: 0, maxWidth: "100%" }}>
      <div style={{ marginBottom: "24px" }}>
        <h2 style={{ fontSize: "15px", fontWeight: 600, margin: "0 0 4px" }}>
          Welcome back, {isAuthenticated ? "Admin" : "Guest"}
        </h2>
        <p style={{ fontSize: "12px", color: "var(--color-text-tertiary)", margin: 0 }}>
          Role: <span className="admin-user-role">{ROLE_LABELS[role]}</span>
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
        {MODULES.map((mod) => {
          if (!isAuthenticated || !canAccess(role, mod.permission)) return null;
          return (
            <Link
              key={mod.path}
              to={mod.path}
              style={{
                textDecoration: "none",
                color: "inherit",
                background: "var(--color-surface)",
                border: "1px solid var(--color-border)",
                borderRadius: "10px",
                padding: "24px",
                transition: "border-color 0.15s, transform 0.15s",
                cursor: "pointer",
                display: "block",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = mod.color;
                e.currentTarget.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--color-border)";
                e.currentTarget.style.transform = "none";
              }}
            >
              <i className={mod.icon} style={{ fontSize: "28px", color: mod.color, display: "block", marginBottom: "12px" }} aria-hidden="true" />
              <h3 style={{ fontSize: "14px", fontWeight: 600, margin: "0 0 6px" }}>{mod.title}</h3>
              <p style={{ fontSize: "11px", color: "var(--color-text-tertiary)", margin: 0, lineHeight: 1.5 }}>{mod.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
