import { prisma } from "../src/lib/db";
import bcrypt from "bcryptjs";

async function main() {
  // --- Counselors -----------------------------------------------------
  const counselors = [
    {
      slug: "karla-meleka",
      name: "Karla Meleka",
      credentials: "Psychologist, MSc (Liverpool John Moores University)",
      bio: "Karla Meleka is a compassionate psychologist with dual degrees in Psychology from the British University in Egypt and London South Bank University. She holds an MSc from Liverpool John Moores University. Passionate about adult mental health, she uses evidence-based therapies like CBT and DBT combined with a holistic approach to help clients manage depression, anxiety, and general psychological distress. Karla focuses on empowering clients with practical tools and resilience to achieve lasting well-being through an empathetic, client-centered approach.",
      specialties: ["Depression", "Anxiety", "CBT", "DBT", "Adult Mental Health"],
      sortOrder: 0,
    },
    {
      slug: "lora-samuel",
      name: "Lora Samuel",
      credentials: "Psychotherapist & Trainer, MSc Clinical Psychology (British University in Egypt)",
      bio: "Lora Samuel is a psychotherapist and trainer. She earned her bachelor's degree in basic and applied psychology in 2020 and her master's degree in clinical psychology in 2025 from the British University in Egypt, where her thesis focused on creating and implementing a self-help self-compassion training program. From 2020-2025, she taught at the psychology department of the British University in Egypt, mentoring students on a personal and professional level. She delivers workshops on topics including personality and behavior, guilt and shame, perfectionism, self-compassion, emotional regulation, and effective communication. Lora is passionate about helping individuals and teams build healthier relationships with themselves and others, believing that emotional awareness, self-compassion, and healthy relationships are essential foundations for wellbeing and meaningful change.",
      specialties: ["Self-Compassion", "Perfectionism", "Emotional Regulation", "Communication", "Workshops & Training"],
      sortOrder: 1,
    },
    {
      slug: "verna-awad",
      name: "Verna Awad",
      credentials: "Clinical Psychologist, MSc Clinical Psychology (University of Gibraltar)",
      bio: "Verna Awad is a clinical psychologist holding an MSc in Clinical Psychology from the University of Gibraltar. She has been working with adults since 2020, supporting people through stress, burnout, emotional dysregulation, and the quiet exhaustion that builds when we stop prioritizing ourselves. Her work is grounded in CBT and DBT, and she is currently in advanced training in psychosexual therapy. She believes that self-awareness is the foundation of any real change — and that the tools we build in therapy are the ones we carry into every area of life.",
      specialties: ["Stress & Burnout", "Emotional Dysregulation", "CBT", "DBT", "Psychosexual Therapy"],
      sortOrder: 2,
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
  // NOTE: physical prices are the real prices provided by Let It Out.
  // Ebook prices are a placeholder (30% off physical) pending confirmation —
  // update in this seed file once real ebook pricing is set.
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
        { format: "EBOOK" as const, priceEGP: 700, sku: "LIO-J-80SL-EBK" },
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
        { format: "EBOOK" as const, priceEGP: 550, sku: "LIO-J-30MF-EBK" },
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
