export type AdminRole =
  | "super_admin"
  | "accounting_admin"
  | "marketing_admin"
  | "security_admin"
  | "read_only_viewer";

export type AdminPermission =
  | "access_accounting"
  | "access_marketing"
  | "access_website_protection"
  | "view_financial_data"
  | "export_data"
  | "manage_campaigns"
  | "manage_promos"
  | "manage_homepage"
  | "manage_security"
  | "view_audit_logs"
  | "manage_rate_limits"
  | "manage_roles"
  | "manage_settings";

type PermissionMatrix = Record<AdminPermission, AdminRole[]>;

const PERMISSION_MATRIX: PermissionMatrix = {
  access_accounting:        ["super_admin", "accounting_admin", "read_only_viewer"],
  access_marketing:         ["super_admin", "marketing_admin", "read_only_viewer"],
  access_website_protection:["super_admin", "security_admin", "read_only_viewer"],
  view_financial_data:      ["super_admin", "accounting_admin", "read_only_viewer"],
  export_data:              ["super_admin", "accounting_admin"],
  manage_campaigns:         ["super_admin", "marketing_admin"],
  manage_promos:            ["super_admin", "marketing_admin"],
  manage_homepage:          ["super_admin", "marketing_admin"],
  manage_security:          ["super_admin", "security_admin"],
  view_audit_logs:          ["super_admin", "security_admin"],
  manage_rate_limits:       ["super_admin", "security_admin"],
  manage_roles:             ["super_admin"],
  manage_settings:          ["super_admin", "accounting_admin", "marketing_admin", "security_admin"],
};

export function canAccess(role: AdminRole, permission: AdminPermission): boolean {
  return PERMISSION_MATRIX[permission]?.includes(role) ?? false;
}

export function getPermissionsForRole(role: AdminRole): AdminPermission[] {
  return (Object.keys(PERMISSION_MATRIX) as AdminPermission[]).filter((p) =>
    canAccess(role, p)
  );
}

export const ROLE_LABELS: Record<AdminRole, string> = {
  super_admin: "Super Admin",
  accounting_admin: "Accounting Admin",
  marketing_admin: "Marketing Admin",
  security_admin: "Security Admin",
  read_only_viewer: "Read-only Viewer",
};
