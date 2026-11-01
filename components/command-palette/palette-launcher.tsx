"use client";

import {
  lazy,
  Suspense,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import type { PaletteDossier } from "@/components/command-palette/command-palette";
import { isPaletteShortcut } from "@/lib/palette";

// Performance (Step 22): only this button and the shortcut listener ship
// with every page. The dialog (cmdk + Radix) loads after the page is idle,
// or sooner when the pointer or focus reaches the button.
const loadDialog = () => import("@/components/command-palette/command-palette");
const PaletteDialog = lazy(loadDialog);

const noop = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

export function PaletteLauncher({ dossiers }: { dossiers: PaletteDossier[] }) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  // "Ctrl K" on the server and during hydration, the real key afterwards.
  const shortcut = useSyncExternalStore(
    noop,
    () => (isMac() ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );

  const show = (next: boolean) => {
    if (next) setMounted(true);
    setOpen(next);
  };

  // Once the page is idle, fetch the dialog and mount it closed (a closed
  // Radix dialog renders nothing). Opening is then synchronous, so text
  // typed straight after the shortcut lands in the search box.
  useEffect(() => {
    const prepare = () => void loadDialog().then(() => setMounted(true));
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(prepare);
      return () => cancelIdleCallback(id);
    }
    const id = setTimeout(prepare, 1500);
    return () => clearTimeout(id);
  }, []);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPaletteShortcut(event)) return;
      event.preventDefault();
      setMounted(true);
      setOpen((wasOpen) => !wasOpen);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-keyshortcuts="Control+K Meta+K"
        onClick={() => show(true)}
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        className="inline-flex h-10 items-center gap-2 rounded-md px-2.5 text-sm text-ink transition-colors duration-fast ease-standard hover:bg-surface md:border md:border-ink/15"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="size-5"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
        >
          <circle cx="11" cy="11" r="6.5" />
          <path d="M16 16l4.5 4.5" />
        </svg>
        <span className="sr-only md:not-sr-only">Search</span>
        <kbd
          aria-hidden="true"
          className="hidden font-mono text-xs text-muted md:inline"
        >
          {shortcut}
        </kbd>
      </button>
      {mounted && (
        <Suspense fallback={null}>
          <PaletteDialog
            dossiers={dossiers}
            open={open}
            onOpenChange={show}
            returnFocusTo={button}
          />
        </Suspense>
      )}
    </>
  );
}
