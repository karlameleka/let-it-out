// Content and scoring for the QR-only self-assessment tools (see
// src/app/qr/*). These are printed as QR codes inside the physical guided
// journals — deliberately not linked anywhere on the site itself (no nav,
// no sitemap, robots.txt disallows /qr) so they're reached only by
// scanning the code in the book. Each one is an original, plain-language
// self-reflection quiz *informed by* an established psychological
// framework — not a reproduction of any copyrighted or proprietary
// instrument, and not a validated clinical or diagnostic tool. See each
// assessment's `sourceNote` for its specific reference.

export type AssessmentSlug = "love-languages" | "coping-strategies" | "defense-mechanisms";

export type AssessmentCategory = {
  id: string;
  label: string;
  /** Shown under this category on the results screen. */
  description: string;
};

export type AssessmentQuestion = {
  id: string;
  text: string;
  categoryId: string;
};

export type AssessmentDefinition = {
  slug: AssessmentSlug;
  title: string;
  eyebrow: string;
  intro: string;
  sourceNote: string;
  disclaimer: string;
  scaleLow: string;
  scaleHigh: string;
  categories: AssessmentCategory[];
  questions: AssessmentQuestion[];
};

const loveLanguages: AssessmentDefinition = {
  slug: "love-languages",
  title: "Love Languages",
  eyebrow: "Self-reflection",
  intro:
    "How do you most naturally feel loved, and how do you most naturally show love to others? Rate how much each statement sounds like you — there's no right answer, and most people relate to more than one.",
  sourceNote: "Informed by Dr. Gary Chapman's The Five Love Languages (1992) — original questions, not a reproduction of his published assessment.",
  disclaimer:
    "This is an informal self-reflection tool, not a validated psychological instrument. It's meant to prompt useful conversation with the people close to you, not to diagnose or define anyone.",
  scaleLow: "Not at all like me",
  scaleHigh: "Extremely like me",
  categories: [
    { id: "words", label: "Words of Affirmation", description: "You feel most loved through spoken or written appreciation — hearing it said, out loud or in writing, matters more to you than almost anything else." },
    { id: "time", label: "Quality Time", description: "You feel most loved through someone's full, undivided attention — being present together matters more to you than what's said or given." },
    { id: "service", label: "Acts of Service", description: "You feel most loved through helpful actions — what someone does for you speaks louder to you than what they say." },
    { id: "gifts", label: "Receiving Gifts", description: "You feel most loved through thoughtful gifts — not their price, but the thought and effort a gift represents." },
    { id: "touch", label: "Physical Touch", description: "You feel most loved through physical closeness — a hug, a hand held, sitting near someone — as a source of reassurance and connection." },
  ],
  questions: [
    { id: "wa1", categoryId: "words", text: "Hearing someone say “I'm proud of you” or “I appreciate you” means a lot to me." },
    { id: "wa2", categoryId: "words", text: "A genuine, specific compliment can make my whole day better." },
    { id: "wa3", categoryId: "words", text: "I feel most loved when someone puts their appreciation for me into words." },
    { id: "wa4", categoryId: "words", text: "A kind note or message stays with me long after I read it." },
    { id: "qt1", categoryId: "time", text: "I feel closest to someone when we're doing something together, just us, without distractions." },
    { id: "qt2", categoryId: "time", text: "Undivided attention — no phones, no multitasking — means more to me than almost anything else." },
    { id: "qt3", categoryId: "time", text: "I'd rather have one uninterrupted hour with someone than a whole day of them being distracted around me." },
    { id: "qt4", categoryId: "time", text: "Shared conversations and experiences are what make me feel truly connected to someone." },
    { id: "as1", categoryId: "service", text: "When someone does something helpful for me without being asked, I feel genuinely cared for." },
    { id: "as2", categoryId: "service", text: "Actions speak louder than words to me — I notice what people do more than what they say." },
    { id: "as3", categoryId: "service", text: "I feel loved when someone takes something off my plate, even something small." },
    { id: "as4", categoryId: "service", text: "Seeing someone follow through on a promise means more to me than hearing them make it." },
    { id: "rg1", categoryId: "gifts", text: "A thoughtful gift, even a small one, makes me feel like someone was really thinking of me." },
    { id: "rg2", categoryId: "gifts", text: "I remember the gifts people have given me, and what they meant at the time." },
    { id: "rg3", categoryId: "gifts", text: "It's not about the price — the thought and effort behind a gift is what touches me." },
    { id: "rg4", categoryId: "gifts", text: "I like giving gifts as much as receiving them, because I know how much they can mean." },
    { id: "pt1", categoryId: "touch", text: "A hug, a hand on my shoulder, or sitting close to someone helps me feel emotionally connected." },
    { id: "pt2", categoryId: "touch", text: "Physical affection reassures me in ways that words sometimes can't." },
    { id: "pt3", categoryId: "touch", text: "I notice when physical warmth is missing from a relationship that used to have it." },
    { id: "pt4", categoryId: "touch", text: "Being physically close to someone I trust helps me feel calm and safe." },
  ],
};

