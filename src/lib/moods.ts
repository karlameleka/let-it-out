export type CoreEmotionId = "happy" | "sad" | "angry" | "fearful" | "surprised" | "disgusted";

export type Mood = {
  id: string;
  label: string;
  core: CoreEmotionId;
  color: string;
};

/** The 6 starting options. Colors are drawn from the app's dedicated mood
 * accent palette — used only for mood dots/tags, never for chrome. */
export const CORE_EMOTIONS: { id: CoreEmotionId; label: string; color: string }[] = [
  { id: "happy", label: "Happy", color: "#3388A4" },
  { id: "sad", label: "Sad", color: "#8677A3" },
  { id: "angry", label: "Angry", color: "#1E5B73" },
  { id: "fearful", label: "Fearful", color: "#D8E4FB" },
  { id: "surprised", label: "Surprised", color: "#F5EFFA" },
  { id: "disgusted", label: "Disgusted", color: "#DDE7EA" },
];

/** More specific feelings revealed when a core emotion is picked — a small
 * feelings-wheel, not a fixed six. */
const SECONDARY_LABELS: Record<CoreEmotionId, string[]> = {
  happy: ["Content", "Proud", "Grateful", "Optimistic", "Playful", "Excited"],
  sad: ["Lonely", "Disappointed", "Hurt", "Discouraged", "Guilty", "Numb"],
  angry: ["Frustrated", "Irritated", "Resentful", "Defensive", "Jealous", "Overwhelmed"],
  fearful: ["Anxious", "Nervous", "Insecure", "Worried", "Vulnerable", "Helpless"],
  surprised: ["Confused", "Amazed", "Startled", "Curious", "Energized", "Hopeful"],
  disgusted: ["Embarrassed", "Ashamed", "Uncomfortable", "Judgmental", "Rejected", "Withdrawn"],
};

function slugify(label: string): string {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

/** Flattened list of every selectable mood — core emotions plus all their
 * secondary feelings, each carrying its parent's color. */
export const MOODS: Mood[] = CORE_EMOTIONS.flatMap((core) => [
  { id: core.id, label: core.label, core: core.id, color: core.color },
  ...SECONDARY_LABELS[core.id].map((label) => ({
    id: slugify(label),
    label,
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

export function moodLabel(id: string): string {
  return MOOD_BY_ID.get(id)?.label ?? id;
}

export function moodColor(id: string): string {
  return MOOD_BY_ID.get(id)?.color ?? FALLBACK_COLOR;
}
