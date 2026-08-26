"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "@/components/logo";
import { WaveDivider } from "@/components/decor";
import { SOCIAL_LINKS } from "@/components/social-icons";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionary";

const OFFICE_MAPS_URL = "https://maps.app.goo.gl/ym5Dc5zvyxfPVxcZA";
const CONTACT_PHONE = "+20 128 8200533";
const CONTACT_PHONE_HREF = "tel:+201288200533";
const CONTACT_EMAIL = "letitoutsupport@gmail.com";

export default function SiteFooter({ dict }: { locale: Locale; dict: Dictionary["footer"] }) {
  const pathname = usePathname();
  // /support runs as a fixed, full-viewport chat screen — the footer
  // would just sit invisibly behind it.
  if (pathname?.startsWith("/support")) return null;

  return (
    <footer className="relative mt-24 bg-brand-900 text-brand-50">
      <WaveDivider className="absolute -top-[1px] left-0 -translate-y-full" fill="fill-brand-900" />

      <div className="relative mx-auto max-w-6xl overflow-hidden px-4 py-10 sm:px-6 sm:py-14">
        <Image
          src="/brand/logo-icon-white.png"
          alt=""
          width={852}
          height={829}
          className="pointer-events-none absolute -bottom-16 -right-12 h-64 w-64 rotate-6 opacity-[0.05] sm:h-80 sm:w-80"
        />

        <div className="relative grid gap-8 sm:grid-cols-2 sm:gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="horizontal-white" height={32} />
            <p className="mt-4 max-w-sm text-sm text-brand-100/80">{dict.tagline}</p>
            <p className="mt-2 max-w-sm text-sm text-brand-100/60">{dict.servicesLine}</p>
          </div>

          <div className="hidden sm:block">
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-200">
              {dict.exploreHeading}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              <li><Link href="/about" className="hover:text-white active:text-white">{dict.aboutUs}</Link></li>
              <li><Link href="/counseling" className="hover:text-white active:text-white">{dict.counseling}</Link></li>
              <li><Link href="/workshops" className="hover:text-white active:text-white">{dict.workshops}</Link></li>
              <li><Link href="/shop" className="hover:text-white active:text-white">{dict.guidedJournals}</Link></li>
              <li><Link href="/journal" className="hover:text-white active:text-white">{dict.journalingApp}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-200">
              {dict.getInTouchHeading}
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/80">
              <li><Link href="/contact" className="hover:text-white active:text-white">{dict.contactUs}</Link></li>
              <li>
                <a
                  href={CONTACT_PHONE_HREF}
                  className="inline-flex items-center gap-1.5 hover:text-white active:text-white"
                >
                  <Phone className="h-3.5 w-3.5 shrink-0" strokeWidth={2} />
                  {CONTACT_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="inline-flex items-center gap-1.5 hover:text-white active:text-white"
                >
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
                  {dict.officeLocation}
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
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-white/20 text-brand-100 transition-colors hover:border-white/40 active:border-white/40 hover:bg-white/10 active:bg-white/10 hover:text-white active:text-white"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </li>
              <li className="pt-2 text-brand-100/50">{dict.crisisNotice}</li>
              <li className="text-brand-100/70">
                {dict.crisisHotlineLabel}{" "}
                <a href="tel:16328" className="font-semibold text-white hover:underline active:underline">
                  16328
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="relative mt-10 flex flex-col gap-4 border-t border-white/10 pt-6 text-xs text-brand-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {dict.copyright}</p>
          <div className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white active:text-white">{dict.privacyPolicy}</Link>
            <Link href="/terms" className="hover:text-white active:text-white">{dict.terms}</Link>
            <Link href="/shop-policy" className="hover:text-white active:text-white">{dict.shopPolicy}</Link>
          </div>
          <p className="italic">{dict.motto}</p>
        </div>
      </div>
    </footer>
  );
}
