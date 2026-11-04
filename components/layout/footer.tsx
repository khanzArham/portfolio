import { newTab, SocialIcon, socialLinks } from "@/components/ui/social";
import { site } from "@/lib/site";

export function Footer() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-xs text-muted">
          © {new Date().getFullYear()} · Designed &amp; Built by {site.owner} ·{" "}
          <a
            href={site.social.source}
            {...newTab}
            className="underline underline-offset-4 hover:text-ink"
          >
            Source Code on GitHub
          </a>
        </p>
        <ul className="flex gap-6">
          {socialLinks.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                {...(link.external && newTab)}
                className="inline-flex items-center gap-2 text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                <SocialIcon label={link.label} />
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
