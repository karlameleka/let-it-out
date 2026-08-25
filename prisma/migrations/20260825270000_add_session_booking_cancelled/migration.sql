-- Lets a client cancel their own paid session booking from /upcoming.
ALTER TYPE "SessionBookingStatus" ADD VALUE IF NOT EXISTS 'CANCELLED';
