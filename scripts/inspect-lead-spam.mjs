#!/usr/bin/env node
// Read-only diagnostic for the Lead/ContactMessage spam-bot incident
// (September 2026). Prints per-day and per-hour submission counts so you can
// see exactly when the flood happened, plus a look at the most common
// name/email/subject patterns — everything you need to pick a safe time
// window before running cleanup-lead-spam.mjs. Never writes anything.
//
// Usage:
//   node scripts/inspect-lead-spam.mjs
//
// Run this against production by setting DATABASE_URL to your production
// connection string first (e.g. `vercel env pull .env.production.local`
// then `DATABASE_URL=$(grep ^DATABASE_URL .env.production.local | cut -d= -f2-) node scripts/inspect-lead-spam.mjs`),
// or paste the connection string from the Neon/Vercel dashboard directly:
//   DATABASE_URL="postgresql://..." node scripts/inspect-lead-spam.mjs

import pg from "pg";

const rawDatabaseUrl = process.env.DATABASE_URL;
if (!rawDatabaseUrl) {
  console.error("DATABASE_URL is not set — nothing to inspect.");
  process.exit(1);
}

const client = new pg.Client({ connectionString: rawDatabaseUrl });
await client.connect();

async function reportTable(table, extraCols = []) {
  const { rows: totalRows } = await client.query(`SELECT COUNT(*)::int AS count FROM "${table}"`);
  const total = totalRows[0].count;
  console.log(`\n=== ${table} — ${total} total rows ===`);
  if (total === 0) return;

  const { rows: byDay } = await client.query(`
    SELECT date_trunc('day', "createdAt") AS day, COUNT(*)::int AS count
    FROM "${table}"
    GROUP BY day
    ORDER BY count DESC
    LIMIT 15
  `);
  console.log(`\nTop days by volume:`);
  for (const r of byDay) {
    console.log(`  ${r.day.toISOString().slice(0, 10)}  ${String(r.count).padStart(8)} rows`);
  }

  const busiestDay = byDay[0]?.day;
  if (busiestDay) {
    const { rows: byHour } = await client.query(
      `
      SELECT date_trunc('hour', "createdAt") AS hour, COUNT(*)::int AS count
      FROM "${table}"
      WHERE "createdAt" >= $1 AND "createdAt" < $1 + interval '1 day'
      GROUP BY hour
      ORDER BY hour
    `,
      [busiestDay],
    );
    console.log(`\nHourly breakdown for busiest day (${busiestDay.toISOString().slice(0, 10)}):`);
    for (const r of byHour) {
      console.log(`  ${r.hour.toISOString().slice(0, 13)}:00  ${String(r.count).padStart(8)} rows`);
    }
  }

  const { rows: dupEmails } = await client.query(`
    SELECT email, COUNT(*)::int AS count
    FROM "${table}"
    WHERE email IS NOT NULL
    GROUP BY email
    HAVING COUNT(*) > 1
    ORDER BY count DESC
    LIMIT 10
  `);
  if (dupEmails.length > 0) {
    console.log(`\nMost repeated email addresses:`);
    for (const r of dupEmails) console.log(`  ${String(r.count).padStart(6)}x  ${r.email}`);
  }

  const sampleCols = ["id", "name", "email", ...extraCols, `"createdAt"`].filter(Boolean).join(", ");
  const { rows: sample } = await client.query(`SELECT ${sampleCols} FROM "${table}" ORDER BY "createdAt" DESC LIMIT 5`);
  console.log(`\nMost recent 5 rows (sanity check — do these look like spam?):`);
  for (const r of sample) console.log(" ", JSON.stringify(r));
}

await reportTable("Lead", ["type", "source", "notes"]);
await reportTable("ContactMessage", ["subject", "message"]);

await client.end();

console.log(`
Next step: once you've spotted the burst window above, preview a deletion with:
  DATABASE_URL="..." node scripts/cleanup-lead-spam.mjs --from "<start>" --to "<end>"
(add --yes only once the preview count looks right — see that script's header for details)
`);
