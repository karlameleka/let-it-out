"use client";

import { AnimatePresence, motion } from "framer-motion";

/** Animated step progress bar for a multi-step booking flow — the fill
 * smoothly springs to the new width on every step change, and each
 * step's label lights up once reached. `current` is 0-indexed. */
export function BookingProgress({ steps, current }: { steps: string[]; current: number }) {
  const pct = steps.length > 1 ? (current / (steps.length - 1)) * 100 : 100;
  return (
    <div>
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-brand-100">
        <motion.div
          className="h-full rounded-full bg-brand-600"
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: "spring", stiffness: 260, damping: 32 }}
        />
      </div>
      <div className="mt-2 flex justify-between">
        {steps.map((label, i) => (
          <span
            key={label}
            className={`text-[11px] font-semibold uppercase tracking-wide transition-colors duration-300 ${
              i <= current ? "text-brand-700" : "text-ink/35"
            }`}
          >
            {label}
          </span>
        ))}
      </div>
    </div>
  );
}

/** Crossfades/slides between step contents. `stepKey` must change when
 * the step changes (e.g. the step index) to trigger the transition.
 * `direction` flips the slide axis for RTL locales so "forward" always
 * reads as the same physical direction the progress bar is filling. */
export function BookingStepTransition({
  stepKey,
  direction = 1,
  children,
}: {
  stepKey: string | number;
  direction?: 1 | -1;
  children: React.ReactNode;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={stepKey}
        initial={{ opacity: 0, x: 18 * direction }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -18 * direction }}
        transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
