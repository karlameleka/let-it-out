import "server-only";
import { createCipheriv, createDecipheriv, createHash, randomBytes } from "crypto";

/**
 * Field-level encryption at rest for clinical/PII columns (therapist
 * notes, medications, intake answers, referral snapshots, support-chat
 * transcripts, the legacy pre-local-storage journal rows, and trashed-item
 * snapshots — see db.ts, which wires this into a Prisma Client Extension
 * so every read/write of those specific fields is transparently
 * decrypted/encrypted without touching each call site).
 *
 * AES-256-GCM, keyed off a dedicated FIELD_ENCRYPTION_KEY secret (never
 * SESSION_SECRET — a compromise of one shouldn't unlock the other). The
 * "enc:v1:" prefix is what lets the migration script (and decryptField
 * itself) tell an already-encrypted value apart from a legacy plaintext
 * row that hasn't been migrated yet.
 */

const VERSION_PREFIX = "enc:v1:";

function getKey(): Buffer {
  const secret = process.env.FIELD_ENCRYPTION_KEY;
  if (!secret) throw new Error("FIELD_ENCRYPTION_KEY is not set");
  return createHash("sha256").update(secret).digest();
}

/** True for a value this module actually encrypted — false for legacy
 * plaintext (not yet migrated) or anything else. */
export function isEncryptedField(value: unknown): value is string {
  return typeof value === "string" && value.startsWith(VERSION_PREFIX);
}

export function encryptField(plaintext: string): string {
  const key = getKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return VERSION_PREFIX + Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/** Decrypts a value this module encrypted. Given a legacy plaintext string
 * (no "enc:v1:" prefix — a row the migration script hasn't reached yet),
 * returns it unchanged rather than throwing, so old data stays readable
 * mid-migration instead of breaking the app. */
export function decryptField(stored: string): string {
  if (!isEncryptedField(stored)) return stored;
  const key = getKey();
  const raw = Buffer.from(stored.slice(VERSION_PREFIX.length), "base64");
  const iv = raw.subarray(0, 12);
  const authTag = raw.subarray(12, 28);
  const encrypted = raw.subarray(28);
  const decipher = createDecipheriv("aes-256-gcm", key, iv);
  decipher.setAuthTag(authTag);
  return Buffer.concat([decipher.update(encrypted), decipher.final()]).toString("utf8");
}

/** Same idea for a Prisma `Json` column: the value is JSON-stringified,
 * then encrypted into a single opaque string (jsonb happily stores a bare
 * string scalar). */
export function encryptJsonField(value: unknown): string {
  return encryptField(JSON.stringify(value));
}

/** Given whatever a Json column currently holds: an already-encrypted
 * string (decrypt then parse), or — mid-migration — the real legacy
 * object/array Prisma deserialized the jsonb value into directly (pass
 * through unchanged). */
export function decryptJsonField<T = unknown>(stored: unknown): T {
  if (typeof stored !== "string") return stored as T;
  if (!isEncryptedField(stored)) {
    try {
      return JSON.parse(stored) as T;
    } catch {
      return stored as T;
    }
  }
  return JSON.parse(decryptField(stored)) as T;
}
