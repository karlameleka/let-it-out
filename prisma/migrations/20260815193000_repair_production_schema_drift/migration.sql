-- Repair migration: production's `_prisma_migrations` table has several
-- earlier migrations marked as applied whose DDL never actually landed
-- (PushSubscription, Lead, ResourceNotifySignup, and SessionBooking tables
-- were all missing; Counselor was missing priceEGP and languages) — almost
-- certainly from `prisma migrate resolve` being run manually during an
-- earlier troubleshooting session while the CLI's datasource pointed at a
-- pooled connection that couldn't reliably run migration DDL (see
-- prisma.config.ts for that fix).
--
-- Every statement below is written to be safe to run against a database in
-- ANY partial state, including one that's already fully up to date, so it
-- can't cause harm regardless of exactly which pieces are missing.

-- ============ Enums ============

DO $$ BEGIN
  CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SessionType" AS ENUM ('INDIVIDUAL_COUNSELING', 'COUPLES_COUNSELING', 'FOLLOW_UP', 'OTHER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "InquiryStatus" AS ENUM ('NEW', 'IN_DISCUSSION', 'SCHEDULED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductCategory" AS ENUM ('JOURNAL');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "ProductFormat" AS ENUM ('PHYSICAL', 'EBOOK');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "OrderStatus" AS ENUM ('PENDING_PAYMENT', 'PAYMENT_SUBMITTED', 'CONFIRMED', 'SHIPPED', 'COMPLETED', 'CANCELLED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "PaymentMethod" AS ENUM ('INSTAPAY', 'CASH_ON_DELIVERY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS 'PAYMOB';

DO $$ BEGIN
  CREATE TYPE "LeadType" AS ENUM ('WORKSHOP_LEAD', 'COUNSELING_INQUIRY', 'JOURNAL_CUSTOMER', 'GENERAL_INQUIRY');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
ALTER TYPE "LeadType" ADD VALUE IF NOT EXISTS 'ACCOUNT_SIGNUP';
ALTER TYPE "LeadType" ADD VALUE IF NOT EXISTS 'RESOURCE_NOTIFY';

DO $$ BEGIN
  CREATE TYPE "LeadStatus" AS ENUM ('NEW', 'CONTACTED', 'QUALIFIED', 'CONVERTED', 'LOST');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE TYPE "SessionBookingStatus" AS ENUM ('PENDING_PAYMENT', 'CONFIRMED');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ Tables ============

CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Counselor" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "credentials" TEXT NOT NULL,
    "bio" TEXT NOT NULL,
    "specialties" TEXT[],
    "photoUrl" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Counselor_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "BookingRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "counselorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "sessionType" "SessionType" NOT NULL DEFAULT 'INDIVIDUAL_COUNSELING',
    "preferredDate" TEXT NOT NULL,
    "preferredTime" TEXT NOT NULL,
    "message" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkshopInquiry" (
    "id" TEXT NOT NULL,
    "organizationName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "workshopTopic" TEXT NOT NULL,
    "groupSize" TEXT,
    "preferredDates" TEXT,
    "message" TEXT,
    "status" "InquiryStatus" NOT NULL DEFAULT 'NEW',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkshopInquiry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Product" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "category" "ProductCategory" NOT NULL DEFAULT 'JOURNAL',
    "coverImageUrl" TEXT,
    "durationDays" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ProductVariant" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "format" "ProductFormat" NOT NULL,
    "priceEGP" INTEGER NOT NULL,
    "sku" TEXT NOT NULL,
    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Order" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "guestName" TEXT NOT NULL,
    "guestEmail" TEXT NOT NULL,
    "guestPhone" TEXT NOT NULL,
    "shippingAddress" TEXT,
    "needsShipping" BOOLEAN NOT NULL DEFAULT false,
    "subtotalEGP" INTEGER NOT NULL,
    "totalEGP" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentRef" TEXT,
    "paymentNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "OrderItem" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productVariantId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "unitPriceEGP" INTEGER NOT NULL,
    "titleSnapshot" TEXT NOT NULL,
    "formatSnapshot" "ProductFormat" NOT NULL,
    CONSTRAINT "OrderItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalPrompt" (
    "id" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "category" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    CONSTRAINT "JournalPrompt_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "JournalEntry" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "promptId" TEXT,
    "content" TEXT NOT NULL,
    "mood" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "JournalEntry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ContactMessage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ContactMessage_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "WorkshopInterestSignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "WorkshopInterestSignup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "PushSubscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "endpoint" TEXT NOT NULL,
    "p256dh" TEXT NOT NULL,
    "auth" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PushSubscription_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "Lead" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "LeadType" NOT NULL,
    "status" "LeadStatus" NOT NULL DEFAULT 'NEW',
    "email" TEXT,
    "phone" TEXT,
    "source" TEXT,
    "sessionType" TEXT,
    "groupSize" INTEGER,
    "orderTotalEGP" INTEGER,
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "ResourceNotifySignup" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ResourceNotifySignup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "SessionBooking" (
    "id" TEXT NOT NULL,
    "counselorId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "preferredDate" TEXT NOT NULL,
    "priceEGP" INTEGER NOT NULL,
    "status" "SessionBookingStatus" NOT NULL DEFAULT 'PENDING_PAYMENT',
    "paymentRef" TEXT,
    "paymentNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "SessionBooking_pkey" PRIMARY KEY ("id")
);

-- ============ Columns added by later migrations ============

ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'INSTAPAY';
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "googleMapsLink" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "governorate" TEXT;
ALTER TABLE "Order" ADD COLUMN IF NOT EXISTS "shippingFeeEGP" INTEGER NOT NULL DEFAULT 0;

ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "bookingUrl" TEXT;
ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "priceEGP" INTEGER;
ALTER TABLE "Counselor" ADD COLUMN IF NOT EXISTS "languages" TEXT[] NOT NULL DEFAULT '{}';

ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenHash" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "resetTokenExpiresAt" TIMESTAMP(3);
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "ageRange" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "gender" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "country" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "referralSource" TEXT;
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "journalLockEnabled" BOOLEAN NOT NULL DEFAULT false;

ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "bookmarked" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "JournalEntry" ADD COLUMN IF NOT EXISTS "photoUrl" TEXT;

-- ============ Indexes ============

CREATE UNIQUE INDEX IF NOT EXISTS "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX IF NOT EXISTS "User_resetTokenHash_key" ON "User"("resetTokenHash");
CREATE UNIQUE INDEX IF NOT EXISTS "Counselor_slug_key" ON "Counselor"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "Product_slug_key" ON "Product"("slug");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_sku_key" ON "ProductVariant"("sku");
CREATE UNIQUE INDEX IF NOT EXISTS "ProductVariant_productId_format_key" ON "ProductVariant"("productId", "format");
CREATE UNIQUE INDEX IF NOT EXISTS "JournalPrompt_dayNumber_key" ON "JournalPrompt"("dayNumber");
CREATE UNIQUE INDEX IF NOT EXISTS "PushSubscription_endpoint_key" ON "PushSubscription"("endpoint");

-- ============ Foreign keys (guarded — ADD CONSTRAINT has no IF NOT EXISTS) ============

DO $$ BEGIN
  ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "BookingRequest" ADD CONSTRAINT "BookingRequest_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "JournalEntry" ADD CONSTRAINT "JournalEntry_promptId_fkey" FOREIGN KEY ("promptId") REFERENCES "JournalPrompt"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "PushSubscription" ADD CONSTRAINT "PushSubscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  ALTER TABLE "SessionBooking" ADD CONSTRAINT "SessionBooking_counselorId_fkey" FOREIGN KEY ("counselorId") REFERENCES "Counselor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- ============ Data backfill (idempotent — fixed values, safe to re-run) ============

UPDATE "Counselor"
SET "priceEGP" = 1000,
    "photoUrl" = '/counselors/verna-awad.jpg',
    "languages" = ARRAY['English', 'Arabic']
WHERE "slug" = 'verna-awad';

UPDATE "Counselor"
SET "priceEGP" = 800,
    "photoUrl" = '/counselors/karla-meleka.jpg',
    "languages" = ARRAY['English', 'Arabic', 'French']
WHERE "slug" = 'karla-meleka';
