import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";
import { fieldEncryptionExtension } from "@/lib/prisma-field-encryption-extension";

neonConfig.webSocketConstructor = ws;

function createPrismaClient() {
  const connectionString = process.env.DATABASE_URL;
  // Neon's own serverless driver talks to the database over a pooled
  // WebSocket that Neon's proxy understands how to suspend between
  // requests. The plain `pg` adapter opens a regular TCP connection that a
  // warm serverless function instance holds open across invocations, which
  // keeps Neon's compute endpoint "active" and unable to scale to zero even
  // between real requests — this is Neon's documented top cause of runaway
  // compute-hour usage on Vercel, and unrelated to actual traffic volume.
  // Local dev runs against a plain (non-Neon) Postgres instance, which
  // doesn't speak Neon's proxy protocol, so it keeps using the `pg` adapter.
  const adapter = connectionString?.includes("neon.tech")
    ? new PrismaNeon({ connectionString })
    : new PrismaPg({ connectionString });
  return new PrismaClient({ adapter }).$extends(fieldEncryptionExtension);
}

const globalForPrisma = globalThis as unknown as {
  prisma: ReturnType<typeof createPrismaClient> | undefined;
};

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
