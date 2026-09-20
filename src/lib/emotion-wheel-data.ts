import type { CoreEmotionId } from "@/lib/moods";

export type WheelLeaf = { label: string; labelAr: string };
export type WheelSecondary = { label: string; labelAr: string; tertiary: [WheelLeaf, WheelLeaf] };
export type WheelCore = {
  id: CoreEmotionId;
  label: string;
  labelAr: string;
  /** Innermost ring, most saturated. */
  colorCore: string;
  /** Middle ring (5 secondary feelings). */
  colorSecondary: string;
  /** Outer ring (10 more specific feelings, 2 per secondary). */
  colorTertiary: string;
  secondaries: [WheelSecondary, WheelSecondary, WheelSecondary, WheelSecondary, WheelSecondary];
};

/**
 * The full 3-tier feelings wheel (5 core → 5 secondary each → 2 tertiary
 * each = 80 leaf feelings) shown on /journal/mood-wheel. A distinct data
 * set from moods.ts's flatter CORE_EMOTIONS/SECONDARY_LABELS (used by
 * MoodPicker's chip list and mood-patterns/calendar) — every wedge here
 * still logs under one of moods.ts's existing core ids (see
 * EmotionsWheel's log() call), so calendar coloring and legacy entries
 * stay fully compatible without this file touching that one.
 *
 * Colors are a muted 5-hue family (amber/blue/terracotta/violet/sage) in
 * the app's soft, low-saturation style — deliberately not the reference
 * wheel's bright saturated hues, and not constrained to the site-wide
 * brand teal ramp either (this widget needs 5 clearly distinct hues to
 * read at a glance, the same exception moods.ts's existing palette
 * already made). Order within each ring (clockwise) matches the source
 * wheel's layout, so adjacent wedges across ring/core boundaries line up.
 */
