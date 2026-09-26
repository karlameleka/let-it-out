"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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

  function next() {
    setIndex((i) => (i + 1) % quotes.length);
  }
  function prev() {
    setIndex((i) => (i - 1 + quotes.length) % quotes.length);
  }

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={() => setPaused(true)}
      onBlur={() => setPaused(false)}
      className="mx-auto max-w-2xl rounded-2xl border border-brand-100 bg-white p-8 sm:p-10"
    >
      {quotes.length > 1 && (
        <div className="mb-6 flex gap-1.5">
          {quotes.map((_, i) => (
            <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-brand-100">
              <div
                className={`h-full rounded-full bg-brand-600 ${
                  i === index ? "animate-story-fill" : i < index ? "w-full" : "w-0"
                }`}
                style={
                  i === index
                    ? { animationDuration: `${readingDurationMs(quotes[index])}ms`, animationPlayState: paused ? "paused" : "running" }
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}

      <div className="relative">
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
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Previous testimonial"
              className="group absolute inset-y-0 left-0 flex w-1/2 items-center justify-start rounded-l-xl outline-none"
            >
              <ChevronLeft
                className="h-6 w-6 -translate-x-1 text-brand-300 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                strokeWidth={2.5}
              />
            </button>
            <button
              type="button"
              onClick={next}
              aria-label="Next testimonial"
              className="group absolute inset-y-0 right-0 flex w-1/2 items-center justify-end rounded-r-xl outline-none"
            >
              <ChevronRight
                className="h-6 w-6 translate-x-1 text-brand-300 opacity-0 transition-all duration-200 group-hover:translate-x-0 group-hover:opacity-100 group-focus-visible:opacity-100"
                strokeWidth={2.5}
              />
            </button>
          </>
        )}
      </div>
    </div>
  );
}
