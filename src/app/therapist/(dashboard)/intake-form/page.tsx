import { notFound } from "next/navigation";
import { getCurrentCounselor } from "@/lib/therapist-session";
import { prisma } from "@/lib/db";
import { getIntakeFormConfig, updateIntakeFormSections } from "@/lib/intake-form-config";
import IntakeFormEditor from "@/components/intake-form-editor";

export default async function TherapistIntakeFormPage() {
  const session = await getCurrentCounselor();
  if (!session) notFound();

  const counselor = await prisma.counselor.findUnique({
    where: { id: session.counselorId },
    select: { canEditFormsConfig: true },
  });
  if (!counselor?.canEditFormsConfig) notFound();

  const { sections, sectionsAr } = await getIntakeFormConfig();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">Counseling intake form</h1>
      <p className="mt-1 text-sm text-ink/60">
        Shown to a client after a session request, via a private one-time link — never stored on our servers,
        sent straight to the counselor. This is the same form used sitewide, for every counselor&rsquo;s
        clients, not just your own — changes here apply to every link sent after saving. Arabic-locale clients
        see the Arabic version below when it has at least one section; otherwise they see the English version.
      </p>
      <div className="mt-6">
        <IntakeFormEditor sections={sections} sectionsAr={sectionsAr} action={updateIntakeFormSections} />
      </div>
    </div>
  );
}
