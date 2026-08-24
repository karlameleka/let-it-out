#!/usr/bin/env node
// Creates a compressed, offline copy of the database — a local file you
// keep outside Neon entirely, independent of Neon's own backups/PITR.
// Uses pg_dump's custom format (-Fc): compressed, and restorable with
// `pg_restore` even into a database with a different name/owner.
//
// Usage:
//   npm run db:backup                 # dumps DATABASE_URL to backups/
//   node scripts/backup-db.mjs --keep 10   # also prune, keeping the 10 newest
//
// Restore:
//   pg_restore --clean --if-exists --no-owner -d "$DATABASE_URL" backups/<file>.dump
//
// This is a supplementary safety net, not a replacement for Neon's own
// backups — Neon retains continuous point-in-time recovery on paid plans.
// Run this before risky migrations, or on a schedule (cron/CI) if you want
// dumps stored somewhere Neon-outage-proof.

import { spawnSync } from "node:child_process";
import { mkdirSync, readdirSync, statSync, unlinkSync } from "node:fs";
import { join } from "node:path";

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  console.error("DATABASE_URL is not set — nothing to back up.");
  process.exit(1);
}

// Prisma's connection string carries query params (schema, connection_limit,
// pgbouncer, ...) that Prisma understands but pg_dump's own libpq-style URI
// parser rejects outright ("invalid URI query parameter"). pg_dump doesn't
// need any of them — schema is handled by --schema/-n if ever needed, and
// the rest are pooling hints irrelevant to a direct pg_dump connection.
const url = new URL(rawDatabaseUrl);
const schema = url.searchParams.get("schema");
for (const key of [...url.searchParams.keys()]) {
  url.searchParams.delete(key);
}
const databaseUrl = url.toString();

const backupDir = join(process.cwd(), "backups");
mkdirSync(backupDir, { recursive: true });

const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
const outFile = join(backupDir, `letitout-${timestamp}.dump`);

console.log(`Backing up database to ${outFile} ...`);
const args = ["--format=custom", "--no-owner", "--no-privileges"];
if (schema) {
  args.push("--schema", schema);
}
args.push("--file", outFile, databaseUrl);

const result = spawnSync("pg_dump", args, { stdio: "inherit" });

if (result.status !== 0) {
  console.error("pg_dump failed — see output above.");
  process.exit(result.status ?? 1);
}

console.log(`Backup complete: ${outFile}`);

const keepArg = process.argv.indexOf("--keep");
if (keepArg !== -1) {
  const keep = Number(process.argv[keepArg + 1]);
  if (!Number.isFinite(keep) || keep < 1) {
    console.error("--keep must be a positive number.");
    process.exit(1);
  }
  const dumps = readdirSync(backupDir)
    .filter((f) => f.endsWith(".dump"))
    .map((f) => ({ file: f, mtime: statSync(join(backupDir, f)).mtimeMs }))
    .sort((a, b) => b.mtime - a.mtime);

  for (const { file } of dumps.slice(keep)) {
    unlinkSync(join(backupDir, file));
    console.log(`Pruned old backup: ${file}`);
  }
}
