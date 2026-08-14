import { moodColor, moodLabel } from "@/lib/moods";

const SIZES = {
  sm: { badge: "h-8 w-8", dot: "h-3 w-3" },
  md: { badge: "h-10 w-10", dot: "h-4 w-4" },
};

export function MoodDot({ mood, size = "sm" }: { mood: string; size?: keyof typeof SIZES }) {
  const { badge, dot } = SIZES[size];
  return (
    <span
      title={moodLabel(mood)}
      className={`flex ${badge} shrink-0 items-center justify-center rounded-full border border-brand-100 bg-white shadow-sm`}
    >
      <span className={`${dot} rounded-full border border-black/10`} style={{ backgroundColor: moodColor(mood) }} />
    </span>
  );
}
