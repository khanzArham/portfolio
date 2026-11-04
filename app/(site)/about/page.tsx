import fs from "node:fs";
import path from "node:path";
import Link from "next/link";
import { JsonLd } from "@/components/seo/json-ld";
import { newTab, SocialIcon, socialLinks } from "@/components/ui/social";
import { WindowBar } from "@/components/ui/window-bar";
import { getDossiers } from "@/lib/content/dossiers";
import { getEducation, getExperience } from "@/lib/content/profile";
import { formatPeriod, STATUS_LABELS } from "@/lib/format";
import { pageMetadata, personJsonLd } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "About",
  description: `About ${site.owner}: background, values and how to get in touch.`,
  path: "/about",
});

// The resume button appears once public/resume.pdf exists (read at build).
const hasResume = fs.existsSync(
  path.join(process.cwd(), "public", "resume.pdf"),
);

/**
 * The bio, with a profile card beside it on wide screens: facts the site
 * already holds (education, latest role, current project) and the ways to
 * reach the owner, so the page doubles as a one-glance summary.
 */
export default function AboutPage() {
  const education = getEducation()[0];
  const role = getExperience()[0];
  // The newest dossier, when it is still in progress.
  const current = getDossiers().find((d) => d.status === "in-progress");

  const facts = [
    {
      label: "Education",
      value: `${education.degree}, ${education.institution}`,
      meta: formatPeriod(education.period),
    },
    {
      label: "Latest role",
      value: `${role.role}, ${role.organization}`,
      meta: formatPeriod(role.period),
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      <JsonLd data={personJsonLd} />
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        About
      </h1>

      <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="flex flex-col gap-8">
          {/* The bio fills its column, beside the profile card. */}
          <div className="flex flex-col gap-4 text-lg leading-8">
            {site.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
          <p>
            <Link href="/contact" className="underline underline-offset-4">
              Get in touch
            </Link>
          </p>
        </div>

        <aside
          aria-label="Profile"
          className="overflow-hidden rounded-lg border border-line bg-surface-raised lg:sticky lg:top-8"
        >
          <WindowBar path="~/about/profile" />

          <div className="flex flex-col gap-5 p-5">
            <div className="flex flex-col gap-2">
              <p className="font-mono text-sm text-accent">{site.role}</p>
              <p className="inline-flex items-center gap-2 self-start rounded-full border border-line px-3 py-1 font-mono text-xs text-muted">
                <span
                  aria-hidden="true"
                  className="size-2 rounded-full bg-success"
                />
                {site.availability}
              </p>
            </div>

            <dl className="flex flex-col gap-4 text-sm">
              {facts.map((fact) => (
                <div key={fact.label} className="flex flex-col gap-0.5">
                  <dt className="font-mono text-xs text-muted">{fact.label}</dt>
                  <dd>{fact.value}</dd>
                  <dd className="font-mono text-xs text-muted">{fact.meta}</dd>
                </div>
              ))}
              {current && (
                <div className="flex flex-col gap-0.5">
                  <dt className="font-mono text-xs text-muted">
                    Current project
                  </dt>
                  <dd>
                    <Link
                      href={`/projects/${current.slug}`}
                      className="underline underline-offset-4"
                    >
                      {current.title}
                    </Link>
                  </dd>
                  <dd className="font-mono text-xs text-muted">
                    {STATUS_LABELS[current.status]}
                  </dd>
                </div>
              )}
            </dl>

            <ul className="flex flex-wrap gap-2 border-t border-line pt-4">
              {socialLinks.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    {...(link.external && newTab)}
                    className="inline-flex h-9 items-center gap-2 rounded-md border border-line px-3 text-sm transition-colors duration-fast ease-standard hover:border-accent hover:bg-surface"
                  >
                    <SocialIcon label={link.label} />
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="-mt-2 font-mono text-xs text-muted">{site.email}</p>

            {hasResume && (
              <a
                href="/resume.pdf"
                download
                className="inline-flex h-10 items-center justify-center rounded-md bg-accent px-4 text-sm font-medium text-on-accent"
              >
                Download Resume
              </a>
            )}
          </div>
        </aside>
      </div>
    </div>
  );
}
