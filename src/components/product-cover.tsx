import Image from "next/image";

/**
 * Real cover layouts for the two current journals, matched from product
 * photos (stacked bold-caps title, script wordmark, brain mark, byline).
 * Falls back to a generic number+title layout for any future product
 * that doesn't have a hand-tuned entry here.
 */
const COVER_STYLES: Record<
  string,
  {
    tone: "dark" | "light";
    stackLines: string[];
    author?: string;
  }
> = {
  "80-days-of-self-love": {
    tone: "dark",
    stackLines: ["80", "DAYS", "OF", "SELF-", "LOVE"],
    author: "BY K",
  },
  "30-days-of-mindfulness": {
    tone: "light",
    stackLines: ["30", "DAYS", "OF", "MIND-", "FULNESS"],
  },
};

export function ProductCover({
  slug,
  title,
  durationDays,
  className = "",
}: {
  slug?: string;
  title: string;
  durationDays: number | null;
  className?: string;
}) {
  const style = slug ? COVER_STYLES[slug] : undefined;
  const dark = style?.tone !== "light";

  return (
    <div className={`group relative aspect-[4/5] ${className}`}>
      {/* Offset paper-stack effect behind the cover, like a real journal on a desk */}
      <div className={`absolute inset-0 translate-x-2 translate-y-3 rotate-3 rounded-2xl ${dark ? "bg-brand-100" : "bg-brand-200/60"}`} />
      <div className={`absolute inset-0 -translate-x-1 translate-y-1.5 -rotate-2 rounded-2xl ${dark ? "bg-brand-200/70" : "bg-brand-100"}`} />

      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-2xl p-5 shadow-[0_18px_30px_-12px_rgba(18,53,67,0.45)] transition-transform duration-300 group-hover:-translate-y-1 ${
          dark ? "bg-brand-700 text-white" : "bg-brand-50 text-brand-800"
        }`}
      >
        {/* subtle grain texture instead of a flat gradient */}
        <svg className={`absolute inset-0 h-full w-full mix-blend-overlay ${dark ? "opacity-[0.12]" : "opacity-[0.06]"}`} aria-hidden="true">
          <filter id={`grain-${slug ?? "default"}`}>
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter={`url(#grain-${slug ?? "default"})`} />
        </svg>

        <Image
          src={dark ? "/brand/logo-icon-white.png" : "/brand/logo-icon-teal.png"}
          alt=""
          width={852}
          height={829}
          className={`absolute -bottom-8 -right-8 h-32 w-32 rotate-6 ${dark ? "opacity-15" : "opacity-[0.08]"}`}
        />

        <p className={`relative font-display text-sm italic ${dark ? "text-white/90" : "text-brand-700"}`}>
          Let it Out
        </p>

        {style ? (
          <div className="relative mt-auto">
            <div className="leading-[0.95]">
              {style.stackLines.map((line, i) => (
                <p
                  key={i}
                  className={`font-display font-bold uppercase ${
                    i === 0 ? "text-4xl" : "text-xl"
                  }`}
                >
                  {line}
                </p>
              ))}
            </div>
            {style.author && (
              <p className={`mt-3 text-[11px] font-semibold uppercase tracking-[0.15em] ${dark ? "text-brand-100" : "text-brand-500"}`}>
                {style.author}
                <span className="mx-1.5">·</span>
                Daily Journal
              </p>
            )}
          </div>
        ) : (
          <div className="relative mt-auto">
            {durationDays && (
              <p className="font-display text-5xl font-bold leading-none">{durationDays}</p>
            )}
            <p className={`mt-1 text-xs font-semibold uppercase tracking-[0.2em] ${dark ? "text-brand-100" : "text-brand-500"}`}>
              {durationDays ? "days" : ""}
            </p>
            <p className="mt-3 font-display text-lg font-semibold italic leading-snug">
              {title}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
