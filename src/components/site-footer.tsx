import Link from "next/link";
import Image from "next/image";
import { Logo } from "@/components/logo";
import { WaveDivider } from "@/components/decor";
import { SOCIAL_LINKS } from "@/components/social-icons";
import { AmbientGlow, focusRingInverse, motionEase } from "@/components/ui";

const footerLink = `rounded-md ${motionEase} ${focusRingInverse} hover:text-white`;

export default function SiteFooter() {
  return (
    <>
      {/* Rendered ahead of the footer rather than absolutely positioned
          inside it, so nothing clips the wave and no hairline of page
          background shows through the seam. */}
      <WaveDivider fill="fill-brand-800" className="-mb-px mt-28" />
      <footer className="relative bg-linear-to-b from-brand-800 via-brand-900 to-brand-950 text-brand-50">
        <AmbientGlow palette="light" intensity={0.1} />

        <div className="relative mx-auto max-w-6xl overflow-hidden px-5 py-16 sm:px-8">
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
              <p className="mt-5 max-w-sm text-sm leading-relaxed text-brand-100/80">
                Enhancing Mental Health using Evidence-based Research since
                2021
              </p>
              <p className="mt-3 max-w-sm text-sm leading-relaxed text-brand-100/60">
                Online Counseling • Guided Journals • Trainings and Workshops
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-brand-200">
                Explore
              </h3>
              <ul className="mt-5 space-y-2.5 text-sm text-brand-100/80">
                <li><Link href="/about" className={footerLink}>About us</Link></li>
                <li><Link href="/counseling" className={footerLink}>Counseling</Link></li>
                <li><Link href="/workshops" className={footerLink}>Workshops</Link></li>
                <li><Link href="/shop" className={footerLink}>Guided journals</Link></li>
                <li><Link href="/journal" className={footerLink}>Journaling app</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold uppercase tracking-[0.16em] text-brand-200">
                Get in touch
              </h3>
              <ul className="mt-5 space-y-2.5 text-sm text-brand-100/80">
                <li><Link href="/contact" className={footerLink}>Contact us</Link></li>
                <li className="flex flex-wrap gap-2 pt-1">
                  {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                    <a
                      key={label}
                      href={href}
                      target={href.startsWith("http") ? "_blank" : undefined}
                      rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                      aria-label={label}
                      className={`flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/5 text-brand-100 backdrop-blur-md ${motionEase} ${focusRingInverse} hover:-translate-y-0.5 hover:border-white/40 hover:bg-white/15 hover:text-white active:translate-y-0 active:scale-[0.98]`}
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
                  <a href="tel:16328" className={`font-semibold text-white ${footerLink} hover:underline`}>
                    16328
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="relative mt-14 flex flex-col gap-4 border-t border-white/10 pt-8 text-xs text-brand-100/50 sm:flex-row sm:items-center sm:justify-between">
            <p>© {new Date().getFullYear()} Let It Out. Est. 2021. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link href="/privacy" className={footerLink}>Privacy Policy</Link>
              <Link href="/terms" className={footerLink}>Terms &amp; Conditions</Link>
            </div>
            <p className="italic">A self-exploration journey.</p>
          </div>
        </div>
      </footer>
    </>
  );
}
