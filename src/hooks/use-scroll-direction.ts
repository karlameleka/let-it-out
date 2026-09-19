"use client";

import { useEffect, useRef, useState } from "react";

/** "up" once the page has scrolled past `threshold` and the user is
 * scrolling upward, "down" once scrolled past it and scrolling downward,
 * null while still within `threshold` of the top (where hiding a nav bar
 * would be pointless — there's nothing to gain the space for). Small
 * jitter (a few px of wheel/trackpad noise) is absorbed by `threshold`
 * rather than flipping direction on every scroll event. */
export function useScrollDirection(threshold = 8) {
  const [direction, setDirection] = useState<"up" | "down" | null>(null);
  const lastY = useRef(0);
  const ticking = useRef(false);

  useEffect(() => {
    lastY.current = window.scrollY;

    function update() {
      const y = window.scrollY;
      const delta = y - lastY.current;
      if (y < threshold) {
        setDirection(null);
      } else if (Math.abs(delta) > threshold) {
        setDirection(delta > 0 ? "down" : "up");
        lastY.current = y;
      }
      ticking.current = false;
    }

    function onScroll() {
      if (!ticking.current) {
        ticking.current = true;
        requestAnimationFrame(update);
      }
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [threshold]);

  return direction;
}
