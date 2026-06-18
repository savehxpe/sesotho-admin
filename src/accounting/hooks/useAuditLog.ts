// ─── Sesotho Fashioning · Audit Log Hook ─────────────────────────────────────
// Wraps logAuditAction with the current user's context from AccountingAuthCtx.
// Every important accounting action calls useAuditLog().log() before or after.

import { useCallback } from "react";
import { useAccountingAuth } from "../rbac/accountingRBAC";
import { logAuditAction } from "../services/accountingService";
import type { AuditAction } from "../types/accounting";

export interface UseAuditLogReturn {
  log: (action: AuditAction, detail: string, entityId?: string) => void;
}

/**
 * Returns a `log` function bound to the current user's email and role.
 * Fire-and-forget: never await in critical path.
 *
 * @example
 * const { log } = useAuditLog();
 * log("view_transaction_detail", "Viewed SF-00124", "SF-00124");
 * log("download_export", `Exported ${count} rows, filters: ${JSON.stringify(filters)}`);
 */
export function useAuditLog(): UseAuditLogReturn {
  const { userEmail, role } = useAccountingAuth();

  const log = useCallback(
    (action: AuditAction, detail: string, entityId?: string) => {
      // Fire-and-forget. Never block UI on audit writes.
      logAuditAction(action, userEmail, role, detail, entityId).catch((err) => {
        // Silently swallow audit failures in prod; alert monitoring systems instead.
        console.warn("[AUDIT] Failed to write audit log entry", err);
      });
    },
    [userEmail, role]
  );

  return { log };
}
