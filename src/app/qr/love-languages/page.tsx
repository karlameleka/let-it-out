import type { Metadata } from "next";
import AssessmentPageContent from "../_shared/assessment-page-content";

export const metadata: Metadata = {
  title: "Love Languages",
  robots: { index: false, follow: false },
};

export default function LoveLanguagesPage() {
  return <AssessmentPageContent slug="love-languages" />;
}
