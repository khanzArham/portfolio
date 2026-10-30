"use client";

import { useSyncExternalStore } from "react";

/**
 * Live media query match. `serverValue` is used during server render and
 * hydration, so pick the layout the server HTML was written for.
 */
export function useMediaQuery(query: string, serverValue: boolean) {
  return useSyncExternalStore(
    (onChange) => {
      const list = window.matchMedia(query);
      list.addEventListener("change", onChange);
      return () => list.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => serverValue,
  );
}
