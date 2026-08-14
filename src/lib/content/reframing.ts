export type ReframingPrompt = {
  category: string;
  situation: string;
  thought: string;
};

/** A bank of common automatic-thought scenarios across everyday life
 * domains, shuffled by the cognitive reframing tool so no two sessions
 * feel the same. */
export const REFRAMING_PROMPTS: ReframingPrompt[] = [
  // Work
  {
    category: "Work",
    situation: "Your manager hasn't responded to your message in two days.",
    thought: "They must be annoyed with me, or thinking about letting me go.",
  },
  {
    category: "Work",
    situation: "You made a small mistake in a report you sent out.",
    thought: "I'm going to get in serious trouble for this.",
  },
  {
    category: "Work",
    situation: "A coworker got the promotion you were hoping for.",
    thought: "I'm never going to get anywhere in this company.",
  },
  {
    category: "Work",
    situation: "You spoke up in a meeting and nobody responded.",
    thought: "That was a stupid thing to say. Everyone thinks less of me now.",
  },
  {
    category: "Work",
    situation: "You have a big presentation coming up next week.",
    thought: "I'm going to freeze up and embarrass myself in front of everyone.",
  },
  // Relationships
  {
    category: "Relationships",
    situation: "A friend hasn't texted back in a few days.",
    thought: "They're pulling away from me. I must have done something wrong.",
  },
  {
    category: "Relationships",
    situation: "Your partner seemed distracted during dinner tonight.",
    thought: "They're losing interest in me.",
  },
  {
    category: "Relationships",
    situation: "You canceled plans because you weren't feeling up to it.",
    thought: "Now they'll think I'm unreliable and stop inviting me places.",
  },
  {
    category: "Relationships",
    situation: "A family gathering didn't go the way you'd hoped.",
    thought: "Get-togethers are always ruined because of me.",
  },
  {
    category: "Relationships",
    situation: "You and a close friend had a small disagreement.",
    thought: "This is going to change everything between us.",
  },
  // Self-image
  {
    category: "Self-image",
    situation: "You didn't finish everything on your to-do list today.",
    thought: "I'm lazy, and I can't get anything right.",
  },
  {
    category: "Self-image",
    situation: "You caught yourself comparing your life to someone else's online.",
    thought: "Everyone else has it figured out except me.",
  },
  {
    category: "Self-image",
    situation: "You received a piece of critical feedback at work.",
    thought: "I'm just bad at this. I should probably quit.",
  },
  {
    category: "Self-image",
    situation: "You forgot something you'd meant to do.",
    thought: "I'm so forgetful. Something must be wrong with me.",
  },
  {
    category: "Self-image",
    situation: "You had a visibly anxious moment in a public place.",
    thought: "Everyone noticed, and now they think I'm weird.",
  },
  // Health & routine
  {
    category: "Health & routine",
    situation: "You skipped your workout for the third day in a row.",
    thought: "I've completely fallen off. There's no point starting again.",
  },
  {
    category: "Health & routine",
    situation: "You didn't sleep well last night.",
    thought: "Today is going to be a disaster because of it.",
  },
  {
    category: "Health & routine",
    situation: "You ate something you'd told yourself you wouldn't.",
    thought: "I have no self-control at all.",
  },
  {
    category: "Health & routine",
    situation: "You felt unusually tired in the middle of the day.",
    thought: "Something must be seriously wrong with me.",
  },
  // Social & belonging
  {
    category: "Social & belonging",
    situation: "You weren't invited to something your friends went to.",
    thought: "They don't actually like having me around.",
  },
  {
    category: "Social & belonging",
    situation: "You said something a little awkward in a group conversation.",
    thought: "Everyone's going to remember that and judge me for it.",
  },
  {
    category: "Social & belonging",
    situation: "You saw two coworkers laughing and glance your way.",
    thought: "They were talking about me.",
  },
  {
    category: "Social & belonging",
    situation: "You haven't made a new friend in a long time.",
    thought: "There's something wrong with me that keeps people at a distance.",
  },
  {
    category: "Social & belonging",
    situation: "You turned down an invitation because you needed to rest.",
    thought: "People are going to stop inviting me altogether now.",
  },
];

export type CognitiveDistortion = {
  id: string;
  label: string;
  description: string;
};

/** The standard CBT list of common "thinking traps" (Burns, 1980). Shown
 * as a checklist so the exercise doubles as a light primer on the terms. */
export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
  {
    id: "all-or-nothing",
    label: "All-or-nothing thinking",
    description: "Seeing things in black-and-white categories, with no middle ground.",
  },
  {
    id: "catastrophizing",
    label: "Catastrophizing",
    description: "Assuming the worst possible outcome will happen.",
  },
  {
    id: "mind-reading",
    label: "Mind reading",
    description: "Assuming you know what someone else is thinking about you.",
  },
  {
    id: "overgeneralization",
    label: "Overgeneralization",
    description: "Seeing a single negative event as an endless pattern.",
  },
  {
    id: "should-statements",
    label: "\"Should\" statements",
    description: "Holding yourself to a rigid rule and feeling guilty when it isn't met.",
  },
  {
    id: "labeling",
    label: "Labeling",
    description: "Attaching a harsh global label to yourself instead of the specific behavior.",
  },
  {
    id: "emotional-reasoning",
    label: "Emotional reasoning",
    description: "Assuming that because you feel it, it must be true.",
  },
  {
    id: "fortune-telling",
    label: "Fortune telling",
    description: "Predicting things will go badly, as if it were already decided.",
  },
  {
    id: "personalization",
    label: "Personalization",
    description: "Blaming yourself for something that wasn't (entirely) your fault.",
  },
  {
    id: "mental-filter",
    label: "Mental filter",
    description: "Dwelling on one negative detail while screening out the positives.",
  },
];
