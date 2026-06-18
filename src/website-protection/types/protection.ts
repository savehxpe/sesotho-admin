export type SecurityEventSeverity = "info" | "low" | "medium" | "high" | "critical";
export type SecurityEventStatus = "open" | "investigating" | "resolved" | "dismissed";
export type RateLimitAction = "block" | "challenge" | "log";

export interface SecurityEvent {
  id: string;
  type: string;
  severity: SecurityEventSeverity;
  status: SecurityEventStatus;
  sourceIp: string;
  description: string;
  entityId?: string;
  userEmail?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
  resolvedAt?: string;
}

export interface AdminLoginAttempt {
  id: string;
  email: string;
  success: boolean;
  ipAddress: string;
  userAgent: string;
  failureReason?: string;
  createdAt: string;
}

export interface FailedCheckout {
  id: string;
  orderId?: string;
  customerEmail: string;
  paymentMethod: string;
  failureReason: string;
  amount: number;
  currency: string;
  ipAddress: string;
  attemptCount: number;
  createdAt: string;
}

export interface RateLimitRule {
  id: string;
  endpoint: string;
  maxRequests: number;
  windowSeconds: number;
  action: RateLimitAction;
  isActive: boolean;
  description: string;
  createdAt: string;
}

export interface ProtectionSettings {
  enableRateLimiting: boolean;
  enableBotDetection: boolean;
  enableAdminAlerts: boolean;
  maxLoginAttempts: number;
  loginLockoutMinutes: number;
  alertEmail: string;
  challengeThreshold: number;
  blockThreshold: number;
}

export interface SecurityOverview {
  totalEvents: number;
  openEvents: number;
  criticalEvents: number;
  failedLogins24h: number;
  failedCheckouts24h: number;
  blockedIps: number;
  activeRules: number;
}

export const MOCK_SECURITY_EVENTS: SecurityEvent[] = [
  { id: "evt-1", type: "failed_login", severity: "high", status: "open", sourceIp: "196.xx.xx.42", description: "Repeated failed admin login attempts", userEmail: "unknown", createdAt: "2026-06-17T23:15:00Z" },
  { id: "evt-2", type: "rate_limit_hit", severity: "medium", status: "investigating", sourceIp: "41.xx.xx.17", description: "Checkout endpoint rate limit exceeded", entityId: "checkout", createdAt: "2026-06-17T22:30:00Z" },
  { id: "evt-3", type: "failed_payment", severity: "low", status: "resolved", sourceIp: "197.xx.xx.88", description: "M-Pesa payment timeout on order SF-00125", entityId: "SF-00125", userEmail: "customer@example.co.ls", createdAt: "2026-06-17T18:00:00Z", resolvedAt: "2026-06-17T18:05:00Z" },
  { id: "evt-4", type: "suspicious_ip", severity: "critical", status: "open", sourceIp: "103.xx.xx.55", description: "Known proxy IP detected accessing admin panel", createdAt: "2026-06-17T12:00:00Z" },
];

export const MOCK_LOGIN_ATTEMPTS: AdminLoginAttempt[] = [
  { id: "la-1", email: "admin@sesothofashioning.ls", success: true, ipAddress: "196.xx.xx.1", userAgent: "Chrome 125", createdAt: "2026-06-18T08:00:00Z" },
  { id: "la-2", email: "unknown@test.com", success: false, ipAddress: "196.xx.xx.42", userAgent: "Python/requests", failureReason: "Invalid credentials", createdAt: "2026-06-17T23:10:00Z" },
  { id: "la-3", email: "unknown@test.com", success: false, ipAddress: "196.xx.xx.42", userAgent: "Python/requests", failureReason: "Invalid credentials", createdAt: "2026-06-17T23:11:00Z" },
  { id: "la-4", email: "unknown@test.com", success: false, ipAddress: "196.xx.xx.42", userAgent: "Python/requests", failureReason: "Invalid credentials", createdAt: "2026-06-17T23:12:00Z" },
  { id: "la-5", email: "admin@sesothofashioning.ls", success: true, ipAddress: "196.xx.xx.1", userAgent: "Chrome 125", createdAt: "2026-06-17T09:00:00Z" },
];

export const MOCK_RATE_LIMIT_RULES: RateLimitRule[] = [
  { id: "rl-1", endpoint: "/api/checkout", maxRequests: 30, windowSeconds: 60, action: "block", isActive: true, description: "Prevent checkout abuse", createdAt: "2026-06-01" },
  { id: "rl-2", endpoint: "/api/auth/login", maxRequests: 10, windowSeconds: 300, action: "block", isActive: true, description: "Brute force protection", createdAt: "2026-06-01" },
  { id: "rl-3", endpoint: "/api/products", maxRequests: 100, windowSeconds: 60, action: "challenge", isActive: true, description: "Scraping prevention", createdAt: "2026-06-01" },
];

export const DEFAULT_PROTECTION_SETTINGS: ProtectionSettings = {
  enableRateLimiting: true,
  enableBotDetection: true,
  enableAdminAlerts: true,
  maxLoginAttempts: 5,
  loginLockoutMinutes: 15,
  alertEmail: "security@sesothofashioning.ls",
  challengeThreshold: 50,
  blockThreshold: 100,
};
