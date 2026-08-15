import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  // --- Counselors -----------------------------------------------------
  // bookingUrl: once a counselor has a live Cal.com account with their
  // Google Calendar connected and Google Meet enabled as the conferencing
  // location, set this to their full event link (e.g.
  // "https://cal.com/verna-awad/50min-session") and their page will
  // automatically switch from the manual request form to the live Cal.com
  // scheduler. Leave null until that's ready — the manual form keeps
  // working in the meantime.
  const counselors = [
    {
      slug: "verna-awad",
      name: "Verna Awad",
      credentials: "Lead Psychotherapist",
      bio: "Verna Awad is a clinical psychologist holding an MSc in Clinical Psychology from the University of Gibraltar. She has been working with adults since 2020, supporting people through stress, burnout, emotional dysregulation, and the quiet exhaustion that builds when we stop prioritizing ourselves. Her work is grounded in CBT and DBT, and she is currently in advanced training in psychosexual therapy. She believes that self-awareness is the foundation of any real change — and that the tools we build in therapy are the ones we carry into every area of life.",
      specialties: ["Stress & Burnout", "Emotional Dysregulation", "CBT", "DBT", "Psychosexual Therapy"],
      sortOrder: 0,
      active: true,
      bookingUrl: "https://cal.com/karlameleka/verna-awad",
      priceEGP: 1000,
    },
    {
      slug: "karla-meleka",
      name: "Karla Meleka",
      credentials: "Psychologist, MSc (Liverpool John Moores University)",
      bio: "Karla Meleka is a compassionate psychologist with dual degrees in Psychology from the British University in Egypt and London South Bank University. She holds an MSc from Liverpool John Moores University. Passionate about adult mental health, she uses evidence-based therapies like CBT and DBT combined with a holistic approach to help clients manage depression, anxiety, and general psychological distress. Karla focuses on empowering clients with practical tools and resilience to achieve lasting wellbeing through an empathetic, client-centered approach.",
      specialties: ["Depression", "Anxiety", "CBT", "DBT", "Adult Mental Health"],
      sortOrder: 1,
      active: true,
      bookingUrl: "https://cal.com/karlameleka/counseling-session",
      priceEGP: 800,
    },
    {
      slug: "lora-samuel",
      name: "Lora Samuel",
      credentials: "Psychotherapist & Trainer, MSc Clinical Psychology (British University in Egypt)",
      bio: "Lora Samuel is a psychotherapist and trainer. She earned her bachelor's degree in basic and applied psychology in 2020 and her master's degree in clinical psychology in 2025 from the British University in Egypt, where her thesis focused on creating and implementing a self-help self-compassion training program. From 2020-2025, she taught at the psychology department of the British University in Egypt, mentoring students on a personal and professional level. She delivers workshops on topics including personality and behavior, guilt and shame, perfectionism, self-compassion, emotional regulation, and effective communication. Lora is passionate about helping individuals and teams build healthier relationships with themselves and others, believing that emotional awareness, self-compassion, and healthy relationships are essential foundations for wellbeing and meaningful change.",
      specialties: ["Self-Compassion", "Perfectionism", "Emotional Regulation", "Communication", "Workshops & Training"],
      sortOrder: 2,
      // Hidden for now, at Let It Out's request — flip back to true to re-show.
      active: false,
    },
  ];

  for (const c of counselors) {
    await prisma.counselor.upsert({
      where: { slug: c.slug },
      update: c,
      create: c,
    });
  }

  // --- Products (guided journals) --------------------------------------
  // Physical only for now — ebook format removed at Let It Out's request.
  const products = [
    {
      slug: "80-days-of-self-love",
      title: "80 Days of Self-Love",
      description:
        "An 80-day guided journal built to help you rebuild your relationship with yourself — daily prompts grounded in self-compassion, boundaries, and mindful reflection.",
      durationDays: 80,
      sortOrder: 0,
      variants: [
        { format: "PHYSICAL" as const, priceEGP: 1000, sku: "LIO-J-80SL-PHY" },
      ],
    },
    {
      slug: "30-days-of-mindfulness",
      title: "30 Days of Mindfulness",
      description:
        "A 30-day guided journal designed to bring you back to the present moment through short daily mindfulness prompts, grounding exercises, and gentle self-reflection.",
      durationDays: 30,
      sortOrder: 1,
      variants: [
        { format: "PHYSICAL" as const, priceEGP: 800, sku: "LIO-J-30MF-PHY" },
      ],
    },
  ];

  for (const p of products) {
    const { variants, ...productData } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: productData,
      create: productData,
    });

    for (const v of variants) {
      await prisma.productVariant.upsert({
        where: { productId_format: { productId: product.id, format: v.format } },
        update: { priceEGP: v.priceEGP, sku: v.sku },
        create: { productId: product.id, format: v.format, priceEGP: v.priceEGP, sku: v.sku },
      });
    }

    // Drop any variant format no longer in this product's list (e.g. the
    // now-removed ebook format). Best-effort: a variant referenced by an
    // existing order can't be deleted, so failures here are logged, not fatal.
    const keepFormats = variants.map((v) => v.format);
    try {
      await prisma.productVariant.deleteMany({
        where: { productId: product.id, format: { notIn: keepFormats } },
      });
    } catch (err) {
      console.warn(`[seed] Could not remove stale variants for ${p.slug}:`, err);
    }
  }

  // --- Journal prompts (in-app journaling feature) ----------------------
  const prompts: { category: string; text: string }[] = [
    { category: "Self-Awareness", text: "What emotion have you been avoiding lately? What would happen if you let yourself feel it fully, just for today?" },
    { category: "Gratitude", text: "Name three small things from this week that made you feel steady or safe." },
    { category: "Self-Compassion", text: "Write a sentence you'd say to a friend going through what you're going through. Now say it to yourself." },
    { category: "Boundaries", text: "Where in your life do you say yes when you mean no? What would it cost you to say no once this week?" },
    { category: "Growth", text: "What is a belief about yourself you've outgrown, even if you still catch yourself repeating it?" },
    { category: "Relationships", text: "Who in your life makes you feel most like yourself? What is it about them, or you, that allows that?" },
    { category: "Stress", text: "Where do you carry stress in your body? What has it been trying to tell you?" },
    { category: "Self-Awareness", text: "What is a story you keep telling about yourself that may no longer be true?" },
    { category: "Mindfulness", text: "Describe exactly where you are right now — five things you can see, and how your body feels in this chair." },
    { category: "Self-Love", text: "What is one thing your body did for you today that you didn't thank it for?" },
    { category: "Emotional Regulation", text: "Think of the last time you felt overwhelmed. What did you need in that moment that you didn't get?" },
    { category: "Growth", text: "What would you attempt if you knew you couldn't fail — and what's one small version of it you could try this month?" },
    { category: "Gratitude", text: "Who has shaped who you are today in a way you've never told them?" },
    { category: "Self-Awareness", text: "What does 'letting it out' mean for you today — a feeling, a truth, a tension you're ready to release?" },
    { category: "Relationships", text: "Is there a conversation you've been avoiding? What are you afraid it will change?" },
    { category: "Boundaries", text: "What does it look like when you're being generous with your time out of guilt rather than genuine want?" },
    { category: "Mindfulness", text: "Notice your breath for one minute before writing. What shifted, even slightly?" },
    { category: "Self-Compassion", text: "What would it look like to fail at something and still treat yourself with kindness?" },
    { category: "Stress", text: "What is one thing currently on your plate that isn't actually yours to carry?" },
    { category: "Growth", text: "What is a fear you've quietly been making smaller decisions around? What's one size-appropriate step past it?" },
    { category: "Self-Love", text: "Write down three things about yourself that have nothing to do with productivity or achievement." },
    { category: "Relationships", text: "What do you need more of from the people closest to you — and have you ever asked for it directly?" },
    { category: "Self-Awareness", text: "When do you feel most like a performance, and when do you feel most real?" },
    { category: "Gratitude", text: "What is something difficult you went through that you're, in some strange way, grateful for now?" },
    { category: "Emotional Regulation", text: "What's your go-to way of numbing out when things get hard? What might it be protecting you from?" },
    { category: "Mindfulness", text: "Where does your mind go when it's not being directed? What does it keep circling back to?" },
    { category: "Boundaries", text: "What's one boundary you've successfully held recently, even if it was uncomfortable? How did it feel afterward?" },
    { category: "Self-Compassion", text: "If your inner critic had to introduce itself honestly, what would it say — and whose voice does it borrow?" },
    { category: "Growth", text: "What does 'enough' look like for you today, separate from what you were taught to chase?" },
    { category: "Self-Love", text: "Write a short letter to yourself a year from now. What do you hope has softened? What do you hope has grown?" },

    // --- Letting Go ---------------------------------------------------
    { category: "Letting Go", text: "What are you still holding onto that has already run its course?" },
    { category: "Letting Go", text: "If you gave yourself full permission to stop trying to control an outcome, what would you do differently today?" },
    { category: "Letting Go", text: "What version of yourself are you grieving, even quietly? What would it mean to let them go with kindness?" },
    { category: "Letting Go", text: "Is there an apology you're waiting for that you may never receive? What would it take to move forward without it?" },
    { category: "Letting Go", text: "What's something you keep re-reading, re-checking, or replaying — and what are you hoping to find?" },
    { category: "Letting Go", text: "Write about a plan or identity that didn't work out. What did it teach you before you set it down?" },

    // --- Resilience -----------------------------------------------------
    { category: "Resilience", text: "Think of a hard season you got through. What did you lean on that you'd forgotten you had?" },
    { category: "Resilience", text: "What's one small sign, this week, that you're doing better than you think you are?" },
    { category: "Resilience", text: "When things go wrong, what's the story you tell about yourself? Is it fair?" },
    { category: "Resilience", text: "What has repeated hardship taught you that ease never could?" },
    { category: "Resilience", text: "Name someone who has watched you struggle and still believed in you. What do they see that you sometimes can't?" },
    { category: "Resilience", text: "What would it look like to give yourself credit for simply still being here?" },

    // --- Values & Identity ------------------------------------------------
    { category: "Values & Identity", text: "What is a value you hold that you rarely get to talk about? Where does it show up in your life?" },
    { category: "Values & Identity", text: "Whose definition of success have you been living by — yours, or someone else's?" },
    { category: "Values & Identity", text: "What part of your personality did you shrink to be more likeable, and do you miss it?" },
    { category: "Values & Identity", text: "If no one were watching or grading you, what would you spend more time doing?" },
    { category: "Values & Identity", text: "What's something you believed about yourself at 15 that quietly still runs the show?" },
    { category: "Values & Identity", text: "Where in your life are you performing certainty you don't actually feel?" },

    // --- Forgiveness --------------------------------------------------
    { category: "Forgiveness", text: "Is there someone you haven't forgiven — including yourself? What is forgiveness protecting you from, or costing you?" },
    { category: "Forgiveness", text: "What mistake do you keep punishing yourself for long after the lesson has been learned?" },
    { category: "Forgiveness", text: "Write about a time someone hurt you and later, you understood why. Did that change anything?" },
    { category: "Forgiveness", text: "What would it feel like to forgive yourself for something you haven't told anyone about?" },
    { category: "Forgiveness", text: "Who do you need to have compassion for today, even if they don't deserve it in your eyes?" },

    // --- Rest & Restoration -------------------------------------------
    { category: "Rest & Restoration", text: "What does true rest feel like for you — not scrolling, not sleeping out of exhaustion, but actual rest?" },
    { category: "Rest & Restoration", text: "When was the last time you did something with absolutely no goal attached to it?" },
    { category: "Rest & Restoration", text: "What signals does your body give you before you're burnt out? Are you listening to them?" },
    { category: "Rest & Restoration", text: "If you gave yourself an unhurried hour tomorrow, what would you actually want to do with it?" },
    { category: "Rest & Restoration", text: "What have you been 'pushing through' that actually needs you to stop?" },
    { category: "Rest & Restoration", text: "Write about a place, real or imagined, where you feel completely at ease. What makes it feel that way?" },

    // --- Communication --------------------------------------------------
    { category: "Communication", text: "What's something you wish someone would just ask you directly?" },
    { category: "Communication", text: "When you're upset, do you tend to go quiet or go loud? What do you actually need in that moment?" },
    { category: "Communication", text: "What's a truth you've softened so much in the telling that it stopped being heard?" },
    { category: "Communication", text: "Think of the last disagreement you had. What did you want the other person to understand about you?" },
    { category: "Communication", text: "Who do you find hardest to be honest with — and what are you protecting by staying quiet?" },

    // --- Fear & Courage ---------------------------------------------------
    { category: "Fear & Courage", text: "What decision have you been putting off because you're afraid of being wrong?" },
    { category: "Fear & Courage", text: "What would you do if you trusted yourself completely, just for one day?" },
    { category: "Fear & Courage", text: "Name a fear that's actually just discomfort wearing a bigger costume." },
    { category: "Fear & Courage", text: "What's the smallest brave thing you could do today, that you've been avoiding?" },
    { category: "Fear & Courage", text: "What did you used to be afraid of that doesn't scare you anymore? What changed?" },
    { category: "Fear & Courage", text: "If failure were simply information and not a verdict on your worth, what would you try?" },

    // --- Joy & Play -------------------------------------------------------
    { category: "Joy & Play", text: "When did you last laugh so hard you forgot what you were worried about?" },
    { category: "Joy & Play", text: "What did you love doing as a kid that you've quietly stopped making time for?" },
    { category: "Joy & Play", text: "What's something small and a little silly that reliably makes you happy?" },
    { category: "Joy & Play", text: "Describe a moment this month where you felt fully, unselfconsciously yourself." },
    { category: "Joy & Play", text: "If joy were a practice rather than a feeling that just happens to you, what would you practice this week?" },

    // --- Closure & Beginnings ---------------------------------------------
    { category: "Closure & Beginnings", text: "What chapter of your life do you feel is quietly closing? How do you want to close it well?" },
    { category: "Closure & Beginnings", text: "What would you want to say to the person you were a year ago, right now?" },
    { category: "Closure & Beginnings", text: "What is something you're ready to begin, even imperfectly?" },
    { category: "Closure & Beginnings", text: "If today were the first day of a new season in your life, what would you want it to be about?" },
    { category: "Closure & Beginnings", text: "What ending are you avoiding because it feels final, even though you already know it's time?" },

    // --- Purpose ------------------------------------------------------
    { category: "Purpose", text: "What makes you lose track of time in a good way?" },
    { category: "Purpose", text: "When do you feel most useful — not busy, but genuinely useful?" },
    { category: "Purpose", text: "What would you want people to say about how you made them feel, not what you achieved?" },
    { category: "Purpose", text: "What's a small way you could live closer to your values this week?" },
    { category: "Purpose", text: "If your day-to-day life had to reflect what matters most to you, what's the first thing that would change?" },

    // --- More Self-Awareness --------------------------------------------
    { category: "Self-Awareness", text: "What's a pattern in your relationships that keeps showing up in different disguises?" },
    { category: "Self-Awareness", text: "When do you feel most like yourself, and what tends to pull you away from that?" },
    { category: "Self-Awareness", text: "What do you do on autopilot that might be worth actually noticing?" },
    { category: "Self-Awareness", text: "What's a compliment you have a hard time accepting? Why do you think that is?" },
    { category: "Self-Awareness", text: "If your current mood were a weather forecast, what would it say — and what's moving in?" },

    // --- More Gratitude -----------------------------------------------
    { category: "Gratitude", text: "What's a hard conversation that ended up bringing you closer to someone?" },
    { category: "Gratitude", text: "What's something your past self did that your present self is grateful for?" },
    { category: "Gratitude", text: "Who showed up for you recently in a way you haven't properly thanked them for?" },
    { category: "Gratitude", text: "What's a part of your daily routine you'd miss if it were gone?" },

    // --- More Self-Compassion --------------------------------------------
    { category: "Self-Compassion", text: "What do you need to hear today that no one has said to you yet?" },
    { category: "Self-Compassion", text: "How do you typically treat yourself after a mistake? Would you treat a friend that way?" },
    { category: "Self-Compassion", text: "What expectation of yourself might actually be unrealistic?" },
    { category: "Self-Compassion", text: "Name one way you were hard on yourself today, and offer yourself a gentler version of that thought." },

    // --- More Boundaries -----------------------------------------------
    { category: "Boundaries", text: "What's a boundary you know you need to set but keep putting off?" },
    { category: "Boundaries", text: "Who in your life makes it hardest to say no — and why do you think that is?" },
    { category: "Boundaries", text: "What does it cost you when you don't protect your time or energy?" },

    // --- More Growth ----------------------------------------------------
    { category: "Growth", text: "What's something you understand now that you couldn't have understood a few years ago?" },
    { category: "Growth", text: "What discomfort are you currently avoiding that might actually be growth in disguise?" },
    { category: "Growth", text: "If you looked back on this exact day in five years, what would you hope you did with it?" },

    // --- More Relationships -----------------------------------------------
    { category: "Relationships", text: "What do you wish the people close to you understood about how you show love?" },
    { category: "Relationships", text: "Is there a relationship in your life that takes more than it gives right now?" },
    { category: "Relationships", text: "What's a small act of connection you could offer someone today?" },

    // --- More Stress ------------------------------------------------------
    { category: "Stress", text: "What's the difference between the things stressing you out that you can act on, and the things you can only accept?" },
    { category: "Stress", text: "If your stress could talk, what would it be trying to warn you about?" },
    { category: "Stress", text: "What's one thing you could take off your plate this week without anything falling apart?" },

    // --- More Mindfulness ---------------------------------------------
    { category: "Mindfulness", text: "What sounds can you hear right now that you weren't paying attention to a moment ago?" },
    { category: "Mindfulness", text: "Where in your body do you feel the most tension right now? Breathe into it for a moment before writing." },
    { category: "Mindfulness", text: "What does the present moment actually feel like, without judging it as good or bad?" },

    // --- More Emotional Regulation -----------------------------------------
    { category: "Emotional Regulation", text: "What emotion visits you most often uninvited? What does it usually want you to do?" },
    { category: "Emotional Regulation", text: "What helps you come back to yourself after a hard moment?" },
    { category: "Emotional Regulation", text: "What's the difference between how you feel right now and how you're presenting to others today?" },

    // --- More Self-Love -----------------------------------------------
    { category: "Self-Love", text: "What is something about your personality that took you years to appreciate?" },
    { category: "Self-Love", text: "How do you usually celebrate your wins — and are you letting yourself have this one?" },
    { category: "Self-Love", text: "What would you do today if you fully believed you were worthy of ease?" },
  ];

  for (let i = 0; i < prompts.length; i++) {
    const dayNumber = i + 1;
    await prisma.journalPrompt.upsert({
      where: { dayNumber },
      update: { category: prompts[i].category, text: prompts[i].text },
      create: { dayNumber, category: prompts[i].category, text: prompts[i].text },
    });
  }

  // --- Admin user (dev convenience) --------------------------------------
  const adminEmail = "admin@letitout.app";
  const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Let It Out Admin",
        role: "ADMIN",
        passwordHash: await bcrypt.hash("letitout-admin-dev", 10),
      },
    });
    console.log(`Created dev admin user: ${adminEmail} / letitout-admin-dev (change in production)`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
