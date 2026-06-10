-- Add customer_email to product_reservations so admins can contact buyers when a hold expires.
ALTER TABLE product_reservations
  ADD COLUMN IF NOT EXISTS customer_email TEXT;

-- Unique partial index prevents concurrent wire reservations for the same product.
-- A product can only have one active hold at a time (reserved or admin_hold or completed).
CREATE UNIQUE INDEX IF NOT EXISTS idx_reservations_product_active
  ON product_reservations (product_id)
  WHERE status IN ('reserved', 'admin_hold', 'completed');
