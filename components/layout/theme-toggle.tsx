"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";

const THEMES = ["system", "light", "dark"] as const;
type ThemeChoice = (typeof THEMES)[number];

const LABELS: Record<ThemeChoice, string> = {
  system: "System",
  light: "Light",
  dark: "Dark",
};

const noop = () => () => {};

// False during server render and hydration, true afterwards. The stored theme
// is only known on the client, so rendering it earlier would mismatch.
function useHydrated() {
  return useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
}

function isThemeChoice(value: string | undefined): value is ThemeChoice {
  return THEMES.includes(value as ThemeChoice);
}

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const hydrated = useHydrated();

  const current: ThemeChoice =
    hydrated && isThemeChoice(theme) ? theme : "system";
  const next = THEMES[(THEMES.indexOf(current) + 1) % THEMES.length];

  return (
    <button
      type="button"
      onClick={() => setTheme(next)}
      aria-label={`Theme: ${LABELS[current]}. Switch to ${LABELS[next]}.`}
      title={`Theme: ${LABELS[current]}`}
      className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors duration-fast ease-standard hover:bg-surface"
    >
      <ThemeIcon theme={current} />
    </button>
  );
}

function ThemeIcon({ theme }: { theme: ThemeChoice }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {theme === "system" && (
        <>
          <rect x="3" y="4" width="18" height="12" rx="1.5" />
          <path d="M8 20h8M12 16v4" />
        </>
      )}
      {theme === "light" && (
        <>
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
        </>
      )}
      {theme === "dark" && (
        <path d="M20 14.5A8 8 0 1 1 9.5 4a6.5 6.5 0 0 0 10.5 10.5Z" />
      )}
    </svg>
  );
}
