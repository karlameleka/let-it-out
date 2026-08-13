import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { WaveDivider } from "@/components/decor";
import { SOCIAL_LINKS } from "@/components/social-icons";

export default function SiteFooter() {
  return (
    <footer className="relative mt-24 bg-brand-900 text-brand-50">
      <WaveDivider className="absolute -top-[1px] left-0 -translate-y-full" fill="fill-brand-900" />

      <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-14 sm:px-6">
        <Image
          src="/brand/logo-icon-white.png"
          alt=""
          width={852}
          height={829}
          className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rotate-6 opacity-[0.05] sm:h-80 sm:w-80"
        />

        <div className="relative grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="horizontal-white" height={32} />
            <p className="mt-4 max-w-sm text-sm text-brand-100/80">
              Psychologist-led mental health support since 2021 — online
              counseling, guided journals, and workshops built on
              evidence-based care.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-200">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              <li><Link href="/about" className="hover:text-white">About us</Link></li>
              <li><Link href="/counseling" className="hover:text-white">Counseling</Link></li>
              <li><Link href="/workshops" className="hover:text-white">Workshops</Link></li>
              <li><Link href="/shop" className="hover:text-white">Guided journals</Link></li>
              <li><Link href="/journal" className="hover:text-white">Journaling app</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-200">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
              <li className="flex flex-wrap gap-2 pt-1">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-brand-100 transition-colors hover:border-white/40 hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </li>
              <li className="pt-2 text-brand-100/50">
                If you are in crisis or experiencing a mental health
                emergency, please contact your local emergency services
                immediately.
              </li>
              <li className="text-brand-100/70">
                Egyptian National Crisis Hotline:{" "}
                <a href="tel:16328" className="font-semibold text-white hover:underline">
                  16328
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col gap-2 border-t border-white/10 pt-6 text-xs text-brand-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Let It Out. Est. 2021. All rights reserved.</p>
          <p className="italic">A self-exploration journey.</p>
        </div>
      </div>
    </footer>
  );
}
