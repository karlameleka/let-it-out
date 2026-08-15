/**
 * Line-art marks for empty states.
 *
 * Drawn on a 24×24 grid with round caps and a single stroke weight so they
 * sit alongside the hand-drawn swash and doodle motifs rather than looking
 * like a stock icon set. They inherit `currentColor`, so tone comes from the
 * surrounding surface.
 */

type MarkProps = { className?: string };

const stroke = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.5,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function Mark({
  className = "h-8 w-8",
  children,
}: MarkProps & { children: React.ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" className={className} {...stroke}>
      {children}
    </svg>
  );
}

/** An open journal — for "no entries yet". */
export function OpenJournalMark({ className }: MarkProps) {
  return (
    <Mark className={className}>
      <path d="M12 6.5C10.6 5.2 8.7 4.5 6.5 4.5H3.5v13h3c2.2 0 4.1.7 5.5 2 1.4-1.3 3.3-2 5.5-2h3v-13h-3c-2.2 0-4.1.7-5.5 2Z" />
      <path d="M12 6.5v13" />
      <path d="M6.2 9h2.9M6.2 12h2.6M14.9 9h2.9M15.2 12h2.6" />
    </Mark>
  );
}

/** A pen mid-stroke — for "start writing". */
export function PenMark({ className }: MarkProps) {
  return (
    <Mark className={className}>
      <path d="M16.6 3.9a1.9 1.9 0 0 1 2.7 2.7L9.6 16.3l-3.6.9.9-3.6 9.7-9.7Z" />
      <path d="M14.8 5.7l2.7 2.7" />
      <path d="M4 20.5c1.7-1.4 3.3-1.4 5 0s3.3 1.4 5 0 3.3-1.4 5 0" />
    </Mark>
  );
}

/** A bookmarked page — for "no articles". */
export function BookmarkMark({ className }: MarkProps) {
  return (
    <Mark className={className}>
      <path d="M6.5 3.5h11a1 1 0 0 1 1 1v15.4a.6.6 0 0 1-.95.5L12 16.4l-5.55 4a.6.6 0 0 1-.95-.5V4.5a1 1 0 0 1 1-1Z" />
      <path d="M9.3 8h5.4" />
    </Mark>
  );
}

/** A calendar with a held slot — for "no sessions / no counselors". */
export function CalendarMark({ className }: MarkProps) {
  return (
    <Mark className={className}>
      <rect x="3.5" y="5.5" width="17" height="15" rx="2.5" />
      <path d="M3.5 10h17M8 3.5v4M16 3.5v4" />
      <path d="M9.3 14.6l1.9 1.9 3.5-3.7" />
    </Mark>
  );
}

/** A shopping bag — for "nothing in the shop / empty cart". */
export function BagMark({ className }: MarkProps) {
  return (
    <Mark className={className}>
      <path d="M5.4 8h13.2l-1 11.1a1.5 1.5 0 0 1-1.5 1.4H7.9a1.5 1.5 0 0 1-1.5-1.4L5.4 8Z" />
      <path d="M9 10.5V7a3 3 0 0 1 6 0v3.5" />
    </Mark>
  );
}

/** A settled, breathing circle — a calm catch-all. */
export function BreathMark({ className }: MarkProps) {
  return (
    <Mark className={className}>
      <circle cx="12" cy="12" r="8.5" />
      <circle cx="12" cy="12" r="4" />
      <path d="M12 3.5v2M12 18.5v2M3.5 12h2M18.5 12h2" />
    </Mark>
  );
}
