"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import { hapticTap } from "@/lib/haptics";

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-300 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2";

const variants = {
  primary:
    "bg-brand-700 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-600 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.16)] active:bg-brand-600 active:shadow-[0_0_0_6px_rgba(30,91,115,0.16)]",
  bright:
    "bg-brand-500 text-white shadow-sm shadow-brand-800/20 hover:bg-brand-400 hover:shadow-[0_0_0_6px_rgba(51,136,164,0.18)] active:bg-brand-400 active:shadow-[0_0_0_6px_rgba(51,136,164,0.18)]",
  outline:
    "border-[1.5px] border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50 hover:shadow-[0_0_0_6px_rgba(30,91,115,0.08)] active:border-brand-400 active:bg-brand-50 active:shadow-[0_0_0_6px_rgba(30,91,115,0.08)]",
  "outline-inverse":
    "border-[1.5px] border-white/70 text-white hover:border-white hover:bg-white/10 hover:shadow-[0_0_0_6px_rgba(255,255,255,0.14)] active:border-white active:bg-white/10 active:shadow-[0_0_0_6px_rgba(255,255,255,0.14)] focus-visible:ring-white/60 focus-visible:ring-offset-0",
  ghost: "text-brand-700 hover:bg-brand-50 active:bg-brand-50",
  /** Quiet secondary action — an underlined text link, not a boxed button.
      Pairs with `primary` in hero/marketing CTA rows per the editorial direction. */
  text: "!rounded-none !px-0 !py-0 font-semibold text-ink link-grow",
};

/** Shared button primitive — a Client Component (unlike the rest of
 * ui.tsx) purely so it can fire a haptic tap on every click, sitewide,
 * without every call site needing to remember to do it. */
export function Button({
  variant = "primary",
  className = "",
  onClick,
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button
      className={`${buttonBase} ${variants[variant]} ${className}`}
      onClick={(e) => {
        hapticTap();
        onClick?.(e);
      }}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  onClick,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${variants[variant]} ${className}`}
      onClick={(e) => {
        hapticTap();
        onClick?.(e);
      }}
      {...props}
    />
  );
}
