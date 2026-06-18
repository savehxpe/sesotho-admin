-- ─── Sesotho Fashioning · Accounting Database Schema ─────────────────────────
-- Target: Supabase / PostgreSQL 15+
-- Run via Supabase migrations or psql
-- All monetary values stored as NUMERIC(12,2) — never FLOAT.
-- Row Level Security (RLS) enabled on all accounting tables.

-- ─── Extensions ───────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ─── Enums ────────────────────────────────────────────────────────────────────
CREATE TYPE currency_code        AS ENUM ('LSL', 'ZAR');
CREATE TYPE payment_method_type  AS ENUM ('M-Pesa', 'NedSecure/iVeri');
CREATE TYPE payment_status_type  AS ENUM ('pending', 'paid', 'failed', 'refunded');
CREATE TYPE order_status_type    AS ENUM ('placed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE payout_status_type   AS ENUM ('pending', 'processing', 'settled', 'failed');
CREATE TYPE invoice_status_type  AS ENUM ('draft', 'issued', 'paid', 'void');
CREATE TYPE refund_status_type   AS ENUM ('requested', 'processing', 'completed', 'rejected');
CREATE TYPE accounting_role_type AS ENUM ('super_admin', 'accounting_admin', 'read_only_viewer', 'marketing_admin');
CREATE TYPE audit_action_type    AS ENUM (
  'view_dashboard', 'view_transactions', 'view_transaction_detail',
  'create_export', 'download_export', 'add_note',
  'update_payout_status', 'update_refund_status',
  'view_audit_log', 'change_role'
);

-- ─── orders ───────────────────────────────────────────────────────────────────
CREATE TABLE orders (
  id                TEXT PRIMARY KEY,              -- e.g. SF-00124
  customer_name     TEXT NOT NULL,
  customer_email    TEXT NOT NULL,
  customer_phone    TEXT,
  subtotal          NUMERIC(12,2) NOT NULL,        -- server-computed
  shipping          NUMERIC(12,2) NOT NULL DEFAULT 0,
  total             NUMERIC(12,2) NOT NULL,        -- server-authoritative, NEVER trust client
  currency          currency_code NOT NULL DEFAULT 'LSL',
  payment_method    payment_method_type,
  payment_status    payment_status_type NOT NULL DEFAULT 'pending',
  order_status      order_status_type NOT NULL DEFAULT 'placed',
  transaction_ref   TEXT,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── order_items ──────────────────────────────────────────────────────────────
CREATE TABLE order_items (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id   UUID NOT NULL,
  product_name TEXT NOT NULL,
  quantity     INT NOT NULL CHECK (quantity > 0),
  unit_price   NUMERIC(12,2) NOT NULL CHECK (unit_price >= 0),
  line_total   NUMERIC(12,2) NOT NULL CHECK (line_total >= 0),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);

-- ─── transactions ─────────────────────────────────────────────────────────────
-- One transaction record per payment attempt (may be multiple per order on retry).
-- raw_event stores the provider webhook payload — NEVER expose this to the UI.
CREATE TABLE transactions (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id     TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  provider     payment_method_type NOT NULL,
  provider_ref TEXT,
  amount       NUMERIC(12,2) NOT NULL,
  currency     currency_code NOT NULL,
  status       payment_status_type NOT NULL DEFAULT 'pending',
  raw_event    JSONB,                              -- never forwarded to frontend
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_transactions_order_id ON transactions(order_id);

-- ─── payouts ─────────────────────────────────────────────────────────────────
CREATE TABLE payouts (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  period_start         DATE NOT NULL,
  period_end           DATE NOT NULL,
  amount               NUMERIC(12,2) NOT NULL,
  currency             currency_code NOT NULL,
  status               payout_status_type NOT NULL DEFAULT 'pending',
  provider             payment_method_type,
  provider_ref         TEXT,
  reconciliation_note  TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at           TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CHECK (period_end >= period_start)
);

-- ─── invoices ────────────────────────────────────────────────────────────────
CREATE TABLE invoices (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL,
  order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  customer_name  TEXT NOT NULL,
  customer_email TEXT NOT NULL,
  amount         NUMERIC(12,2) NOT NULL,
  currency       currency_code NOT NULL,
  status         invoice_status_type NOT NULL DEFAULT 'draft',
  issued_at      TIMESTAMPTZ,
  paid_at        TIMESTAMPTZ,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_invoices_order_id ON invoices(order_id);

-- ─── refunds ──────────────────────────────────────────────────────────────────
CREATE TABLE refunds (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id       TEXT NOT NULL REFERENCES orders(id) ON DELETE RESTRICT,
  transaction_id UUID REFERENCES transactions(id),
  amount         NUMERIC(12,2) NOT NULL CHECK (amount > 0),
  currency       currency_code NOT NULL,
  reason         TEXT NOT NULL,
  status         refund_status_type NOT NULL DEFAULT 'requested',
  provider_ref   TEXT,
  processed_at   TIMESTAMPTZ,
  note           TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_refunds_order_id ON refunds(order_id);

-- ─── accounting_notes ─────────────────────────────────────────────────────────
CREATE TABLE accounting_notes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type  TEXT NOT NULL CHECK (entity_type IN ('order','transaction','payout','refund')),
  entity_id    TEXT NOT NULL,
  note         TEXT NOT NULL,
  author_email TEXT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_accounting_notes_entity ON accounting_notes(entity_type, entity_id);

-- ─── accounting_exports ───────────────────────────────────────────────────────
CREATE TABLE accounting_exports (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_by      TEXT NOT NULL,
  filter_snapshot JSONB NOT NULL,   -- snapshot of TransactionFilters at export time
  row_count       INT NOT NULL,
  file_name       TEXT NOT NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── audit_log ────────────────────────────────────────────────────────────────
-- Append-only. No UPDATE or DELETE ever runs on this table.
-- Grant only INSERT to the accounting service role.
CREATE TABLE audit_log (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action     audit_action_type NOT NULL,
  actor      TEXT NOT NULL,          -- email of the authenticated user
  role       accounting_role_type NOT NULL,
  entity_id  TEXT,
  detail     TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_audit_log_actor     ON audit_log(actor);
CREATE INDEX idx_audit_log_created   ON audit_log(created_at DESC);
CREATE INDEX idx_audit_log_entity    ON audit_log(entity_id) WHERE entity_id IS NOT NULL;

-- Prevent any modification of existing audit records
CREATE RULE no_update_audit AS ON UPDATE TO audit_log DO INSTEAD NOTHING;
CREATE RULE no_delete_audit AS ON DELETE TO audit_log DO INSTEAD NOTHING;

-- ─── Updated-at trigger ───────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_orders_updated_at   BEFORE UPDATE ON orders   FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_payouts_updated_at  BEFORE UPDATE ON payouts  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
-- Enable RLS on all accounting tables. Policies defined per role in Supabase dashboard
-- or via ALTER POLICY statements tied to auth.uid() → user_roles table.
ALTER TABLE orders            ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions      ENABLE ROW LEVEL SECURITY;
ALTER TABLE payouts           ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices          ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds           ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_notes  ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounting_exports ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log         ENABLE ROW LEVEL SECURITY;

-- Example policy (repeat per table, per role):
-- CREATE POLICY "accounting_admin_read_orders" ON orders
--   FOR SELECT TO authenticated
--   USING (
--     EXISTS (
--       SELECT 1 FROM user_roles
--       WHERE user_roles.user_id = auth.uid()
--         AND user_roles.role IN ('super_admin', 'accounting_admin', 'read_only_viewer')
--     )
--   );
