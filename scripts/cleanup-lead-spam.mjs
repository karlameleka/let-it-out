#!/usr/bin/env node
// Deletes spam rows from Lead and/or ContactMessage within a time window —
// the response to the September 2026 spam-bot incident. Defaults to a dry
// run (counts only, deletes nothing); pass --yes to actually delete.
//
// Run scripts/inspect-lead-spam.mjs first to find the burst window (the
// per-day/per-hour breakdown it prints), then:
//
//   DATABASE_URL="..." node scripts/cleanup-lead-spam.mjs --from "2026-09-10T00:00:00Z" --to "2026-09-11T00:00:00Z"
//
// That previews the count. Once it matches what you expect (compare
// against the hourly breakdown from the inspect script), re-run with --yes
// to actually delete:
//
//   DATABASE_URL="..." node scripts/cleanup-lead-spam.mjs --from "..." --to "..." --yes
//
// Options:
//   --from <ISO datetime>   required — window start (inclusive)
//   --to   <ISO datetime>   required — window end (exclusive)
//   --table lead|contact|both   which table(s) to clean (default: both)
//   --yes                    actually delete (default: dry run / preview only)
//
// Strongly recommended: take a fresh backup first —
//   npm run db:backup
// (or rely on Neon's point-in-time recovery if you're on a paid plan) —
// before running this with --yes. There is no undo once rows are deleted.

import pg from "pg";

function parseArgs(argv) {
  const args = { table: "both", yes: false };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--from") args.from = argv[++i];
    else if (a === "--to") args.to = argv[++i];
    else if (a === "--table") args.table = argv[++i];
    else if (a === "--yes") args.yes = true;
  }
  return args;
}

const args = parseArgs(process.argv.slice(2));

if (!args.from || !args.to) {
  console.error("Usage: node scripts/cleanup-lead-spam.mjs --from <ISO datetime> --to <ISO datetime> [--table lead|contact|both] [--yes]");
  console.error('Example: node scripts/cleanup-lead-spam.mjs --from "2026-09-10T00:00:00Z" --to "2026-09-11T00:00:00Z"');
  process.exit(1);
}

const from = new Date(args.from);
const to = new Date(args.to);
if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
  console.error("--from and --to must be valid ISO datetimes with --from before --to.");
  process.exit(1);
}
if (!["lead", "contact", "both"].includes(args.table)) {
  console.error('--table must be "lead", "contact", or "both".');
  process.exit(1);
}

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  console.error("DATABASE_URL is not set — nothing to clean up.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: rawDatabaseUrl });
await client.connect();

const tables = args.table === "both" ? ["Lead", "ContactMessage"] : args.table === "lead" ? ["Lead"] : ["ContactMessage"];

console.log(`Window: ${from.toISOString()} → ${to.toISOString()}`);
console.log(args.yes ? "Mode: DELETE (--yes passed)" : "Mode: dry run (pass --yes to actually delete)");

for (const table of tables) {
  const { rows } = await client.query(
    `SELECT COUNT(*)::int AS count FROM "${table}" WHERE "createdAt" >= $1 AND "createdAt" < $2`,
    [from, to],
  );
  const count = rows[0].count;
  console.log(`\n${table}: ${count} row(s) match this window.`);

  if (count === 0) continue;

  if (!args.yes) {
    const { rows: sample } = await client.query(
      `SELECT * FROM "${table}" WHERE "createdAt" >= $1 AND "createdAt" < $2 ORDER BY "createdAt" ASC LIMIT 3`,
      [from, to],
    );
    console.log(`  Sample (first 3, oldest first) — check these are actually spam before re-running with --yes:`);
    for (const r of sample) console.log("   ", JSON.stringify(r));
    continue;
  }

  const result = await client.query(`DELETE FROM "${table}" WHERE "createdAt" >= $1 AND "createdAt" < $2`, [from, to]);
  console.log(`  Deleted ${result.rowCount} row(s) from ${table}.`);
}

await client.end();
