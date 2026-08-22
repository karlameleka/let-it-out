-- Phone number, collected at signup and usable as an alternate login
-- identifier alongside email. Nullable since accounts created via Google
-- sign-in don't go through the form that collects it.
ALTER TABLE "User" ADD COLUMN "phone" TEXT;
ALTER TABLE "User" ADD CONSTRAINT "User_phone_key" UNIQUE ("phone");
