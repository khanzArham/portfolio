// Light ("Warm paper") color tokens for places that cannot read CSS
// variables, such as next/og share images. Must match styles/tokens.css;
// tests/unit/tokens.test.ts fails if they drift apart.
export const lightTokens = {
  paper: "#f4efe4",
  surface: "#ece5d6",
  "surface-raised": "#fbf8f1",
  ink: "#1d1b18",
  muted: "#5c554a",
  accent: "#f2b705",
  "on-accent": "#1d1b18",
  success: "#2e6b3a",
  danger: "#a6322a",
} as const;
