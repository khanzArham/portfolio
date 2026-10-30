import type { Dossier } from "@/lib/content/dossiers";
import type { Education, Experience, Skill } from "@/lib/content/schemas";
import type { SearchDoc } from "@/lib/search/config";

// The searchable passages: one per dossier section, skill category, role,
// degree and page. Built only from content the site already shows.

/** Plain text from section MDX: drop syntax, keep words. */
export function stripMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`([^`]*)`/g, "$1")
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/[*_>~]/g, "")
    .replace(/^\s*[-+]\s+/gm, "")
    .replace(/\s+/g, " ")
    .trim();
}

const SECTION_TITLES = {
  brief: "Brief",
  data: "Data",
  method: "Method",
  failureLog: "Failure Log",
  outcome: "Outcome",
} as const;

export function buildCorpus({
  dossiers,
  skills,
  experience,
  education,
  bio,
}: {
  dossiers: Dossier[];
  skills: Skill[];
  experience: Experience;
  education: Education;
  bio: readonly string[];
}): SearchDoc[] {
  const docs: SearchDoc[] = [];

  for (const d of dossiers) {
    docs.push({
      id: `dossier-${d.slug}`,
      kind: "dossier",
      title: d.title,
      url: `/projects/${d.slug}`,
      text: `${d.summary} Stack: ${d.stack.join(", ")}. Tags: ${d.tags.join(", ")}.`,
    });
    for (const [key, label] of Object.entries(SECTION_TITLES)) {
      const source = d.sections[key as keyof typeof SECTION_TITLES];
      if (!source) continue;
      docs.push({
        id: `dossier-${d.slug}-${key}`,
        kind: "dossier",
        title: `${d.title}: ${label}`,
        url: `/projects/${d.slug}`,
        text: stripMarkdown(source),
      });
    }
  }

  const categories = [...new Set(skills.map((s) => s.category))];
  for (const category of categories) {
    docs.push({
      id: `skills-${category}`,
      kind: "skills",
      title: `Skills: ${category}`,
      url: "/skills",
      text: skills
        .filter((s) => s.category === category)
        .map((s) => s.name)
        .join(", "),
    });
  }

  experience.forEach((e, i) =>
    docs.push({
      id: `experience-${i}`,
      kind: "experience",
      title: `${e.role}, ${e.organization}`,
      url: "/experience#field-title",
      text: e.achievements.join(" "),
    }),
  );

  education.forEach((e, i) =>
    docs.push({
      id: `education-${i}`,
      kind: "education",
      title: `${e.degree}, ${e.institution}`,
      url: "/experience#origin-title",
      text: (e.details ?? []).join(" "),
    }),
  );

  docs.push({
    id: "page-about",
    kind: "page",
    title: "About",
    url: "/about",
    text: bio.join(" "),
  });

  return docs.filter((doc) => doc.text.trim().length > 0);
}
