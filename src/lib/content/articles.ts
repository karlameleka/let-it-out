export type ArticleSection = {
  heading: string;
  paragraphs: string[];
  list?: string[];
};

export type Article = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  readMinutes: number;
  sections: ArticleSection[];
  references: string[];
};

export const ARTICLES: Article[] = [
  {
    slug: "stress-management-for-employees",
    title: "Stress Management for Employees: A Field Guide",
    excerpt:
      "Why work stress builds the way it does, and a few tools that actually help — used before you're already burnt out.",
    category: "Workplace wellbeing",
    readMinutes: 5,
    sections: [
      {
        heading: "Why a Slack notification can feel like a tiger",
        paragraphs: [
          "Stress isn't the enemy — it's an old survival system doing its job. A tight deadline or a tense meeting triggers the same alarm your ancestors used to outrun predators: cortisol rises, your heart rate climbs, your focus narrows. In short bursts, that's actually useful.",
          "The problem is when it never switches off. Endocrinologist Hans Selye called this the difference between short, motivating stress and the kind with no recovery period. Modern work is good at manufacturing the second kind — back-to-back meetings, notifications that never stop, no clear line between work and rest.",
          "One useful reframe: burnout usually isn't caused by demands alone. It's caused by demands that outpace your resources — autonomy, support, recovery time, a sense that the work means something. So managing stress isn't just \"relax harder.\" It's rebalancing both sides of that equation.",
        ],
      },
      {
        heading: "Five things that actually help",
        paragraphs: ["A short, practical toolkit — nothing that requires a retreat."],
        list: [
          "The physiological sigh: two quick inhales through the nose, then one long exhale. Stanford research found it's one of the fastest ways to calm your body down in real time. Try it before opening the email that's been sitting in your stomach.",
          "A dedicated \"worry window\": instead of fighting intrusive work thoughts all day, give them a fixed 10–15 minutes. Research on worry postponement shows this actually reduces how often they show up the rest of the day.",
          "\"If-then\" planning: decide your response before the stressful moment hits. Not \"I'll stay calm in tense meetings,\" but \"if my jaw tightens, then I'll unclench it and take one slow breath.\" Pre-deciding makes you far more likely to actually do it.",
          "Short, frequent breaks beat one long one. A few genuine minutes away from the task — not scrolling — every hour or so protects your mood and focus better than saving it all for one break at the end of a depleted day.",
          "Talk to someone. A few minutes with a trusted colleague lowers stress hormones faster than solitary coping, in study after study. Connection regulates your nervous system — it's not just a nice-to-have.",
        ],
      },
      {
        heading: "Making it stick",
        paragraphs: [
          "Individual tricks only go so far — they work best inside a few habits, not remembered only in a crisis.",
          "Protect the transition between things. Closing a laptop and instantly starting the next task keeps stress hormones elevated longer than you'd think. Even a five-minute buffer helps your body reset.",
          "Make it normal to say the deadline is tight out loud. Teams where asking for help is met with problem-solving, not judgment, see measurably less burnout — and it's the single highest-leverage thing a manager can offer.",
          "And once a week, ask yourself what gave you energy and what drained it. That simple habit surfaces patterns that willpower alone won't fix — and gives you something concrete to bring to your manager.",
          "Work stress will never hit zero, and it doesn't need to. The goal is a nervous system that gets enough recovery to keep meeting demands without quietly running on empty — and small, repeated habits do more for that than any single big gesture.",
        ],
      },
    ],
    references: [
      "Selye, H. (1976). The Stress of Life. McGraw-Hill.",
      "Bakker, A. B., & Demerouti, E. (2007). The Job Demands-Resources model: State of the art. Journal of Managerial Psychology, 22(3), 309–328.",
      "Balban, M. Y., et al. (2023). Brief structured respiration practices enhance mood and reduce physiological arousal. Cell Reports Medicine, 4(1).",
      "Gollwitzer, P. M. (1999). Implementation intentions: Strong effects of simple plans. American Psychologist, 54(7), 493–503.",
      "Trougakos, J. P., et al. (2014). Lunch breaks unpacked: The role of autonomy as a moderator of recovery during lunch. Academy of Management Journal, 57(2), 405–421.",
      "Crum, A. J., Salovey, P., & Achor, S. (2013). Rethinking stress: The role of mindsets in determining the stress response. Journal of Personality and Social Psychology, 104(4), 716–733.",
    ],
  },
  {
    slug: "importance-of-journaling",
    title: "The Importance of Journaling as a Healthy Habit",
    excerpt:
      "What actually happens when you write things down — and a few tricks to make it a habit that sticks past week two.",
    category: "Self-care habits",
    readMinutes: 4,
    sections: [
      {
        heading: "Why putting it on paper changes how you feel",
        paragraphs: [
          "Journaling can feel like an optional, soft habit — something you'll get to eventually. But the research behind it is surprisingly solid. Psychologist James Pennebaker found that people who wrote about emotionally significant experiences for 15–20 minutes, a few days in a row, showed real improvements — fewer doctor visits, better mood, weeks later.",
          "Part of why it works: writing turns a swirling, formless feeling into a structured story with a beginning and an end. Just naming an emotion — \"I feel anxious about this\" — has been shown to calm the brain's threat-detection center. Writing does that naturally.",
          "It also creates a little distance. There's real research behind that small shift from \"I am anxious\" to describing it more like an outside observer would — it tends to make problems feel more solvable and less overwhelming.",
          "And there's a simpler benefit: pattern recognition. Old entries show you the meetings that always drain you, or the worry that, in hindsight, resolved itself nine times out of ten. Hard to notice from inside one day — easy once it's written down.",
        ],
      },
      {
        heading: "Building a habit that survives week two",
        paragraphs: [
          "Journaling habits rarely fail because journaling doesn't work — they fail because they're set up to be hard to sustain. A few small adjustments fix that.",
        ],
        list: [
          "Lower the bar on purpose: three honest sentences count as a real entry. Consistency builds the habit; length can grow on its own later.",
          "Attach it to something you already do — after your morning coffee, before bed — so it doesn't rely on willpower alone.",
          "Use a prompt when you're stuck. \"What took more energy than it should have today?\" beats a blank page every time.",
          "Mix in one specific good thing sometimes, so it doesn't turn into pure venting.",
          "Let it be messy. Grammar and structure don't matter for the benefit — only being honest does. Give yourself permission to write badly.",
          "Keep it somewhere you'll actually see it. Visibility matters as much as motivation.",
        ],
      },
      {
        heading: "A small habit with an outsized return",
        paragraphs: [
          "Journaling isn't a cure-all, and it's not a replacement for professional support when you need it — but as a daily habit, it costs a few minutes and a willingness to be honest with yourself. Start smaller than feels meaningful. The habit that survives is the one you can actually keep doing.",
        ],
      },
    ],
    references: [
      "Pennebaker, J. W., & Beall, S. K. (1986). Confronting a traumatic event: Toward an understanding of inhibition and disease. Journal of Abnormal Psychology, 95(3), 274–281.",
      "Lieberman, M. D., et al. (2007). Putting feelings into words: Affect labeling disrupts amygdala activity. Psychological Science, 18(5), 421–428.",
      "Kross, E., et al. (2014). Self-talk as a regulatory mechanism: How you do it matters. Journal of Personality and Social Psychology, 106(2), 304–324.",
      "Lally, P., et al. (2010). How are habits formed: Modelling habit formation in the real world. European Journal of Social Psychology, 40(6), 998–1009.",
    ],
  },
];
