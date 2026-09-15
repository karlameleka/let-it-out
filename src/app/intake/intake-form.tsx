"use client";

import { useActionState } from "react";
import { ShieldCheck, CheckCircle2 } from "lucide-react";
import { Container, Button } from "@/components/ui";
import { submitIntakeFormAction } from "@/lib/intake-actions";
import { INTAKE_CONSENT_FIELD_NAME, type IntakeField, type IntakeSection } from "@/lib/intake-form-schema";
import type { Dictionary } from "@/lib/i18n/dictionary";

const inputClasses =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";

function Field({ field, dict }: { field: IntakeField; dict: Dictionary["intake"] }) {
  if (field.type === "yesno") {
    return (
      <fieldset>
        <legend className="mb-1.5 text-sm font-medium text-ink/80">
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </legend>
        <div className="flex gap-4">
          {[dict.yes, dict.no].map((opt) => (
            <label key={opt} className="flex items-center gap-1.5 text-sm text-ink/70">
              <input type="radio" name={field.name} value={opt} required={field.required} className="h-4 w-4 border-brand-300 text-brand-600 focus:ring-brand-400" />
              {opt}
            </label>
          ))}
        </div>
      </fieldset>
    );
  }

  if (field.type === "select") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        <select id={field.name} name={field.name} required={field.required} defaultValue="" className={inputClasses}>
          <option value="" disabled>{dict.select}</option>
          {field.options?.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "scale") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        {field.helpText && <p className="mb-1.5 text-xs text-ink/50">{field.helpText}</p>}
        <select id={field.name} name={field.name} required={field.required} defaultValue="" className={inputClasses}>
          <option value="" disabled>{dict.selectANumber}</option>
          {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
      </div>
    );
  }

  if (field.type === "textarea") {
    return (
      <div>
        <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor={field.name}>
          {field.label}
          {field.required && <span className="text-red-500"> *</span>}
        </label>
        {field.helpText && <p className="mb-1.5 text-xs text-ink/50">{field.helpText}</p>}
        <textarea id={field.name} name={field.name} required={field.required} rows={3} className={inputClasses} />
      </div>
    );
  }

  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-ink/80" htmlFor={field.name}>
        {field.label}
        {field.required && <span className="text-red-500"> *</span>}
      </label>
      {field.helpText && <p className="mb-1.5 text-xs text-ink/50">{field.helpText}</p>}
      <input
        id={field.name}
        name={field.name}
        type={field.type === "date" ? "date" : field.type === "tel" ? "tel" : "text"}
        required={field.required}
        className={inputClasses}
      />
    </div>
  );
}

export default function IntakeForm({
  token,
  clientName,
  counselorName,
  sections,
  dict,
}: {
  token: string;
  clientName: string;
  counselorName: string;
  sections: IntakeSection[];
  dict: Dictionary["intake"];
}) {
  const [state, formAction, pending] = useActionState(submitIntakeFormAction, undefined);
  const firstName = clientName.split(" ")[0];

  if (state?.success) {
    return (
      <Container className="max-w-lg py-20 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-brand-600" strokeWidth={1.5} />
        <h1 className="mt-4 font-display text-2xl font-semibold text-brand-900">
          {dict.thankYouTitle.replace("{name}", firstName)}
        </h1>
        <p className="mt-3 text-sm text-ink/60">{dict.thankYouBody.replace("{counselor}", counselorName)}</p>
      </Container>
    );
  }

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <h1 className="font-display text-2xl font-semibold text-brand-900 sm:text-3xl">
        {dict.formTitle.replace("{counselor}", counselorName)}
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        {dict.formGreeting.replace("{name}", firstName).replace("{counselor}", counselorName)}
      </p>

      <div className="mt-6 flex gap-3 rounded-2xl border border-brand-200 bg-brand-50 p-4">
        <ShieldCheck className="h-5 w-5 shrink-0 text-brand-600" strokeWidth={2} />
        <p className="text-sm text-ink/70">
          <strong className="text-ink/90">{dict.confidentialLabel}</strong>{" "}
          {dict.confidentialBody.replace("{counselor}", counselorName)}
        </p>
      </div>

      <form action={formAction} className="mt-8 space-y-8">
        <input type="hidden" name="token" value={token} />

        {sections.map((section) => (
          <div key={section.id} className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
            <h2 className="font-display text-lg font-semibold text-brand-900">{section.title}</h2>
            {section.description && <p className="mt-1 text-sm text-ink/60">{section.description}</p>}
            {section.note && (
              <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-red-700">{section.note}</p>
            )}
            <div className="mt-4 space-y-4">
              {section.fields.map((field) => (
                <Field key={field.name} field={field} dict={dict} />
              ))}
            </div>
          </div>
        ))}

        <div className="rounded-2xl border border-brand-100 bg-white p-5 sm:p-6">
          <label className="flex items-start gap-3">
            <input
              type="checkbox"
              name={INTAKE_CONSENT_FIELD_NAME}
              required
              className="mt-0.5 h-4 w-4 rounded border-brand-300 text-brand-600 focus:ring-brand-400"
            />
            <span className="text-sm text-ink/80">{dict.consentText.replace("{counselor}", counselorName)}</span>
          </label>
        </div>

        {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

        <Button type="submit" disabled={pending} className="w-full">
          {pending ? dict.sendingSecurely : dict.submitIntakeForm}
        </Button>
      </form>
    </Container>
  );
}
