export type ReframingPrompt = {
  category: string;
  categoryAr: string;
  situation: string;
  situationAr: string;
  thought: string;
  thoughtAr: string;
};

/** A bank of common automatic-thought scenarios across everyday life
 * domains, shuffled by the cognitive reframing tool so no two sessions
 * feel the same. */
export const REFRAMING_PROMPTS: ReframingPrompt[] = [
  // Work
  {
    category: "Work",
    categoryAr: "الشغل",
    situation: "Your manager hasn't responded to your message in two days.",
    situationAr: "مديرك ماردش على رسالتك من يومين.",
    thought: "They must be annoyed with me, or thinking about letting me go.",
    thoughtAr: "أكيد زعلان مني، أو بيفكر يسيبني من الشغل.",
  },
  {
    category: "Work",
    categoryAr: "الشغل",
    situation: "You made a small mistake in a report you sent out.",
    situationAr: "عملت غلطة صغيرة في تقرير بعتّه.",
    thought: "I'm going to get in serious trouble for this.",
    thoughtAr: "هقع في مشكلة كبيرة بسبب ده.",
  },
  {
    category: "Work",
    categoryAr: "الشغل",
    situation: "A coworker got the promotion you were hoping for.",
    situationAr: "زميلك أخد الترقية اللي كنت مستنيها.",
    thought: "I'm never going to get anywhere in this company.",
    thoughtAr: "مش هوصل لحاجة في الشركة دي أبدًا.",
  },
  {
    category: "Work",
    categoryAr: "الشغل",
    situation: "You spoke up in a meeting and nobody responded.",
    situationAr: "اتكلمت في الاجتماع ومحدش ردّ.",
    thought: "That was a stupid thing to say. Everyone thinks less of me now.",
    thoughtAr: "كان كلام غبي. الكل بقى شايفني أقل دلوقتي.",
  },
  {
    category: "Work",
    categoryAr: "الشغل",
    situation: "You have a big presentation coming up next week.",
    situationAr: "عندك عرض تقديمي كبير الأسبوع الجاي.",
    thought: "I'm going to freeze up and embarrass myself in front of everyone.",
    thoughtAr: "هتجمد وهفضح نفسي قدام الكل.",
  },
  // Relationships
  {
    category: "Relationships",
    categoryAr: "العلاقات",
    situation: "A friend hasn't texted back in a few days.",
    situationAr: "صاحبك ماردش على رسالتك من كام يوم.",
    thought: "They're pulling away from me. I must have done something wrong.",
    thoughtAr: "بيبعد عني. أكيد عملت حاجة غلط.",
  },
  {
    category: "Relationships",
    categoryAr: "العلاقات",
    situation: "Your partner seemed distracted during dinner tonight.",
    situationAr: "شريكك كان شارد بالك خلال العشا النهاردة.",
    thought: "They're losing interest in me.",
    thoughtAr: "بدأ يفقد اهتمامه بيا.",
  },
  {
    category: "Relationships",
    categoryAr: "العلاقات",
    situation: "You canceled plans because you weren't feeling up to it.",
    situationAr: "لغيت خطة لأنك مكنتش قادر.",
    thought: "Now they'll think I'm unreliable and stop inviting me places.",
    thoughtAr: "دلوقتي هيفكروا إني مش يُعتمد عليّ ويبطلوا يعزموني.",
  },
  {
    category: "Relationships",
    categoryAr: "العلاقات",
    situation: "A family gathering didn't go the way you'd hoped.",
    situationAr: "تجمع عائلي ماجاش زي ما كنت متمني.",
    thought: "Get-togethers are always ruined because of me.",
    thoughtAr: "التجمعات دايمًا بتتخرب بسببي.",
  },
  {
    category: "Relationships",
    categoryAr: "العلاقات",
    situation: "You and a close friend had a small disagreement.",
    situationAr: "حصل خلاف بسيط بينك وبين صاحبك المقرب.",
    thought: "This is going to change everything between us.",
    thoughtAr: "الموضوع ده هيغيّر كل حاجة بينّا.",
  },
  // Self-image
  {
    category: "Self-image",
    categoryAr: "الصورة الذاتية",
    situation: "You didn't finish everything on your to-do list today.",
    situationAr: "مخلصتش كل حاجة في قائمة مهامك النهاردة.",
    thought: "I'm lazy, and I can't get anything right.",
    thoughtAr: "أنا كسول، ومش قادر أظبط أي حاجة.",
  },
  {
    category: "Self-image",
    categoryAr: "الصورة الذاتية",
    situation: "You caught yourself comparing your life to someone else's online.",
    situationAr: "لقيت نفسك بتقارن حياتك بحياة حد تاني أونلاين.",
    thought: "Everyone else has it figured out except me.",
    thoughtAr: "الكل عارف طريقه غيري أنا.",
  },
  {
    category: "Self-image",
    categoryAr: "الصورة الذاتية",
    situation: "You received a piece of critical feedback at work.",
    situationAr: "استلمت ملاحظة نقدية في الشغل.",
    thought: "I'm just bad at this. I should probably quit.",
    thoughtAr: "أنا مش كويس في الشغلانة دي. يمكن أستقيل.",
  },
  {
    category: "Self-image",
    categoryAr: "الصورة الذاتية",
    situation: "You forgot something you'd meant to do.",
    situationAr: "نسيت حاجة كنت ناوي تعملها.",
    thought: "I'm so forgetful. Something must be wrong with me.",
    thoughtAr: "أنا نسّاي أوي. أكيد فيا حاجة غلط.",
  },
  {
    category: "Self-image",
    categoryAr: "الصورة الذاتية",
    situation: "You had a visibly anxious moment in a public place.",
    situationAr: "حصلت معاك لحظة قلق واضحة في مكان عام.",
    thought: "Everyone noticed, and now they think I'm weird.",
    thoughtAr: "الكل لاحظ، ودلوقتي شايفني غريب.",
  },
  // Health & routine
  {
    category: "Health & routine",
    categoryAr: "الصحة والروتين",
    situation: "You skipped your workout for the third day in a row.",
    situationAr: "فوّت التمرين لتالت يوم على التوالي.",
    thought: "I've completely fallen off. There's no point starting again.",
    thoughtAr: "بطّلت خالص. مفيش فايدة أبدأ تاني.",
  },
  {
    category: "Health & routine",
    categoryAr: "الصحة والروتين",
    situation: "You didn't sleep well last night.",
    situationAr: "منمتش كويس إمبارح بالليل.",
    thought: "Today is going to be a disaster because of it.",
    thoughtAr: "النهاردة هيبقى يوم كارثي بسبب ده.",
  },
  {
    category: "Health & routine",
    categoryAr: "الصحة والروتين",
    situation: "You ate something you'd told yourself you wouldn't.",
    situationAr: "أكلت حاجة كنت قررت متاكلهاش.",
    thought: "I have no self-control at all.",
    thoughtAr: "معنديش أي ضبط نفس خالص.",
  },
  {
    category: "Health & routine",
    categoryAr: "الصحة والروتين",
    situation: "You felt unusually tired in the middle of the day.",
    situationAr: "حسيت بتعب غريب في نص اليوم.",
    thought: "Something must be seriously wrong with me.",
    thoughtAr: "أكيد فيا حاجة خطيرة.",
  },
  // Social & belonging
  {
    category: "Social & belonging",
    categoryAr: "الانتماء الاجتماعي",
    situation: "You weren't invited to something your friends went to.",
    situationAr: "متعزمتش على حاجة أصحابك راحوها.",
    thought: "They don't actually like having me around.",
    thoughtAr: "هما مش بيحبوا وجودي معاهم فعلاً.",
  },
  {
    category: "Social & belonging",
    categoryAr: "الانتماء الاجتماعي",
    situation: "You said something a little awkward in a group conversation.",
    situationAr: "قلت حاجة محرجة شوية في كلام جماعي.",
    thought: "Everyone's going to remember that and judge me for it.",
    thoughtAr: "الكل هيفتكرها ويحكم عليّ بسببها.",
  },
  {
    category: "Social & belonging",
    categoryAr: "الانتماء الاجتماعي",
    situation: "You saw two coworkers laughing and glance your way.",
    situationAr: "شفت زميلين بيضحكوا وبصوا ناحيتك.",
    thought: "They were talking about me.",
    thoughtAr: "كانوا بيتكلموا عليّ.",
  },
  {
    category: "Social & belonging",
    categoryAr: "الانتماء الاجتماعي",
    situation: "You haven't made a new friend in a long time.",
    situationAr: "زمان عليك مكونتش صداقة جديدة.",
    thought: "There's something wrong with me that keeps people at a distance.",
    thoughtAr: "فيا حاجة غلط بتخلي الناس تبعد عني.",
  },
  {
    category: "Social & belonging",
    categoryAr: "الانتماء الاجتماعي",
    situation: "You turned down an invitation because you needed to rest.",
    situationAr: "رفضت دعوة عشان محتاج تريّح.",
    thought: "People are going to stop inviting me altogether now.",
    thoughtAr: "الناس هتبطل تعزمني خالص دلوقتي.",
  },
  // Money
  {
    category: "Money",
    categoryAr: "الفلوس",
    situation: "You checked your bank balance and it was lower than you expected.",
    situationAr: "شفت رصيدك في البنك وكان أقل مما توقعت.",
    thought: "I'm terrible with money and I'll never get this together.",
    thoughtAr: "أنا فاشل في إدارة الفلوس ومش هظبط ده أبدًا.",
  },
  {
    category: "Money",
    categoryAr: "الفلوس",
    situation: "You had to ask a friend to cover you for something small.",
    situationAr: "اضطريت تطلب من صاحبك يدفع عنك حاجة صغيرة.",
    thought: "This is embarrassing — they probably think I can't manage my life.",
    thoughtAr: "ده محرج — أكيد شايفني مش قادر أدير حياتي.",
  },
  {
    category: "Money",
    categoryAr: "الفلوس",
    situation: "A big, unplanned expense came up this month.",
    situationAr: "طلع مصروف كبير مش متوقع الشهر ده.",
    thought: "Something like this always happens right when I start getting ahead.",
    thoughtAr: "حاجة زي دي دايمًا بتحصل لما أبدأ أتقدم شوية.",
  },
  // Creative & ambition
  {
    category: "Creative & ambition",
    categoryAr: "الإبداع والطموح",
    situation: "You shared something you made and it got barely any response.",
    situationAr: "شاركت حاجة عملتها ومحدش رد عليها تقريبًا.",
    thought: "That confirms it — I'm just not good at this.",
    thoughtAr: "ده بيأكد إني مش كويس في ده.",
  },
  {
    category: "Creative & ambition",
    categoryAr: "الإبداع والطموح",
    situation: "You've been putting off starting a project you actually care about.",
    situationAr: "بتأجل بدء مشروع فعلاً بيهمك.",
    thought: "If I really wanted it, I'd have started already. I guess I don't have what it takes.",
    thoughtAr: "لو كنت عايزه فعلاً كنت بدأت من زمان. يمكن مش عندي اللي يخليني أكمله.",
  },
  {
    category: "Creative & ambition",
    categoryAr: "الإبداع والطموح",
    situation: "Someone else finished something similar to what you'd been planning.",
    situationAr: "حد تاني خلّص حاجة شبه اللي كنت ناوي تعملها.",
    thought: "There's no point now — mine won't matter.",
    thoughtAr: "مفيش فايدة دلوقتي — بتاعتي مش هتفرق.",
  },
];

