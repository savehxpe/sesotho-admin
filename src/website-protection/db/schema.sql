-- Website Protection module tables for Sesotho Fashioning
-- Target: Supabase / PostgreSQL 15+

CREATE TYPE security_event_severity AS ENUM ('info', 'low', 'medium', 'high', 'critical');
CREATE TYPE security_event_status AS ENUM ('open', 'investigating', 'resolved', 'dismissed');
CREATE TYPE rate_limit_action AS ENUM ('block', 'challenge', 'log');

CREATE TABLE security_events (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type        TEXT NOT NULL,
  severity    security_event_severity NOT NULL,
  status      security_event_status NOT NULL DEFAULT 'open',
  source_ip   INET,
  description TEXT NOT NULL,
  entity_id   TEXT,
  user_email  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

CREATE INDEX idx_security_events_severity ON security_events(severity);
CREATE INDEX idx_security_events_status ON security_events(status);
CREATE INDEX idx_security_events_created ON security_events(created_at DESC);

CREATE TABLE admin_login_attempts (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email          TEXT NOT NULL,
  success        BOOLEAN NOT NULL,
  ip_address     INET,
  user_agent     TEXT,
  failure_reason TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_admin_login_attempts_email ON admin_login_attempts(email);
CREATE INDEX idx_admin_login_attempts_created ON admin_login_attempts(created_at DESC);

CREATE TABLE failed_checkouts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id        TEXT,
  customer_email  TEXT NOT NULL,
  payment_method  TEXT NOT NULL,
  failure_reason  TEXT NOT NULL,
  amount          NUMERIC(12,2) NOT NULL,
  currency        TEXT NOT NULL,
  ip_address      INET,
  attempt_count   INT NOT NULL DEFAULT 1,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE rate_limit_rules (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint        TEXT NOT NULL,
  max_requests    INT NOT NULL,
  window_seconds  INT NOT NULL,
  action          rate_limit_action NOT NULL DEFAULT 'block',
  is_active       BOOLEAN NOT NULL DEFAULT true,
  description     TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE protection_settings (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  enable_rate_limiting  BOOLEAN NOT NULL DEFAULT true,
  enable_bot_detection  BOOLEAN NOT NULL DEFAULT true,
  enable_admin_alerts   BOOLEAN NOT NULL DEFAULT true,
  max_login_attempts    INT NOT NULL DEFAULT 5,
  login_lockout_minutes INT NOT NULL DEFAULT 15,
  alert_email           TEXT,
  challenge_threshold   INT NOT NULL DEFAULT 50,
  block_threshold       INT NOT NULL DEFAULT 100,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
