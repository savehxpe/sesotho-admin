import { createContext, useContext } from "react";
import type { AdminRole } from "./roles";

export interface AdminAuthContext {
  userEmail: string;
  role: AdminRole;
  isAuthenticated: boolean;
}

export const AdminAuthCtx = createContext<AdminAuthContext>({
  userEmail: "",
  role: "read_only_viewer",
  isAuthenticated: false,
});

export function useAdminAuth(): AdminAuthContext {
  return useContext(AdminAuthCtx);
}
