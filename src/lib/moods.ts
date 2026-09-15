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
 * feelings-wheel, not a fixed six. */
const SECONDARY_LABELS: Record<CoreEmotionId, { label: string; labelAr: string }[]> = {
  happy: [
    { label: "Calm", labelAr: "هادي" },
    { label: "Content", labelAr: "راضي" },
    { label: "Peaceful", labelAr: "مطمئن" },
    { label: "Amused", labelAr: "مستمتع" },
    { label: "Brave", labelAr: "شجاع" },
    { label: "Confident", labelAr: "واثق" },
    { label: "Excited", labelAr: "متحمس" },
    { label: "Grateful", labelAr: "ممتن" },
    { label: "Hopeful", labelAr: "متفائل" },
    { label: "Joyful", labelAr: "مسرور" },
    { label: "Passionate", labelAr: "شغوف" },
    { label: "Proud", labelAr: "فخور" },
    { label: "Relieved", labelAr: "مرتاح" },
    { label: "Satisfied", labelAr: "قانع" },
  ],
  sad: [
    { label: "Drained", labelAr: "منهك" },
    { label: "Indifferent", labelAr: "غير مبالي" },
    { label: "Disappointed", labelAr: "خايب أمل" },
    { label: "Discouraged", labelAr: "فاقد الحماس" },
    { label: "Lonely", labelAr: "وحيد" },
    { label: "Hopeless", labelAr: "يائس" },
  ],
  angry: [
    { label: "Annoyed", labelAr: "منزعج" },
    { label: "Frustrated", labelAr: "محبط" },
    { label: "Irritated", labelAr: "عصبي" },
    { label: "Jealous", labelAr: "غيران" },
    { label: "Overwhelmed", labelAr: "مثقل" },
    { label: "Stressed", labelAr: "متوتر" },
  ],
  fearful: [
    { label: "Anxious", labelAr: "قلقان" },
    { label: "Embarrassed", labelAr: "محرج" },
    { label: "Scared", labelAr: "مرعوب" },
    { label: "Worried", labelAr: "مهموم" },
  ],
  surprised: [{ label: "Amazed", labelAr: "مندهش" }],
  disgusted: [
    { label: "Guilty", labelAr: "حاسس بالذنب" },
    { label: "Ashamed", labelAr: "خجلان" },
  ],
};

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Flattened list of every selectable mood — core emotions plus all their
 * secondary feelings, each carrying its parent's color. */
export const MOODS: Mood[] = CORE_EMOTIONS.flatMap((core) => [
  { id: core.id, label: core.label, labelAr: core.labelAr, core: core.id, color: core.color },
  ...SECONDARY_LABELS[core.id].map((s) => ({
    id: slugify(s.label),
    label: s.label,
    labelAr: s.labelAr,
    core: core.id,
    color: core.color,
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
