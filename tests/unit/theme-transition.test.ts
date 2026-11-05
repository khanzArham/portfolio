import { afterEach, describe, expect, it, vi } from "vitest";
import { switchTheme } from "@/lib/theme-transition";

const media = (matches: Record<string, boolean>) =>
  vi.stubGlobal(
    "matchMedia",
    (query: string) => ({ matches: matches[query] ?? false }) as MediaQueryList,
  );

describe("switchTheme", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.className = "";
    Reflect.deleteProperty(document, "startViewTransition");
  });

  it("switches instantly without the View Transitions API", () => {
    media({});
    const setTheme = vi.fn();
    switchTheme(setTheme, "dark");
    expect(setTheme).toHaveBeenCalledWith("dark");
  });

  it("switches instantly under reduced motion", () => {
    media({ "(prefers-reduced-motion: reduce)": true });
    const start = vi.fn();
    Object.assign(document, { startViewTransition: start });
    const setTheme = vi.fn();
    switchTheme(setTheme, "light");
    expect(start).not.toHaveBeenCalled();
    expect(setTheme).toHaveBeenCalledWith("light");
  });

  it("sets the resolved class inside the transition, before next-themes", () => {
    media({ "(prefers-color-scheme: dark)": true });
    document.documentElement.className = "light";
    Object.assign(document, {
      startViewTransition: (update: () => void) => update(),
    });
    const setTheme = vi.fn(() =>
      expect(document.documentElement.classList.contains("dark")).toBe(true),
    );
    switchTheme(setTheme, "system");
    expect(setTheme).toHaveBeenCalledWith("system");
    expect(document.documentElement.classList.contains("light")).toBe(false);
  });
});
