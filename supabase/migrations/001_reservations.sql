-- Product reservation table
-- Tracks 48-hour wire-transfer holds on 1-of-1 items.
-- IMPORTANT: status 'reserved' NEVER auto-transitions to 'released'.
-- The cron job transitions 'reserved' → 'admin_hold' on expiry and notifies
-- the store owner. Only the admin /api/admin/release-item endpoint can release.
--
-- Status lifecycle:
--   reserved   → admin_hold  (cron: expires_at passed, admin must review)
--   admin_hold → released    (admin manually releases after confirming no wire)
--   reserved   → completed   (webhook: payment_intent.succeeded received)

CREATE TABLE IF NOT EXISTS product_reservations (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id            TEXT        NOT NULL,
  product_id         TEXT        NOT NULL,
  stripe_pi_id       TEXT,                              -- Stripe PaymentIntent ID
  status             TEXT        NOT NULL DEFAULT 'reserved',
  reserved_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at         TIMESTAMPTZ NOT NULL,              -- reserved_at + 48 hours
  admin_notified_at  TIMESTAMPTZ,                       -- set when notification email sent
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),

  CONSTRAINT reservations_status_check CHECK (
    status IN ('reserved', 'admin_hold', 'released', 'completed')
  )
);

CREATE INDEX IF NOT EXISTS idx_reservations_product
  ON product_reservations (product_id);

CREATE INDEX IF NOT EXISTS idx_reservations_status_expires
  ON product_reservations (status, expires_at);

CREATE INDEX IF NOT EXISTS idx_reservations_stripe_pi
  ON product_reservations (stripe_pi_id);

-- Auto-update updated_at on every row change
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER reservations_updated_at
  BEFORE UPDATE ON product_reservations
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Row-level security: only service_role key can write; anon key can read status
ALTER TABLE product_reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON product_reservations
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "anon_read_status" ON product_reservations
  FOR SELECT
  TO anon
  USING (true);
