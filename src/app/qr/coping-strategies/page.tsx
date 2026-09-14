import type { Metadata } from "next";
import AssessmentPageContent from "../_shared/assessment-page-content";

export const metadata: Metadata = {
  title: "Coping Strategies",
  robots: { index: false, follow: false },
};

export default function CopingStrategiesPage() {
  return <AssessmentPageContent slug="coping-strategies" />;
}
