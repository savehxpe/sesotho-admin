import type { AdminRole } from "../rbac/roles";
import { supabase, isSupabaseConfigured } from "./supabase";

const SESSION_KEY = "sesotho_admin_session";

interface StoredSession {
  email: string;
  role: AdminRole;
}

// ─── Mock credentials (fallback when Supabase not configured) ──────────────

const MOCK_CREDENTIALS: Record<string, { password: string; role: AdminRole }> = {
  "team@outworldcreative.com": { password: "askmeagain123$", role: "super_admin" },
  "sammyoppenheimer3@gmail.com": { password: "sammy123", role: "read_only_viewer" },
  "accounting@sesothofashioning.ls": { password: "accounting123", role: "accounting_admin" },
  "marketing@sesothofashioning.ls": { password: "marketing123", role: "marketing_admin" },
  "security@sesothofashioning.ls": { password: "security123", role: "security_admin" },
  "viewer@sesothofashioning.ls": { password: "viewer123", role: "read_only_viewer" },
};

// ─── Session helpers ──────────────────────────────────────────────────────

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

// ─── Login ────────────────────────────────────────────────────────────────

export async function login(email: string, password: string): Promise<LoginResult> {
  const trimmedEmail = email.trim().toLowerCase();

  if (isSupabaseConfigured()) {
    return loginWithSupabase(trimmedEmail, password);
  }

  return loginWithMock(trimmedEmail, password);
}

async function loginWithSupabase(email: string, password: string): Promise<LoginResult> {
  const { error: authError } = await supabase!.auth.signInWithPassword({
    email,
    password,
  });

  if (authError) {
    return { success: false, error: authError.message };
  }

  // Fetch role from admin_users table
  const { data: userData, error: userError } = await supabase!
    .from("admin_users")
    .select("role")
    .eq("email", email)
    .single();

  if (userError || !userData) {
    await supabase!.auth.signOut();
    return { success: false, error: "No admin role assigned to this account." };
  }

  const role = userData.role as AdminRole;
  const session: StoredSession = { email, role };
  saveSession(session);
  return { success: true, session };
}

function loginWithMock(email: string, password: string): LoginResult {
  const entry = MOCK_CREDENTIALS[email];

  if (!entry) {
    return { success: false, error: "No account found with this email." };
  }

  if (entry.password !== password) {
    return { success: false, error: "Incorrect password." };
  }

  const session: StoredSession = { email, role: entry.role };
  saveSession(session);
  return { success: true, session };
}

// ─── Logout ───────────────────────────────────────────────────────────────

export async function logout(): Promise<void> {
  if (isSupabaseConfigured()) {
    await supabase!.auth.signOut();
  }
  clearSession();
}

export function isLoggedIn(): boolean {
  return getStoredSession() !== null;
}
