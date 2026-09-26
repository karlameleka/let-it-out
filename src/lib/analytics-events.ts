import "server-only";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";

// The object/action vocabulary this app actually emits — kept as a union
// of string literals (not a DB enum) so a new event type is just a new
// literal here, no migration. See the AnalyticsEvent model comment in
// schema.prisma for the general shape.
export type AnalyticsObject =
  | "User"
  | "JournalEntry"
  | "SessionBooking"
  | "Order"
  | "Assessment"
  | "Feedback"
  | "Referral";

export type AnalyticsAction =
  | "signed_up"
  | "logged_in"
  | "created"
  | "placed"
  | "confirmed"
  | "started"
  | "completed"
  | "submitted"
  | "activated";

/**
 * Records one row to the behavioral event log. Fire-and-forget by design,
 * same convention as logAudit(): a tracking write failing must never break
 * the real action (booking a session, placing an order) it's describing,
 * so it swallows its own errors and only logs them to the server console.
 * Call sites that don't need to block on it (most of them) can call this
 * without awaiting.
 */
export async function trackEvent(
  userId: string | null,
  object: AnalyticsObject,
  action: AnalyticsAction,
  properties?: Record<string, unknown>,
): Promise<void> {
  try {
    await prisma.analyticsEvent.create({
      data: {
        userId,
        object,
        action,
        properties: (properties as Prisma.InputJsonValue | undefined) ?? undefined,
      },
    });
  } catch (err) {
    console.error("[analytics-event] Failed to write event:", object, action, err);
  }
}
