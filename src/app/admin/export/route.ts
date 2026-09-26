import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { resolveDateRange } from "@/lib/date-range";
import { getRevenueSeries, type RevenuePoint } from "@/lib/dashboard-metrics";
import { toCsv, toXlsxBuffer, toPdfBuffer, contentTypeFor, type ExportColumn } from "@/lib/export";
import { formatEGP } from "@/lib/format";

const COLUMNS: ExportColumn<RevenuePoint>[] = [
  { header: "Date", get: (r) => r.date, width: 14 },
  { header: "Shop revenue (EGP)", get: (r) => r.shop, width: 20 },
  { header: "Session revenue (EGP)", get: (r) => r.sessions, width: 22 },
  { header: "Total (EGP)", get: (r) => r.total, width: 16 },
];

/** Exports the Overview dashboard's daily revenue series — the richest
 * single table backing the KPI scorecards and revenue chart, for
 * whatever range is currently selected. */
export async function GET(req: NextRequest) {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "csv";
  const range = resolveDateRange({ from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined });

  const rows = await getRevenueSeries(range);
  const filename = `dashboard-revenue-${range.from.toISOString().slice(0, 10)}-to-${range.to.toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer(rows, COLUMNS, "Revenue");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor("xlsx"),
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }
  if (format === "pdf") {
    const total = rows.reduce((sum, r) => sum + r.total, 0);
    const buffer = await toPdfBuffer(
      rows,
      COLUMNS,
      `Dashboard Revenue Report — Total ${formatEGP(total)}`,
    );
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
