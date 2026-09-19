import Image from "next/image";

type MarqueeLogo = { name: string; src: string; width: number; height: number };

/** A single continuously-scrolling row of logos. The list is rendered
 * twice back to back and the whole track translates by exactly -50% of
 * its own width, so the loop seams invisibly into itself — pure CSS
 * (see .animate-marquee in globals.css), no JS needed, and already
 * covered by the app-wide prefers-reduced-motion rule. The second copy
 * is aria-hidden so screen readers don't hear every logo twice. */
export default function LogoMarquee({ logos }: { logos: MarqueeLogo[] }) {
  return (
    // Fixed LTR regardless of site locale — a decorative logo scroll has no
    // reading direction of its own, and RTL's flex-item reversal combined
    // with a physical translateX would otherwise fight each other.
    <div
      dir="ltr"
      className="group overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]"
    >
      <div className="flex w-max animate-marquee gap-x-8 group-hover:[animation-play-state:paused] sm:gap-x-10">
        {[...logos, ...logos].map((logo, i) => (
          <Image
            key={`${logo.name}-${i}`}
            src={logo.src}
            alt={i < logos.length ? logo.name : ""}
            aria-hidden={i >= logos.length}
            width={logo.width}
            height={logo.height}
            className="h-6 w-auto shrink-0 object-contain opacity-90 transition hover:opacity-100 sm:h-7"
          />
        ))}
      </div>
    </div>
  );
}
