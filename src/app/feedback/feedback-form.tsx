"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { Star } from "lucide-react";
import { submitFeedback } from "@/lib/feedback-actions";
import type { Dictionary } from "@/lib/i18n/dictionary";
import { Button } from "@/components/ui";

const inputClass =
  "w-full rounded-xl border border-brand-200 bg-white px-4 py-2.5 text-sm outline-none focus:border-brand-500";
const labelClass = "mb-2 block text-sm font-medium text-ink/80";

const SERVICES: { value: string; labelKey: keyof Dictionary["feedback"] }[] = [
  { value: "COUNSELING", labelKey: "serviceCounseling" },
  { value: "JOURNALS", labelKey: "serviceJournals" },
  { value: "WORKSHOPS", labelKey: "serviceWorkshops" },
  { value: "RESOURCES", labelKey: "serviceResources" },
  { value: "SHOP", labelKey: "serviceShop" },
  { value: "APP_GENERAL", labelKey: "serviceAppGeneral" },
];

export default function FeedbackForm({ dict }: { dict: Dictionary }) {
  const t = dict.feedback;
  const [state, formAction, pending] = useActionState(submitFeedback, undefined);
  const [service, setService] = useState(SERVICES[0].value);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);

  // Swapping the (taller) form for the (shorter) success card leaves
  // scrollY wherever it was, which the browser then clamps to the new
  // page height — reading as an unwanted jump toward the bottom. Reset
  // to the top on that transition, but not on first mount. Same pattern
  // as the QR self-assessment results screen (assessment-quiz.tsx).
  const skipNextScrollReset = useRef(true);
  useEffect(() => {
    if (skipNextScrollReset.current) {
      skipNextScrollReset.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [state?.success]);

  if (state?.success) {
    return (
      <div className="rounded-2xl border-2 border-brand-100 bg-white p-8 text-center">
        <p className="font-display text-xl font-semibold text-brand-900">{t.successTitle}</p>
        <p className="mt-2 text-sm text-ink/60">{t.successDescription}</p>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="mt-5 text-sm font-medium text-brand-600 link-grow"
        >
          {t.submitAnother}
        </button>
      </div>
    );
  }

  return (
    <form action={formAction} className="space-y-6 rounded-2xl border-2 border-brand-100 bg-white p-6 sm:p-8">
      <input type="hidden" name="rating" value={rating} />

      <div>
        <label className={labelClass}>{t.serviceLabel}</label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {SERVICES.map((s) => (
            <button
              key={s.value}
              type="button"
              onClick={() => setService(s.value)}
              className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                service === s.value
                  ? "border-brand-700 bg-brand-700 text-white"
                  : "border-brand-200 text-ink/70 hover:bg-brand-50"
              }`}
            >
              {t[s.labelKey]}
            </button>
          ))}
        </div>
        <input type="hidden" name="service" value={service} />
      </div>

      <div>
        <label className={labelClass}>{t.ratingLabel}</label>
        <div className="flex items-center gap-1.5">
          {[1, 2, 3, 4, 5].map((n) => {
            const filled = n <= (hoverRating || rating);
            return (
              <motion.button
                key={n}
                type="button"
                whileTap={{ scale: 0.85 }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                onClick={() => setRating(n)}
                onMouseEnter={() => setHoverRating(n)}
                onMouseLeave={() => setHoverRating(0)}
                aria-label={`${n}/5`}
                className="p-1"
              >
                <Star
                  className={`h-8 w-8 transition-colors ${filled ? "fill-brand-500 text-brand-500" : "fill-none text-brand-200"}`}
                  strokeWidth={1.5}
                />
              </motion.button>
            );
          })}
        </div>
      </div>

      <div>
        <label className={labelClass} htmlFor="comment">{t.commentLabel}</label>
        <textarea id="comment" name="comment" rows={4} className={inputClass} />
      </div>

      {state?.error && <p className="text-sm text-red-600">{state.error}</p>}

      <Button type="submit" disabled={pending || rating === 0} className="w-full">
        {pending ? t.sending : t.submit}
      </Button>
    </form>
  );
}
