import { createContext, useContext, useState, useCallback, type ReactNode } from "react";
import type { AdminRole } from "./roles";
import { login as authLogin, logout as authLogout, getStoredSession } from "../services/authService";

export interface AdminAuthContext {
  userEmail: string;
  role: AdminRole;
  isAuthenticated: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
}

const defaultContext: AdminAuthContext = {
  userEmail: "",
  role: "read_only_viewer",
  isAuthenticated: false,
  login: () => ({ success: false, error: "Auth not initialized" }),
  logout: () => {},
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

  const login = useCallback((email: string, password: string) => {
    const result = authLogin(email, password);
    if (result.success && result.session) {
      setUserEmail(result.session.email);
      setRole(result.session.role);
      setIsAuthenticated(true);
    }
    return result;
  }, []);

  const logout = useCallback(() => {
    authLogout();
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
