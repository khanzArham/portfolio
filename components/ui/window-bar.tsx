/**
 * A terminal-style title bar: the three window controls and a file path.
 * Decorative only, so it is hidden from assistive technology.
 */
export function WindowBar({ path }: { path: string }) {
  return (
    <div
      aria-hidden="true"
      className="flex items-center gap-3 border-b border-line bg-surface px-4 py-2"
    >
      <span className="flex gap-1.5">
        <span className="size-2.5 rounded-full bg-window-close" />
        <span className="size-2.5 rounded-full bg-window-min" />
        <span className="size-2.5 rounded-full bg-window-max" />
      </span>
      <span className="truncate font-mono text-xs text-muted">{path}</span>
    </div>
  );
}
