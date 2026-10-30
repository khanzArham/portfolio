import type { DossierSummary } from "@/lib/content/dossiers";
import type { Education, Experience } from "@/lib/content/schemas";
import { formatPeriod, STATUS_LABELS } from "@/lib/format";
import { navItems } from "@/lib/site";

// The home page journey map (plan §5.3): stations on a path, in the plan's
// order. Built from content, so it never says more than the content does.

export type JourneyItem = { title: string; meta: string; href?: string };
export type Station = {
  id: "origin" | "build" | "field" | "lab";
  name: string;
  /** One line shown while the station is closed. */
  summary: string;
  items: JourneyItem[];
  /** Where the full section lives. */
  href: string;
  /** Link text for the full section, e.g. "Education details". */
  linkLabel: string;
};

const year = (month: string) =>
  month === "present" ? "present" : month.slice(0, 4);

function yearSpan(periods: { start: string; end: string }[]) {
  const starts = periods.map((p) => p.start).sort();
  const ends = periods.map((p) => p.end).sort();
  const last = ends.includes("present") ? "present" : ends[ends.length - 1];
  return `${year(starts[0])}–${year(last)}`;
}

const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? "" : "s"}`;

export function buildJourney({
  education,
  experience,
  dossiers,
  inProgress,
}: {
  education: Education;
  experience: Experience;
  dossiers: DossierSummary[];
  inProgress: readonly { name: string; status: string }[];
}): Station[] {
  // Projects still under way, unless a dossier with that name already exists.
  const unpublished = inProgress.filter(
    (p) => !dossiers.some((d) => d.title === p.name),
  );

  const stations: Station[] = [
    {
      id: "origin",
      name: "Origin",
      summary: education[0]
        ? `${education[0].degree} · ${yearSpan([education[0].period])}`
        : "Education",
      href: "/experience#origin-title",
      linkLabel: "Education details",
      items: education.map((e) => ({
        title: `${e.degree}, ${e.institution}`,
        meta: formatPeriod(e.period),
      })),
    },
    {
      id: "build",
      name: "Build",
      summary: dossiers.length
        ? plural(dossiers.length, "case file")
        : unpublished.length
          ? `${plural(unpublished.length, "project")} in progress`
          : "Projects",
      href: "/projects",
      linkLabel: "All work",
      items: [
        ...dossiers.map((d) => ({
          title: `${d.title} (${d.caseNumber})`,
          meta: STATUS_LABELS[d.status],
          href: `/projects/${d.slug}`,
        })),
        ...unpublished.map((p) => ({ title: p.name, meta: p.status })),
      ],
    },
    {
      id: "field",
      name: "Field",
      summary: experience.length
        ? `${plural(experience.length, "role")} · ${yearSpan(experience.map((e) => e.period))}`
        : "Experience",
      href: "/experience#field-title",
      linkLabel: "Experience details",
      items: experience.map((e) => ({
        title: `${e.role}, ${e.organization}`,
        meta: formatPeriod(e.period),
      })),
    },
  ];

  // Plan §10: the Lab station stays hidden until the Lab has demos.
  const lab = navItems.find((item) => item.href === "/lab");
  if (lab && !lab.hidden) {
    stations.push({
      id: "lab",
      name: "Lab",
      summary: "Experiments and demos",
      href: "/lab",
      linkLabel: "Visit the Lab",
      items: [],
    });
  }

  return stations;
}
