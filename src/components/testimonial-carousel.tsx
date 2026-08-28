"use client";

import { useEffect, useState } from "react";

// Longer quotes get more time on screen before auto-advancing, clamped to
// a sane range so a one-line quote doesn't flash by and a long one doesn't
// stall the rotation.
function readingDurationMs(quote: string): number {
  const words = quote.trim().split(/\s+/).length;
  return Math.min(14000, Math.max(5500, words * 110));
}

export default function TestimonialCarousel({ quotes }: { quotes: string[] }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused || quotes.length <= 1) return;
    const id = setTimeout(() => {
      setIndex((i) => (i + 1) % quotes.length);
    }, readingDurationMs(quotes[index]));
    return () => clearTimeout(id);
  }, [index, paused, quotes]);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="mx-auto max-w-2xl rounded-2xl border border-brand-100 bg-white p-8 sm:p-10"
    >
      <p aria-hidden="true" className="font-display text-4xl leading-none text-brand-200">
        &ldquo;
      </p>
      <p
        key={index}
        className="animate-rise -mt-3 min-h-[4.5rem] whitespace-pre-line text-sm leading-relaxed text-ink/75 sm:text-base"
      >
        {quotes[index]}
      </p>

      {quotes.length > 1 && (
        <div className="mt-6 flex items-center justify-center gap-2">
          {quotes.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show testimonial ${i + 1} of ${quotes.length}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-5 bg-brand-600" : "w-1.5 bg-brand-200 hover:bg-brand-300"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
}
