// A standard biopsychosocial intake — the same shape used across most
// private-practice intake packets (presenting concern, history, safety
// screening, goals). This is the single source of truth: the client form
// renders from it, and the submission handler uses it to turn raw FormData
// into labeled Q&A pairs for the therapist email and AI prompt, so the
// three never drift out of sync with each other.

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

export const INTAKE_SECTIONS: IntakeSection[] = [
  {
    id: "about-you",
    title: "About you",
    fields: [
      { name: "fullName", label: "Full legal name", type: "text", required: true },
      { name: "dateOfBirth", label: "Date of birth", type: "date", required: true },
      { name: "phone", label: "Phone number", type: "tel", required: true },
      { name: "occupation", label: "Occupation", type: "text" },
      { name: "livingSituation", label: "Who do you currently live with?", type: "text" },
    ],
  },
  {
    id: "presenting-concern",
    title: "What brings you here",
    fields: [
      {
        name: "mainConcern",
        label: "What brings you to therapy at this time?",
        type: "textarea",
        required: true,
      },
      { name: "concernDuration", label: "How long has this been going on?", type: "text", required: true },
      {
        name: "severityScale",
        label: "How much is this affecting your daily life right now?",
        type: "scale",
        required: true,
        helpText: "1 = barely noticeable, 10 = severely disruptive",
      },
      {
        name: "previousAttempts",
        label: "What have you already tried to address this?",
        type: "textarea",
      },
    ],
  },
  {
    id: "mental-health-history",
    title: "Mental health history",
    fields: [
      { name: "priorTherapy", label: "Have you received therapy or counseling before?", type: "yesno", required: true },
      {
        name: "priorTherapyDetails",
        label: "Briefly describe — when, how long, was it helpful?",
        type: "textarea",
        showIfYes: "priorTherapy",
      },
      { name: "priorDiagnosis", label: "Have you ever been diagnosed with a mental health condition?", type: "yesno", required: true },
      { name: "priorDiagnosisDetails", label: "Which condition(s), and when?", type: "textarea", showIfYes: "priorDiagnosis" },
      { name: "currentMedications", label: "Any medication you're currently taking for your mental health?", type: "textarea" },
      { name: "priorHospitalization", label: "Have you ever been hospitalized for a mental health concern?", type: "yesno", required: true },
    ],
  },
  {
    id: "medical-history",
    title: "Medical history",
    fields: [
      { name: "medicalConditions", label: "Any current medical conditions we should know about?", type: "textarea" },
      { name: "otherMedications", label: "Any other medications you're currently taking?", type: "textarea" },
      { name: "allergies", label: "Any allergies?", type: "text" },
    ],
  },
  {
    id: "substance-use",
    title: "Substance use",
    fields: [
      {
        name: "alcoholUse",
        label: "How often do you drink alcohol?",
        type: "select",
        required: true,
        options: ["Never", "Occasionally", "Regularly", "Prefer not to say"],
      },
      { name: "substanceUse", label: "Any recreational drug or tobacco use you'd like to share?", type: "textarea" },
    ],
  },
  {
    id: "family-social",
    title: "Family & support",
    fields: [
      { name: "familyMentalHealthHistory", label: "Any family history of mental illness or substance use?", type: "textarea" },
      { name: "supportSystem", label: "Who do you turn to for support? (family, friends, partner, none)", type: "textarea", required: true },
      { name: "currentStressors", label: "What's currently the biggest source of stress in your life?", type: "textarea", required: true },
    ],
  },
  {
    id: "safety",
    title: "A few safety questions",
    description:
      "These are standard questions every therapist asks — they help your therapist take care of you properly, not to judge you.",
    note:
      "If you are in crisis or in danger right now, please don't wait for this form — contact the Egyptian National Crisis Hotline at 16328 or your local emergency services immediately.",
    fields: [
      { name: "suicidalThoughts", label: "Are you currently having thoughts of harming yourself?", type: "yesno", required: true },
      {
        name: "suicidalThoughtsDetails",
        label: "Please share more — your therapist will follow up with you directly.",
        type: "textarea",
        showIfYes: "suicidalThoughts",
      },
      { name: "priorSelfHarm", label: "Have you ever attempted to harm yourself or attempted suicide?", type: "yesno", required: true },
      { name: "harmToOthers", label: "Are you currently having thoughts of harming someone else?", type: "yesno", required: true },
      { name: "feelSafe", label: "Do you feel safe in your current home/living situation?", type: "yesno", required: true },
    ],
  },
  {
    id: "goals",
    title: "Your goals",
    fields: [
      { name: "therapyGoals", label: "What would you like to work on or get out of therapy?", type: "textarea", required: true },
      { name: "successLooksLike", label: "What would meaningful progress look like to you?", type: "textarea" },
    ],
  },
  {
    id: "emergency-contact",
    title: "Emergency contact",
    description: "Only ever contacted in a genuine emergency.",
    fields: [
      { name: "emergencyContactName", label: "Name", type: "text", required: true },
      { name: "emergencyContactRelationship", label: "Relationship to you", type: "text", required: true },
      { name: "emergencyContactPhone", label: "Phone number", type: "tel", required: true },
    ],
  },
];

export const INTAKE_CONSENT_FIELD_NAME = "consent";

/** Turns raw FormData values into labeled Q&A pairs, skipping unanswered
 * optional fields and conditional fields whose parent wasn't "Yes". */
export function buildIntakeAnswers(formData: FormData): { section: string; label: string; value: string }[] {
  const entries: { section: string; label: string; value: string }[] = [];
  for (const section of INTAKE_SECTIONS) {
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
