import Link from "next/link";
import { Logo } from "@/components/logo";

export default function SiteFooter() {
  return (
    <footer className="mt-20 bg-brand-800 text-brand-50">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
        <div className="grid gap-10 sm:grid-cols-2 md:grid-cols-4">
          <div className="md:col-span-2">
            <Logo variant="horizontal-white" height={32} />
            <p className="mt-4 max-w-sm text-sm text-brand-100/90">
              Psychologist-led mental health support since 2021 — online
              counseling, guided journals, and workshops built on
              evidence-based care.
            </p>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-100">
              Explore
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/90">
              <li><Link href="/about" className="hover:text-white">About us</Link></li>
              <li><Link href="/counseling" className="hover:text-white">Counseling</Link></li>
              <li><Link href="/workshops" className="hover:text-white">Workshops</Link></li>
              <li><Link href="/shop" className="hover:text-white">Guided journals</Link></li>
              <li><Link href="/journal" className="hover:text-white">Journaling app</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-brand-100">
              Get in touch
            </h3>
            <ul className="mt-4 space-y-2 text-sm text-brand-100/90">
              <li><Link href="/contact" className="hover:text-white">Contact us</Link></li>
              <li className="pt-2 text-brand-100/60">
                If you are in crisis or experiencing a mental health
                emergency, please contact your local emergency services
                immediately.
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-brand-700 pt-6 text-xs text-brand-100/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Let It Out. Est. 2021. All rights reserved.</p>
          <p>A self-exploration journey.</p>
        </div>
      </div>
    </footer>
  );
}
