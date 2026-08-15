import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { Logo } from "@/components/logo";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto max-w-6xl px-4 sm:px-6 ${className}`}>{children}</div>
  );
}

const buttonBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold tracking-tight transition-all duration-200 ease-out disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2";

const variants = {
  primary:
    "bg-brand-700 text-white shadow-sm shadow-brand-900/20 hover:bg-brand-600 hover:shadow-md hover:shadow-brand-900/25 hover:-translate-y-0.5",
  bright:
    "bg-brand-500 text-white shadow-sm shadow-brand-800/20 hover:bg-brand-400 hover:shadow-md hover:shadow-brand-800/25 hover:-translate-y-0.5",
  outline:
    "border-[1.5px] border-brand-200 text-brand-700 hover:border-brand-400 hover:bg-brand-50 hover:-translate-y-0.5",
  "outline-inverse":
    "border-[1.5px] border-white/70 text-white hover:border-white hover:bg-white/10 hover:-translate-y-0.5 focus-visible:ring-white/60 focus-visible:ring-offset-0",
  ghost: "text-brand-700 hover:bg-brand-50",
  /** Quiet secondary action — an underlined text link, not a boxed button.
      Pairs with `primary` in hero/marketing CTA rows per the editorial direction. */
  text: "!rounded-none !px-0 !py-0 font-semibold text-ink link-grow",
};

export function Button({
  variant = "primary",
  className = "",
  ...props
}: ComponentProps<"button"> & { variant?: keyof typeof variants }) {
  return (
    <button className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />
  );
}

export function ButtonLink({
  variant = "primary",
  className = "",
  href,
  ...props
}: ComponentProps<typeof Link> & { variant?: keyof typeof variants }) {
  return (
    <Link href={href} className={`${buttonBase} ${variants[variant]} ${className}`} {...props} />
  );
}

export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <p className="inline-flex items-center gap-2 border-b border-brand-200 pb-2 text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">
      <Logo variant="icon-teal" height={13} className="shrink-0 opacity-70" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="mt-3 font-display text-3xl font-semibold leading-[1.15] text-brand-900 sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base text-ink/70">{description}</p>}
    </div>
  );
}
