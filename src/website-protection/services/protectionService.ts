import type { SecurityEvent, AdminLoginAttempt, FailedCheckout, RateLimitRule, ProtectionSettings, SecurityOverview } from "../types/protection";
import { MOCK_SECURITY_EVENTS, MOCK_LOGIN_ATTEMPTS, MOCK_RATE_LIMIT_RULES, DEFAULT_PROTECTION_SETTINGS } from "../types/protection";

const delay = (ms = 100) => new Promise((r) => setTimeout(r, ms));

export async function getSecurityOverview(): Promise<SecurityOverview> {
  await delay();
  const events = MOCK_SECURITY_EVENTS;
  return {
    totalEvents: events.length,
    openEvents: events.filter((e) => e.status === "open").length,
    criticalEvents: events.filter((e) => e.severity === "critical").length,
    failedLogins24h: MOCK_LOGIN_ATTEMPTS.filter((a) => !a.success).length,
    failedCheckouts24h: 2,
    blockedIps: 1,
    activeRules: MOCK_RATE_LIMIT_RULES.filter((r) => r.isActive).length,
  };
}

export async function getSecurityEvents(): Promise<SecurityEvent[]> {
  await delay();
  return MOCK_SECURITY_EVENTS;
}

export async function getLoginAttempts(): Promise<AdminLoginAttempt[]> {
  await delay();
  return MOCK_LOGIN_ATTEMPTS;
}

export async function getFailedCheckouts(): Promise<FailedCheckout[]> {
  await delay();
  return [
    { id: "fc-1", orderId: "SF-00125", customerEmail: "customer@example.co.ls", paymentMethod: "M-Pesa", failureReason: "STK push timeout", amount: 1250, currency: "LSL", ipAddress: "197.xx.xx.88", attemptCount: 2, createdAt: "2026-06-17T18:00:00Z" },
    { id: "fc-2", customerEmail: "guest@example.com", paymentMethod: "NedSecure/iVeri", failureReason: "Gateway 500 error", amount: 920, currency: "ZAR", ipAddress: "41.xx.xx.17", attemptCount: 1, createdAt: "2026-06-17T16:30:00Z" },
  ];
}

export async function getRateLimitRules(): Promise<RateLimitRule[]> {
  await delay();
  return MOCK_RATE_LIMIT_RULES;
}

export async function getProtectionSettings(): Promise<ProtectionSettings> {
  await delay();
  return DEFAULT_PROTECTION_SETTINGS;
}
