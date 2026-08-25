// Static, curated content for the therapist portal's "Toolkit" page and the
// condensed sidebar shown on a client's profile — reference material and
// quick links a therapist might reach for during or around a session.
// Not admin-editable (unlike client-facing content); revisit if it needs to
// grow past a fixed reference list.

export type ClientTool = {
  title: string;
  description: string;
  href: string;
};

/** The same interactive exercises clients can use on their own — useful to
 * walk through together in session, or to recommend as homework. */
export const CLIENT_TOOLS: ClientTool[] = [
  {
    title: "Guided Breathing",
    description: "Box breathing, 4-7-8, and coherent breathing, paced with a visual guide.",
    href: "/resources/breathing",
  },
  {
    title: "Cognitive Reframing",
    description: "Walks through catching, examining, and reframing a stuck thought.",
    href: "/resources/cognitive-reframing",
  },
  {
    title: "5-4-3-2-1 Grounding",
    description: "A short sensory grounding exercise for acute anxiety or dissociation.",
    href: "/resources/cbt-exercises/grounding",
  },
  {
    title: "Tiny Next Step",
    description: "Behavioral activation — shrinks an overwhelming task to one tiny step.",
    href: "/resources/cbt-exercises/next-step",
  },
];

export type PromptCard = {
  title: string;
  prompts: string[];
};

export const SESSION_PROMPTS: PromptCard[] = [
  {
    title: "Opening a session",
    prompts: [
      "What's been on your mind since we last spoke?",
      "On a scale of 1-10, how has this week felt compared to last?",
      "Is there anything from last session you've been sitting with?",
      "What would make today's session feel worthwhile to you?",
    ],
  },
  {
    title: "When a client feels stuck",
    prompts: [
      "What would it look like if this went a little better, not perfectly?",
      "What's one thing within your control here?",
      "What have you tried before that helped, even a little?",
      "If a friend told you this, what would you say to them?",
    ],
  },
  {
    title: "Ending a session",
    prompts: [
      "What's one thing you're taking away from today?",
      "Is there anything we didn't get to that we should start with next time?",
      "What's one small thing you could try before we meet again?",
      "How are you feeling right now, before we close?",
    ],
  },
];

/** Deliberately short and action-oriented — this is a during-session quick
 * reference, not clinical guidance. Mirrors the hotline shown sitewide in
 * the footer/help button (tel:16328). */
export const CRISIS_PROTOCOL = {
  hotline: "16328",
  hotlineLabel: "Egyptian National Crisis Hotline",
  steps: [
    "Stay present — don't rush to end the call/session.",
    "Ask directly: \"Are you thinking about harming yourself?\" Direct questions don't plant the idea.",
    "Assess immediacy: do they have a plan, means, and timeline?",
    "If there's immediate danger, help them contact emergency services or the hotline above — offer to stay on the line while they do.",
    "Document what was discussed and follow up according to your own clinical protocol.",
  ],
};
