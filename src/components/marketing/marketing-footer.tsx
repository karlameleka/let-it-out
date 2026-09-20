import Image from "next/image";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { WaveDivider } from "@/components/decor";
import { SOCIAL_LINKS } from "@/components/social-icons";

const APP_ORIGIN = "https://letitouteg.org";
const OFFICE_MAPS_URL = "https://maps.app.goo.gl/ym5Dc5zvyxfPVxcZA";
const CONTACT_PHONE = "+20 128 8200533";
const CONTACT_PHONE_HREF = "tel:+201288200533";
const CONTACT_EMAIL = "letitoutsupport@gmail.com";

const EXPLORE_LINKS = [
  { href: `${APP_ORIGIN}/about`, label: "About us" },
  { href: `${APP_ORIGIN}/counseling`, label: "Counseling" },
  { href: `${APP_ORIGIN}/workshops`, label: "Workshops" },
  { href: `${APP_ORIGIN}/shop`, label: "Guided journals" },
  { href: `${APP_ORIGIN}/install`, label: "Get the app" },
];

export function MarketingFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-900 text-brand-50">
      <WaveDivider className="absolute -top-[1px] left-0 -translate-y-full" fill="fill-brand-900" />

      <Image
        src="/brand/logo-icon-white.png"
        alt=""
        width={852}
        height={829}
        className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rotate-6 opacity-[0.05] sm:h-80 sm:w-80"
      />

      <div className="relative mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
        <div className="relative grid gap-8 sm:grid-cols-2 sm:gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="horizontal-white" height={32} />
            <p className="mt-4 max-w-sm text-sm text-brand-100/80">
              Enhancing Mental Health using Evidence-based Research since 2021
            </p>
            <p className="mt-2 max-w-sm text-sm text-brand-100/60">
              Online Counseling • Guided Journals • Trainings and Workshops
            </p>
          </div>

          <div className="hidden sm:block">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-200">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              {EXPLORE_LINKS.map((link) => (
                <li key={link.href}>
                  <a href={link.href} className="hover:text-white active:text-white">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-200">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              <li><a href={`${APP_ORIGIN}/contact`} className="hover:text-white active:text-white">Contact us</a></li>
              <li>
                <a href={CONTACT_PHONE_HREF} className="inline-flex items-center gap-1.5 hover:text-white active:text-white">
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${CONTACT_EMAIL}`} className="inline-flex items-center gap-1.5 hover:text-white active:text-white">
                  <Mail className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {CONTACT_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={OFFICE_MAPS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 hover:text-white active:text-white"
                >
                  <MapPin className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  Heliopolis, Cairo, Egypt
                </a>
              </li>
              <li className="flex flex-wrap gap-2 pt-1">
                {SOCIAL_LINKS.map(({ label, href, icon: Icon }) => (
                  <a
                    key={label}
                    href={href}
                    target={href.startsWith("http") ? "_blank" : undefined}
                    rel={href.startsWith("http") ? "noopener noreferrer" : undefined}
                    aria-label={label}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 text-brand-100 transition-colors hover:border-white/40 active:border-white/40 hover:bg-white/10 active:bg-white/10 hover:text-white active:text-white"
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                ))}
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-brand-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Let It Out. Est. 2021. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href={`${APP_ORIGIN}/privacy`} className="hover:text-white active:text-white">Privacy Policy</a>
            <a href={`${APP_ORIGIN}/terms`} className="hover:text-white active:text-white">Terms &amp; Conditions</a>
          </div>
          <p className="italic">A self-exploration journey.</p>
        </div>
      </div>
    </footer>
  );
}
