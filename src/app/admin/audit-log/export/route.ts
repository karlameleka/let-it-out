import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import { resolveDateRange } from "@/lib/date-range";
import { toCsv, toXlsxBuffer, toPdfBuffer, contentTypeFor, type ExportColumn } from "@/lib/export";

const SEVERITIES = ["INFO", "WARNING", "SECURITY"] as const;

type Row = {
  createdAt: Date;
  actorEmail: string | null;
  action: string;
  summary: string;
  severity: string;
};

const COLUMNS: ExportColumn<Row>[] = [
  { header: "When", get: (r) => r.createdAt.toISOString(), width: 22 },
  { header: "Actor", get: (r) => r.actorEmail ?? "System", width: 28 },
  { header: "Action", get: (r) => r.action, width: 28 },
  { header: "Summary", get: (r) => r.summary, width: 50 },
  { header: "Severity", get: (r) => r.severity, width: 12 },
];

export async function GET(req: NextRequest) {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "csv";
  const range = resolveDateRange({ from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined });
  const severity = sp.get("severity");
  const q = sp.get("q")?.trim();

  const where: Prisma.AuditLogWhereInput = {
    createdAt: { gte: range.from, lte: range.to },
    ...(severity && (SEVERITIES as readonly string[]).includes(severity) ? { severity: severity as never } : {}),
    ...(q
      ? {
          OR: [
            { summary: { contains: q, mode: "insensitive" } },
            { action: { contains: q, mode: "insensitive" } },
            { actorEmail: { contains: q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  // Exports are capped, same reasoning as every paginated admin list in
  // this app (ADMIN_PAGE_SIZE) — an unbounded export of a table that only
  // grows is a self-inflicted outage waiting to happen.
  const rows = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: "desc" },
    take: 10_000,
    select: { createdAt: true, actorEmail: true, action: true, summary: true, severity: true },
  });

  const filename = `audit-log-${range.from.toISOString().slice(0, 10)}-to-${range.to.toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer(rows, COLUMNS, "Audit log");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor("xlsx"),
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }
  if (format === "pdf") {
    const buffer = await toPdfBuffer(rows, COLUMNS, "Audit Log");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor("pdf"),
        "Content-Disposition": `attachment; filename="${filename}.pdf"`,
      },
    });
  }

  const csv = toCsv(rows, COLUMNS);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": contentTypeFor("csv"),
      "Content-Disposition": `attachment; filename="${filename}.csv"`,
    },
  });
}
