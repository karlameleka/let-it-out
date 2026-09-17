import "server-only";
import { prisma } from "@/lib/db";
import { logAudit } from "@/lib/audit-log";
import type { Prisma } from "@/generated/prisma/client";

/** How long a trashed row stays restorable before api/cron/trash-purge
 * hard-deletes it for good — see the TrashedItem model comment. */
export const TRASH_RETENTION_MS = 24 * 60 * 60 * 1000;

type Actor = { userId: string; email: string };

type ChildConfig = {
  /** Key this child array is stored under inside `data._children`. */
  key: string;
  /** The Prisma client delegate name, e.g. "orderItem". */
  delegate: string;
  /** The child's FK column pointing back at the parent's id. */
  fkField: string;
  /** Child fields that need string -> Date revival on restore. */
  dateFields: string[];
};

type ModelConfig = {
  /** The Prisma client delegate name, e.g. "order". */
  delegate: string;
  dateFields: string[];
  children?: ChildConfig[];
};

// One entry per model this app lets an admin delete. Deliberately excludes
// full client-account deletion (deleteClientAccount / deleteUserAccountCompletely)
// — that already cascades through a dozen+ tables (journal entries, push
// subscriptions, webauthn credentials, ...) and a shallow JSON-snapshot
// restore of just the User row would silently lose the rest, which is worse
// than no undo at all.
const MODEL_CONFIG: Record<string, ModelConfig> = {
  Order: {
    delegate: "order",
    dateFields: ["createdAt", "updatedAt"],
    children: [{ key: "items", delegate: "orderItem", fkField: "orderId", dateFields: [] }],
  },
  BookingRequest: {
    delegate: "bookingRequest",
    dateFields: ["joinedAt", "reminderSentAt", "createdAt"],
  },
  SessionBooking: {
    delegate: "sessionBooking",
    dateFields: ["joinedAt", "reminderSentAt", "createdAt", "updatedAt"],
  },
  WorkshopInquiry: {
    delegate: "workshopInquiry",
    dateFields: ["createdAt"],
  },
  WorkshopInterestSignup: {
    delegate: "workshopInterestSignup",
    dateFields: ["createdAt"],
  },
  ContactMessage: {
    delegate: "contactMessage",
    dateFields: ["createdAt"],
  },
  Lead: {
    delegate: "lead",
    dateFields: ["createdAt", "updatedAt"],
  },
  PromoCode: {
    delegate: "promoCode",
    dateFields: ["expiresAt", "createdAt"],
    children: [
      { key: "products", delegate: "promoCodeProduct", fkField: "promoCodeId", dateFields: [] },
      { key: "counselors", delegate: "promoCodeCounselor", fkField: "promoCodeId", dateFields: [] },
    ],
  },
  Product: {
    delegate: "product",
    dateFields: [],
    children: [{ key: "variants", delegate: "productVariant", fkField: "productId", dateFields: [] }],
  },
  Counselor: {
    delegate: "counselor",
    dateFields: ["resetTokenExpiresAt", "lastPasswordResetRequestAt", "lockedUntil", "lastLoginAt", "loginTokenExpiresAt"],
    children: [{ key: "toolkitItems", delegate: "toolkitItem", fkField: "counselorId", dateFields: ["createdAt"] }],
  },
  CounselorFilter: {
    delegate: "counselorFilter",
    dateFields: ["createdAt"],
    children: [{ key: "assignments", delegate: "counselorFilterAssignment", fkField: "filterId", dateFields: [] }],
  },
  Article: {
    delegate: "article",
    dateFields: ["createdAt", "updatedAt"],
  },
  Event: {
    delegate: "event",
    dateFields: ["startAt", "createdAt"],
    children: [{ key: "rsvps", delegate: "eventRSVP", fkField: "eventId", dateFields: ["createdAt", "updatedAt"] }],
  },
  SupportChat: {
    delegate: "supportChat",
    dateFields: ["createdAt", "updatedAt", "escalatedAt", "resolvedAt"],
  },
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyDelegate = Record<string, (...args: any[]) => any>;

function getDelegate(name: string): AnyDelegate {
  return (prisma as unknown as Record<string, AnyDelegate>)[name];
}

function reviveDates(obj: Record<string, unknown>, dateFields: string[]): Record<string, unknown> {
  const copy = { ...obj };
  for (const key of dateFields) {
    if (copy[key] != null) copy[key] = new Date(copy[key] as string);
  }
  return copy;
}

/**
 * Snapshots a row (and, per MODEL_CONFIG, its real children) as plain JSON
 * — the deleting admin action still does the actual delete itself right
 * after, ideally in the same $transaction as the TrashedItem write this
 * feeds into (see moveToTrash), so a row is never gone without something
 * landing in Recently Deleted.
 */
export async function captureRow(modelName: string, id: string): Promise<Record<string, unknown> | null> {
  const config = MODEL_CONFIG[modelName];
  if (!config) return null;
  const row = await getDelegate(config.delegate).findUnique({ where: { id } });
  if (!row) return null;

  const data: Record<string, unknown> = { ...row };
  if (config.children) {
    const children: Record<string, unknown> = {};
    for (const child of config.children) {
      children[child.key] = await getDelegate(child.delegate).findMany({ where: { [child.fkField]: id } });
    }
    data._children = children;
  }
  // Round-trips Date -> ISO string (and anything else non-JSON-safe would
  // surface here too) so this is guaranteed valid Prisma Json input.
  return JSON.parse(JSON.stringify(data));
}

/** JSON-round-trips an already-fetched row (Date -> ISO string) — for bulk
 * deletes that already queried the matching rows themselves (to build a
 * `where: { id: { in } }` for the deleteMany) and would otherwise have to
 * re-fetch each one individually through captureRow just to snapshot it. */
export function serializeRow(row: Record<string, unknown>): Record<string, unknown> {
  return JSON.parse(JSON.stringify(row));
}

/** Writes the TrashedItem row for an already-captured snapshot — call
 * alongside (ideally in the same $transaction array as) the real delete. */
export function trashedItemCreateArgs(params: {
  modelName: string;
  originalId: string;
  summary: string;
  data: Record<string, unknown>;
  actor: Actor;
}) {
  return {
    modelName: params.modelName,
    originalId: params.originalId,
    summary: params.summary,
    data: params.data as Prisma.InputJsonValue,
    deletedById: params.actor.userId,
    deletedByEmail: params.actor.email,
  };
}

export type RestoreResult = { success: true } | { success: false; error: string };

/** Recreates a trashed row (and its children) with its original id, then
 * removes the TrashedItem row. Fails cleanly (leaving the TrashedItem in
 * place, still restorable later) if something it referenced — a
 * counselor, a product, a promo code — no longer exists. */
export async function restoreTrashedItem(trashId: string, actor: Actor): Promise<RestoreResult> {
  const item = await prisma.trashedItem.findUnique({ where: { id: trashId } });
  if (!item) return { success: false, error: "Already restored, purged, or never existed." };

  const config = MODEL_CONFIG[item.modelName];
  if (!config) return { success: false, error: `Unknown item type "${item.modelName}".` };

  const { _children, ...row } = item.data as Record<string, unknown> & { _children?: Record<string, unknown[]> };
  const revivedRow = reviveDates(row, config.dateFields);

  try {
    await getDelegate(config.delegate).create({ data: revivedRow });
    if (config.children && _children) {
      for (const child of config.children) {
        const rows = (_children[child.key] ?? []) as Record<string, unknown>[];
        if (rows.length === 0) continue;
        await getDelegate(child.delegate).createMany({
          data: rows.map((r) => reviveDates(r, child.dateFields)),
        });
      }
    }
  } catch (err) {
    console.error(`[trash] Restore failed for ${item.modelName}:${item.originalId}`, err);
    return { success: false, error: "Restore failed — something it depends on (e.g. a counselor or product) may have been deleted since." };
  }

  await prisma.trashedItem.delete({ where: { id: trashId } });
  await logAudit({
    actor,
    action: "trash.restored",
    summary: `Restored ${item.modelName}: ${item.summary}`,
    targetType: item.modelName,
    targetId: item.originalId,
  });

  return { success: true };
}

/** Hard-deletes every TrashedItem past its 24h undo window — called from
 * api/cron/trash-purge. This only ever removes the JSON snapshot; the
 * original row is already gone (deleted when it was trashed), so there's
 * nothing else to clean up here. */
export async function purgeExpiredTrash(): Promise<number> {
  const cutoff = new Date(Date.now() - TRASH_RETENTION_MS);
  const { count } = await prisma.trashedItem.deleteMany({ where: { deletedAt: { lt: cutoff } } });
  return count;
}
