import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAdminAuth } from "./shared/rbac/AdminAuthCtx";
import { AccountingAuthCtx } from "./accounting/rbac/accountingRBAC";
import type { AccountingRole } from "./accounting/types/accounting";
import { AdminLayout } from "./layout/AdminLayout";
import { AdminDashboard } from "./AdminDashboard";
import { AccountingDashboard } from "./accounting/components/dashboard/AccountingDashboard";
import { MarketingDashboard } from "./marketing/components/MarketingDashboard";
import { ProtectionDashboard } from "./website-protection/components/ProtectionDashboard";
import { LoginPage } from "./auth/LoginPage";
import { RequireAuth } from "./auth/RequireAuth";

function AccountingBridge({ children }: { children: React.ReactNode }) {
  const { userEmail, role, isAuthenticated } = useAdminAuth();

  const roleMap: Record<string, AccountingRole> = {
    super_admin: "super_admin",
    accounting_admin: "accounting_admin",
    marketing_admin: "marketing_admin",
    read_only_viewer: "read_only_viewer",
  };

  return (
    <AccountingAuthCtx.Provider
      value={{
        userEmail,
        role: roleMap[role] ?? "read_only_viewer",
        isAuthenticated,
      }}
    >
      {children}
    </AccountingAuthCtx.Provider>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/admin/login" element={<LoginPage />} />

          <Route
            path="/admin"
            element={
              <RequireAuth>
                <AccountingBridge>
                  <AdminLayout />
                </AccountingBridge>
              </RequireAuth>
            }
          >
            <Route index element={<AdminDashboard />} />
            <Route path="accounting" element={<AccountingDashboard />} />
            <Route path="marketing" element={<MarketingDashboard />} />
            <Route path="website-protection" element={<ProtectionDashboard />} />
          </Route>

          <Route path="*" element={<Navigate to="/admin/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