export const EMOTION_WHEEL: [WheelCore, WheelCore, WheelCore, WheelCore, WheelCore] = [
  {
    id: "fearful",
    label: "Fearful",
    labelAr: "خايف",
    colorCore: "#7A5EA8",
    colorSecondary: "#A78FC7",
    colorTertiary: "#E4DBF0",
    secondaries: [
      { label: "Threatened", labelAr: "يشعر بالتهديد", tertiary: [
        { label: "Overwhelmed", labelAr: "مرهق" },
        { label: "Worried", labelAr: "قلق" },
      ] },
      { label: "Rejected", labelAr: "مرفوض", tertiary: [
        { label: "Inadequate", labelAr: "غير كافٍ" },
        { label: "Inferior", labelAr: "أقل شأناً" },
      ] },
      { label: "Weak", labelAr: "ضعيف", tertiary: [
        { label: "Worthless", labelAr: "عديم القيمة" },
        { label: "Insignificant", labelAr: "تافه" },
      ] },
      { label: "Insecure", labelAr: "غير آمن", tertiary: [
        { label: "Excluded", labelAr: "مستبعد" },
        { label: "Persecuted", labelAr: "مضطهد" },
      ] },
      { label: "Anxious", labelAr: "قلقان", tertiary: [
        { label: "Nervous", labelAr: "متوتر" },
        { label: "Exposed", labelAr: "مكشوف" },
      ] },
    ],
  },
  {
    id: "disgusted",
    label: "Disgusted",
    labelAr: "مشمئز",
    colorCore: "#4C8C6B",
    colorSecondary: "#8DBBA2",
    colorTertiary: "#DCEAE1",
    secondaries: [
      { label: "Repelled", labelAr: "نافر", tertiary: [
        { label: "Horrified", labelAr: "مرتعب" },
        { label: "Hesitant", labelAr: "متردد" },
      ] },
      { label: "Awful", labelAr: "فظيع", tertiary: [
        { label: "Nauseated", labelAr: "يشعر بالغثيان" },
        { label: "Detestable", labelAr: "بغيض" },
      ] },
      { label: "Disenchanted", labelAr: "محبط", tertiary: [
        { label: "Appalled", labelAr: "مصدوم" },
        { label: "Revolted", labelAr: "مقزز" },
      ] },
      { label: "Disapproving", labelAr: "رافض", tertiary: [
        { label: "Judgemental", labelAr: "يصدر أحكاماً" },
        { label: "Embarrassed", labelAr: "محرج" },
      ] },
      { label: "Startled", labelAr: "منذعر", tertiary: [
        { label: "Shocked", labelAr: "صادم" },
        { label: "Dismayed", labelAr: "مستاء" },
      ] },
    ],
  },
  {
    id: "happy",
    label: "Happy",
    labelAr: "مبسوط",
    colorCore: "#C98F3E",
    colorSecondary: "#E0B876",
    colorTertiary: "#F3E1C2",
    secondaries: [
      { label: "Optimistic", labelAr: "متفائل", tertiary: [
        { label: "Hopeful", labelAr: "يحمل أملاً" },
        { label: "Inspired", labelAr: "ملهَم" },
      ] },
      { label: "Peaceful", labelAr: "مطمئن", tertiary: [
        { label: "Loved", labelAr: "محبوب" },
        { label: "Thankful", labelAr: "شاكر" },
      ] },
      { label: "Proud", labelAr: "فخور", tertiary: [
        { label: "Successful", labelAr: "ناجح" },
        { label: "Confident", labelAr: "واثق" },
      ] },
      { label: "Excited", labelAr: "متحمس", tertiary: [
        { label: "Eager", labelAr: "متلهف" },
        { label: "Energetic", labelAr: "نشيط" },
      ] },
      { label: "Powerful", labelAr: "قوي", tertiary: [
        { label: "Courageous", labelAr: "شجاع" },
        { label: "Creative", labelAr: "مبدع" },
      ] },
    ],
  },
  {
    id: "sad",
    label: "Sad",
    labelAr: "زعلان",
    colorCore: "#3D6FA6",
    colorSecondary: "#7FA3C9",
    colorTertiary: "#D2E1EE",
    secondaries: [
      { label: "Lonely", labelAr: "وحيد", tertiary: [
        { label: "Isolated", labelAr: "منعزل" },
        { label: "Abandoned", labelAr: "مهجور" },
      ] },
      { label: "Vulnerable", labelAr: "هش", tertiary: [
        { label: "Victimised", labelAr: "ضحية" },
        { label: "Fragile", labelAr: "رقيق المشاعر" },
      ] },
      { label: "Despair", labelAr: "يائس", tertiary: [
        { label: "Grief", labelAr: "حزن عميق" },
        { label: "Powerless", labelAr: "عاجز" },
      ] },
      { label: "Guilty", labelAr: "حاسس بالذنب", tertiary: [
        { label: "Remorseful", labelAr: "نادم" },
        { label: "Ashamed", labelAr: "خجلان" },
      ] },
      { label: "Hurt", labelAr: "متألم", tertiary: [
        { label: "Wounded", labelAr: "جريح" },
        { label: "Disappointed", labelAr: "خايب الأمل" },
      ] },
    ],
  },
  {
    id: "angry",
    label: "Angry",
    labelAr: "متضايق",
    colorCore: "#B24C42",
    colorSecondary: "#D08278",
    colorTertiary: "#F1D4CF",
    secondaries: [
      { label: "Humiliated", labelAr: "مُهان", tertiary: [
        { label: "Disrespected", labelAr: "غير محترم" },
        { label: "Ridiculed", labelAr: "مسخور منه" },
      ] },
      { label: "Bitter", labelAr: "حاقد", tertiary: [
        { label: "Indignant", labelAr: "ساخط" },
        { label: "Violated", labelAr: "مُنتهَك" },
      ] },
      { label: "Frustrated", labelAr: "محبط", tertiary: [
        { label: "Infuriated", labelAr: "غاضب جداً" },
        { label: "Annoyed", labelAr: "منزعج" },
      ] },
      { label: "Critical", labelAr: "ناقد", tertiary: [
        { label: "Sceptical", labelAr: "متشكك" },
        { label: "Dismissive", labelAr: "متجاهل" },
      ] },
      { label: "Distant", labelAr: "بعيد", tertiary: [
        { label: "Withdrawn", labelAr: "منسحب" },
        { label: "Numb", labelAr: "مخدر المشاعر" },
      ] },
    ],
  },
];
