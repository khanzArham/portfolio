import { site } from "@/lib/site";

const links = [
  { label: "GitHub", href: site.social.github },
  { label: "LinkedIn", href: site.social.linkedin },
  { label: "Email", href: `mailto:${site.email}` },
];

export function Footer() {
  return (
    <footer className="border-t border-ink/10">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-8 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-mono text-sm text-muted">
          © {new Date().getFullYear()} {site.owner}
        </p>
        <ul className="flex gap-6">
          {links.map((link) => (
            <li key={link.label}>
              <a
                href={link.href}
                className="text-sm text-muted underline-offset-4 hover:text-ink hover:underline"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}
