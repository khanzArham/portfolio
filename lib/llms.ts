import type { DossierSummary } from "@/lib/content/dossiers";
import { STATUS_LABELS } from "@/lib/format";
import { site } from "@/lib/site";

// /llms.txt (plan §1.2, §6.1): a plain-text profile for AI agents and
// recruiter tools, in the llmstxt.org format. Public information only.

export type LlmsDossier = Pick<
  DossierSummary,
  "slug" | "caseNumber" | "title" | "summary" | "status"
> & { stack: string[] };

const SECTIONS = [
  [
    "Work",
    "/projects",
    "Project dossiers with method, evaluation and failure log",
  ],
  ["Experience", "/experience", "Work experience and education"],
  ["Skills", "/skills", "Technical skills by category"],
  ["About", "/about", "Background and values"],
  ["Contact", "/contact", "Contact form and email"],
] as const;

export function buildLlmsTxt({
  dossiers,
  hasResume,
}: {
  dossiers: LlmsDossier[];
  hasResume: boolean;
}): string {
  const url = (path: string) => `${site.url}${path}`;
  const lines = [
    `# ${site.owner}`,
    "",
    `> ${site.positioning}`,
    "",
    "Each project is a case-file dossier: brief, data, method, evaluation, failure log and outcome. Metrics come from real evaluation runs and link to the code that produced them.",
    "",
    "## Sections",
    "",
    ...SECTIONS.map(
      ([name, path, note]) => `- [${name}](${url(path)}): ${note}`,
    ),
    "",
    "## Dossiers",
    "",
    ...(dossiers.length
      ? dossiers.map(
          (d) =>
            `- [${d.title} (${d.caseNumber})](${url(`/projects/${d.slug}`)}): ${d.summary} Status: ${STATUS_LABELS[d.status]}. Stack: ${d.stack.join(", ")}.`,
        )
      : ["- No dossiers published yet."]),
    "",
    "## Contact",
    "",
    `- [Email](mailto:${site.email})`,
    `- [GitHub](${site.social.github})`,
    `- [LinkedIn](${site.social.linkedin})`,
    ...(hasResume ? [`- [Resume (PDF)](${url("/resume.pdf")})`] : []),
    "",
  ];
  return lines.join("\n");
}
