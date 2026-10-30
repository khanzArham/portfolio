"use client";

import { useSyncExternalStore } from "react";

// Recharts writes colors into SVG attributes, where CSS variables are not
// reliable, so read the token values from the page and re-read them when
// next-themes switches the class on <html>.

const TOKENS = [
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-grid",
  "ink",
  "muted",
  "paper",
  "surface-raised",
] as const;
export type ChartColors = Record<(typeof TOKENS)[number], string>;

function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

// A string snapshot, so React sees no change unless a color really changed.
const readColors = () => {
  const style = getComputedStyle(document.documentElement);
  return TOKENS.map((t) => style.getPropertyValue(`--color-${t}`).trim()).join(
    "|",
  );
};

/** Current chart colors, or null during server render and hydration. */
export function useChartColors(): ChartColors | null {
  const snapshot = useSyncExternalStore(subscribeToTheme, readColors, () => "");
  if (!snapshot) return null;
  const values = snapshot.split("|");
  return Object.fromEntries(
    TOKENS.map((t, i) => [t, values[i]]),
  ) as ChartColors;
}

const REDUCED = "(prefers-reduced-motion: reduce)";

/** True when the visitor asks for reduced motion (plan §5.5). */
export function usePrefersReducedMotion() {
  return useSyncExternalStore(
    (onChange) => {
      const query = window.matchMedia(REDUCED);
      query.addEventListener("change", onChange);
      return () => query.removeEventListener("change", onChange);
    },
    () => window.matchMedia(REDUCED).matches,
    () => true, // server: assume no animation
  );
}
