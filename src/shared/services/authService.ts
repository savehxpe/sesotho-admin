import type { AdminRole } from "../rbac/roles";

const SESSION_KEY = "sesotho_admin_session";

interface StoredSession {
  email: string;
  role: AdminRole;
}

const ADMIN_CREDENTIALS: Record<string, { password: string; role: AdminRole }> = {
  "team@outworldcreative.com": { password: "askmeagain123$", role: "super_admin" },
  "accounting@sesothofashioning.ls": { password: "accounting123", role: "accounting_admin" },
  "marketing@sesothofashioning.ls": { password: "marketing123", role: "marketing_admin" },
  "security@sesothofashioning.ls": { password: "security123", role: "security_admin" },
  "viewer@sesothofashioning.ls": { password: "viewer123", role: "read_only_viewer" },
};

export function getStoredSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function saveSession(session: StoredSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

function clearSession(): void {
  localStorage.removeItem(SESSION_KEY);
}

export interface LoginResult {
  success: boolean;
  error?: string;
  session?: StoredSession;
}

export function login(email: string, password: string): LoginResult {
  const trimmedEmail = email.trim().toLowerCase();
  const entry = ADMIN_CREDENTIALS[trimmedEmail];

  if (!entry) {
    return { success: false, error: "No account found with this email." };
  }

  if (entry.password !== password) {
    return { success: false, error: "Incorrect password." };
  }

  const session: StoredSession = { email: trimmedEmail, role: entry.role };
  saveSession(session);
  return { success: true, session };
}

export function logout(): void {
  clearSession();
}

export function isLoggedIn(): boolean {
  return getStoredSession() !== null;
}
