import Link from "next/link";
import { Download } from "lucide-react";
import { Logo } from "@/components/logo";

const APP_ORIGIN = "https://www.letitouteg.org";

// All in-page anchors — this site stands on its own (see proxy.ts), so
// nothing here links into the live app except the "download" CTAs below.
const NAV_LINKS = [
  { href: "#services", label: "Services" },
  { href: "#app", label: "Get the app" },
  { href: "#story", label: "About" },
  { href: "#contact", label: "Contact" },
];

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4">
        <Link href="/" aria-label="Let It Out home" className="inline-flex items-center">
          <Logo height={40} className="h-9 w-auto sm:h-10" priority />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="link-grow pb-0.5 text-sm font-medium text-ink/70 hover:text-brand-700 active:text-brand-700"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <a
          href={`${APP_ORIGIN}/install`}
          className="inline-flex items-center gap-1.5 rounded bg-brand-700 px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] sm:px-5 sm:py-2.5"
        >
          <Download className="h-4 w-4" strokeWidth={2} />
          <span className="hidden sm:inline">Download the app</span>
          <span className="sm:hidden">Get the app</span>
        </a>
      </div>
    </header>
  );
}
