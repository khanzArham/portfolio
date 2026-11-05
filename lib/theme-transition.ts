/**
 * Switches the theme inside a View Transition, so the whole page cross-fades
 * from one theme to the other instead of snapping. next-themes applies its
 * class in an effect, after the transition would capture the new state, so
 * the class is set here first; next-themes then sets the same class again.
 * Without the API, or under reduced motion, the switch is instant.
 */
export function switchTheme(
  setTheme: (theme: string) => void,
  theme: "light" | "dark" | "system",
) {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!document.startViewTransition || reduce) {
    setTheme(theme);
    return;
  }
  const resolved =
    theme === "system"
      ? matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light"
      : theme;
  document.startViewTransition(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(resolved);
    root.style.colorScheme = resolved;
    setTheme(theme);
  });
}
