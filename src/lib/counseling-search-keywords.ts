/**
 * Static synonym dictionary powering the counseling search bar. Each entry
 * pairs a canonical specialty tag with the alternate words/phrases visitors
 * might actually type. Deliberately broader than any current counselor's
 * specialties array — the goal is that a search for "OCD" or "family"
 * already works today (falling through to the empty-state contact prompt)
 * and starts returning real matches the moment a future therapist is
 * tagged with that specialty, with no code changes needed.
 *
 * Matching is intentionally simple substring search (see counselor-finder.tsx),
 * not exact-tag lookup — a counselor is included the moment any keyword in
 * a group they carry contains (or is contained by) the visitor's search term.
 */
export type CounselingKeywordGroup = {
  specialty: string;
  keywords: string[];
};

export const COUNSELING_KEYWORD_GROUPS: CounselingKeywordGroup[] = [
  // Modalities / frameworks
  { specialty: "CBT", keywords: ["cbt", "cognitive behavioral therapy", "cognitive behavioural therapy", "cognitive therapy"] },
  { specialty: "DBT", keywords: ["dbt", "dialectical behavior therapy", "dialectical behaviour therapy"] },
  { specialty: "ACT", keywords: ["act", "acceptance and commitment therapy"] },
  { specialty: "EMDR", keywords: ["emdr", "eye movement desensitization", "eye movement desensitisation"] },
  { specialty: "Psychodynamic Therapy", keywords: ["psychodynamic", "psychoanalysis", "psychoanalytic"] },
  { specialty: "Family Therapy", keywords: ["family", "family therapy", "family counseling", "family counselling", "systemic therapy"] },
  { specialty: "Couples Therapy", keywords: ["couples", "couple", "marriage", "marital", "premarital", "relationship counseling", "relationship counselling"] },
  { specialty: "Psychosexual Therapy", keywords: ["psychosexual", "sex therapy", "sexual", "intimacy"] },
  { specialty: "Play Therapy", keywords: ["play therapy"] },
  { specialty: "Group Therapy", keywords: ["group therapy", "group counseling", "group counselling"] },

  // Concerns / conditions
  { specialty: "Anxiety", keywords: ["anxiety", "anxious", "worry", "generalized anxiety", "gad"] },
  { specialty: "Depression", keywords: ["depression", "depressed", "low mood", "sadness"] },
  { specialty: "Stress & Burnout", keywords: ["stress", "burnout", "burn out", "overwhelm", "overwhelmed", "work stress"] },
  { specialty: "Emotional Dysregulation", keywords: ["emotional dysregulation", "emotion regulation", "mood swings", "emotional regulation"] },
  { specialty: "Trauma", keywords: ["trauma", "ptsd", "post-traumatic stress", "post traumatic stress", "abuse"] },
  { specialty: "Grief & Loss", keywords: ["grief", "loss", "bereavement", "mourning"] },
  { specialty: "OCD", keywords: ["ocd", "obsessive compulsive disorder", "obsessive-compulsive", "intrusive thoughts", "compulsions"] },
  { specialty: "Panic Disorder", keywords: ["panic", "panic attacks", "panic disorder"] },
  { specialty: "Social Anxiety", keywords: ["social anxiety", "social phobia"] },
  { specialty: "Phobias", keywords: ["phobia", "phobias", "fear"] },
  { specialty: "Eating Disorders", keywords: ["eating disorder", "anorexia", "bulimia", "binge eating", "body image"] },
  { specialty: "Addiction", keywords: ["addiction", "substance abuse", "substance use", "alcohol", "drugs"] },
  { specialty: "Anger Management", keywords: ["anger", "anger management", "irritability"] },
  { specialty: "Self-Esteem", keywords: ["self esteem", "self-esteem", "confidence", "self worth"] },
  { specialty: "Bipolar Disorder", keywords: ["bipolar", "manic", "mania"] },
  { specialty: "Borderline Personality Disorder (BPD)", keywords: ["bpd", "borderline personality", "borderline"] },
  { specialty: "Personality Disorders", keywords: ["personality disorder"] },
  { specialty: "ADHD", keywords: ["adhd", "attention deficit"] },
  { specialty: "Autism Spectrum", keywords: ["autism", "asd", "autism spectrum", "asperger"] },
  { specialty: "Sleep Issues", keywords: ["sleep", "insomnia", "sleep issues"] },
  { specialty: "Postpartum / Perinatal", keywords: ["postpartum", "perinatal", "pregnancy", "new mom", "new mother"] },
  { specialty: "Parenting Support", keywords: ["parenting", "parent", "parenting support"] },
  { specialty: "Child Therapy", keywords: ["child", "children", "kids", "child therapy"] },
  { specialty: "Adolescent Therapy", keywords: ["teen", "teenager", "adolescent", "youth"] },
  { specialty: "Adult Mental Health", keywords: ["adult", "adult mental health"] },
  { specialty: "Career Counseling", keywords: ["career", "work", "workplace", "job"] },
  { specialty: "LGBTQ+ Affirmative Therapy", keywords: ["lgbtq", "lgbt", "queer", "gender identity", "sexual orientation"] },
  { specialty: "Identity & Self-Discovery", keywords: ["identity", "self discovery", "self-discovery"] },
  { specialty: "Life Transitions", keywords: ["life transition", "life change", "transition"] },
  { specialty: "Chronic Illness", keywords: ["chronic illness", "illness", "health anxiety"] },
  { specialty: "Perfectionism", keywords: ["perfectionism", "perfectionist"] },
  { specialty: "Self-Compassion", keywords: ["self compassion", "self-compassion"] },
  { specialty: "Communication", keywords: ["communication", "communication skills"] },
  { specialty: "Psychosis", keywords: ["psychosis", "psychotic"] },
];

/**
 * Does this counselor match a visitor's free-text search? Every whitespace-
 * separated term in the query must appear somewhere in the counselor's
 * "search bag" — their name, credentials, specialties, languages, plus (for
 * each specialty tag they carry) every keyword alias from any dictionary
 * group that tag belongs to. An empty query matches everyone.
 */
export function counselorMatchesSearch(
  counselor: { name: string; credentials: string; specialties: string[]; languages: string[] },
  query: string,
): boolean {
  const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return true;

  const bagParts = [counselor.name, counselor.credentials, ...counselor.specialties, ...counselor.languages];

  for (const specialty of counselor.specialties) {
    const normalizedSpecialty = specialty.toLowerCase();
    for (const group of COUNSELING_KEYWORD_GROUPS) {
      const groupTerms = [group.specialty.toLowerCase(), ...group.keywords];
      const belongsToGroup = groupTerms.some(
        (term) => term === normalizedSpecialty || normalizedSpecialty.includes(term) || term.includes(normalizedSpecialty),
      );
      if (belongsToGroup) bagParts.push(group.specialty, ...group.keywords);
    }
  }

  const bag = bagParts.join(" ").toLowerCase();
  return terms.every((term) => bag.includes(term));
}
