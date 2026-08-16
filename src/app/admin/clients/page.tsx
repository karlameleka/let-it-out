import { prisma } from "@/lib/db";

export default async function AdminClientsPage() {
  const clients = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, email: true, accountCode: true, createdAt: true },
  });

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink/60">
        {clients.length} registered {clients.length === 1 ? "client" : "clients"}. Journal entry counts
        aren&apos;t shown here — journal entries are stored only on each client&apos;s own device (encrypted,
        never sent to our servers), so there&apos;s nothing about their content or volume for us to see.
      </p>
      <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wide text-brand-700">
            <tr>
              <th className="px-5 py-3">Name</th>
              <th className="px-5 py-3">Account code</th>
              <th className="px-5 py-3">Email</th>
              <th className="px-5 py-3">Joined</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((c) => (
              <tr key={c.id} className="border-t border-brand-50">
                <td className="px-5 py-3 font-medium text-ink/90">{c.name}</td>
                <td className="px-5 py-3">
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {c.accountCode}
                  </span>
                </td>
                <td className="px-5 py-3 text-ink/70">{c.email}</td>
                <td className="px-5 py-3 text-ink/60">{c.createdAt.toLocaleDateString("en-GB")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