const copingStrategies: AssessmentDefinition = {
  slug: "coping-strategies",
  title: "Coping Strategies",
  eyebrow: "Self-reflection",
  intro:
    "When you're stressed, upset, or facing a hard situation, what do you tend to reach for? Rate how often you find yourself doing each of these — most people use a mix, and noticing your own patterns is the point.",
  sourceNote: "Informed by the Brief COPE inventory (Carver, 1997) — original questions covering a subset of its coping styles, not a reproduction of the published instrument.",
  disclaimer:
    "This is an informal self-reflection tool, not a validated psychological instrument or a clinical screening. If stress or a specific situation feels like more than you can manage alone, talking to one of our psychologists can genuinely help.",
  scaleLow: "Never",
  scaleHigh: "Very often",
  categories: [
    { id: "problem-solving", label: "Active Problem-Solving", description: "You tend to meet stress head-on — making a plan and taking concrete steps to actually change the situation." },
    { id: "support", label: "Seeking Support", description: "You tend to lean on the people around you — talking things through, asking for advice, or just being comforted." },
    { id: "reframing", label: "Positive Reframing", description: "You tend to look for a different angle on a hard situation — what's manageable about it, or what it might teach you." },
    { id: "avoidance", label: "Avoidance", description: "You tend to put distance between yourself and the stressor — not thinking about it, delaying it, or staying busy with other things instead." },
    { id: "self-blame", label: "Self-Blame", description: "You tend to turn stress inward, criticizing yourself for what's happening even when it isn't fully in your control." },
    { id: "humor", label: "Humor", description: "You tend to find something to laugh about, using humor to take the edge off a hard moment." },
    { id: "acceptance", label: "Acceptance", description: "You tend to work toward acknowledging a situation as real and adjusting to it, rather than fighting it." },
    { id: "reflection", label: "Turning Inward", description: "You tend to slow down and sit with what you're feeling — writing, thinking, or trying to understand your own reaction before acting." },
  ],
  questions: [
    { id: "ps1", categoryId: "problem-solving", text: "I try to come up with a concrete plan of action." },
    { id: "ps2", categoryId: "problem-solving", text: "I take active steps to try to fix the problem." },
    { id: "ps3", categoryId: "problem-solving", text: "I think through exactly what I need to do, then do it." },
    { id: "ss1", categoryId: "support", text: "I talk to someone about how I'm feeling." },
    { id: "ss2", categoryId: "support", text: "I ask people who've been through something similar for advice." },
    { id: "ss3", categoryId: "support", text: "I lean on friends or family for comfort." },
    { id: "pr1", categoryId: "reframing", text: "I try to see the situation in a more positive light." },
    { id: "pr2", categoryId: "reframing", text: "I look for something good in what's happening, even if it's small." },
    { id: "pr3", categoryId: "reframing", text: "I remind myself it could be worse, or that it's temporary." },
    { id: "av1", categoryId: "avoidance", text: "I try not to think about it." },
    { id: "av2", categoryId: "avoidance", text: "I distract myself with other things so I don't have to deal with it." },
    { id: "av3", categoryId: "avoidance", text: "I put off dealing with it for as long as I can." },
    { id: "sb1", categoryId: "self-blame", text: "I criticize myself for what's happening." },
    { id: "sb2", categoryId: "self-blame", text: "I blame myself for things going wrong." },
    { id: "sb3", categoryId: "self-blame", text: "I feel like it's my fault, even when it might not fully be." },
    { id: "hu1", categoryId: "humor", text: "I make jokes about the situation." },
    { id: "hu2", categoryId: "humor", text: "I use humor to make the stress feel more manageable." },
    { id: "hu3", categoryId: "humor", text: "I find something funny in a hard situation to lighten the mood." },
    { id: "ac1", categoryId: "acceptance", text: "I remind myself that this is just something I have to accept." },
    { id: "ac2", categoryId: "acceptance", text: "I try to come to terms with what's happening." },
    { id: "ac3", categoryId: "acceptance", text: "I accept that this is real, and adjust accordingly." },
    { id: "ti1", categoryId: "reflection", text: "I take time to sit with my feelings before reacting." },
    { id: "ti2", categoryId: "reflection", text: "I write or think through what's bothering me to understand it better." },
    { id: "ti3", categoryId: "reflection", text: "I try to understand why I'm reacting the way I am." },
  ],
};

