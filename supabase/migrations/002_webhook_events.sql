-- Idempotency log for Stripe webhook events (Boundary 1).
-- Before processing any event, the webhook handler checks this table.
-- If the event ID already exists, it returns 200 immediately without re-running
-- business logic — preventing double-orders or double-inventory updates on
-- Stripe's automatic delivery retries.

CREATE TABLE IF NOT EXISTS processed_webhook_events (
  stripe_event_id  TEXT        PRIMARY KEY,
  event_type       TEXT        NOT NULL,
  processed_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Row-level security: only service_role can read/write
ALTER TABLE processed_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role_all" ON processed_webhook_events
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);
