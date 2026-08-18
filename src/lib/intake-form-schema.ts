// Types + pure helpers for the counseling intake form. The actual question
// content lives in the database (see intake-form-config.ts) so it's
// editable from /admin/intake-form — this file stays client-safe (no
// "server-only" guard) since intake-form.tsx renders directly from these
// types on the client.

export type IntakeFieldType = "text" | "textarea" | "tel" | "date" | "select" | "yesno" | "scale";

export interface IntakeField {
  name: string;
  label: string;
  type: IntakeFieldType;
  required?: boolean;
  helpText?: string;
  options?: string[];
  /** Only rendered/included when the field with this name is answered "Yes". */
  showIfYes?: string;
}

export interface IntakeSection {
  id: string;
  title: string;
  description?: string;
  note?: string;
  fields: IntakeField[];
}

export const INTAKE_CONSENT_FIELD_NAME = "consent";

/** Turns raw FormData values into labeled Q&A pairs, skipping unanswered
 * optional fields and conditional fields whose parent wasn't "Yes". */
export function buildIntakeAnswers(
  sections: IntakeSection[],
  formData: FormData,
): { section: string; label: string; value: string }[] {
  const entries: { section: string; label: string; value: string }[] = [];
  for (const section of sections) {
    for (const field of section.fields) {
      if (field.showIfYes && formData.get(field.showIfYes) !== "Yes") continue;
      const raw = formData.get(field.name);
      const value = typeof raw === "string" ? raw.trim() : "";
      if (!value) continue;
      entries.push({ section: section.title, label: field.label, value });
    }
  }
  return entries;
}
