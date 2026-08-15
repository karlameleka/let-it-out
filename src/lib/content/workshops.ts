import type { Locale } from "@/lib/i18n/locale";

export type WorkshopTopic = {
  slug: string;
  title: string;
  description: string;
  stat?: string;
  statSource?: string;
};

const EN_TOPICS: WorkshopTopic[] = [
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

// Stat sources (institution/citation names) are kept in English even in the
// Arabic version — standard practice for academic/institutional citations.
const AR_TOPICS: WorkshopTopic[] = [
  {
    slug: "stress-management",
    title: "إدارة الضغوط",
    description: "أدوات عملية قائمة على الأدلة للتعرف على محفزات التوتر وبناء عادات تأقلم مستدامة تحت الضغط.",
    stat: "55% من الموظفين في دول الخليج يُبلغون عن ضغوط نفسية يومية مرتفعة، مقابل 32% عالميًا.",
    statSource: "McKinsey Health Institute",
  },
  {
    slug: "burnout-prevention",
    title: "الوقاية من الإرهاق الوظيفي",
    description: "مساعدة الفرق على التعرف على العلامات المبكرة للإرهاق الوظيفي، وبناء حدود وعادات تحمي رفاهيتهم على المدى الطويل.",
    stat: "ما يقارب 1 من كل 3 موظفين في دول الخليج يُبلغون عن أعراض إرهاق وظيفي، و36% ينوون ترك وظائفهم — أكثر من ضعف المعدل العالمي.",
    statSource: "McKinsey Health Institute",
  },
  {
    slug: "mental-health-first-aid",
    title: "الإسعافات الأولية للصحة النفسية",
    description: "تزويد الموظفين والعاملين بالوعي واللغة اللازمة للتعرف على مشكلات الصحة النفسية لدى الآخرين والتعامل معها.",
    stat: "66% من الأشخاص في دول الخليج واجهوا تحديًا نفسيًا، ومع ذلك يتجنب ما يقارب 9 من كل 10 شباب طلب المساعدة خوفًا من الحكم عليهم.",
    statSource: "Regional youth mental health survey, via Workplace Options",
  },
  {
    slug: "parenting-101",
    title: "أساسيات التربية",
    description: "إرشادات أساسية مبنية على علم النفس للآباء الذين يتعاملون مع الاحتياجات العاطفية اليومية لأطفالهم.",
    stat: "5% على الأقل من الآباء حول العالم يعانون من إرهاق الأبوة — وغالبًا ما يكون غير مرئي حتى يؤثر على الأسرة بأكملها.",
    statSource: "Roskam & Mikolajczak, 42-country international study",
  },
  {
    slug: "bridging-generational-gaps",
    title: "تجسير الفجوات بين الأجيال",
    description: "بناء التفاهم والتواصل بين الأجيال في مكان العمل أو الأسرة، بأسلوب قائم على التعاطف واللغة المشتركة.",
    stat: "62% من الموظفين يقولون إن الاختلافات بين الأجيال تُغذي الصراع في مكان العمل، ويُبلغ 39% عن انهيارات تواصل حقيقية بسببها.",
    statSource: "Cross-generational workplace research",
  },
  {
    slug: "self-expression-through-art",
    title: "التعبير عن الذات من خلال الفن",
    description: "ورشة عمل تفاعلية وإبداعية تستخدم الفن كأداة للمعالجة العاطفية واكتشاف الذات — لا حاجة لخبرة فنية سابقة.",
    stat: "عبر 35 دراسة وأكثر من 3000 مشارك، أدى العلاج بالفن البصري إلى انخفاض ملحوظ وقابل للقياس في أعراض القلق.",
    statSource: "Huang et al., meta-analysis, Journal of Psychiatric and Mental Health Nursing",
  },
  {
    slug: "tailored-topics",
    title: "مواضيع مخصصة",
    description: "لديك فكرة محددة في ذهنك؟ نصمم جلسات مخصصة تناسب احتياجات مؤسستك أو مجتمعك الفريدة.",
    stat: "كل دولار واحد يُستثمر في دعم الصحة النفسية في مكان العمل يعود بحوالي 4 دولارات في تحسين الصحة والإنتاجية.",
    statSource: "World Health Organization",
  },
];

export function getWorkshopTopics(locale: Locale): WorkshopTopic[] {
  return locale === "ar" ? AR_TOPICS : EN_TOPICS;
}
