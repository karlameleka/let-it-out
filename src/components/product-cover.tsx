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
    <div
      className={`relative flex aspect-[4/5] items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 to-brand-800 ${className}`}
    >
      <Image
        src="/brand/logo-icon-white.png"
        alt=""
        width={852}
        height={829}
        className="absolute -bottom-8 -right-8 h-40 w-40 opacity-20"
      />
      <div className="relative px-6 text-center text-white">
        {durationDays && (
          <p className="font-display text-5xl font-bold">{durationDays}</p>
        )}
        <p className="mt-1 text-xs font-semibold uppercase tracking-[0.2em] text-brand-100">
          {durationDays ? "days" : "guided journal"}
        </p>
        <p className="mt-4 font-display text-lg font-semibold leading-snug">
          {title}
        </p>
      </div>
    </div>
  );
}
