import { getReflectionSheetConfig, updateReflectionSheetQuestions } from "@/lib/reflection-sheet-config";
import ReflectionSheetEditor from "@/components/reflection-sheet-editor";

export default async function AdminReflectionSheetPage() {
  const { questions, questionsAr } = await getReflectionSheetConfig();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">In-between sessions reflection sheet</h1>
      <p className="mt-1 text-sm text-ink/60">
        A private self-reflection tool clients can fill out any time between counseling sessions, from
        Journal &gt; Reflection. We prompt them roughly a day after each confirmed session with an in-app
        notification and a push notification. Answers are encrypted on the client&rsquo;s own device and are
        never visible here or to their therapist.
      </p>
      <div className="mt-6">
        <ReflectionSheetEditor questions={questions} questionsAr={questionsAr} action={updateReflectionSheetQuestions} />
      </div>
    </div>
  );
}
