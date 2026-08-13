import Image from "next/image";

export function ProductCover({
  title,
  durationDays,
  className = "",
}: {
  title: string;
  durationDays: number | null;
  className?: string;
}) {
  return (
    <div className={`group relative aspect-[4/5] ${className}`}>
      {/* Offset paper-stack effect behind the cover, like a real journal on a desk */}
      <div className="absolute inset-0 translate-x-2 translate-y-3 rotate-3 rounded-2xl bg-brand-100" />
      <div className="absolute inset-0 -translate-x-1 translate-y-1.5 -rotate-2 rounded-2xl bg-brand-200/70" />

      <div className="relative flex h-full w-full flex-col justify-between overflow-hidden rounded-2xl bg-brand-700 p-6 text-white shadow-[0_18px_30px_-12px_rgba(18,53,67,0.45)] transition-transform duration-300 group-hover:-translate-y-1">
        {/* subtle grain texture instead of a flat gradient */}
        <svg className="absolute inset-0 h-full w-full opacity-[0.12] mix-blend-overlay" aria-hidden="true">
          <filter id="grain">
            <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" />
          </filter>
          <rect width="100%" height="100%" filter="url(#grain)" />
        </svg>

        <Image
          src="/brand/logo-icon-white.png"
          alt=""
          width={852}
          height={829}
          className="absolute -bottom-10 -right-10 h-44 w-44 rotate-6 opacity-15"
        />

        <span className="relative inline-flex w-fit -rotate-2 items-center rounded-full border border-white/30 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-brand-50">
          Guided journal
        </span>

        <div className="relative">
          {durationDays && (
            <p className="font-display text-6xl font-semibold leading-none">{durationDays}</p>
          )}
          <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
            {durationDays ? "days" : ""}
          </p>
          <p className="mt-4 font-display text-xl font-semibold leading-snug italic">
            {title}
          </p>
        </div>
      </div>
    </div>
  );
}
