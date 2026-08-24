import Image from "next/image";
import { Container, ButtonLink } from "@/components/ui";
import { Logo } from "@/components/logo";
import { Ribbon, WaveDivider } from "@/components/decor";
import { Reveal } from "@/components/reveal";

/** The "Our story" teaser block — shared between the homepage (desktop) and
    the About page's mobile-first section (see the two call sites for the
    responsive visibility split). */
export default function StoryTeaser({
  ribbon,
  title,
  description,
  cta,
  className = "",
}: {
  ribbon: string;
  title: string;
  description: string;
  /** Omit on the About page itself — a "read our story" link back to the
      page you're already on doesn't make sense there. */
  cta?: { label: string; href: string };
  /** Extra classes on the outer <section> — e.g. responsive visibility. */
  className?: string;
}) {
  return (
    <section
      className={`relative overflow-hidden bg-brand-800 pb-24 pt-8 text-white sm:pt-14 ${className}`}
    >
      <WaveDivider className="absolute -top-px left-0 -translate-y-full" fill="fill-brand-800" />
      <Image
        src="/brand/logo-icon-white.png"
        alt=""
        width={852}
        height={829}
        className="pointer-events-none absolute -bottom-20 -left-16 h-72 w-72 opacity-[0.06]"
      />
      <Reveal>
        <Container className="relative grid items-center gap-10 md:grid-cols-2">
          <div>
            <Ribbon tone="dark">{ribbon}</Ribbon>
            <h2 className="mt-4 font-display text-3xl font-medium sm:text-4xl">{title}</h2>
            <p className="mt-5 text-brand-50/85">{description}</p>
            {cta && (
              <ButtonLink href={cta.href} variant="bright" className="mt-7">
                {cta.label}
              </ButtonLink>
            )}
          </div>
          <div className="flex justify-center">
            <Logo variant="icon-white" height={200} className="drop-shadow-xl" />
          </div>
        </Container>
      </Reveal>
    </section>
  );
}
