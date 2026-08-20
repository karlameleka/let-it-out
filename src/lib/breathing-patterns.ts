export type BreathingPhaseLabel = "Inhale" | "Hold" | "Exhale";

export type BreathingPhase = { label: BreathingPhaseLabel; seconds: number };

export type BreathingPattern = {
  id: string;
  name: string;
  tagline: string;
  description: string;
  phases: BreathingPhase[];
};

export const BREATHING_PATTERNS: BreathingPattern[] = [
  {
    id: "box",
    name: "Box Breathing",
    tagline: "4-4-4-4",
    description: "Equal-count breathing used to sharpen focus and steady nerves before something stressful.",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
      { label: "Exhale", seconds: 4 },
      { label: "Hold", seconds: 4 },
    ],
  },
  {
    id: "4-7-8",
    name: "4-7-8 Breathing",
    tagline: "4-7-8",
    description: "A longer exhale than inhale, designed to wind you down — often used before sleep.",
    phases: [
      { label: "Inhale", seconds: 4 },
      { label: "Hold", seconds: 7 },
      { label: "Exhale", seconds: 8 },
    ],
  },
  {
    id: "coherent",
    name: "Coherent Breathing",
    tagline: "5-5",
    description: "Smooth, equal in-and-out breathing at about six breaths a minute — shown to improve heart-rate variability.",
    phases: [
      { label: "Inhale", seconds: 5 },
      { label: "Exhale", seconds: 5 },
    ],
  },
];

export const CYCLE_OPTIONS = [4, 6, 8];
