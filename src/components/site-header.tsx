"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LogoLink } from "@/components/logo";
import { useCart } from "@/lib/cart-context";
import { logoutAction } from "@/lib/auth-actions";
import type { SessionPayload } from "@/lib/session";

const NAV_LINKS = [
  { href: "/about", label: "About" },
  { href: "/counseling", label: "Counseling" },
  { href: "/workshops", label: "Workshops" },
  { href: "/shop", label: "Shop" },
  { href: "/journal", label: "Journal" },
];

export default function SiteHeader({ user }: { user: SessionPayload | null }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
        <LogoLink height={36} />

        <nav className="hidden items-center gap-7 md:flex">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`link-grow pb-0.5 text-sm font-medium hover:text-brand-700 ${
                  active ? "text-brand-700 [background-size:100%_1.5px]" : "text-ink/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          <Link
            href="/cart"
            className="relative text-sm font-medium text-ink/70 hover:text-brand-600"
          >
            Cart
            {count > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-brand-500 text-[10px] font-semibold text-white">
                {count}
              </span>
            )}
          </Link>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/journal"}
                className="text-sm font-medium text-ink/70 hover:text-brand-600"
              >
                {user.name.split(" ")[0]}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-ink/50 hover:text-brand-600"
                >
                  Log out
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-brand-600">
                Log in
              </Link>
              <Link
                href="/counseling"
                className="rounded-full bg-brand-700 px-4 py-2 text-sm font-semibold text-white shadow-[0_3px_0_0_theme(colors.brand.900)] transition-all hover:bg-brand-600 hover:translate-y-px hover:shadow-[0_2px_0_0_theme(colors.brand.900)]"
              >
                Book a session
              </Link>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="inline-flex items-center justify-center rounded-md p-2 text-ink md:hidden"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            {open ? (
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            ) : (
              <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/cart"
              onClick={() => setOpen(false)}
              className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50"
            >
              Cart {count > 0 ? `(${count})` : ""}
            </Link>
            {user ? (
              <>
                <Link
                  href={user.role === "ADMIN" ? "/admin" : "/journal"}
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50"
                >
                  My account
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-ink/60 hover:bg-brand-50"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50"
                >
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
