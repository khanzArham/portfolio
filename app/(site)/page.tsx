import Link from "next/link";
import { DossierCard } from "@/components/dossier/dossier-card";
import { JourneyMap } from "@/components/journey/journey-map";
import { JsonLd } from "@/components/seo/json-ld";
import { getDossiers, toSummary } from "@/lib/content/dossiers";
import { getEducation, getExperience } from "@/lib/content/profile";
import { buildJourney } from "@/lib/journey";
import { pageMetadata, personJsonLd } from "@/lib/seo";
import { projectsInProgress, site } from "@/lib/site";

export const metadata = pageMetadata({
  description: `${site.owner}: ${site.positioning} Case files of ML, AI and web projects, with evaluations and failure logs.`,
  path: "/",
});

const MAX_FEATURED = 3;

export default function HomePage() {
  const dossiers = getDossiers();
  const featured = dossiers.filter((d) => d.featured).slice(0, MAX_FEATURED);

  return (
    <div className="flex flex-col gap-16">
      <JsonLd data={personJsonLd} />
      <section aria-labelledby="hero-title" className="flex flex-col gap-6">
        <p className="font-mono text-sm text-muted">{site.role}</p>
        <h1
          id="hero-title"
          className="font-display text-5xl font-semibold tracking-tight sm:text-6xl"
        >
          {site.owner}
        </h1>
        <p className="max-w-prose text-xl leading-8">{site.positioning}</p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/projects"
            className="inline-flex h-11 items-center rounded-md bg-accent px-5 font-medium text-on-accent"
          >
            View work
          </Link>
          <Link
            href="/contact"
            className="inline-flex h-11 items-center rounded-md border border-ink/20 px-5 font-medium transition-colors duration-fast ease-standard hover:bg-surface"
          >
            Contact
          </Link>
        </div>
      </section>

      <JourneyMap
        stations={buildJourney({
          education: getEducation(),
          experience: getExperience(),
          dossiers: dossiers.map(toSummary),
          inProgress: projectsInProgress,
        })}
      />

      {featured.length > 0 && (
        <section
          aria-labelledby="featured-title"
          className="flex flex-col gap-6"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2
              id="featured-title"
              className="font-display text-2xl font-semibold"
            >
              Featured dossiers
            </h2>
            <Link
              href="/projects"
              className="group inline-flex items-center gap-1 text-sm font-medium underline underline-offset-4"
            >
              All {dossiers.length} case files
              <span
                aria-hidden="true"
                className="transition-transform duration-fast ease-standard group-hover:translate-x-0.5"
              >
                →
              </span>
            </Link>
          </div>
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((d) => (
              <li key={d.slug}>
                <DossierCard dossier={toSummary(d)} />
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
