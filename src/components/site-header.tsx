"use client";

import { useEffect, useRef, useState, type ComponentType } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart } from "lucide-react";
import { CartIcon } from "@/components/lio-icons";
import { LogoLink } from "@/components/logo";
import { logoutAction } from "@/lib/auth-actions";
import { useCart } from "@/lib/cart-context";
import type { SessionPayload } from "@/lib/session";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/components/language-switcher";
import NotificationBell from "@/components/notification-bell";

function CartIconLink({
  count,
  className = "",
  icon: Icon,
}: {
  count: number;
  className?: string;
  icon: ComponentType<{ className?: string }>;
}) {
  if (count === 0) return null;
  return (
    <Link
      href="/cart"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
      className={`relative inline-flex items-center justify-center rounded-md p-2 text-ink hover:text-brand-700 active:text-brand-700 ${className}`}
    >
      <Icon className="h-5 w-5" />
      <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-brand-700 px-1 text-[10px] font-semibold leading-none text-white">
        {count}
      </span>
    </Link>
  );
}

export default function SiteHeader({
  user,
  locale,
  dict,
  arabicEnabled = true,
}: {
  user: SessionPayload | null;
  locale: Locale;
  dict: Dictionary;
  arabicEnabled?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { count: cartCount } = useCart();
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!open) return;
    function handleOutside(e: MouseEvent | TouchEvent) {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);
    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [open]);

  const NAV_LINKS = [
    { href: "/about", label: dict.nav.about },
    { href: "/counseling", label: dict.nav.counseling },
    { href: "/workshops", label: dict.nav.workshops },
    { href: "/shop", label: dict.nav.shop },
    { href: "/resources", label: dict.nav.resources },
  ];

  return (
    <header
      ref={headerRef}
      className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 md:py-6">
        <LogoLink
          variant={locale === "ar" ? "icon-teal" : "horizontal-teal"}
          height={48}
          className="h-10 w-auto sm:h-11 md:h-12"
        />

        <nav className="hidden items-center gap-6 md:flex lg:gap-8">
          {NAV_LINKS.map((link) => {
            const active = pathname === link.href || pathname.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`link-grow pb-0.5 text-sm font-medium hover:text-brand-700 active:text-brand-700 ${
                  active ? "text-brand-700 [background-size:100%_1.5px]" : "text-ink/70"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-4 md:flex">
          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/journal"}
                className="text-sm font-medium text-ink/70 hover:text-brand-600 active:text-brand-600"
              >
                {user.name.split(" ")[0]}
              </Link>
              <Link href="/account" className="text-sm font-medium text-ink/50 hover:text-brand-600 active:text-brand-600">
                {dict.nav.settings}
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="text-sm font-medium text-ink/50 hover:text-brand-600 active:text-brand-600"
                >
                  {dict.nav.logOut}
                </button>
              </form>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-brand-600 active:text-brand-600">
                {dict.nav.logIn}
              </Link>
              <Link
                href="/counseling"
                className="rounded bg-brand-700 px-4 py-2 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 active:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 md:px-5 md:py-2.5"
              >
                {dict.nav.bookASession}
              </Link>
            </div>
          )}

          {user && <NotificationBell />}
          <CartIconLink count={cartCount} icon={CartIcon} />
          <LanguageSwitcher locale={locale} dict={dict.languageSwitcher} compact arabicEnabled={arabicEnabled} />
        </div>

        <div className="flex items-center gap-1 md:hidden">
          {user && <NotificationBell />}
          <CartIconLink count={cartCount} icon={ShoppingCart} />
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center justify-center rounded-md p-2 text-ink"
            aria-label={dict.nav.toggleMenu}
          >
            <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {open ? (
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              ) : (
                <path d="M4 7h16M4 12h16M4 17h16" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-brand-100 bg-white px-4 pb-4 md:hidden">
          <nav className="flex flex-col gap-1 pt-2">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50"
              >
                {link.label}
              </Link>
            ))}
            {user ? (
              <>
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50"
                >
                  {dict.nav.settings}
                </Link>
                <form action={logoutAction}>
                  <button
                    type="submit"
                    className="w-full rounded-md px-2 py-2 text-left text-sm font-medium text-ink/60 hover:bg-brand-50 active:bg-brand-50"
                  >
                    {dict.nav.logOut}
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50"
                >
                  {dict.nav.logIn}
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setOpen(false)}
                  className="rounded-md px-2 py-2 text-sm font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50"
                >
                  {dict.nav.signUp}
                </Link>
              </>
            )}
            <div className="mt-2 border-t border-brand-100 pt-3">
              <LanguageSwitcher locale={locale} dict={dict.languageSwitcher} arabicEnabled={arabicEnabled} />
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
