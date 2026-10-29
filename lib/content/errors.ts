import type { z } from "zod";

/** Thrown when content fails validation; lists every problem found. */
export class ContentError extends Error {
  constructor(readonly problems: string[]) {
    super(
      `Invalid content (${problems.length} problem${problems.length === 1 ? "" : "s"}):\n` +
        problems.map((p) => `  - ${p}`).join("\n"),
    );
    this.name = "ContentError";
  }
}

/** "content/projects/x.mdx › period.end: Use YYYY-MM" for each issue. */
export function formatIssues(source: string, error: z.ZodError): string[] {
  return error.issues.map((issue) => {
    const where = issue.path.length ? issue.path.join(".") : "(root)";
    return `${source} › ${where}: ${issue.message}`;
  });
}
