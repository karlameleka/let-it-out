import { getIntakeFormConfig, updateIntakeFormSections } from "@/lib/intake-form-config";
import IntakeFormEditor from "@/components/intake-form-editor";

export default async function AdminIntakeFormPage() {
  const { sections, sectionsAr } = await getIntakeFormConfig();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">Counseling intake form</h1>
      <p className="mt-1 text-sm text-ink/60">
        Shown to a client after a session request, via a private one-time link — never stored on our servers,
        sent straight to the counselor. Changes here apply to every link sent after saving. Arabic-locale
        clients see the Arabic version below when it has at least one section; otherwise they see the English
        version.
      </p>
      <div className="mt-6">
        <IntakeFormEditor sections={sections} sectionsAr={sectionsAr} action={updateIntakeFormSections} />
      </div>
    </div>
  );
}
