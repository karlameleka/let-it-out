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
  "inline-flex items-center justify-center gap-2 rounded-full px-6 py-3 text-sm font-semibold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none active:translate-y-px";

const variants = {
  primary:
    "bg-brand-700 text-white shadow-[0_4px_0_0_theme(colors.brand.900)] hover:bg-brand-600 hover:shadow-[0_2px_0_0_theme(colors.brand.900)] hover:translate-y-[2px]",
  bright:
    "bg-brand-500 text-white shadow-[0_4px_0_0_theme(colors.brand.800)] hover:bg-brand-400 hover:shadow-[0_2px_0_0_theme(colors.brand.800)] hover:translate-y-[2px]",
  outline: "border-2 border-brand-700 text-brand-700 hover:bg-brand-50",
  "outline-inverse": "border-2 border-white text-white hover:bg-white/10",
  ghost: "text-brand-700 hover:bg-brand-50",
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
    <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-brand-500">
      <Logo variant="icon-teal" height={14} className="shrink-0 opacity-80" />
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
