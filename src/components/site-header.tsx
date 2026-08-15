"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLink } from "@/components/logo";
import { useCart } from "@/lib/cart-context";
import { logoutAction } from "@/lib/auth-actions";
import { focusRing, liftPress, motionEase } from "@/components/ui";
import type { SessionPayload } from "@/lib/session";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/counseling", label: "Counseling" },
  { href: "/workshops", label: "Workshops" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
  { href: "/resources", label: "Resources" },
];

const quietLink = `rounded-md text-sm font-medium text-ink-muted ${motionEase} ${focusRing} hover:text-brand-600`;
const mobileLink = `rounded-xl px-3 py-2.5 text-sm font-medium text-ink-body ${motionEase} ${focusRing} hover:bg-brand-50 hover:text-brand-700`;

export default function SiteHeader({ user }: { user: SessionPayload | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-900/[0.07] bg-white/70 shadow-ambient-sm backdrop-blur-xl supports-[backdrop-filter]:bg-white/65">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-5 py-3.5 sm:px-8">
        <LogoLink height={36} />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={`link-grow rounded-md pb-0.5 text-sm font-medium ${motionEase} ${focusRing} hover:text-brand-700 ${
                  active ? "text-brand-700 [background-size:100%_1.5px]" : "text-ink-muted"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link href="/cart" className={`relative ${quietLink}`}>
            Cart
            {count > 0 && (
              <span className="absolute -right-3.5 -top-2 flex h-4.5 w-4.5 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white shadow-ambient-sm">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3.5">
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/journal"}
                className={quietLink}
              >
                {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className={`rounded-md text-sm font-medium text-ink-faint ${motionEase} ${focusRing} hover:text-brand-600`}
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3.5">
              <Link href="/login" className={quietLink}>
                Log in
              </Link>
              <Link
                href="/counseling"
                className={`rounded-full bg-linear-to-b from-brand-600 to-brand-700 px-5 py-2.5 text-sm font-semibold tracking-tight text-white shadow-ambient ${motionEase} ${liftPress} ${focusRing} hover:from-brand-500 hover:to-brand-600 hover:shadow-ambient-lg`}
              >
                Book a session
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          aria-label="Toggle menu"
          className={`inline-flex items-center justify-center rounded-xl border border-brand-900/10 bg-white/60 p-2 text-ink ${motionEase} ${focusRing} hover:border-brand-300 active:scale-[0.98] md:hidden`}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="animate-rise-in border-t border-brand-900/[0.07] bg-white/90 px-4 pb-5 backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-1 pt-3">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={mobileLink}
              >
                {link.label}
              </Link>
            ))}
            <Link href="/cart" onClick={() => setOpen(false)} className={mobileLink}>
              Cart {count > 0 ? `(${count})` : ""}
            </Link>
            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/journal"}
                  onClick={() => setOpen(false)}
                  className={mobileLink}
                >
                  My account
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className={`w-full text-left ${mobileLink} text-ink-muted`}
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" onClick={() => setOpen(false)} className={mobileLink}>
                  Log in
                </Link>
                <Link href="/signup" onClick={() => setOpen(false)} className={mobileLink}>
                  Sign up
                </Link>
              </>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
