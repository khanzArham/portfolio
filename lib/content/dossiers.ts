import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { ContentError, formatIssues } from "@/lib/content/errors";
import {
  AI_TAGS,
  dossierFrontmatterSchema,
  evaluationSchema,
  type DossierFrontmatter,
  type Evaluation,
} from "@/lib/content/schemas";
import { parseSections, type Sections } from "@/lib/content/sections";

export const PROJECTS_DIR = path.join(process.cwd(), "content", "projects");

/** Plan §4.3: chart data stays under about 50 KB per dossier. */
export const MAX_EVAL_BYTES = 50 * 1024;

export type Dossier = DossierFrontmatter & {
  sections: Required<
    Pick<Sections, "brief" | "method" | "failureLog" | "outcome">
  > &
    Pick<Sections, "data">;
  evaluation?: Evaluation;
  isAiProject: boolean;
};

export type DossierInput = {
  /** File name, e.g. "careersyncai.mdx" or "_fixture.mdx". */
  fileName: string;
  source: string;
  /** Raw contents of the matching <name>.eval.json, if it exists. */
  evaluationJson?: string;
};

/** Parses and validates one dossier. Pure: no file system access. */
export function parseDossier(input: DossierInput): {
  dossier?: Dossier;
  errors: string[];
} {
  const file = `content/projects/${input.fileName}`;
  const evalFile = file.replace(/\.mdx$/, ".eval.json");
  const errors: string[] = [];

  let data: unknown;
  let body: string;
  try {
    ({ data, content: body } = matter(input.source));
  } catch (error) {
    return { errors: [`${file} › frontmatter: ${(error as Error).message}`] };
  }

  const frontmatter = dossierFrontmatterSchema.safeParse(data);
  if (!frontmatter.success)
    errors.push(...formatIssues(file, frontmatter.error));

  let evaluation: Evaluation | undefined;
  if (input.evaluationJson !== undefined) {
    const bytes = Buffer.byteLength(input.evaluationJson);
    if (bytes > MAX_EVAL_BYTES) {
      errors.push(
        `${evalFile}: ${Math.round(bytes / 1024)} KB is over the ${MAX_EVAL_BYTES / 1024} KB limit; summarize the data first`,
      );
    }
    try {
      const parsed = evaluationSchema.safeParse(
        JSON.parse(input.evaluationJson),
      );
      if (parsed.success) evaluation = parsed.data;
      else errors.push(...formatIssues(evalFile, parsed.error));
    } catch (error) {
      errors.push(`${evalFile}: invalid JSON (${(error as Error).message})`);
    }
  }

  const parsedBody = parseSections(body);
  errors.push(...parsedBody.errors.map((e) => `${file} › body: ${e}`));

  for (const [id, title] of [
    ["brief", "Brief"],
    ["method", "Method"],
    ["failureLog", "Failure Log"],
    ["outcome", "Outcome"],
  ] as const) {
    if (parsedBody.sections[id] === undefined) {
      errors.push(`${file} › body: missing required section "## ${title}"`);
    }
  }
  if (
    parsedBody.sections.failureLog !== undefined &&
    parsedBody.failureEntries === 0
  ) {
    errors.push(
      `${file} › body: "## Failure Log" needs at least one "### " entry (what did not work and why)`,
    );
  }

  if (!frontmatter.success) return { errors };
  const fm = frontmatter.data;

  const expectedSlug = input.fileName.replace(/^_/, "").replace(/\.mdx$/, "");
  if (fm.slug !== expectedSlug) {
    errors.push(
      `${file} › slug: "${fm.slug}" must match the file name "${expectedSlug}"`,
    );
  }

  const isAiProject = fm.tags.some((tag) => AI_TAGS.includes(tag));
  if (isAiProject && input.evaluationJson === undefined) {
    errors.push(
      `${file}: AI project (tags ${AI_TAGS.join("/")}) needs ${path.basename(evalFile)} with real evaluation data`,
    );
  }
  if (fm.tags.includes("ML") && parsedBody.sections.data === undefined) {
    errors.push(`${file} › body: ML project needs a "## Data" section`);
  }

  if (errors.length) return { errors };

  return {
    dossier: {
      ...fm,
      sections: parsedBody.sections as Dossier["sections"],
      evaluation,
      isAiProject,
    },
    errors,
  };
}

