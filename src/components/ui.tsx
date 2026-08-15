import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";

export function Container({
  className = "",
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={`mx-auto max-w-6xl px-5 sm:px-8 ${className}`}>{children}</div>
  );
}

/* =====================================================================
   Motion & focus primitives
   Every interactive element in the app composes these three strings, so
   hover, press and keyboard feedback stay identical across pages.
   ===================================================================== */

/** The house transition curve. */
export const motionEase = "transition-all duration-300 ease-out";

/** Hover lift + press depth, for anything clickable. */
export const liftPress =
  "hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]";

/** Glowing, keyboard-only focus ring. */
export const focusRing =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white";

/** Focus ring for controls sitting on a dark brand surface. */
export const focusRingInverse =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-brand-800";

/* =====================================================================
   Surfaces
   ===================================================================== */

const surfaceTones = {
  /** Frosted white over a tinted section — the default card. */
  light: "border-brand-900/10 bg-white/75 backdrop-blur-md shadow-glass",
  /** Fully opaque, for cards over photography or busy backdrops. */
  solid: "border-brand-900/10 bg-white shadow-ambient",
  /** Tinted, for prompts and inline callouts. */
  tinted:
    "border-brand-900/10 bg-brand-50/70 backdrop-blur-md shadow-ambient-sm",
  /** Glass over the deep brand background. */
  dark: "border-white/20 bg-white/10 backdrop-blur-md shadow-ambient-lg text-white",
};

/**
 * A layered surface: hairline stroke, backdrop blur, and a diffuse ambient
 * shadow instead of a flat border-and-box. Pass `interactive` when the whole
 * surface is clickable so it picks up the shared lift/press feedback.
 */
export function Surface({
  tone = "light",
  interactive = false,
  className = "",
  children,
}: {
  tone?: keyof typeof surfaceTones;
  interactive?: boolean;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`rounded-3xl border ${surfaceTones[tone]} ${
        interactive ? `${motionEase} ${liftPress} hover:shadow-ambient-lg` : ""
      } ${className}`}
    >
      {children}
    </div>
  );
}

/** Class string for a surface that is itself a link/button element. */
export function surfaceClass(
  tone: keyof typeof surfaceTones = "light",
  interactive = true,
) {
  return `rounded-3xl border ${surfaceTones[tone]} ${
    interactive
      ? `${motionEase} ${liftPress} ${focusRing} hover:border-brand-300/70 hover:shadow-ambient-lg`
      : ""
  }`;
}

/* =====================================================================
   Ambient lighting
   ===================================================================== */

const glowPalettes = {
  brand: ["51 136 164", "30 91 115"],
  warm: ["90 167 187", "51 136 164"],
  light: ["255 255 255", "139 196 209"],
};

/**
 * Soft radial glow spots for the backdrop of a hero or a primary CTA card.
 * Purely decorative — sits behind content, never intercepts pointer events.
 */
export function AmbientGlow({
  palette = "brand",
  className = "",
  intensity = 0.18,
}: {
  palette?: keyof typeof glowPalettes;
  className?: string;
  /** Peak alpha of the largest spot. Keep well under 0.3 — this should
   *  read as light in the room, not as a coloured shape. */
  intensity?: number;
}) {
  const [a, b] = glowPalettes[palette];
  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}
      /* The spots are wider than their container, so `overflow-hidden`
         would otherwise cut a blurred edge into a visible straight line.
         Fading the container's own mask out at the bottom means the glow
         always dissolves, whatever height a caller gives it. */
      style={{
        maskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
        WebkitMaskImage: "linear-gradient(to bottom, #000 0%, #000 55%, transparent 100%)",
      }}
    >
      <div
        className="animate-glow-drift absolute -left-32 -top-40 h-[34rem] w-[34rem] rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, rgb(${a} / ${intensity}) 0%, rgb(${a} / 0) 70%)`,
        }}
      />
      <div
        className="animate-glow-drift absolute -bottom-48 -right-24 h-[30rem] w-[30rem] rounded-full blur-3xl [animation-delay:-9s]"
        style={{
          background: `radial-gradient(circle, rgb(${b} / ${intensity * 0.7}) 0%, rgb(${b} / 0) 70%)`,
        }}
      />
      <div
        className="absolute left-1/2 top-1/3 h-[22rem] w-[22rem] -translate-x-1/2 rounded-full blur-3xl"
        style={{
          background: `radial-gradient(circle, rgb(${a} / ${intensity * 0.4}) 0%, rgb(${a} / 0) 70%)`,
        }}
      />
    </div>
  );
}

/* =====================================================================
   Buttons
   ===================================================================== */

const buttonBase = `inline-flex items-center justify-center gap-2 rounded-full px-7 py-3.5 text-sm font-semibold tracking-tight ${motionEase} ${liftPress} ${focusRing} disabled:pointer-events-none disabled:opacity-50`;

const variants = {
  primary:
    "bg-linear-to-b from-brand-600 to-brand-700 text-white shadow-ambient hover:from-brand-500 hover:to-brand-600 hover:shadow-ambient-lg",
  bright:
    "bg-linear-to-b from-brand-400 to-brand-500 text-white shadow-ambient hover:from-brand-300 hover:to-brand-400 hover:shadow-ambient-lg",
  outline:
    "border border-brand-700/25 bg-white/60 text-brand-700 backdrop-blur-md shadow-ambient-sm hover:border-brand-500/50 hover:bg-white hover:shadow-ambient",
  "outline-inverse": `border border-white/30 bg-white/10 text-white backdrop-blur-md hover:border-white/50 hover:bg-white/20 ${focusRingInverse}`,
  ghost: "text-brand-700 hover:bg-brand-50",
};

