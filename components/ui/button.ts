// One shape for every action button and button-like link: the same height,
// weight and corners; only the colours differ by variant. Padding defaults
// to px-5; a primary form action may use the wider px-6.
const base =
  "inline-flex h-11 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors duration-fast ease-standard disabled:opacity-60";

const variants = {
  primary: "bg-accent text-on-accent hover:bg-accent/90",
  secondary: "border border-line-strong text-ink hover:bg-surface",
} as const;

export const buttonClass = (
  variant: keyof typeof variants = "primary",
  padding: "px-5" | "px-6" = "px-5",
) => `${base} ${padding} ${variants[variant]}`;
