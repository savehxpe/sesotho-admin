import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AdminAuthCtx } from "./shared/rbac/AdminAuthCtx";
import { AccountingAuthCtx } from "./accounting/rbac/accountingRBAC";
import type { AdminRole } from "./shared/rbac/roles";
import { AdminLayout } from "./layout/AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { AccountingDashboard } from "./accounting/components/dashboard/AccountingDashboard";
import { MarketingDashboard } from "./marketing/components/MarketingDashboard";
import { ProtectionDashboard } from "./website-protection/components/ProtectionDashboard";

// ─── Mock auth context (replace with real Supabase/auth) ─────────────────────
const MOCK_AUTH = {
  userEmail: "admin@sesothofashioning.ls",
  role: "super_admin" as AdminRole,
  isAuthenticated: true,
};

// Bridge: Accounting module expects AccountingAuthCtx with AccountingRole
const MOCK_ACCOUNTING_AUTH = {
  userEmail: "admin@sesothofashioning.ls",
  role: "super_admin" as const,
  isAuthenticated: true,
};

export default function App() {
  return (
    <AdminAuthCtx.Provider value={MOCK_AUTH}>
      <AccountingAuthCtx.Provider value={MOCK_ACCOUNTING_AUTH}>
        <BrowserRouter>
          <Routes>
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminDashboard />} />
              <Route path="accounting" element={<AccountingDashboard />} />
              <Route path="marketing" element={<MarketingDashboard />} />
              <Route path="website-protection" element={<ProtectionDashboard />} />
            </Route>
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Routes>
        </BrowserRouter>
      </AccountingAuthCtx.Provider>
    </AdminAuthCtx.Provider>
  );
}
