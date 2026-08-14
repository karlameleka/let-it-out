-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "country" TEXT,
ADD COLUMN     "googleMapsLink" TEXT,
ADD COLUMN     "governorate" TEXT,
ADD COLUMN     "shippingFeeEGP" INTEGER NOT NULL DEFAULT 0;
