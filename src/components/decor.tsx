import Image from "next/image";

/** Hand-drawn-style underline squiggle, placed behind a headline word via `.mark-swash`. */
export function Swash() {
  return (
    <svg viewBox="0 0 200 20" preserveAspectRatio="none" fill="none" aria-hidden="true">
      <path
        d="M2 14C40 4 90 2 100 9C110 16 150 18 198 8"
        stroke="currentColor"
        strokeWidth="7"
        strokeLinecap="round"
      />
    </svg>
  );
}

/** Organic wave shape used to transition between sections instead of a flat edge. */
export function WaveDivider({
  flip = false,
  className = "",
  fill = "fill-white",
}: {
  flip?: boolean;
  className?: string;
  fill?: string;
}) {
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none w-full overflow-hidden leading-none ${flip ? "rotate-180" : ""} ${className}`}
    >
      <svg
        viewBox="0 0 1440 90"
        preserveAspectRatio="none"
        className={`h-14 w-full sm:h-20 ${fill}`}
      >
        <path d="M0,32 C240,80 480,0 720,24 C960,48 1200,88 1440,40 L1440,90 L0,90 Z" />
      </svg>
    </div>
  );
}

/** A hand-placed, slightly rotated tag — used for "Est. 2021" and similar callouts. */
export function Ribbon({
  children,
  className = "",
  tone = "light",
}: {
  children: React.ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3.5 py-1 text-xs font-semibold tracking-wide ${
        tone === "light"
          ? "border-brand-200 bg-white text-brand-700"
          : "border-white/30 bg-white/10 text-white"
      } ${className}`}
    >
      {children}
    </span>
  );
}

/** Decorative scattered brain-line-art marks, for hero/section backdrops. Purely ornamental. */
export function DoodleField({ className = "" }: { className?: string }) {
  return (
    <div aria-hidden="true" className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      <Image
        src="/brand/logo-icon-teal.png"
        alt=""
        width={783}
        height={765}
        className="absolute -right-16 top-8 h-40 w-40 rotate-12 opacity-[0.07] animate-float-slow sm:h-56 sm:w-56"
      />
      <Image
        src="/brand/logo-icon-teal.png"
        alt=""
        width={783}
        height={765}
        className="absolute -left-10 bottom-0 h-28 w-28 -rotate-12 opacity-[0.06] sm:h-36 sm:w-36"
      />
    </div>
  );
}

/** Organic blob-clipped frame for photos/illustrations, instead of a plain rounded rectangle. */
export function BlobFrame({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{ borderRadius: "63% 37% 54% 46% / 43% 39% 61% 57%" }}
    >
      <div className="h-full w-full overflow-hidden" style={{ borderRadius: "inherit" }}>
        {children}
      </div>
    </div>
  );
}
