"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentProps } from "react";

// A section stays active on its child routes, e.g. Work on /projects/careersyncai.
export function isActivePath(pathname: string | null, href: string) {
  if (!pathname) return false;
  return pathname === href || pathname.startsWith(`${href}/`);
}

type NavLinkProps = Omit<ComponentProps<typeof Link>, "href"> & {
  href: string;
};

export function NavLink({ href, className, ...props }: NavLinkProps) {
  const active = isActivePath(usePathname(), href);

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      // Light accent is fill-only (1.59:1), so the underline is ink there.
      className={`${className ?? ""} ${active ? "text-ink underline decoration-ink decoration-2 underline-offset-8 dark:decoration-accent" : "text-muted hover:text-ink"}`}
      {...props}
    />
  );
}
