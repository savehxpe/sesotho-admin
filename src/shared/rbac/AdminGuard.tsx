import React from "react";
import { useAdminAuth } from "./AdminAuthCtx";
import { canAccess } from "./roles";
import type { AdminPermission } from "./roles";

interface AdminGuardProps {
  permission: AdminPermission;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AccessDenied({ reason }: { reason?: string }) {
  return (
    <div className="sf-empty" role="alert">
      <i className="ti ti-lock" aria-hidden="true" />
      <p>Access restricted</p>
      {reason && <p style={{ fontSize: "11px", marginTop: "4px" }}>{reason}</p>}
    </div>
  );
}

export function AdminGuard({ permission, children, fallback }: AdminGuardProps) {
  const { role, isAuthenticated } = useAdminAuth();
  if (!isAuthenticated) return <AccessDenied reason="Not authenticated" />;
  if (!canAccess(role, permission)) {
    return fallback ? <>{fallback}</> : <AccessDenied reason={`Role "${role}" cannot "${permission}"`} />;
  }
  return <>{children}</>;
}
