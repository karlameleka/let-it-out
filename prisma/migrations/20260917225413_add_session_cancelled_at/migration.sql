-- AlterTable
ALTER TABLE "BookingRequest" ADD COLUMN     "cancelledAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SessionBooking" ADD COLUMN     "cancelledAt" TIMESTAMP(3);
