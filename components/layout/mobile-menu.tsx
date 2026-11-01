"use client";

import { lazy, Suspense, useRef, useState } from "react";

// Performance (Step 22): only the menu button ships with every page; the
// drawer (Radix Dialog) loads on first tap, warmed on pointer or focus.
const loadDialog = () => import("@/components/layout/mobile-menu-dialog");
const MobileMenuDialog = lazy(loadDialog);

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  const show = (next: boolean) => {
    if (next) setMounted(true);
    setOpen(next);
  };

  return (
    <>
      <button
        ref={button}
        type="button"
        aria-label="Open menu"
        aria-haspopup="dialog"
        aria-expanded={open}
        onClick={() => show(true)}
        onPointerEnter={() => void loadDialog()}
        onFocus={() => void loadDialog()}
        className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors duration-fast ease-standard hover:bg-surface md:hidden"
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
          <path d="M4 7h16M4 12h16M4 17h16" />
        </svg>
      </button>
      {mounted && (
        <Suspense fallback={null}>
          <MobileMenuDialog
            open={open}
            onOpenChange={show}
            returnFocusTo={button}
          />
        </Suspense>
      )}
    </>
  );
}
