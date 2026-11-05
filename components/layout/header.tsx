import Image from "next/image";
import Link from "next/link";
import type { PaletteDossier } from "@/components/command-palette/command-palette";
import { PaletteLauncher } from "@/components/command-palette/palette-launcher";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { NavLink } from "@/components/layout/nav-link";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { hasResume, profilePhoto } from "@/lib/public-files";
import { contactItem, site, visibleNavItems } from "@/lib/site";

const initials = site.owner
  .split(" ")
  .slice(0, 2)
  .map((word) => word[0])
  .join("");

export function Header({ dossiers }: { dossiers: PaletteDossier[] }) {
  const photo = profilePhoto();
  const resume = hasResume();

  return (
    // Sticky, with a translucent blurred background so content scrolls
    // under it; z-30 keeps it below the menu and palette dialogs.
    <header className="sticky top-0 z-30 border-b border-line bg-paper/80 backdrop-blur-md">
      {/* Reading progress, driven by scroll in CSS (globals.css). */}
      <div
        aria-hidden="true"
        className="scroll-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-accent"
      />
      <div className="mx-auto flex h-16 w-full max-w-5xl items-center justify-between gap-4 px-4">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-lg font-semibold whitespace-nowrap"
        >
          {/* Decorative: the name next to it is the link text. */}
          {photo ? (
            <Image
              src={`/${photo}`}
              alt=""
              width={32}
              height={32}
              className="size-8 rounded-full border border-line object-cover"
            />
          ) : (
            <span
              aria-hidden="true"
              className="inline-flex size-8 items-center justify-center rounded-full border border-accent/40 bg-accent/10 font-mono text-xs font-medium text-accent"
            >
              {initials}
            </span>
          )}
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
          <PaletteLauncher dossiers={dossiers} />
          <ThemeToggle />
          {resume && (
            <a
              href="/resume.pdf"
              download
              className="hidden h-10 items-center gap-2 rounded-md border border-line-strong px-3 text-sm font-medium transition-colors duration-fast ease-standard hover:bg-surface md:inline-flex"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="size-4"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 4v11m0 0l-4-4m4 4l4-4M5 19h14" />
              </svg>
              {/* Icon only from md to lg, where the header is tight. */}
              <span className="sr-only lg:not-sr-only">Resume</span>
            </a>
          )}
          <Link
            href={contactItem.href}
            className="hidden h-10 items-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent md:inline-flex"
          >
            {contactItem.label}
          </Link>
          <MobileMenu hasResume={resume} />
        </div>
      </div>
    </header>
  );
}
