"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { WaveDivider } from "@/components/decor";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionary";

/** Just the closing bar — copyright, contact/legal links, motto. The
 * fuller footer (logo, explore column, get-in-touch details, socials,
 * crisis hotline) moved to /contact, see contact/page.tsx. "Legal" links
 * to the same consolidated privacy/terms/shop-policy page the menu uses
 * (see /legal) rather than listing all three separately. */
export default function SiteFooter({ dict }: { locale: Locale; dict: Dictionary }) {
  const pathname = usePathname();
  // /support runs as a fixed, full-viewport chat screen — the footer
  // would just sit invisibly behind it.
  if (pathname?.startsWith("/support")) return null;

  const f = dict.footer;

  return (
    <footer className="relative mt-24 overflow-hidden bg-brand-900 text-brand-50">
      <WaveDivider className="absolute -top-[1px] left-0 -translate-y-full" fill="fill-brand-900" />

      <div className="relative mx-auto max-w-6xl px-4 py-6 sm:px-6">
        <div className="flex flex-col gap-4 text-xs text-brand-100/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {f.copyright}</p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/contact" className="hover:text-white active:text-white">{f.contactUs}</Link>
            <Link href="/legal" className="hover:text-white active:text-white">{dict.nav.legal}</Link>
          </div>
          <p className="italic">{f.motto}</p>
        </div>
      </div>
    </footer>
  );
}
