/** Shared loading-placeholder block — a calmer, brand-tinted pulse than
 * Tailwind's default `animate-pulse` (see `.skeleton-pulse` in
 * globals.css), reused across route-level `loading.tsx` fallbacks so
 * every "still loading" moment in the app feels the same. Purely
 * presentational: no "use client" needed, safe inside a Server
 * Component's loading.tsx. */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton-pulse rounded-2xl bg-brand-100/70 ${className}`} />;
}

/** A stack of skeleton rows, e.g. standing in for a list of cards while
 * data loads. `lines` controls how many, `lineClassName` how each looks. */
export function SkeletonRows({
  count = 3,
  className = "space-y-3",
  lineClassName = "h-24 rounded-2xl",
}: {
  count?: number;
  className?: string;
  lineClassName?: string;
}) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} className={lineClassName} />
      ))}
    </div>
  );
}
