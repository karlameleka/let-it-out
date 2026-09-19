import Link from "next/link";

/** Segmented pill toggle between /upcoming and /upcoming/past — a real
 * navigation between two Server Component pages, not client-side tab
 * state, so it inherits the page-to-page crossfade already wrapping
 * `children` in layout.tsx (see the ViewTransition there) for a smooth
 * whole-page swap between the two views. */
export default function SessionsTabSwitcher({
  active,
  upcomingLabel,
  pastLabel,
}: {
  active: "upcoming" | "past";
  upcomingLabel: string;
  pastLabel: string;
}) {
  return (
    <div className="flex rounded-full border border-brand-100 bg-white p-1 shadow-sm">
      <Link
        href="/upcoming"
        className={`flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
          active === "upcoming" ? "bg-brand-600 text-white shadow-sm" : "text-ink/40 hover:text-ink/60"
        }`}
      >
        {upcomingLabel}
      </Link>
      <Link
        href="/upcoming/past"
        className={`flex-1 rounded-full py-2.5 text-center text-sm font-semibold transition-colors ${
          active === "past" ? "bg-brand-600 text-white shadow-sm" : "text-ink/40 hover:text-ink/60"
        }`}
      >
        {pastLabel}
      </Link>
    </div>
  );
}