const defenseMechanisms: AssessmentDefinition = {
  slug: "defense-mechanisms",
  title: "Defense Mechanisms",
  eyebrow: "Self-reflection",
  intro:
    "Defense mechanisms are the mostly-automatic ways we protect ourselves from difficult feelings — everyone uses a mix, and none of them are “bad” on their own. Rate how much each statement sounds like you to get a sense of the patterns you lean on most.",
  sourceNote: "Informed by Vaillant's hierarchy of ego defenses and the Defense Style Questionnaire (Bond et al., 1983) — original questions covering a subset of common defense mechanisms, not a reproduction of any published instrument.",
  disclaimer:
    "This is an informal self-reflection tool, not a validated psychological or diagnostic instrument. Defense mechanisms are a normal part of how everyone's mind works — this is meant to build self-awareness, not to label or pathologize you. A therapist can help you explore any of this in real depth.",
  scaleLow: "Not like me at all",
  scaleHigh: "Very much like me",
  categories: [
    { id: "denial", label: "Denial", description: "Keeping something painful at a distance by not fully acknowledging it's happening." },
    { id: "projection", label: "Projection", description: "Attributing your own uncomfortable feelings to someone else, rather than owning them directly." },
    { id: "rationalization", label: "Rationalization", description: "Explaining away a difficult choice or feeling with logic, after the fact, rather than sitting with it." },
    { id: "displacement", label: "Displacement", description: "Redirecting a strong feeling from where it actually started toward a safer, less risky target." },
    { id: "intellectualization", label: "Intellectualization", description: "Processing hard emotions by analyzing them rather than actually feeling them." },
    { id: "avoidance", label: "Avoidance / Repression", description: "Pushing uncomfortable thoughts, memories, or feelings out of conscious awareness." },
    { id: "humor", label: "Humor", description: "Using jokes and lightness to make something genuinely difficult easier to get through — generally considered one of the more adaptive defenses." },
    { id: "sublimation", label: "Sublimation", description: "Redirecting difficult emotional energy into something constructive — work, exercise, creativity — also generally considered one of the more adaptive defenses." },
  ],
  questions: [
    { id: "de1", categoryId: "denial", text: "When something is too painful, I tell myself it isn't really happening." },
    { id: "de2", categoryId: "denial", text: "I find it easier to act like a problem doesn't exist than to face it directly." },
    { id: "pr1", categoryId: "projection", text: "When I'm upset with myself, I sometimes end up feeling like others are upset with me instead." },
    { id: "pr2", categoryId: "projection", text: "I notice flaws in other people that I don't always notice in myself." },
    { id: "ra1", categoryId: "rationalization", text: "I can usually find a logical explanation for why something happened, even when it's uncomfortable." },
    { id: "ra2", categoryId: "rationalization", text: "I tend to justify my choices after the fact rather than examine them at the time." },
    { id: "di1", categoryId: "displacement", text: "When I'm frustrated with one person, I sometimes take it out on someone else instead." },
    { id: "di2", categoryId: "displacement", text: "A bad moment with one thing can make me short-tempered about something completely unrelated." },
    { id: "in1", categoryId: "intellectualization", text: "I deal with difficult emotions by analyzing them rather than feeling them." },
    { id: "in2", categoryId: "intellectualization", text: "I find it easier to talk about a problem logically than to talk about how it makes me feel." },
    { id: "av1", categoryId: "avoidance", text: "There are things about myself or my past I'd rather not think about at all." },
    { id: "av2", categoryId: "avoidance", text: "I push uncomfortable memories or feelings out of my mind when I can." },
    { id: "hu1", categoryId: "humor", text: "I use jokes to cope with things that are actually bothering me." },
    { id: "hu2", categoryId: "humor", text: "Making light of a hard situation helps me get through it." },
    { id: "su1", categoryId: "sublimation", text: "When I'm stressed, I tend to redirect that energy into something productive, like work, exercise, or a creative project." },
    { id: "su2", categoryId: "sublimation", text: "Difficult emotions often push me to create or build something." },
  ],
};

export const ASSESSMENTS: Record<AssessmentSlug, AssessmentDefinition> = {
  "love-languages": loveLanguages,
  "coping-strategies": copingStrategies,
  "defense-mechanisms": defenseMechanisms,
};

export function getAssessment(slug: string): AssessmentDefinition | null {
  return slug in ASSESSMENTS ? ASSESSMENTS[slug as AssessmentSlug] : null;
}

export type CategoryScore = { categoryId: string; label: string; description: string; average: number; percent: number };

/** Averages each category's raw 1-5 answers and ranks them descending.
 * `percent` maps the 1-5 average onto a 0-100 bar for display. */
export function scoreAssessment(
  definition: AssessmentDefinition,
  answers: Record<string, number>,
): CategoryScore[] {
  return definition.categories
    .map((category) => {
      const qIds = definition.questions.filter((q) => q.categoryId === category.id).map((q) => q.id);
      const values = qIds.map((id) => answers[id]).filter((v): v is number => typeof v === "number");
      const average = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
      return {
        categoryId: category.id,
        label: category.label,
        description: category.description,
        average,
        percent: Math.round(((average - 1) / 4) * 100),
      };
    })
    .sort((a, b) => b.average - a.average);
}
