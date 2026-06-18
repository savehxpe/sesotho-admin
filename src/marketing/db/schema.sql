-- Marketing module tables for Sesotho Fashioning
-- Target: Supabase / PostgreSQL 15+

CREATE TYPE campaign_status AS ENUM ('draft', 'active', 'paused', 'ended');
CREATE TYPE promo_discount_type AS ENUM ('percentage', 'fixed_amount', 'free_shipping');

CREATE TABLE campaigns (
  id          TEXT PRIMARY KEY,
  name        TEXT NOT NULL,
  description TEXT,
  start_date  DATE NOT NULL,
  end_date    DATE NOT NULL,
  status      campaign_status NOT NULL DEFAULT 'draft',
  budget      NUMERIC(12,2) NOT NULL DEFAULT 0,
  spent       NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT NOT NULL DEFAULT 'LSL',
  channel     TEXT,
  notes       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE promo_codes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code            TEXT UNIQUE NOT NULL,
  discount_type   promo_discount_type NOT NULL,
  discount_value  NUMERIC(12,2) NOT NULL,
  min_order_amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  max_uses        INT NOT NULL DEFAULT 0,
  current_uses    INT NOT NULL DEFAULT 0,
  expires_at      DATE NOT NULL,
  is_active       BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE homepage_announcements (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message     TEXT NOT NULL,
  is_active   BOOLEAN NOT NULL DEFAULT false,
  link_url    TEXT,
  link_label  TEXT,
  bg_color    TEXT NOT NULL DEFAULT '#1a1a2e',
  text_color  TEXT NOT NULL DEFAULT '#e8e8ed',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE hero_messages (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  headline     TEXT NOT NULL,
  subheadline  TEXT,
  cta_text     TEXT,
  cta_link     TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  image_url    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE featured_products (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  TEXT NOT NULL,
  product_name TEXT NOT NULL,
  product_image TEXT,
  priority    INT NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
