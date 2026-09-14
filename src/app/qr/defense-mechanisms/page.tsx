import type { Metadata } from "next";
import AssessmentPageContent from "../_shared/assessment-page-content";

export const metadata: Metadata = {
  title: "Defense Mechanisms",
  robots: { index: false, follow: false },
};

export default function DefenseMechanismsPage() {
  return <AssessmentPageContent slug="defense-mechanisms" />;
}
