import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AdminRole } from "./roles";
import { login as authLogin, logout as authLogout, getStoredSession } from "../services/authService";

export interface AdminAuthContext {
  userEmail: string;
  role: AdminRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
}

const defaultContext: AdminAuthContext = {
  userEmail: "",
  role: "read_only_viewer",
  isAuthenticated: false,
  login: async () => ({ success: false, error: "Auth not initialized" }),
  logout: async () => {},
};

export const AdminAuthCtx = createContext<AdminAuthContext>(defaultContext);

export function useAdminAuth(): AdminAuthContext {
  return useContext(AdminAuthCtx);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const existing = getStoredSession();
  const [userEmail, setUserEmail] = useState(existing?.email ?? "");
  const [role, setRole] = useState<AdminRole>(existing?.role ?? "read_only_viewer");
  const [isAuthenticated, setIsAuthenticated] = useState(!!existing);

  const login = useCallback(async (email: string, password: string) => {
    const result = await authLogin(email, password);
    if (result.success && result.session) {
      setUserEmail(result.session.email);
      setRole(result.session.role);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const logout = useCallback(async () => {
    await authLogout();
    setUserEmail("");
    setRole("read_only_viewer");
    setIsAuthenticated(false);
  }, []);

  return (
    <AdminAuthCtx.Provider value={{ userEmail, role, isAuthenticated, login, logout }}>
      {children}
    </AdminAuthCtx.Provider>
  );
}
