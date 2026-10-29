import type { ReactNode } from "react";

/** Small monospace label for tags, stack items and metadata. */
export function Tag({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-sm border border-ink/15 px-2 py-0.5 font-mono text-xs text-muted">
      {children}
    </span>
  );
}
