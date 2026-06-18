// ─── Sesotho Fashioning · Accounting RBAC ─────────────────────────────────────
// Role-based access control for the accounting module.
// Never rely on this alone — enforce identical rules server-side on every API route.

import { useContext, createContext } from "react";
import type { AccountingRole } from "../types/accounting";

// ─── Permission definitions ───────────────────────────────────────────────────

export type AccountingPermission =
  | "view_dashboard"
  | "view_transactions"
  | "view_transaction_detail"
  | "export_csv"
  | "add_note"
  | "manage_payouts"
  | "manage_refunds"
  | "view_audit_log"
  | "view_schema"
  | "manage_roles";

type PermissionMatrix = Record<AccountingPermission, AccountingRole[]>;

/**
 * Defines which roles hold each permission.
 * Marketing Admin is intentionally excluded from all financial permissions.
 */
const PERMISSION_MATRIX: PermissionMatrix = {
  view_dashboard:          ["super_admin", "accounting_admin", "read_only_viewer", "marketing_admin"],
  view_transactions:       ["super_admin", "accounting_admin", "read_only_viewer"],
  view_transaction_detail: ["super_admin", "accounting_admin", "read_only_viewer"],
  export_csv:              ["super_admin", "accounting_admin"],
  add_note:                ["super_admin", "accounting_admin"],
  manage_payouts:          ["super_admin", "accounting_admin"],
  manage_refunds:          ["super_admin", "accounting_admin"],
  view_audit_log:          ["super_admin", "accounting_admin"],
  view_schema:             ["super_admin"],
  manage_roles:            ["super_admin"],
};

/**
 * Check whether a role holds a given permission.
 * Use this both in React guards and in server-side API handlers.
 */
export function canAccess(
  role: AccountingRole,
  permission: AccountingPermission
): boolean {
  return PERMISSION_MATRIX[permission]?.includes(role) ?? false;
}

/**
 * Returns all permissions held by a role (useful for debugging/audit UI).
 */
export function getPermissionsForRole(role: AccountingRole): AccountingPermission[] {
  return (Object.keys(PERMISSION_MATRIX) as AccountingPermission[]).filter((p) =>
    canAccess(role, p)
  );
}

// ─── Auth Context ─────────────────────────────────────────────────────────────

interface AccountingAuthContext {
  userEmail: string;
  role: AccountingRole;
  isAuthenticated: boolean;
}

export const AccountingAuthCtx = createContext<AccountingAuthContext>({
  userEmail: "",
  role: "read_only_viewer",
  isAuthenticated: false,
});

/**
 * Hook to read the current accounting user's auth state.
 * In production: derive role from your auth provider (Supabase Auth + user_roles table).
 */
export function useAccountingAuth(): AccountingAuthContext {
  return useContext(AccountingAuthCtx);
}

// ─── React Guard Component ────────────────────────────────────────────────────

import React from "react";

interface AccountingGuardProps {
  permission: AccountingPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Wraps any accounting UI section and prevents render if the current role
 * does not hold the required permission.
 *
 * @example
 * <AccountingGuard permission="export_csv">
 *   <ExportButton />
 * </AccountingGuard>
 */
export function AccountingGuard({
  permission,
  children,
  fallback = null,
}: AccountingGuardProps): React.ReactElement | null {
  const { role, isAuthenticated } = useAccountingAuth();
  if (!isAuthenticated) return React.createElement(AccessDenied, { reason: "Not authenticated" });
  if (!canAccess(role, permission)) {
    return fallback
      ? React.createElement(React.Fragment, null, fallback)
      : React.createElement(AccessDenied, { reason: `Role "${role}" cannot "${permission}"` });
  }
  return React.createElement(React.Fragment, null, children);
}

interface AccessDeniedProps {
  reason?: string;
}

function AccessDenied({ reason }: AccessDeniedProps) {
  return React.createElement(
    "div",
    {
      role: "alert",
      style: {
        padding: "24px",
        textAlign: "center" as const,
        color: "var(--color-text-tertiary)",
        fontSize: "13px",
      },
    },
    React.createElement("i", {
      className: "ti ti-lock",
      "aria-hidden": "true",
      style: { fontSize: "28px", display: "block", marginBottom: "8px" },
    }),
    React.createElement("p", null, "Access restricted"),
    reason && React.createElement("p", { style: { fontSize: "11px", marginTop: "4px" } }, reason)
  );
}
