import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { requireCounselor } from "@/lib/therapist-session";
import TherapistProfileForm from "./profile-form";
import TherapistPricingForm from "./pricing-form";

export default async function TherapistProfilePage() {
  const session = await requireCounselor();
  const counselor = await prisma.counselor.findUnique({ where: { id: session.counselorId } });
  if (!counselor) notFound();

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display font-semibold text-brand-900">Profile</h2>
        <p className="mt-1 text-sm text-ink/60">What clients see on your public counseling page.</p>
        <div className="mt-5">
          <TherapistProfileForm
            credentials={counselor.credentials}
            bio={counselor.bio}
            email={counselor.email ?? ""}
            specialties={counselor.specialties}
            languages={counselor.languages}
            photoUrl={counselor.photoUrl}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-brand-100 bg-white p-6">
        <h2 className="font-display font-semibold text-brand-900">Pricing &amp; availability</h2>
        <p className="mt-1 text-sm text-ink/60">Controls whether booking is live and what it costs.</p>
        <div className="mt-5">
          <TherapistPricingForm
            priceEGP={counselor.priceEGP}
            availabilityStatus={counselor.availabilityStatus}
          />
        </div>
      </div>
    </div>
  );
}
