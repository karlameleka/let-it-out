import { NextResponse, type NextRequest } from "next/server";
import { requireAdmin } from "@/lib/session";
import { prisma } from "@/lib/db";
import { toCsv, toXlsxBuffer, toPdfBuffer, contentTypeFor, type ExportColumn } from "@/lib/export";
import { formatEGP } from "@/lib/format";

const STATUSES = ["PENDING_PAYMENT", "PAYMENT_SUBMITTED", "CONFIRMED", "SHIPPED", "COMPLETED", "CANCELLED"];

type Row = {
  id: string;
  guestName: string;
  guestEmail: string;
  totalEGP: number;
  status: string;
  paymentMethod: string;
  createdAt: Date;
};

const COLUMNS: ExportColumn<Row>[] = [
  { header: "Order #", get: (r) => r.id.slice(-8).toUpperCase(), width: 12 },
  { header: "Customer", get: (r) => r.guestName, width: 24 },
  { header: "Email", get: (r) => r.guestEmail, width: 28 },
  { header: "Total", get: (r) => formatEGP(r.totalEGP), width: 14 },
  { header: "Status", get: (r) => r.status.replaceAll("_", " "), width: 18 },
  { header: "Payment method", get: (r) => r.paymentMethod, width: 18 },
  { header: "Placed", get: (r) => r.createdAt.toISOString(), width: 22 },
];

export async function GET(req: NextRequest) {
  await requireAdmin();

  const sp = req.nextUrl.searchParams;
  const format = sp.get("format") ?? "csv";
  const statusParam = sp.get("status");
  const status = statusParam && STATUSES.includes(statusParam) ? statusParam : undefined;

  const rows = await prisma.order.findMany({
    where: status ? { status: status as never } : undefined,
    orderBy: { createdAt: "desc" },
    take: 10_000,
    select: {
      id: true,
      guestName: true,
      guestEmail: true,
      totalEGP: true,
      status: true,
      paymentMethod: true,
      createdAt: true,
    },
  });

  const filename = status ? `orders-${status.toLowerCase()}` : "orders";

  if (format === "xlsx") {
    const buffer = await toXlsxBuffer(rows, COLUMNS, "Orders");
    return new NextResponse(new Uint8Array(buffer), {
      headers: {
        "Content-Type": contentTypeFor("xlsx"),
        "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      },
    });
  }
  if (format === "pdf") {
    const buffer = await toPdfBuffer(rows, COLUMNS, "Orders");
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
