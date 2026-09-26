import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { resolveDateRange } from "@/lib/date-range";
import { getRevenueByProduct, type ProductRevenue } from "@/lib/finance-metrics";
import { toCsv, toXlsxBuffer, toPdfBuffer, contentTypeFor, type ExportColumn } from "@/lib/export";
import { formatEGP } from "@/lib/format";

const COLUMNS: ExportColumn<ProductRevenue>[] = [
  { header: "Product", get: (r) => r.title, width: 32 },
  { header: "Revenue (EGP)", get: (r) => r.revenueEGP, width: 18 },
  { header: "Units sold", get: (r) => r.unitsSold, width: 14 },
];

/** Exports the Finance page's top-products-by-revenue breakdown, the
 * richest single table backing it, for whatever range is currently
 * selected — same one-canonical-table-per-export convention as the other
 * export routes in this app. */
export async function GET(req: NextRequest) {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "csv";
  const range = resolveDateRange({ from: sp.get("from") ?? undefined, to: sp.get("to") ?? undefined });

  const rows = await getRevenueByProduct(range, 1000);
  const filename = `finance-revenue-by-product-${range.from.toISOString().slice(0, 10)}-to-${range.to.toISOString().slice(0, 10)}`;

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer(rows, COLUMNS, "Revenue by product");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor("xlsx"),
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }
  if (format === "pdf") {
    const total = rows.reduce((sum, r) => sum + r.revenueEGP, 0);
    const buffer = await toPdfBuffer(rows, COLUMNS, `Finance — Revenue by Product — Total ${formatEGP(total)}`);
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
