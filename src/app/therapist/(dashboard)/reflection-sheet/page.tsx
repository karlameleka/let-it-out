import { notFound } from "next/navigation";
import { getCurrentCounselor } from "@/lib/therapist-session";
import { prisma } from "@/lib/db";
import { getReflectionSheetConfig, updateReflectionSheetQuestions } from "@/lib/reflection-sheet-config";
import ReflectionSheetEditor from "@/components/reflection-sheet-editor";

export default async function TherapistReflectionSheetPage() {
  const session = await getCurrentCounselor();
  if (!session) notFound();

  const counselor = await prisma.counselor.findUnique({
    where: { id: session.counselorId },
    select: { canEditFormsConfig: true },
  });
  if (!counselor?.canEditFormsConfig) notFound();

  const { questions, questionsAr } = await getReflectionSheetConfig();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">In-between sessions reflection sheet</h1>
      <p className="mt-1 text-sm text-ink/60">
        A private self-reflection tool clients can fill out any time between counseling sessions, from
        Journal &gt; Reflection. This is the same sheet used sitewide, for every counselor&rsquo;s clients, not
        just your own. Answers are encrypted on the client&rsquo;s own device and are never visible here or to
        their therapist.
      </p>
      <div className="mt-6">
        <ReflectionSheetEditor questions={questions} questionsAr={questionsAr} action={updateReflectionSheetQuestions} />
      </div>
    </div>
  );
}
