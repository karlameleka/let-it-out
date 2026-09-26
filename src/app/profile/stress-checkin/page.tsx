import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Container } from "@/components/ui";
import { Ribbon } from "@/components/decor";
import { getCurrentUser } from "@/lib/session";
import { getLocale } from "@/lib/i18n/locale";
import { getDictionary } from "@/lib/i18n/dictionary";
import { getMyStressCheckInStatus } from "@/lib/stress-checkin-actions";
import StressCheckInTool from "./stress-checkin-tool";

export const metadata: Metadata = { title: "Stress Check-in" };

export default async function StressCheckInPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const locale = await getLocale();
  const dict = getDictionary(locale).stressCheckIn;

  const status = await getMyStressCheckInStatus();
  if (!status) redirect("/login");

  return (
    <Container className="max-w-2xl py-10 sm:py-14">
      <Link href="/profile" className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 link-grow">
        <span className="inline-block rtl:-scale-x-100">&larr;</span> {dict.backToProfile}
      </Link>
      <div className="mt-4">
        <Ribbon>{dict.eyebrow}</Ribbon>
      </div>
      <h1 className="mt-4 font-display text-3xl font-medium text-brand-900 sm:text-4xl">{dict.title}</h1>
      <p className="mt-3 text-sm text-ink/70">{dict.intro}</p>
      <p className="mt-2 text-xs text-ink/40">{dict.sourceNote}</p>

      <div className="mt-8">
        {/* initialCanCheckIn/nextAvailableAt are only ever read by the
            client tool BEFORE a submission — a Server Action's completion
            triggers Next.js to re-render this server page, which would
            recompute canCheckIn as false (the check-in that was just
            created immediately re-locks it) and could otherwise swap this
            whole subtree back to a "locked" view before the person ever
            sees their results. Keeping one component always mounted here,
            with the results branch checked first inside it, means that
            re-render can't unmount/replace it out from under its own
            just-set success state. */}
        <StressCheckInTool
          locale={locale}
          dict={dict}
          initialCanCheckIn={status.canCheckIn}
          initialNextAvailableAt={status.nextAvailableAt}
        />
      </div>
    </Container>
  );
}
