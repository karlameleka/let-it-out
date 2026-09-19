import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { Container, SectionHeading } from "@/components/ui";
import FeedbackForm from "./feedback-form";

export const metadata: Metadata = {
  title: "Feedback",
  description: "Share your feedback about Let It Out.",
};

export default async function FeedbackPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const dict = getDictionary(await getLocale());
  const t = dict.feedback;

  return (
    <section className="pt-6 pb-10 sm:pt-14 sm:pb-24">
      <Container className="max-w-xl">
        <SectionHeading title={t.pageTitle} description={t.pageSubtitle} />
        <div className="mt-8">
          <FeedbackForm dict={dict} />
        </div>
      </Container>
    </section>
  );
}
