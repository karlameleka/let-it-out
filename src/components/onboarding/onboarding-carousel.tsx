"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowLeft, ArrowRight, Sparkles, PlusCircle, Bell, BadgeCheck } from "lucide-react";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { hapticTap } from "@/lib/haptics";

type SlideId = "welcome" | "journal" | "reminders" | "counseling";

/** Phone-frame shell for the journal/reminders/counseling slides — a
 * smaller sibling of install-preview.tsx's PhoneFrame, sized to fit the
 * carousel's diagonal hero band instead of a wide two-column page. */
function MiniPhone({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-[92px] rounded-[16px] bg-white/15 p-1 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm sm:w-[102px]">
      <div className="relative h-[152px] overflow-hidden rounded-[11px] bg-white sm:h-[168px]">
        <div className="absolute left-1/2 top-0 h-2 w-8 -translate-x-1/2 rounded-b-md bg-brand-900/80" />
        {children}
      </div>
    </div>
  );
}

function JournalPreviewScreen({ dict }: { dict: Dictionary["install"] }) {
  return (
    <>
      <div className="bg-brand-50 px-2 pb-1.5 pt-3.5">
        <p className="text-[5.5px] font-semibold uppercase tracking-wide text-brand-500">{dict.previewSelfExploration}</p>
        <p className="mt-0.5 font-display text-[8px] font-medium text-brand-900">{dict.previewWelcomeBack}</p>
        <div className="mt-1 inline-flex items-center gap-1 rounded-full bg-brand-700 px-1.5 py-0.5 text-[5.5px] font-semibold text-white">
          <PlusCircle className="h-1.5 w-1.5" strokeWidth={2} />
          {dict.previewNewEntry}
        </div>
      </div>
      <div className="px-2 py-1.5">
        <div className="rounded-md border border-brand-100 bg-white p-1.5">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-brand-500" />
          <p className="mt-1 line-clamp-2 text-[6.5px] leading-tight text-ink/70">{dict.previewEntry1}</p>
        </div>
      </div>
    </>
  );
}

function RemindersPreviewScreen({ dict }: { dict: Dictionary["onboarding"] }) {
  return (
    <div className="bg-brand-50 px-2 pb-2 pt-3.5">
      <p className="text-[5.5px] font-semibold uppercase tracking-wide text-brand-500">{dict.previewRemindersEyebrow}</p>
      <p className="mt-0.5 font-display text-[8px] font-medium text-brand-900">{dict.previewRemindersHeading}</p>
      <div className="mt-2 flex items-center justify-between rounded-md border border-brand-100 bg-white p-1.5">
        <span className="flex items-center gap-1">
          <Bell className="h-2 w-2 text-brand-700" strokeWidth={2} />
          <span className="text-[6px] font-medium text-ink/80">{dict.previewRemindersLabel}</span>
        </span>
        <span className="relative h-2 w-4 shrink-0 rounded-full bg-brand-700">
          <span className="absolute right-0.5 top-0.5 h-1 w-1 rounded-full bg-white" />
        </span>
      </div>
      <p className="mt-1 text-[5.5px] font-medium text-ink/40">{dict.previewRemindersTime}</p>
    </div>
  );
}

function CounselingPreviewScreen({ dict }: { dict: Dictionary["onboarding"] }) {
  return (
    <div className="bg-brand-50 px-2 pb-2 pt-3.5">
      <p className="text-[5.5px] font-semibold uppercase tracking-wide text-brand-500">{dict.previewCounselingEyebrow}</p>
      <p className="mt-0.5 font-display text-[8px] font-medium text-brand-900">{dict.previewCounselingHeading}</p>
      <div className="mt-2 rounded-md border border-brand-100 bg-white p-1.5">
        <div className="flex items-center gap-1">
          <div className="relative h-5 w-5 shrink-0 overflow-hidden rounded-full">
            <Image src="/counselors/verna-awad.jpg" alt="" fill sizes="20px" className="object-cover" />
          </div>
          <div className="min-w-0">
            <p className="flex items-center gap-0.5 truncate text-[6px] font-semibold text-brand-900">
              Verna Awad
              <BadgeCheck className="h-1.5 w-1.5 shrink-0 text-brand-500" strokeWidth={2} />
            </p>
            <p className="truncate text-[5.5px] text-ink/50">{dict.previewCounselingCredentials}</p>
          </div>
        </div>
        <div className="mt-1 rounded-full bg-brand-700 px-1.5 py-0.5 text-center text-[5.5px] font-semibold text-white">
          {dict.previewCounselingCta}
        </div>
      </div>
    </div>
  );
}

function SlideIllustration({ id, dict, installDict }: { id: SlideId; dict: Dictionary["onboarding"]; installDict: Dictionary["install"] }) {
  if (id === "welcome") {
    return (
      <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm sm:h-32 sm:w-32">
        <Sparkles className="h-14 w-14 text-white sm:h-16 sm:w-16" strokeWidth={1.6} />
      </div>
    );
  }
  return (
    <MiniPhone>
      {id === "journal" && <JournalPreviewScreen dict={installDict} />}
      {id === "reminders" && <RemindersPreviewScreen dict={dict} />}
      {id === "counseling" && <CounselingPreviewScreen dict={dict} />}
    </MiniPhone>
  );
}

