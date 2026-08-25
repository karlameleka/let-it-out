import type { ReactNode } from "react";
import { Logo } from "@/components/logo";

export { Button, ButtonLink } from "@/components/haptic-button";

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
      <h2 className="mt-3 font-display text-3xl font-medium leading-[1.15] text-brand-900 sm:text-4xl">
        {title}
      </h2>
      {description && <p className="mt-4 text-base text-ink/70">{description}</p>}
    </div>
  );
}
