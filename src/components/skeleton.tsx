import { Container, Surface } from "@/components/ui";

/**
 * Shimmer placeholder primitives.
 *
 * These stand in for real content while a route's data resolves, and they
 * deliberately mirror the geometry of what replaces them — same radii, same
 * column widths, same vertical rhythm — so nothing jumps when the data lands.
 * The sweep animation and its reduced-motion fallback live in `globals.css`
 * under `.skeleton`.
 */

export function Skeleton({
  className = "",
  subtle = false,
}: {
  className?: string;
  subtle?: boolean;
}) {
  // Bars default to a pill, but a caller's own radius has to win. Tailwind
  // resolves conflicting utilities by stylesheet order, not attribute order,
  // so `rounded-full` would beat an incoming `rounded-3xl` — hence dropping
  // the default outright whenever the caller supplies one.
  const radius = /(^|\s)rounded/.test(className) ? "" : "rounded-full";
  return (
    <div
      aria-hidden="true"
      className={`skeleton ${subtle ? "skeleton-subtle" : ""} ${radius} ${className}`}
    />
  );
}

/** A paragraph of shimmer lines, the last one short like real ragged text. */
export function SkeletonText({
  lines = 3,
  className = "",
  subtle = false,
}: {
  lines?: number;
  className?: string;
  subtle?: boolean;
}) {
  return (
    <div className={`space-y-2.5 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          subtle={subtle}
          className={`h-3 ${i === lines - 1 ? "w-2/5" : i % 2 ? "w-11/12" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/** Generic card placeholder — eyebrow, title, body, footer link. */
export function SkeletonCard({ className = "" }: { className?: string }) {
  return (
    <Surface className={`p-7 sm:p-8 ${className}`}>
      <Skeleton className="h-3 w-24" />
      <Skeleton className="mt-5 h-5 w-3/4 rounded-lg" />
      <SkeletonText className="mt-5" lines={3} />
      <Skeleton className="mt-7 h-3 w-28" />
    </Surface>
  );
}

/** A person card: avatar disc, name, credentials, specialty pills. */
export function SkeletonPersonCard({ className = "" }: { className?: string }) {
  return (
    <Surface className={`p-7 sm:p-8 ${className}`}>
      <Skeleton className="h-16 w-16" />
      <Skeleton className="mt-6 h-5 w-2/3 rounded-lg" />
      <Skeleton className="mt-3 h-3 w-1/2" />
      <div className="mt-5 flex flex-wrap gap-2">
        <Skeleton className="h-6 w-20" />
        <Skeleton className="h-6 w-24" />
        <Skeleton className="h-6 w-16" />
      </div>
      <Skeleton className="mt-7 h-3 w-32" />
    </Surface>
  );
}

/** A product card: tall 4:5 cover, then centred title, blurb and price. */
export function SkeletonProductCard({ className = "" }: { className?: string }) {
  return (
    <div className={className}>
      <Skeleton className="mx-auto aspect-[4/5] w-full max-w-[280px] rounded-3xl" />
      <Skeleton className="mx-auto mt-6 h-5 w-40 rounded-lg" />
      <Skeleton className="mx-auto mt-3 h-3 w-56" />
      <Skeleton className="mx-auto mt-3 h-3 w-24" />
    </div>
  );
}

/** A saved journal entry in the sidebar or history grid. */
export function SkeletonEntryCard({ className = "" }: { className?: string }) {
  return (
    <Surface className={`p-5 ${className}`}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-4 w-4" />
      </div>
      <SkeletonText className="mt-4" lines={2} />
    </Surface>
  );
}

export function SkeletonEntryList({ count = 4 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonEntryCard key={i} />
      ))}
    </div>
  );
}

/** Hero placeholder — ribbon, headline, standfirst, two buttons. */
export function SkeletonHero() {
  return (
    <section className="relative overflow-hidden bg-linear-to-b from-brand-50 via-brand-50/60 to-white py-20 sm:py-28">
      <Container className="relative">
        <Skeleton className="h-7 w-44" subtle />
        <Skeleton className="mt-7 h-11 w-full max-w-2xl rounded-2xl" subtle />
        <Skeleton className="mt-4 h-11 w-3/5 max-w-lg rounded-2xl" subtle />
        <SkeletonText className="mt-8 max-w-xl" lines={2} subtle />
        <div className="mt-10 flex flex-wrap gap-4">
          <Skeleton className="h-12 w-48" subtle />
          <Skeleton className="h-12 w-44" subtle />
        </div>
      </Container>
    </section>
  );
}

/** Section-heading placeholder: eyebrow, title, description. */
export function SkeletonSectionHeading({
  align = "left",
}: {
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto flex max-w-2xl flex-col items-center" : "max-w-2xl"}>
      <Skeleton className="h-3 w-28" />
      <Skeleton className="mt-5 h-8 w-full max-w-md rounded-xl" />
      <Skeleton className="mt-5 h-3 w-full max-w-sm" />
    </div>
  );
}

/** Convenience wrapper: a responsive grid of identical placeholders. */
export function SkeletonGrid({
  count = 3,
  columns = "sm:grid-cols-3",
  className = "",
  children,
}: {
  count?: number;
  columns?: string;
  className?: string;
  children: (index: number) => React.ReactNode;
}) {
  return (
    <div className={`grid gap-6 ${columns} ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-rise-in" style={{ animationDelay: `${i * 70}ms` }}>
          {children(i)}
        </div>
      ))}
    </div>
  );
}
