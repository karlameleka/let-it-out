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
};

export const ARTICLES: Article[] = [
  {
    slug: "stress-management-for-employees",
    title: "Stress Management for Employees: A Science-Backed Field Guide",
    excerpt:
      "Why workplace stress builds the way it does, and a set of practical, research-informed tools to work with it instead of against it.",
    category: "Workplace wellbeing",
    readMinutes: 9,
    sections: [
      {
        heading: "Part 1 — What stress actually is (and why your body treats a Slack notification like a tiger)",
        paragraphs: [
          "Stress gets a bad reputation, but it starts as a useful system. When your brain perceives a threat — a tight deadline, a tense meeting, an overflowing inbox — it activates the same hypothalamic-pituitary-adrenal (HPA) axis your ancestors used to outrun predators. Cortisol and adrenaline rise, your heart rate climbs, and your attention narrows onto the perceived threat. This is called an acute stress response, and it's genuinely helpful in short bursts: it sharpens focus and mobilizes energy.",
          "The problem isn't stress itself — it's stress that never gets to switch off. Endocrinologist Hans Selye, who coined the term 'stress' in a biological context back in 1936, described this as the difference between short bursts of 'eustress' (stress that motivates and resolves) and prolonged 'distress' (stress with no recovery period). Modern work often manufactures the second kind: back-to-back meetings, always-on notifications, and blurred boundaries between work and rest mean the HPA axis rarely gets the 'all clear' signal it was designed to receive.",
          "Occupational psychology has a useful way of framing this: the Job Demands-Resources (JD-R) model. It suggests that burnout isn't caused by demands alone (workload, time pressure, emotional labor) — it's caused by demands that consistently outpace the resources available to meet them (autonomy, social support, recovery time, a sense of meaning). This reframe matters, because it means stress management at work isn't just about 'trying harder to relax.' It's about rebalancing the equation on both sides.",
        ],
      },
      {
        heading: "Part 2 — Evidence-based tools you can use today",
        paragraphs: [
          "Here's a toolkit built from research on stress physiology and cognitive-behavioral practice — deliberately practical, and a little out of the box.",
        ],
        list: [
          "The physiological sigh: Stanford neuroscience research on breathing patterns found that a double inhale through the nose (a short second inhale on top of a first) followed by a long, slow exhale is one of the fastest ways to lower real-time physiological arousal — faster than standard deep breathing. It works because it maximally reinflates collapsed air sacs in the lungs and offloads carbon dioxide efficiently. Try it before you open an email that's been sitting in your stomach.",
          "The 'worry window': Instead of trying to suppress intrusive work worries all day (which tends to backfire — this is the well-documented 'ironic process' effect), schedule a specific 10-15 minute window to actively think about them. Studies on worry postponement in cognitive-behavioral therapy show this reduces the frequency and intensity of intrusive worry outside that window, because the brain learns the concern has a designated time and place.",
          "Implementation intentions ('if-then' planning): Research by psychologist Peter Gollwitzer shows that pre-deciding your response to a stressor dramatically increases the odds you'll actually use a coping strategy in the moment. Instead of 'I'll try to stay calm in tense meetings,' try: 'If I notice my jaw tightening in a meeting, then I will unclench it and take one physiological sigh before responding.'",
          "Micro-recovery over marathon breaks: You don't need a two-week vacation to recover — you need it more often than you think. Research on workday recovery finds that brief, deliberate breaks (a few minutes, genuinely away from the task) taken every 60-90 minutes protect performance and mood far better than one long break at the end of a depleted day. The key word is deliberate: scrolling your phone doesn't count as recovery in the same way a walk, stretch, or two minutes of quiet does.",
          "Reframe stress as data, not danger: Research from Harvard's Alia Crum and others on 'stress mindset' found that people who view stress arousal as their body preparing them to perform (rather than as a sign something is wrong) show better cognitive performance and even healthier physiological stress responses under pressure. Next time your heart rate climbs before a presentation, try silently naming it: 'This is my body getting ready, not falling apart.'",
          "Social co-regulation: Talking to a trusted colleague for even a few minutes has been shown to lower cortisol faster than solitary coping in several workplace stress studies — humans are a social species, and connection is itself a nervous-system regulator, not just a nice-to-have.",
        ],
      },
      {
        heading: "Part 3 — Making it stick: from techniques to a sustainable system",
        paragraphs: [
          "Individual techniques help, but they work best inside a system, not as isolated tricks you remember only in a crisis. Three shifts make the biggest long-term difference.",
          "First, protect transition time. The research on 'boundary theory' at work shows that abrupt transitions — closing a laptop and immediately parenting, or finishing a call and instantly starting another — leave stress hormones elevated well into the next activity. A five-minute buffer between tasks (even just stepping away from the screen) lets your nervous system reset before the next demand arrives.",
          "Second, normalize naming stress out loud, without apology. Teams with psychologically safe cultures — where saying 'this deadline is tight and I need a hand' is met with problem-solving rather than judgment — see measurably lower burnout rates in organizational research. If you manage people, the single highest-leverage stress-management intervention you can offer isn't a wellness app; it's making it safe to ask for help.",
          "Third, track your resources, not just your demands. Once a week, ask yourself: what gave me energy this week, and what drained it? Over time this simple audit — closer to a stress journal than a to-do list — reveals patterns that willpower alone can't fix, and gives you real data for conversations with your manager about workload and support.",
          "Stress at work is never going to hit zero, and that's not actually the goal. The goal is a nervous system that gets the recovery it needs often enough to keep meeting demands without quietly running on empty. Small, repeated, evidence-based habits do more for that than any single big gesture — which is good news, because small and repeated is something every one of us can actually do.",
        ],
      },
    ],
  },
  {
    slug: "importance-of-journaling",
    title: "The Importance of Journaling as a Healthy Habit",
    excerpt:
      "What happens in your brain when you write things down — and a few creative ways to make journaling a habit that actually sticks.",
    category: "Self-care habits",
    readMinutes: 6,
    sections: [
      {
        heading: "Part 1 — Why putting it on paper changes how you feel",
        paragraphs: [
          "Journaling can feel like a soft, optional habit — something you'll get to eventually. But the research behind it is surprisingly concrete. The most influential body of work here comes from social psychologist James Pennebaker, who in the 1980s discovered that people who wrote about emotionally significant experiences for just 15-20 minutes, several days in a row, showed measurable improvements: fewer doctor visits, better immune markers, and improved mood in the weeks that followed. This became known as 'expressive writing,' and decades of replication since have made it one of the most studied low-cost mental health interventions there is.",
          "Why does it work? A few mechanisms show up consistently in the research. Writing forces what's called 'cognitive processing' — turning a swirling, formless emotional experience into a structured narrative with a beginning, middle, and end. That structuring appears to reduce the mental energy the brain spends ruminating on unresolved experiences, similar to how naming an emotion ('I feel anxious about this') has been shown in neuroimaging studies to reduce activity in the amygdala, the brain's threat-detection center — an effect researchers call 'affect labeling.'",
          "Journaling also creates distance. Writing 'I am anxious' versus 'Karla is anxious' about yourself — a small linguistic shift called self-distancing — has been shown in psychological research to help people reason about their problems more like an outside observer would: calmer, more solution-focused, and less flooded by the emotion itself. A journal is, in effect, a low-cost, always-available way to practice this distancing on your own terms.",
          "And there's a simpler benefit too: memory and self-knowledge. Reviewing old entries lets you notice patterns you'd otherwise miss in the moment — the meetings that reliably drain you, the mornings you feel most like yourself, the recurring worry that, in hindsight, resolved on its own nine times out of ten. That kind of pattern recognition is hard to do from inside a single day, but easy once it's written down.",
        ],
      },
      {
        heading: "Part 2 — Building a journaling habit that actually survives week two",
        paragraphs: [
          "Most journaling habits don't fail because journaling doesn't work — they fail because they're set up in a way that's hard to sustain. A few creative, research-informed adjustments make a real difference.",
        ],
        list: [
          "Lower the bar on purpose: You don't need a page. Behavioral research on habit formation consistently shows that habits stick when the initial version is almost embarrassingly easy — three sentences is a real journal entry. Consistency builds the habit; length can grow later on its own.",
          "Stack it onto something you already do: 'Habit stacking' — attaching a new habit to an existing one ('after I pour my morning coffee, I write three sentences') — uses an established routine as a built-in reminder, instead of relying on willpower or memory alone.",
          "Use a prompt when you're stuck: A blank page can be its own barrier. Try rotating between a few open-ended prompts: 'What took more energy than it should have today?', 'What's one thing I noticed but didn't say out loud?', or 'What would I tell a friend who had my day?' Prompts aimed at specific reflection tend to produce more useful insight than a generic 'how was your day.'",
          "Mix reflection with gratitude: Purely venting can occasionally reinforce rumination if it's the only mode you use. Research on gratitude journaling suggests pairing a reflective entry with even one specific thing that went well balances the practice — not toxic positivity, just a wider lens.",
          "Let it be messy: Expressive writing research specifically found that grammar, spelling, and structure don't matter for the psychological benefit — only honest engagement with the material does. Perfectionism is the single biggest habit-killer here, so give yourself explicit permission to write badly.",
          "Make the trigger visible: Keep your journal (physical or digital) somewhere you'll actually see it — a research-backed principle from environmental design for habits is that visibility of the cue matters as much as motivation does.",
        ],
      },
      {
        heading: "A small habit with an outsized return",
        paragraphs: [
          "Journaling isn't a cure-all, and it isn't a replacement for professional support when you need it — but as a daily habit, it's one of the few practices backed by decades of psychological research that costs nothing but a few minutes and a willingness to be honest with yourself. Start smaller than feels meaningful. The habit that survives is the one you can actually keep doing.",
        ],
      },
    ],
  },
];
