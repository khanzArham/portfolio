"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { useState } from "react";
import { NavLink } from "@/components/layout/nav-link";
import { contactItem, visibleNavItems } from "@/lib/site";

// Radix Dialog provides the focus trap, Escape to close, and focus return.
export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-label="Open menu"
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
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-paper/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col gap-6 border-l border-ink/10 bg-surface-raised p-4">
          <div className="flex items-center justify-between">
            <Dialog.Title className="font-mono text-sm text-muted">
              Menu
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                type="button"
                aria-label="Close menu"
                className="inline-flex size-10 items-center justify-center rounded-md text-ink transition-colors duration-fast ease-standard hover:bg-surface"
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
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </Dialog.Close>
          </div>
          <Dialog.Description className="sr-only">
            Site navigation
          </Dialog.Description>

          <nav aria-label="Main">
            <ul className="flex flex-col gap-1">
              {visibleNavItems.map((item) => (
                <li key={item.href}>
                  <NavLink
                    href={item.href}
                    onClick={close}
                    className="block rounded-md px-2 py-3 text-lg"
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <Link
            href={contactItem.href}
            onClick={close}
            className="inline-flex h-11 items-center justify-center rounded-md bg-accent px-4 font-medium text-on-accent"
          >
            {contactItem.label}
          </Link>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
