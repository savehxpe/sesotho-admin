import { useState, useEffect } from "react";
import type { SecurityEvent, AdminLoginAttempt, FailedCheckout, RateLimitRule, ProtectionSettings, SecurityOverview } from "../types/protection";
import {
  getSecurityOverview,
  getSecurityEvents,
  getLoginAttempts,
  getFailedCheckouts,
  getRateLimitRules,
  getProtectionSettings,
} from "../services/protectionService";

type ActiveTab = "overview" | "events" | "logins" | "checkouts" | "ratelimit" | "settings";

function StatusBadge({ status }: { status: string }) {
  const cls = status === "resolved" || status === "dismissed" ? "status-paid"
    : status === "investigating" ? "status-pending"
    : status === "open" ? "status-failed"
    : "";
  return <span className={`status-pill ${cls}`}>{status}</span>;
}

function SeverityBadge({ severity }: { severity: string }) {
  const cls = severity === "critical" ? "status-failed"
    : severity === "high" ? "status-pending"
    : severity === "medium" ? "status-pending"
    : "";
  return <span className={`status-pill ${cls}`} style={severity === "critical" ? { background: "rgba(239,68,68,0.15)", color: "#ef4444" } : {}}>{severity}</span>;
}

function fmtDate(iso: string) {
  return new Date(iso).toLocaleString("en-ZA", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
}

function OverviewCards({ overview }: { overview: SecurityOverview }) {
  const cards = [
    { label: "Total Events", value: overview.totalEvents, sub: "All time" },
    { label: "Open Events", value: overview.openEvents, variant: "warn", sub: "Needs review" },
    { label: "Critical", value: overview.criticalEvents, variant: "danger", sub: "Immediate action" },
    { label: "Failed Logins (24h)", value: overview.failedLogins24h, variant: "warn" },
    { label: "Failed Checkouts (24h)", value: overview.failedCheckouts24h, variant: "warn" },
    { label: "Blocked IPs", value: overview.blockedIps, sub: "Active blocks" },
    { label: "Active Rules", value: overview.activeRules, sub: "Rate limit rules" },
  ];
  return (
    <div className="sf-cards">
      {cards.map((c) => (
        <div key={c.label} className={`sf-card ${c.variant ? `sf-card-${c.variant}` : ""}`}>
          <div className="sf-card-label">{c.label}</div>
          <div className="sf-card-value">{c.value}</div>
          {c.sub && <div className="sf-card-sub">{c.sub}</div>}
        </div>
      ))}
    </div>
  );
}

function SecurityEventsList({ events }: { events: SecurityEvent[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Security Events</div>
        <span style={{ fontSize: "11px", color: "var(--color-text-tertiary)" }}>{events.length} total</span>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Type</th><th>Severity</th><th>Status</th><th>Source IP</th><th>Description</th><th>Time</th></tr>
          </thead>
          <tbody>
            {events.map((e) => (
              <tr key={e.id}>
                <td><span className="method-pill">{e.type.replace(/_/g, " ")}</span></td>
                <td><SeverityBadge severity={e.severity} /></td>
                <td><StatusBadge status={e.status} /></td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>{e.sourceIp}</td>
                <td style={{ color: "var(--color-text-secondary)" }}>{e.description}</td>
                <td style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>{fmtDate(e.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function LoginAttemptsList({ attempts }: { attempts: AdminLoginAttempt[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Admin Login Attempts</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Email</th><th>Result</th><th>IP Address</th><th>User Agent</th><th>Time</th></tr>
          </thead>
          <tbody>
            {attempts.map((a) => (
              <tr key={a.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{a.email}</td>
                <td><StatusBadge status={a.success ? "success" : "failed"} /></td>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>{a.ipAddress}</td>
                <td style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>{a.userAgent}</td>
                <td style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>{fmtDate(a.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function FailedCheckoutsList({ checkouts }: { checkouts: FailedCheckout[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Failed Checkouts / Payments</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Order</th><th>Customer</th><th>Method</th><th>Amount</th><th>Reason</th><th>Attempts</th><th>Time</th></tr>
          </thead>
          <tbody>
            {checkouts.map((c) => (
              <tr key={c.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--color-text-secondary)" }}>{c.orderId || "—"}</td>
                <td>{c.customerEmail}</td>
                <td><span className="method-pill">{c.paymentMethod}</span></td>
                <td style={{ fontWeight: 500 }}>LSL {c.amount.toFixed(2)}</td>
                <td style={{ color: "var(--color-text-danger)", fontSize: "11px" }}>{c.failureReason}</td>
                <td>{c.attemptCount}</td>
                <td style={{ color: "var(--color-text-tertiary)", fontSize: "11px" }}>{fmtDate(c.createdAt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function RateLimitRulesList({ rules }: { rules: RateLimitRule[] }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Rate Limit Rules</div>
      </div>
      <div className="sf-table-wrap">
        <table className="sf-table">
          <thead>
            <tr><th>Endpoint</th><th>Max Requests</th><th>Window</th><th>Action</th><th>Status</th><th>Description</th></tr>
          </thead>
          <tbody>
            {rules.map((r) => (
              <tr key={r.id}>
                <td style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>{r.endpoint}</td>
                <td>{r.maxRequests}</td>
                <td>{r.windowSeconds}s</td>
                <td><span className="method-pill">{r.action}</span></td>
                <td><StatusBadge status={r.isActive ? "active" : "inactive"} /></td>
                <td style={{ color: "var(--color-text-secondary)" }}>{r.description}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function ProtectionSettingsPanel({ settings }: { settings: ProtectionSettings }) {
  return (
    <>
      <div className="sf-section-head">
        <div className="sf-section-title">Protection Settings</div>
      </div>
      <div className="sf-cards">
        <div className="sf-card">
          <div className="sf-card-label">Rate Limiting</div>
          <div className="sf-card-value" style={{ fontSize: "14px" }}>{settings.enableRateLimiting ? "Enabled" : "Disabled"}</div>
          <div className="sf-card-sub">Max {settings.maxLoginAttempts} login attempts, {settings.loginLockoutMinutes}min lockout</div>
        </div>
        <div className="sf-card">
          <div className="sf-card-label">Bot Detection</div>
          <div className="sf-card-value" style={{ fontSize: "14px" }}>{settings.enableBotDetection ? "Enabled" : "Disabled"}</div>
          <div className="sf-card-sub">Challenge at {settings.challengeThreshold}rpm, block at {settings.blockThreshold}rpm</div>
        </div>
        <div className="sf-card">
          <div className="sf-card-label">Admin Alerts</div>
          <div className="sf-card-value" style={{ fontSize: "14px" }}>{settings.enableAdminAlerts ? "Enabled" : "Disabled"}</div>
          <div className="sf-card-sub">Alerts sent to {settings.alertEmail}</div>
        </div>
      </div>
    </>
  );
}

export function ProtectionDashboard() {
  const [activeTab, setActiveTab] = useState<ActiveTab>("overview");
  const [overview, setOverview] = useState<SecurityOverview | null>(null);
  const [events, setEvents] = useState<SecurityEvent[]>([]);
  const [loginAttempts, setLoginAttempts] = useState<AdminLoginAttempt[]>([]);
  const [failedCheckouts, setFailedCheckouts] = useState<FailedCheckout[]>([]);
  const [rateLimitRules, setRateLimitRules] = useState<RateLimitRule[]>([]);
  const [settings, setSettings] = useState<ProtectionSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      getSecurityOverview().then(setOverview),
      getSecurityEvents().then(setEvents),
      getLoginAttempts().then(setLoginAttempts),
      getFailedCheckouts().then(setFailedCheckouts),
      getRateLimitRules().then(setRateLimitRules),
      getProtectionSettings().then(setSettings),
    ]).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="sf-empty">
        <i className="ti ti-loader" aria-hidden="true" />
        <p>Loading protection data…</p>
      </div>
    );
  }

  return (
    <div className="sf-shell" style={{ padding: 0, maxWidth: "100%" }}>
      <div className="sf-tabs" role="tablist">
        {(["overview", "events", "logins", "checkouts", "ratelimit", "settings"] as ActiveTab[]).map((tab) => (
          <button
            key={tab}
            role="tab"
            aria-selected={activeTab === tab}
            className={`sf-tab ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab === "overview" ? "Overview" : tab === "events" ? "Security Events" : tab === "logins" ? "Logins" : tab === "checkouts" ? "Failed Checkouts" : tab === "ratelimit" ? "Rate Limits" : "Settings"}
          </button>
        ))}
      </div>

      {activeTab === "overview" && overview && <OverviewCards overview={overview} />}
      {activeTab === "events" && <SecurityEventsList events={events} />}
      {activeTab === "logins" && <LoginAttemptsList attempts={loginAttempts} />}
      {activeTab === "checkouts" && <FailedCheckoutsList checkouts={failedCheckouts} />}
      {activeTab === "ratelimit" && <RateLimitRulesList rules={rateLimitRules} />}
      {activeTab === "settings" && settings && <ProtectionSettingsPanel settings={settings} />}
    </div>
  );
}
