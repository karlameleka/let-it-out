-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('INSTAPAY', 'CASH_ON_DELIVERY');

-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "paymentMethod" "PaymentMethod" NOT NULL DEFAULT 'INSTAPAY';