export type Emotion = { id: string; label: string; labelAr: string };

export const EMOTIONS: Emotion[] = [
  { id: "anxious", label: "Anxious", labelAr: "قلقان" },
  { id: "sad", label: "Sad", labelAr: "زعلان" },
  { id: "angry", label: "Angry", labelAr: "غضبان" },
  { id: "ashamed", label: "Ashamed", labelAr: "خجلان" },
  { id: "guilty", label: "Guilty", labelAr: "حاسس بالذنب" },
  { id: "frustrated", label: "Frustrated", labelAr: "محبط" },
  { id: "hurt", label: "Hurt", labelAr: "متجرح" },
  { id: "lonely", label: "Lonely", labelAr: "وحيد" },
  { id: "embarrassed", label: "Embarrassed", labelAr: "محرج" },
  { id: "overwhelmed", label: "Overwhelmed", labelAr: "مثقل" },
];

export const INTENSITY_LABELS = ["A little", "Somewhat", "Moderately", "Quite a bit", "A lot"];
export const INTENSITY_LABELS_AR = ["شوية", "لحد ما", "متوسط", "كتير", "جدًا"];

export type CognitiveDistortion = {
  id: string;
  label: string;
  labelAr: string;
  description: string;
  descriptionAr: string;
};

/** The standard CBT list of common "thinking traps" (Burns, 1980). Shown
 * as a checklist so the exercise doubles as a light primer on the terms. */
