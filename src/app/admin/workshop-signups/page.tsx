import { prisma } from "@/lib/db";
import { deleteWorkshopSignup } from "@/lib/admin-actions";
import ConfirmSubmitButton from "@/components/confirm-submit-button";

export default async function AdminWorkshopSignupsPage() {
  const signups = await prisma.workshopInterestSignup.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <p className="mb-4 text-sm text-ink/60">
        {signups.length} {signups.length === 1 ? "person" : "people"} asked to
        be notified about the next workshop.
      </p>
      {signups.length === 0 ? (
        <p className="text-sm text-ink/60">No signups yet.</p>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-brand-100 bg-white">
          <table className="w-full text-left text-sm">
            <thead className="bg-brand-50 text-xs font-semibold uppercase tracking-wide text-brand-700">
              <tr>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Signed up</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody>
              {signups.map((s) => (
                <tr key={s.id} className="border-t border-brand-50">
                  <td className="px-5 py-3">{s.email}</td>
                  <td className="px-5 py-3 text-ink/60">
                    {s.createdAt.toLocaleString("en-GB")}
                  </td>
                  <td className="px-5 py-3 text-right">
                    <form action={deleteWorkshopSignup}>
                      <input type="hidden" name="id" value={s.id} />
                      <ConfirmSubmitButton
                        confirmMessage="Delete this signup permanently? This can't be undone."
                        className="rounded-lg border border-red-200 px-3 py-1 text-xs font-medium text-red-700 hover:bg-red-50"
                      >
                        Delete
                      </ConfirmSubmitButton>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
