"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Wraps a section so it rises + settles into place the first time it
 * scrolls into view, instead of just appearing. Marketing/content pages
 * only — skipped on transactional flows (checkout, account, admin,
 * journal editor) where motion would slow a task down rather than help it.
 *
 * Renders fully visible until JS has mounted and confirmed it can observe
 * the element — if JS fails to load, content is never hidden in the first
 * place, rather than depending on JS to reveal it.
 */
export function Reveal({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [armed, setArmed] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    setArmed(true);
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          io.unobserve(el);
        }
      },
      { threshold: 0.2, rootMargin: "0px 0px -80px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const state = armed ? (visible ? "reveal reveal-in" : "reveal") : "";
  return (
    <div ref={ref} className={`${state} ${className}`}>
      {children}
    </div>
  );
}
