"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, Sparkles, Bell, HeartHandshake, type LucideIcon } from "lucide-react";
import { JournalIcon } from "@/components/lio-icons";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { hapticTap } from "@/lib/haptics";

type SlideId = "welcome" | "journal" | "reminders" | "counseling";

const FEATURE_ICONS: Partial<Record<SlideId, LucideIcon>> = {
  welcome: Sparkles,
  reminders: Bell,
  counseling: HeartHandshake,
};

function SlideIllustration({ id }: { id: SlideId }) {
  const Icon = FEATURE_ICONS[id];
  return (
    <div className="relative flex h-28 w-28 items-center justify-center rounded-[2rem] bg-white/15 shadow-[0_0_0_1px_rgba(255,255,255,0.12)] backdrop-blur-sm sm:h-32 sm:w-32">
      {id === "journal" ? (
        <JournalIcon className="h-14 w-14 text-white sm:h-16 sm:w-16" />
      ) : Icon ? (
        <Icon className="h-14 w-14 text-white sm:h-16 sm:w-16" strokeWidth={1.6} />
      ) : null}
    </div>
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
}: {
  firstName: string;
  shouldShow: boolean;
  onShown: () => void;
  dict: Dictionary["onboarding"];
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

  function close() {
    setOpen(false);
  }

  function goNext() {
    hapticTap();
    if (isLast) {
      close();
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
          <SlideIllustration id={slide.id} />
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
          {!isLast && (
            <button
              type="button"
              onClick={close}
              className="flex-1 rounded-2xl border-[1.5px] border-brand-200 px-5 py-4 text-center text-sm font-semibold text-brand-700 transition-colors hover:bg-brand-50 active:bg-brand-50"
            >
              {dict.carouselSkip}
            </button>
          )}
          <button
            type="button"
            onClick={goNext}
            aria-label={isLast ? dict.carouselGetStarted : dict.carouselNext}
            className={
              isLast
                ? "flex-1 rounded-2xl bg-brand-700 px-5 py-4 text-center text-sm font-semibold text-white shadow-sm shadow-brand-900/20 transition-all duration-300 hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]"
                : "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-brand-700 text-white shadow-sm shadow-brand-900/20 transition-all duration-300 hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600"
            }
          >
            {isLast ? dict.carouselGetStarted : <ArrowRight className="h-5 w-5" strokeWidth={2.5} />}
          </button>
        </div>
      </div>
    </div>
  );
}
