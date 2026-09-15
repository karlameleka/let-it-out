import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { QR_TOKENS } from "@/lib/qr-tokens";
import { getAssessment } from "@/lib/assessments";
import AssessmentPageContent from "../_shared/assessment-page-content";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ token: string }>;
}): Promise<Metadata> {
  const { token } = await params;
  const slug = QR_TOKENS[token];
  const definition = slug ? getAssessment(slug) : null;
  return {
    title: definition?.title ?? "Assessment",
    robots: { index: false, follow: false },
  };
}

export default async function QrAssessmentPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const slug = QR_TOKENS[token];
  if (!slug) notFound();
  return <AssessmentPageContent slug={slug} />;
}
