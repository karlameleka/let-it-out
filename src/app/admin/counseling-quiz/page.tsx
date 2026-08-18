import { prisma } from "@/lib/db";
import { getCounselingQuizConfig, updateCounselingQuizConfig } from "@/lib/counseling-quiz-config";
import CounselingQuizEditor from "@/components/counseling-quiz-editor";

export default async function AdminCounselingQuizPage() {
  const [config, counselors] = await Promise.all([
    getCounselingQuizConfig(),
    prisma.counselor.findMany({ where: { active: true }, select: { specialties: true } }),
  ]);

  const specialties = Array.from(new Set(counselors.flatMap((c) => c.specialties))).sort();

  return (
    <div className="max-w-3xl">
      <h1 className="font-display text-xl font-semibold text-brand-900">&ldquo;Not sure who to pick&rdquo; quiz</h1>
      <p className="mt-1 text-sm text-ink/60">
        The popup shown from the Counseling page that filters therapists by concern and language.
      </p>
      <div className="mt-6">
        <CounselingQuizEditor config={config} specialties={specialties} action={updateCounselingQuizConfig} />
      </div>
    </div>
  );
}