/**
 * Full-screen, swipeable post-signup onboarding — a bold 4-slide carousel
 * (welcome, journal, reminders, counseling) replacing the old center-screen
 * welcome modal for logged-in accounts. Rendered exactly once, gated the
 * same way the old modal was (see onboarding-root.tsx / markOnboardingWelcomeSeen),
 * so it still only ever shows on a brand-new account's first page load. The
 * guest (pre-signup) flow and the guided-tooltip spotlight are untouched —
 * this only replaces the account-side welcome step.
 */
export default function OnboardingCarousel({
  firstName,
  shouldShow,
  onShown,
  dict,
  installDict,
}: {
  firstName: string;
  shouldShow: boolean;
  onShown: () => void;
  dict: Dictionary["onboarding"];
  installDict: Dictionary["install"];
}) {
  const [open, setOpen] = useState(false);
  const [index, setIndex] = useState(0);
  const shown = useRef(false);
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (!shouldShow || shown.current) return;
    shown.current = true;
    setOpen(true);
    onShown();
    // onShown is a fresh closure each render in practice, but it's only
    // ever meant to fire once per mount (guarded by the ref above), so
    // it's deliberately excluded from the dependency array.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shouldShow]);

  if (!open) return null;

  const slides: { id: SlideId; headline: string; body: string }[] = [
    { id: "welcome", headline: dict.carouselWelcomeHeadline.replace("{name}", firstName), body: dict.carouselWelcomeBody },
    { id: "journal", headline: dict.carouselJournalHeadline, body: dict.carouselJournalBody },
    { id: "reminders", headline: dict.carouselRemindersHeadline, body: dict.carouselRemindersBody },
    { id: "counseling", headline: dict.carouselCounselingHeadline, body: dict.carouselCounselingBody },
  ];
  const isFirst = index === 0;
  const isLast = index === slides.length - 1;
  const slide = slides[index];

  function goNext() {
    hapticTap();
    if (isLast) {
      setOpen(false);
      return;
    }
    setIndex((i) => Math.min(slides.length - 1, i + 1));
  }

  function goBack() {
    hapticTap();
    setIndex((i) => Math.max(0, i - 1));
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0]?.clientX ?? null;
  }

  function onTouchEnd(e: React.TouchEvent) {
    const startX = touchStartX.current;
    touchStartX.current = null;
    if (startX == null) return;
    const deltaX = (e.changedTouches[0]?.clientX ?? startX) - startX;
    if (Math.abs(deltaX) < 50) return;
    if (deltaX < 0) goNext();
    else goBack();
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-carousel-heading"
      className="fixed inset-0 z-[70] flex flex-col overflow-hidden bg-white"
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      <div
        className="relative h-[38vh] shrink-0 overflow-hidden bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 sm:h-[42vh]"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 88%, 0 72%)" }}
      >
        <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
        <div className="absolute -bottom-6 left-8 h-24 w-24 rounded-full bg-white/10" />
        <div className="flex h-full items-center justify-center pb-6">
          <SlideIllustration id={slide.id} dict={dict} installDict={installDict} />
        </div>
      </div>

      <div className="flex flex-1 flex-col px-6 pt-6 sm:px-10">
        <div className="flex justify-center gap-2">
          {slides.map((s, i) => (
            <span
              key={s.id}
              className={`h-1.5 w-8 rounded-full transition-colors duration-300 ${
                i <= index ? "bg-brand-700" : "bg-brand-100"
              }`}
            />
          ))}
        </div>

        <h2
          id="onboarding-carousel-heading"
          className="mt-8 text-center font-display text-2xl font-bold text-brand-900 sm:text-3xl"
        >
          {slide.headline}
        </h2>
        <p className="mx-auto mt-4 max-w-sm text-center text-sm leading-relaxed text-ink/60">{slide.body}</p>

        <div className="flex-1" />

        <div
          className="flex items-center gap-3 pb-6"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 1.5rem)" }}
        >
          {!isFirst && (
            <button
              type="button"
              onClick={goBack}
              aria-label={dict.carouselBack}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border-[1.5px] border-brand-200 text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-50"
            >
              <ArrowLeft className="h-5 w-5" strokeWidth={2.5} />
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            aria-label={isLast ? dict.carouselGetStarted : dict.carouselNext}
            className={
              isLast
                ? "flex-1 rounded-2xl bg-brand-700 px-5 py-4 text-center text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
                : "ml-auto flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-sm shadow-brand-900/20 transition-all duration-300 hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600"
            }
          >
            {isLast ? dict.carouselGetStarted : <ArrowRight className="h-5 w-5" strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
