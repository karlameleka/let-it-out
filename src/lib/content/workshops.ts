export type WorkshopTopic = {
  slug: string;
  title: string;
  description: string;
};

export const WORKSHOP_TOPICS: WorkshopTopic[] = [
  {
    slug: "stress-management",
    title: "Stress-Management",
    description:
      "Practical, evidence-based tools for recognizing stress triggers and building sustainable coping habits under pressure.",
  },
  {
    slug: "burnout-prevention",
    title: "Burnout Prevention",
    description:
      "Helping teams recognize early signs of burnout and build boundaries and habits that protect long-term wellbeing.",
  },
  {
    slug: "mental-health-first-aid",
    title: "Mental Health First-Aid",
    description:
      "Equipping employees and staff with the awareness and language to recognize and respond to mental health concerns in others.",
  },
  {
    slug: "parenting-101",
    title: "Parenting 101",
    description:
      "Foundational, psychology-backed guidance for parents navigating the everyday emotional needs of their children.",
  },
  {
    slug: "bridging-generational-gaps",
    title: "Bridging Generational Gaps",
    description:
      "Building understanding and communication across generations in the workplace or family, rooted in empathy and shared language.",
  },
  {
    slug: "self-expression-through-art",
    title: "Self-Expression Through Art",
    description:
      "An interactive, creative workshop using art as a tool for emotional processing and self-exploration — no artistic experience required.",
  },
  {
    slug: "tailored-topics",
    title: "Tailored Topics",
    description:
      "Have something specific in mind? We design custom sessions around your organization's or community's unique needs.",
  },
];
