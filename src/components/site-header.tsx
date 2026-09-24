"use client";

import type { ComponentType } from "react";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ShoppingCart, UserCircle, HelpCircle, Info, Lock, Settings, LogOut, ChevronDown } from "lucide-react";
import { CartIcon } from "@/components/lio-icons";
import { LogoLink } from "@/components/logo";
import { logoutAction } from "@/lib/auth-actions";
import { useCart } from "@/lib/cart-context";
import type { SessionPayload } from "@/lib/session";
import type { Locale } from "@/lib/i18n/locale";
import type { Dictionary } from "@/lib/i18n/dictionary";
import LanguageSwitcher from "@/components/language-switcher";
import NotificationBell from "@/components/notification-bell";

function useClickOutside<T extends HTMLElement>(onOutside: () => void) {
  const ref = useRef<T>(null);
  useEffect(() => {
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onOutside();
    }
    document.addEventListener("mousedown", handle);
    return () => document.removeEventListener("mousedown", handle);
  }, [onOutside]);
  return ref;
}

/** Desktop's version of the same set of links the mobile bottom-nav's Menu
 * tab shows (see /menu) — a dropdown off the account name instead of a
 * full page, since desktop already has room for the marketing nav and
 * doesn't need its own dedicated page for this. */
function AccountMenu({ name, dict }: { name: string; dict: Dictionary["nav"] }) {
  const [open, setOpen] = useState(false);
  const ref = useClickOutside<HTMLDivElement>(() => setOpen(false));

  const links = [
    { href: "/profile", label: dict.myProfile, icon: UserCircle },
    { href: "/help-center", label: dict.helpCenter, icon: HelpCircle },
    { href: "/about", label: dict.about, icon: Info },
    { href: "/legal", label: dict.legal, icon: Lock },
  ];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-1 text-sm font-medium text-ink/70 hover:text-brand-600 active:text-brand-600"
      >
        {name}
        <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} strokeWidth={2} />
      </button>
      {open && (
        <div
          role="menu"
          className="absolute end-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border-2 border-brand-100 bg-white shadow-lg"
        >
          {links.map(({ href, label, icon: Icon }, i) => (
            <Link
              key={href}
              href={href}
              role="menuitem"
              onClick={() => setOpen(false)}
              className={`flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50 ${i > 0 ? "border-t border-brand-50" : ""}`}
            >
              <Icon className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={1.9} />
              {label}
            </Link>
          ))}
          <Link
            href="/account"
            role="menuitem"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 border-t border-brand-100 px-4 py-2.5 text-sm font-medium text-ink/80 hover:bg-brand-50 active:bg-brand-50"
          >
            <Settings className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={1.9} />
            {dict.settings}
          </Link>
          <form action={logoutAction}>
            <button
              type="submit"
              role="menuitem"
              className="flex w-full items-center gap-2.5 border-t border-brand-50 px-4 py-2.5 text-left text-sm font-medium text-ink/60 hover:bg-brand-50 active:bg-brand-50"
            >
              <LogOut className="h-4 w-4 shrink-0 text-brand-600" strokeWidth={1.9} />
              {dict.logOut}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

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
  const pathname = usePathname();
  const { count: cartCount } = useCart();

  const NAV_LINKS = [
    { href: "/about", label: dict.nav.about },
    { href: "/counseling", label: dict.nav.counseling },
    { href: "/workshops", label: dict.nav.workshops },
    { href: "/shop", label: dict.nav.shop },
    { href: "/resources", label: dict.nav.resources },
  ];

  return (
    <header className="sticky top-0 z-40 border-b border-brand-100 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6 sm:py-4 md:py-6">
        <LogoLink
          variant={locale === "ar" ? "icon-teal" : "horizontal-teal"}
          height={48}
          className="h-10 w-auto sm:h-11 md:h-12"
        />

        <nav className="hidden items-center gap-4 lg:flex xl:gap-8">
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

        <div className="hidden items-center gap-3 lg:flex xl:gap-4">
          {user ? (
            <AccountMenu name={user.name.split(" ")[0]} dict={dict.nav} />
          ) : (
            <div className="flex items-center gap-2.5 xl:gap-3">
              <Link href="/login" className="text-sm font-medium text-ink/70 hover:text-brand-600 active:text-brand-600">
                {dict.nav.logIn}
              </Link>
              <Link
                href="/counseling"
                className="rounded bg-brand-700 px-3.5 py-2 text-sm font-semibold tracking-tight text-white shadow-sm shadow-brand-900/20 transition-all duration-300 ease-out hover:bg-brand-600 active:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 xl:px-5 xl:py-2.5"
              >
                {dict.nav.bookASession}
              </Link>
            </div>
          )}

          {user && <NotificationBell />}
          <CartIconLink count={cartCount} icon={CartIcon} />
          <LanguageSwitcher locale={locale} dict={dict.languageSwitcher} compact arabicEnabled={arabicEnabled} />
        </div>

        <div className="flex items-center gap-1 lg:hidden">
          {user && <NotificationBell />}
          <CartIconLink count={cartCount} icon={ShoppingCart} />
        </div>
      </div>
    </header>
  );
}
