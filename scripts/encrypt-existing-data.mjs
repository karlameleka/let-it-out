#!/usr/bin/env node
// One-time migration: encrypts every plaintext row in the clinical/PII
// columns that src/lib/prisma-field-encryption-extension.ts now encrypts
// transparently going forward (ClientNote, Medication, IntakeSubmission,
// Referral snapshots, AssignedResource, SupportChat, the legacy
// pre-local-storage JournalEntry rows, and TrashedItem snapshots).
//
// Idempotent and safe to re-run: any value that already starts with the
// "enc:v1:" marker (see src/lib/field-encryption.ts) is left untouched, so
// running this twice — or running it while the app is live and writing
// new, already-encrypted rows — never double-encrypts anything.
//
// Uses the same AES-256-GCM scheme as field-encryption.ts, reimplemented
// here with plain `crypto` + `pg` (no Prisma, no Next "server-only" guard)
// so this can run standalone with `node`.
//
// Usage:
//   FIELD_ENCRYPTION_KEY="..." DATABASE_URL="..." node scripts/encrypt-existing-data.mjs
//     — dry run: counts how many rows in each table still need encrypting
//   FIELD_ENCRYPTION_KEY="..." DATABASE_URL="..." node scripts/encrypt-existing-data.mjs --yes
//     — actually encrypts them in place
//   ... --table ClientNote           — limit to one table (repeatable)
//
// Strongly recommended: take a fresh backup first (npm run db:backup, or
// your host's point-in-time recovery) before running with --yes. This
// rewrites existing rows in place; there is no undo once it's run.

import pg from "pg";
import { createCipheriv, createHash, randomBytes } from "crypto";

const VERSION_PREFIX = "enc:v1:";

function getKey() {
  const secret = process.env.FIELD_ENCRYPTION_KEY;
  if (!secret) {
    console.error("FIELD_ENCRYPTION_KEY is not set.");
    process.exit(1);
  }
  return createHash("sha256").update(secret).digest();
}

function isEncrypted(value) {
  return typeof value === "string" && value.startsWith(VERSION_PREFIX);
}

function encryptString(key, plaintext) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return VERSION_PREFIX + Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

// Table (exact Postgres/Prisma name) -> columns to encrypt, and whether
// each one is a plain text column or a jsonb column (jsonb values arrive
// from `pg` already parsed into real JS objects/arrays/strings, so a
// legacy unmigrated jsonb value is a real object/array, not a string —
// that's what tells it apart from an already-encrypted jsonb scalar
// string here, same logic as decryptJsonField in field-encryption.ts).
const TABLES = [
  { table: "ClientNote", fields: [{ name: "notes", kind: "text" }, { name: "nextSteps", kind: "text" }] },
  {
    table: "Medication",
    fields: [
      { name: "name", kind: "text" },
      { name: "dosage", kind: "text" },
      { name: "instructions", kind: "text" },
    ],
  },
  { table: "IntakeSubmission", fields: [{ name: "answers", kind: "json" }, { name: "aiSummary", kind: "text" }] },
  { table: "Referral", fields: [{ name: "intakeSnapshot", kind: "json" }, { name: "notesSnapshot", kind: "json" }] },
  { table: "AssignedResource", fields: [{ name: "description", kind: "text" }, { name: "content", kind: "text" }] },
  { table: "SupportChat", fields: [{ name: "messages", kind: "json" }] },
  { table: "JournalEntry", fields: [{ name: "content", kind: "text" }, { name: "photoUrl", kind: "text" }] },
  { table: "TrashedItem", fields: [{ name: "data", kind: "json" }] },
];

function parseArgs(argv) {
  const args = { yes: false, tables: null };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--yes") args.yes = true;
    else if (a === "--table") (args.tables ??= []).push(argv[++i]);
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  console.error("DATABASE_URL is not set.");
  process.exit(1);
}

const key = getKey();
const client = new pg.Client({ connectionString: rawDatabaseUrl });
await client.connect();

console.log(args.yes ? "Mode: ENCRYPT IN PLACE (--yes passed)" : "Mode: dry run (pass --yes to actually encrypt)");

let grandTotalNeeded = 0;
let grandTotalMigrated = 0;

for (const { table, fields } of TABLES) {
  if (args.tables && !args.tables.includes(table)) continue;

  const columnList = fields.map((f) => `"${f.name}"`).join(", ");
  const { rows } = await client.query(`SELECT id, ${columnList} FROM "${table}"`);

  let needsMigration = 0;
  let updated = 0;

  for (const row of rows) {
    const updates = {};
    for (const field of fields) {
      const value = row[field.name];
      if (value === null || value === undefined) continue;

      if (field.kind === "text") {
        if (isEncrypted(value)) continue;
        updates[field.name] = { kind: "text", value: encryptString(key, value) };
      } else {
        // jsonb: already-encrypted rows hold a plain string scalar;
        // legacy unmigrated rows hold the real object/array.
        if (typeof value === "string" && isEncrypted(value)) continue;
        const cipher = encryptString(key, JSON.stringify(value));
        updates[field.name] = { kind: "json", value: JSON.stringify(cipher) };
      }
    }

    const fieldNames = Object.keys(updates);
    if (fieldNames.length === 0) continue;
    needsMigration++;

    if (!args.yes) continue;

    const setClauses = fieldNames.map((name, i) => {
      const u = updates[name];
      return u.kind === "json" ? `"${name}" = $${i + 1}::jsonb` : `"${name}" = $${i + 1}`;
    });
    const values = fieldNames.map((name) => updates[name].value);
    await client.query(`UPDATE "${table}" SET ${setClauses.join(", ")} WHERE id = $${fieldNames.length + 1}`, [
      ...values,
      row.id,
    ]);
    updated++;
  }

  grandTotalNeeded += needsMigration;
  grandTotalMigrated += updated;
  console.log(
    `${table}: ${rows.length} row(s) total, ${needsMigration} still plaintext` +
      (args.yes ? `, ${updated} encrypted just now.` : " (would encrypt with --yes)."),
  );
}

await client.end();

if (!args.yes && grandTotalNeeded === 0) {
  console.log("\nEverything checked is already encrypted or empty — nothing to do.");
} else if (!args.yes) {
  console.log(`\n${grandTotalNeeded} row(s) still plaintext. Re-run with --yes to actually encrypt them.`);
} else {
  console.log(`\nDone — encrypted ${grandTotalMigrated} row(s) across the tables above.`);
}
