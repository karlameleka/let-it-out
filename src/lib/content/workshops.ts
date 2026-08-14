export type WorkshopTopic = {
  slug: string;
  title: string;
  description: string;
  stat?: string;
  statSource?: string;
};

export const WORKSHOP_TOPICS: WorkshopTopic[] = [
  {
    slug: "stress-management",
    title: "Stress-Management",
    description:
      "Practical, evidence-based tools for recognizing stress triggers and building sustainable coping habits under pressure.",
    stat: "55% of GCC employees report high day-to-day distress, versus 32% globally.",
    statSource: "McKinsey Health Institute",
  },
  {
    slug: "burnout-prevention",
    title: "Burnout Prevention",
    description:
      "Helping teams recognize early signs of burnout and build boundaries and habits that protect long-term wellbeing.",
    stat: "Nearly 1 in 3 GCC employees report burnout symptoms, and 36% intend to leave their job — over twice the global rate.",
    statSource: "McKinsey Health Institute",
  },
  {
    slug: "mental-health-first-aid",
    title: "Mental Health First-Aid",
    description:
      "Equipping employees and staff with the awareness and language to recognize and respond to mental health concerns in others.",
    stat: "66% of people in the GCC have faced a mental health challenge, yet nearly 9 in 10 young adults avoid seeking help for fear of judgment.",
    statSource: "Regional youth mental health survey, via Workplace Options",
  },
  {
    slug: "parenting-101",
    title: "Parenting 101",
    description:
      "Foundational, psychology-backed guidance for parents navigating the everyday emotional needs of their children.",
    stat: "At least 5% of parents worldwide experience parental burnout — often invisible until it affects the whole family.",
    statSource: "Roskam & Mikolajczak, 42-country international study",
  },
  {
    slug: "bridging-generational-gaps",
    title: "Bridging Generational Gaps",
    description:
      "Building understanding and communication across generations in the workplace or family, rooted in empathy and shared language.",
    stat: "62% of employees say generational differences fuel workplace conflict, and 39% report real communication breakdowns because of them.",
    statSource: "Cross-generational workplace research",
  },
  {
    slug: "self-expression-through-art",
    title: "Self-Expression Through Art",
    description:
      "An interactive, creative workshop using art as a tool for emotional processing and self-exploration — no artistic experience required.",
    stat: "Across 35 studies and 3,000+ participants, visual art therapy produced a significant, measurable drop in anxiety symptoms.",
    statSource: "Huang et al., meta-analysis, Journal of Psychiatric and Mental Health Nursing",
  },
  {
    slug: "tailored-topics",
    title: "Tailored Topics",
    description:
      "Have something specific in mind? We design custom sessions around your organization's or community's unique needs.",
    stat: "Every $1 invested in workplace mental health support returns about $4 in improved health and productivity.",
    statSource: "World Health Organization",
  },
];
