import type { Locale } from "@/lib/i18n/locale";

export type CoreEmotionId = "happy" | "sad" | "angry" | "fearful" | "surprised" | "disgusted";

export type Mood = {
  id: string;
  label: string;
  labelAr: string;
  core: CoreEmotionId;
  color: string;
};

/** The 6 starting options. Colors are drawn from the app's dedicated mood
 * accent palette — used only for mood dots/tags, never for chrome. */
export const CORE_EMOTIONS: { id: CoreEmotionId; label: string; labelAr: string; color: string }[] = [
  { id: "happy", label: "Happy", labelAr: "مبسوط", color: "#3388A4" },
  { id: "sad", label: "Sad", labelAr: "زعلان", color: "#8677A3" },
  { id: "angry", label: "Angry", labelAr: "متضايق", color: "#1E5B73" },
  { id: "fearful", label: "Fearful", labelAr: "خايف", color: "#D8E4FB" },
  { id: "surprised", label: "Surprised", labelAr: "متفاجئ", color: "#F5EFFA" },
  { id: "disgusted", label: "Disgusted", labelAr: "مشمئز", color: "#DDE7EA" },
];

/** More specific feelings revealed when a core emotion is picked — a small
 * feelings-wheel, not a fixed six. Each one gets its own shade rather than
 * inheriting its core's color outright: same hue and saturation as the
 * parent (so the family still reads as one color story, e.g. every "happy"
 * feeling stays teal), spread evenly in HSL lightness around the core's own
 * shade so every individual mood is visually distinct, not just its label. */
const SECONDARY_LABELS: Record<CoreEmotionId, { label: string; labelAr: string; color: string }[]> = {
  happy: [
    { label: "Calm", labelAr: "هادي", color: "#0C2027" },
    { label: "Content", labelAr: "راضي", color: "#13343E" },
    { label: "Peaceful", labelAr: "مطمئن", color: "#1B4756" },
    { label: "Amused", labelAr: "مستمتع", color: "#225A6D" },
    { label: "Brave", labelAr: "شجاع", color: "#296E84" },
    { label: "Confident", labelAr: "واثق", color: "#3894B3" },
    { label: "Excited", labelAr: "متحمس", color: "#44A5C5" },
    { label: "Grateful", labelAr: "ممتن", color: "#5CB0CC" },
    { label: "Hopeful", labelAr: "متفائل", color: "#73BCD3" },
    { label: "Joyful", labelAr: "مسرور", color: "#8AC7DB" },
    { label: "Passionate", labelAr: "شغوف", color: "#A2D2E2" },
    { label: "Proud", labelAr: "فخور", color: "#B9DDE9" },
    { label: "Relieved", labelAr: "مرتاح", color: "#D0E9F0" },
    { label: "Satisfied", labelAr: "قانع", color: "#E8F4F8" },
  ],
  sad: [
    { label: "Drained", labelAr: "منهك", color: "#594D71" },
    { label: "Indifferent", labelAr: "غير مبالي", color: "#685984" },
    { label: "Disappointed", labelAr: "خايب أمل", color: "#766596" },
    { label: "Discouraged", labelAr: "فاقد الحماس", color: "#9689AF" },
    { label: "Lonely", labelAr: "وحيد", color: "#A69CBC" },
    { label: "Hopeless", labelAr: "يائس", color: "#B7AEC8" },
  ],
  angry: [
    { label: "Annoyed", labelAr: "منزعج", color: "#0B212A" },
    { label: "Frustrated", labelAr: "محبط", color: "#113542" },
    { label: "Irritated", labelAr: "عصبي", color: "#18485B" },
    { label: "Jealous", labelAr: "غيران", color: "#246E8B" },
    { label: "Overwhelmed", labelAr: "مثقل", color: "#2B81A4" },
    { label: "Stressed", labelAr: "متوتر", color: "#3195BC" },
  ],
  fearful: [
    { label: "Anxious", labelAr: "قلقان", color: "#749FF1" },
    { label: "Embarrassed", labelAr: "محرج", color: "#90B2F4" },
    { label: "Scared", labelAr: "مرعوب", color: "#ACC5F6" },
    { label: "Worried", labelAr: "مهموم", color: "#C7D9F9" },
  ],
  surprised: [{ label: "Amazed", labelAr: "مندهش", color: "#E2D0F0" }],
  disgusted: [
    { label: "Guilty", labelAr: "حاسس بالذنب", color: "#C6D7DC" },
    { label: "Ashamed", labelAr: "خجلان", color: "#ECF2F3" },
  ],
};

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Flattened list of every selectable mood — core emotions plus all their
 * secondary feelings, each with its own distinct shade (see
 * SECONDARY_LABELS above). */
export const MOODS: Mood[] = CORE_EMOTIONS.flatMap((core) => [
  { id: core.id, label: core.label, labelAr: core.labelAr, core: core.id, color: core.color },
  ...SECONDARY_LABELS[core.id].map((s) => ({
    id: slugify(s.label),
    label: s.label,
    labelAr: s.labelAr,
    core: core.id,
    color: s.color,
  })),
]);

const MOOD_BY_ID = new Map(MOODS.map((m) => [m.id, m]));

export function getSecondaryEmotions(coreId: CoreEmotionId): Mood[] {
  return MOODS.filter((m) => m.core === coreId && m.id !== coreId);
}

/** Neutral fallback color for legacy or unrecognized mood values. */
const FALLBACK_COLOR = "#B9C4C8";

export function moodLabel(id: string, locale: Locale = "en"): string {
  const mood = MOOD_BY_ID.get(id);
  if (!mood) return id;
  return locale === "ar" ? mood.labelAr : mood.label;
}

export function moodColor(id: string): string {
  return MOOD_BY_ID.get(id)?.color ?? FALLBACK_COLOR;
}

/** The core (universal) emotion a mood id belongs to — e.g. "joyful" ->
 * "happy". Null for legacy/unrecognized values that predate this taxonomy. */
export function moodCore(id: string): CoreEmotionId | null {
  return MOOD_BY_ID.get(id)?.core ?? null;
}
