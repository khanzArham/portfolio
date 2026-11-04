import type { ReactNode } from "react";

const TONES = {
  neutral: "border-line text-muted",
  // Stack badges: the tech accent on an inset surface (5.7:1 or more).
  tech: "border-line bg-surface text-tech",
} as const;

/** Small monospace label for tags, stack items and metadata. */
export function Tag({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: keyof typeof TONES;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-md border px-2.5 py-1 font-mono text-xs ${TONES[tone]}`}
    >
      {children}
    </span>
  );
}
