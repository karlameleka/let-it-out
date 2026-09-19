import "server-only";
import { Prisma } from "@/generated/prisma/client";
import { encryptField, decryptField, encryptJsonField, decryptJsonField } from "@/lib/field-encryption";

type FieldKind = "string" | "json";

/**
 * Model name (exactly as Prisma names it, PascalCase — matches
 * `Prisma.ModelName`) -> field name -> how to encrypt/decrypt it. Anything
 * not listed here is left completely untouched by this extension.
 *
 * Every field here is either free-text clinical content, a JSON snapshot
 * of clinical content, or — for TrashedItem — a full-row JSON snapshot
 * that can itself contain any of the above (see the admin "Recently
 * Deleted" undo flow in trash.ts, which would otherwise stash a plaintext
 * copy of e.g. a support chat transcript for its 24h undo window).
 */
const ENCRYPTED_FIELDS: Record<string, Record<string, FieldKind>> = {
  ClientNote: { notes: "string", nextSteps: "string" },
  Medication: { name: "string", dosage: "string", instructions: "string" },
  IntakeSubmission: { answers: "json", aiSummary: "string" },
  Referral: { intakeSnapshot: "json", notesSnapshot: "json" },
  AssignedResource: { description: "string", content: "string" },
  SupportChat: { messages: "json" },
  JournalEntry: { content: "string", photoUrl: "string" },
  TrashedItem: { data: "json" },
};

// create/update/upsert both write a `data` object (upsert has one for each
// branch) and return the resulting row; createMany/updateMany write a
// `data` object/array but only ever return `{ count }`, never row data.
const WRITE_DATA_OPERATIONS = new Set(["create", "update", "upsert"]);
const WRITE_MANY_OPERATIONS = new Set(["createMany", "updateMany"]);
const READ_ROW_OPERATIONS = new Set([
  "findFirst",
  "findFirstOrThrow",
  "findUnique",
  "findUniqueOrThrow",
  "findMany",
  "create",
  "update",
  "upsert",
  "delete",
]);

function encryptOne(value: unknown, kind: FieldKind): unknown {
  if (value === null || value === undefined) return value;
  if (kind === "string" && typeof value !== "string") {
    // Not a plain string — e.g. a Prisma field-update operator object
    // like { set: "..." } instead of a literal. Every write site for
    // these fields in this codebase uses plain literals (verified when
    // this extension was wired up), so this shouldn't ever run in
    // practice; left as a no-op rather than risk corrupting something
    // this extension doesn't understand.
    return value;
  }
  return kind === "json" ? encryptJsonField(value) : encryptField(value as string);
}

function decryptOne(value: unknown, kind: FieldKind): unknown {
  if (value === null || value === undefined) return value;
  return kind === "json" ? decryptJsonField(value) : decryptField(value as string);
}

function encryptDataObject(data: unknown, fields: Record<string, FieldKind>) {
  if (!data || typeof data !== "object") return;
  const record = data as Record<string, unknown>;
  for (const [field, kind] of Object.entries(fields)) {
    if (field in record) record[field] = encryptOne(record[field], kind);
  }
}

function decryptRow(row: unknown, fields: Record<string, FieldKind>) {
  if (!row || typeof row !== "object") return;
  const record = row as Record<string, unknown>;
  for (const [field, kind] of Object.entries(fields)) {
    if (field in record) record[field] = decryptOne(record[field], kind);
  }
}

/**
 * Wraps a PrismaClient so every create/update/upsert/createMany/updateMany
 * against one of the models above has its listed fields transparently
 * encrypted before hitting the database, and every read (the find-family,
 * create/update/upsert/delete — all of which return row data) has them
 * transparently decrypted back — every call site in the app keeps reading
 * and writing plain strings/objects exactly as before, with the ciphertext
 * only ever existing on disk and in transit to Postgres.
 *
 * Deliberately model-scoped rather than a blanket "encrypt every string
 * field" — grepped first (see the commit this shipped in) to confirm none
 * of these models are ever fetched as a nested `include`/`select` relation
 * of a different parent model anywhere in the app; a Prisma extension's
 * query hooks only fire for the top-level model a query is issued
 * against, not for relations pulled in via `include`, so relying on that
 * would have silently left nested reads decrypting nothing.
 *
 * Built with `Prisma.defineExtension` (rather than a hand-rolled generic
 * wrapper function around `.$extends`) specifically so `prisma.$extends(
 * fieldEncryptionExtension)` in db.ts keeps Prisma's full per-model result
 * typing — every other call site in the app still gets exact types back
 * from `prisma.clientNote.findMany()` etc., nothing had to change there.
 */
export const fieldEncryptionExtension = Prisma.defineExtension({
  name: "field-encryption",
  query: {
    $allModels: {
      async $allOperations({ model, operation, args, query }) {
        const fields = ENCRYPTED_FIELDS[model];
        if (!fields) return query(args);

        // args' shape genuinely varies per operation (create/update/
        // upsert/createMany/updateMany/find*/delete all differ) in ways
        // Prisma's own extension types don't narrow for a field-agnostic
        // hook like this one — cast once here rather than fight that.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const writableArgs = args as any;

        if (WRITE_DATA_OPERATIONS.has(operation)) {
          if (operation === "upsert") {
            encryptDataObject(writableArgs.create, fields);
            encryptDataObject(writableArgs.update, fields);
          } else {
            encryptDataObject(writableArgs.data, fields);
          }
        } else if (WRITE_MANY_OPERATIONS.has(operation)) {
          if (Array.isArray(writableArgs.data)) {
            for (const row of writableArgs.data) encryptDataObject(row, fields);
          } else {
            encryptDataObject(writableArgs.data, fields);
          }
        }

        const result = await query(args);

        if (READ_ROW_OPERATIONS.has(operation)) {
          if (Array.isArray(result)) {
            for (const row of result) decryptRow(row, fields);
          } else {
            decryptRow(result, fields);
          }
        }

        return result;
      },
    },
  },
});