export const COGNITIVE_DISTORTIONS: CognitiveDistortion[] = [
  {
    id: "all-or-nothing",
    label: "All-or-nothing thinking",
    labelAr: "التفكير الأبيض والأسود",
    description: "Seeing things in black-and-white categories, with no middle ground.",
    descriptionAr: "شوفان الأمور بمنطق كله أو ولا حاجة، من غير حل وسط.",
  },
  {
    id: "catastrophizing",
    label: "Catastrophizing",
    labelAr: "تهويل الأمور",
    description: "Assuming the worst possible outcome will happen.",
    descriptionAr: "افتراض إن أسوأ احتمال هو اللي هيحصل.",
  },
  {
    id: "mind-reading",
    label: "Mind reading",
    labelAr: "قراءة الأفكار",
    description: "Assuming you know what someone else is thinking about you.",
    descriptionAr: "افتراض إنك عارف التاني بيفكر فيك إزاي.",
  },
  {
    id: "overgeneralization",
    label: "Overgeneralization",
    labelAr: "التعميم الزايد",
    description: "Seeing a single negative event as an endless pattern.",
    descriptionAr: "شوفان حدث سلبي واحد وكأنه نمط مستمر مفيهوش نهاية.",
  },
  {
    id: "should-statements",
    label: "\"Should\" statements",
    labelAr: "عبارات «لازم»",
    description: "Holding yourself to a rigid rule and feeling guilty when it isn't met.",
    descriptionAr: "تحميل نفسك قاعدة صارمة والإحساس بالذنب لو معملتهاش.",
  },
  {
    id: "labeling",
    label: "Labeling",
    labelAr: "إلصاق الألقاب",
    description: "Attaching a harsh global label to yourself instead of the specific behavior.",
    descriptionAr: "إلصاق لقب قاسي وعام بنفسك بدل ما تحكم على التصرف بس.",
  },
  {
    id: "emotional-reasoning",
    label: "Emotional reasoning",
    labelAr: "التفكير العاطفي",
    description: "Assuming that because you feel it, it must be true.",
    descriptionAr: "افتراض إن اللي إنت حاسس بيه لازم يبقى صح.",
  },
  {
    id: "fortune-telling",
    label: "Fortune telling",
    labelAr: "التنبؤ بالمستقبل",
    description: "Predicting things will go badly, as if it were already decided.",
    descriptionAr: "التنبؤ إن الأمور هتسوء، وكأن ده أمر محسوم.",
  },
  {
    id: "personalization",
    label: "Personalization",
    labelAr: "تحميل نفسك المسؤولية",
    description: "Blaming yourself for something that wasn't (entirely) your fault.",
    descriptionAr: "لوم نفسك على حاجة مش (كلها) غلطتك.",
  },
  {
    id: "mental-filter",
    label: "Mental filter",
    labelAr: "الفلتر الذهني",
    description: "Dwelling on one negative detail while screening out the positives.",
    descriptionAr: "التركيز على تفصيلة سلبية واحدة وتجاهل الإيجابيات.",
  },
];
