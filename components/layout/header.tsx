import Link from "next/link";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { contactItem, site, visibleNavItems } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b border-ink/10">
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link href="/" className="font-display text-lg font-semibold">
          {site.owner}
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <ul className="flex items-center gap-6">
            {visibleNavItems.map((item) => (
              <li key={item.href}>
                <NavLink href={item.href} className="text-sm font-medium">
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href={contactItem.href}
            className="hidden h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent md:inline-flex"
          >
            {contactItem.label}
          </Link>
          <MobileMenu />
        </div>
      </div>
    </header>
  );
}
