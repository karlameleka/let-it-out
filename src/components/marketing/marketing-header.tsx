import Link from "next/link";
import { Logo } from "@/components/logo";
import { ServicesNav } from "@/components/marketing/services-nav";
import { DownloadButton } from "@/components/marketing/download-button";

// The only nav here is "Services", pointing at this site's own feature
// pages (/counseling, /journaling, /workshops) — everything else is the
// download CTA. See proxy.ts and the PR notes for why nothing here links
// into the live app itself.
export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3.5 sm:px-6 sm:py-4">
        <Link href="/" aria-label="Let It Out home" className="inline-flex items-center">
          <Logo height={40} className="h-9 w-auto sm:h-10" priority />
        </Link>

        <nav className="hidden md:block">
          <ServicesNav />
        </nav>

        <DownloadButton className="!px-4 !py-2 sm:!px-5 sm:!py-2.5">
          <span className="hidden sm:inline">Download the app</span>
          <span className="sm:hidden">Get the app</span>
        </DownloadButton>
      </div>
    </header>
  );
}