const sizes = {
  sm: "px-5 py-2.5 text-xs",
  md: "",
  lg: "px-8 py-4 text-base",
};

export function Button({
  variant = "primary",
  size = "md",
  className = "",
  ...props
}: ComponentProps<"button"> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <button
      className={`${buttonBase} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

export function ButtonLink({
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...props
}: ComponentProps<typeof Link> & {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
}) {
  return (
    <Link
      href={href}
      className={`${buttonBase} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
}

/* =====================================================================
   Typography
   ===================================================================== */

export function Eyebrow({
  children,
  tone = "light",
}: {
  children: React.ReactNode;
  tone?: "light" | "dark";
}) {
  return (
    <p
      className={`flex items-center gap-2.5 text-xs font-bold uppercase tracking-[0.22em] ${
        tone === "dark" ? "text-brand-200" : "text-brand-500"
      }`}
    >
      <span
        className={`h-px w-7 ${tone === "dark" ? "bg-brand-200/60" : "bg-brand-400"}`}
      />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  description,
  align = "left",
  tone = "light",
}: {
  eyebrow?: string;
  title: ReactNode;
  description?: string;
  align?: "left" | "center";
  tone?: "light" | "dark";
}) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      {eyebrow && (
        <div className={align === "center" ? "flex justify-center" : ""}>
          <Eyebrow tone={tone}>{eyebrow}</Eyebrow>
        </div>
      )}
      <h2
        className={`mt-4 font-display text-3xl font-semibold leading-[1.12] tracking-tight sm:text-[2.5rem] ${
          tone === "dark" ? "text-white" : "text-brand-900"
        }`}
      >
        {title}
      </h2>
      {description && (
        <p
          className={`mt-5 text-base leading-relaxed sm:text-lg ${
            tone === "dark" ? "text-brand-50/80" : "text-ink-muted"
          }`}
        >
          {description}
        </p>
      )}
    </div>
  );
}

/** Small, muted label for metadata lines — dates, read times, categories. */
export function Meta({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`text-xs font-semibold uppercase tracking-[0.14em] text-ink-faint ${className}`}
    >
      {children}
    </p>
  );
}

/* =====================================================================
   Badges
   ===================================================================== */

const badgeTones = {
  brand: "border-brand-900/10 bg-brand-50/80 text-brand-700",
  outline: "border-brand-700/20 bg-white/60 text-brand-700",
  dark: "border-white/20 bg-white/10 text-white",
};

export function Badge({
  children,
  tone = "brand",
  className = "",
}: {
  children: ReactNode;
  tone?: keyof typeof badgeTones;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium backdrop-blur-sm ${badgeTones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

/* =====================================================================
   Form controls
   ===================================================================== */

/** Shared input styling — hairline stroke, generous padding, glowing focus. */
export const inputClass = `w-full rounded-2xl border border-brand-900/10 bg-white/70 px-4 py-3 text-sm text-ink shadow-ambient-sm backdrop-blur-md ${motionEase} placeholder:text-ink-faint hover:border-brand-300/70 focus:border-brand-400 focus-visible:outline-none focus-visible:border-brand-400 focus-visible:ring-2 focus-visible:ring-brand-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-white`;

export const labelClass =
  "mb-2 block text-sm font-medium tracking-tight text-ink-body";

export function Field({
  label,
  htmlFor,
  hint,
  className = "",
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={className}>
      <label className={labelClass} htmlFor={htmlFor}>
        {label}
      </label>
      {children}
      {hint && <p className="mt-1.5 text-xs text-ink-faint">{hint}</p>}
    </div>
  );
}

export function Input(props: ComponentProps<"input">) {
  const { className = "", ...rest } = props;
  return <input className={`${inputClass} ${className}`} {...rest} />;
}

export function Textarea(props: ComponentProps<"textarea">) {
  const { className = "", ...rest } = props;
  return (
    <textarea className={`${inputClass} leading-relaxed ${className}`} {...rest} />
  );
}

export function Select(props: ComponentProps<"select">) {
  const { className = "", ...rest } = props;
  return <select className={`${inputClass} ${className}`} {...rest} />;
}

/** Inline validation / server-action error. */
export function FormError({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="animate-rise-in rounded-2xl border border-red-600/15 bg-red-50/70 px-4 py-3 text-sm text-red-700 backdrop-blur-sm"
    >
      {children}
    </p>
  );
}

/* =====================================================================
   Empty states
   ===================================================================== */

/**
 * A designed empty state: illustration, a warm line of onboarding copy, and
 * one obvious next action — used anywhere a list can legitimately be empty.
 */
export function EmptyState({
  illustration,
  title,
  description,
  action,
  className = "",
}: {
  illustration?: ReactNode;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <Surface
      tone="light"
      className={`relative overflow-hidden px-6 py-12 text-center sm:px-10 sm:py-14 ${className}`}
    >
      <AmbientGlow palette="light" intensity={0.22} />
      <div className="relative flex flex-col items-center">
        {illustration && (
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full border border-brand-900/10 bg-brand-50/80 text-brand-500 shadow-ambient-sm">
            {illustration}
          </div>
        )}
        <p className="font-display text-xl font-semibold tracking-tight text-brand-900">
          {title}
        </p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-relaxed text-ink-muted">
          {description}
        </p>
        {action && <div className="mt-7 flex flex-wrap justify-center gap-3">{action}</div>}
      </div>
    </Surface>
  );
}
