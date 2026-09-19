-- Hashed bearer tokens for guest order/booking confirmation pages — the
-- cuid() id alone is not a cryptographically random secret, so relying on
-- it as the only "proof of ownership" for a guest (no-login) checkout is an
-- IDOR risk. Nullable so existing rows (placed before this shipped) keep
-- working under the old id-only access rule; every row created from here on
-- always gets a real token (see order-access.ts / order-actions.ts /
-- session-booking-actions.ts).
ALTER TABLE "Order" ADD COLUMN "accessTokenHash" TEXT;
ALTER TABLE "SessionBooking" ADD COLUMN "accessTokenHash" TEXT;