// Newest first: ongoing work, then by end month, start month, case number.
function compareDossiers(a: Dossier, b: Dossier) {
  const end = (d: Dossier) =>
    d.period.end === "present" ? "9999-12" : d.period.end;
  return (
    end(b).localeCompare(end(a)) ||
    b.period.start.localeCompare(a.period.start) ||
    b.caseNumber.localeCompare(a.caseNumber)
  );
}

export type CollectOptions = {
  /** Include "_"-prefixed fixture files (validation and tests only). */
  includeFixtures?: boolean;
};

// Each file access names content/projects literally: Turbopack's file
// tracing must see the folder, or it bundles the whole project into the
// server output.
const projectFile = (name: string) =>
  path.join(process.cwd(), "content", "projects", name);

/** Loads every dossier and returns all problems instead of throwing. */
export function collectDossiers({
  includeFixtures = false,
}: CollectOptions = {}): { dossiers: Dossier[]; errors: string[] } {
  if (!fs.existsSync(path.join(process.cwd(), "content", "projects"))) {
    return { dossiers: [], errors: [] };
  }

  const files = fs.readdirSync(path.join(process.cwd(), "content", "projects"));
  const isIncluded = (name: string) => includeFixtures || !name.startsWith("_");
  const mdxFiles = files.filter((f) => f.endsWith(".mdx") && isIncluded(f));

  const dossiers: Dossier[] = [];
  const errors: string[] = [];

  for (const evalFile of files.filter(
    (f) => f.endsWith(".eval.json") && isIncluded(f),
  )) {
    if (!files.includes(evalFile.replace(/\.eval\.json$/, ".mdx"))) {
      errors.push(`content/projects/${evalFile}: no matching .mdx dossier`);
    }
  }

  for (const fileName of mdxFiles) {
    const evalPath = projectFile(fileName.replace(/\.mdx$/, ".eval.json"));
    const result = parseDossier({
      fileName,
      source: fs.readFileSync(projectFile(fileName), "utf8"),
      evaluationJson: fs.existsSync(evalPath)
        ? fs.readFileSync(evalPath, "utf8")
        : undefined,
    });
    errors.push(...result.errors);
    if (result.dossier) dossiers.push(result.dossier);
  }

  for (const key of ["slug", "caseNumber"] as const) {
    const seen = new Map<string, string>();
    for (const d of dossiers) {
      const other = seen.get(d[key]);
      if (other)
        errors.push(
          `Duplicate ${key} "${d[key]}" in dossiers "${other}" and "${d.slug}"`,
        );
      seen.set(d[key], d.slug);
    }
  }

  return { dossiers: dossiers.sort(compareDossiers), errors };
}

/**
 * Fixtures render in development and in builds with CONTENT_FIXTURES=1
 * (CI and E2E). Vercel never sets it, so fixtures stay off the live site.
 */
export function fixturesEnabled() {
  return (
    process.env.CONTENT_FIXTURES === "1" ||
    process.env.NODE_ENV === "development"
  );
}

let cache: Dossier[] | undefined;

/** Site dossiers, newest first. Throws ContentError on invalid content. */
export function getDossiers(): Dossier[] {
  if (!cache) {
    const { dossiers, errors } = collectDossiers({
      includeFixtures: fixturesEnabled(),
    });
    if (errors.length) throw new ContentError(errors);
    cache = dossiers;
  }
  return cache;
}

export function getDossier(slug: string): Dossier | undefined {
  return getDossiers().find((d) => d.slug === slug);
}

/** The fields cards and the client-side filter need; no section text. */
export type DossierSummary = Pick<
  Dossier,
  "slug" | "caseNumber" | "title" | "summary" | "status" | "period" | "tags"
>;

export function toSummary(d: Dossier): DossierSummary {
  const { slug, caseNumber, title, summary, status, period, tags } = d;
  return { slug, caseNumber, title, summary, status, period, tags };
}
