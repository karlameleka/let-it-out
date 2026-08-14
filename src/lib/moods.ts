export const MOODS = [
  { emoji: "😊", label: "Great" },
  { emoji: "😌", label: "Calm" },
  { emoji: "😐", label: "Neutral" },
  { emoji: "😔", label: "Low" },
  { emoji: "😣", label: "Stressed" },
  { emoji: "😴", label: "Tired" },
] as const;

export function moodLabel(emoji: string): string {
  return MOODS.find((m) => m.emoji === emoji)?.label ?? emoji;
}
