import { Suspense } from "react";
import { prisma } from "@/lib/db";
import type { Prisma } from "@/generated/prisma/client";
import DateRangePicker from "@/components/date-range-picker";
import AdminPagination from "@/components/admin-pagination";
import { ADMIN_PAGE_SIZE, parseAdminPage } from "@/lib/admin-pagination";
import { resolveDateRange } from "@/lib/date-range";
import ExportButtons from "@/components/export-buttons";
import { CAIRO_TIME_ZONE } from "@/lib/timezone";

const SEVERITIES = ["INFO", "WARNING", "SECURITY"] as const;

const SEVERITY_STYLE: Record<string, string> = {
  INFO: "bg-brand-50 text-brand-700",
  WARNING: "bg-amber-50 text-amber-800",
  SECURITY: "bg-red-50 text-red-700",
};

export default async function AdminAuditLogPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; from?: string; to?: string; severity?: string; q?: string }>;
}) {
  const sp = await searchParams;
  const page = parseAdminPage(sp.page);
  const range = resolveDateRange(sp);
  const severity = sp.severity && (SEVERITIES as readonly string[]).includes(sp.severity) ? sp.severity : undefined;
  const q = sp.q?.trim();

  const where: Prisma.AuditLogWhereInput = {
    createdAt: { gte: range.from, lte: range.to },
    ...(severity ? { severity: severity as never } : {}),
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

  const [entries, totalCount] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * ADMIN_PAGE_SIZE,
      take: ADMIN_PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(totalCount / ADMIN_PAGE_SIZE));

  const extraParams: Record<string, string> = {};
  if (sp.from) extraParams.from = sp.from;
  if (sp.to) extraParams.to = sp.to;
  if (severity) extraParams.severity = severity;
  if (q) extraParams.q = q;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Suspense fallback={<div className="h-8" />}>
          <DateRangePicker />
        </Suspense>
        <ExportButtons endpoint="/admin/audit-log/export" params={extraParams} />
      </div>

      <form className="flex flex-wrap items-center gap-2" action="/admin/audit-log">
        {sp.from && <input type="hidden" name="from" value={sp.from} />}
        {sp.to && <input type="hidden" name="to" value={sp.to} />}
        <select
          name="severity"
          defaultValue={severity ?? ""}
          className="rounded-lg border border-brand-200 bg-white px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        >
          <option value="">All severities</option>
          {SEVERITIES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          type="text"
          name="q"
          placeholder="Search summary, action, or admin email"
          defaultValue={q ?? ""}
          className="w-72 rounded-lg border border-brand-200 px-3 py-1.5 text-sm outline-none focus:border-brand-500"
        />
        <button type="submit" className="rounded-lg bg-brand-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-brand-700">
          Filter
        </button>
      </form>

      <p className="text-sm text-ink/60">
        {totalCount} entr{totalCount === 1 ? "y" : "ies"}
        {totalPages > 1 && `, showing page ${page} of ${totalPages}`}
      </p>

      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
        {entries.length === 0 ? (
          <p className="p-6 text-sm text-ink/50">No activity recorded in this range.</p>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-brand-100 bg-brand-50/50 text-xs uppercase tracking-wide text-ink/50">
              <tr>
                <th className="px-4 py-3 font-medium">When</th>
                <th className="px-4 py-3 font-medium">Actor</th>
                <th className="px-4 py-3 font-medium">Event</th>
                <th className="px-4 py-3 font-medium">Severity</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-brand-50">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/60">{e.createdAt.toLocaleString("en-GB", { timeZone: CAIRO_TIME_ZONE })}</td>
                  <td className="whitespace-nowrap px-4 py-3 text-ink/70">{e.actorEmail ?? "System"}</td>
                  <td className="px-4 py-3">
                    <p className="text-ink/80">{e.summary}</p>
                    <p className="mt-0.5 font-mono text-xs text-ink/35">{e.action}</p>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${SEVERITY_STYLE[e.severity]}`}>
                      {e.severity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AdminPagination page={page} totalPages={totalPages} basePath="/admin/audit-log" extraParams={extraParams} />
    </div>
  );
}
