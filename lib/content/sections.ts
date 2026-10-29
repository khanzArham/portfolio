// Splits a dossier's MDX body into its sections by "## " headings.

export const SECTIONS = {
  Brief: "brief",
  Data: "data",
  Method: "method",
  "Failure Log": "failureLog",
  Outcome: "outcome",
} as const;

export type SectionId = (typeof SECTIONS)[keyof typeof SECTIONS];
export type Sections = Partial<Record<SectionId, string>>;

export type ParsedBody = {
  sections: Sections;
  /** Number of "### " entries inside the Failure Log section. */
  failureEntries: number;
  errors: string[];
};

const HEADING = /^(#{2,3})\s+(.+?)\s*#*\s*$/;
const FENCE = /^\s*(```|~~~)/;

export function parseSections(body: string): ParsedBody {
  const sections: Sections = {};
  const errors: string[] = [];
  let current: SectionId | null = null;
  let buffer: string[] = [];
  let failureEntries = 0;
  let inFence = false;
  let seenHeading = false;
  let reportedLeadingText = false;

  const flush = () => {
    if (current) sections[current] = buffer.join("\n").trim();
    buffer = [];
  };

  body.split(/\r?\n/).forEach((line, index) => {
    if (FENCE.test(line)) inFence = !inFence;
    const match = inFence ? null : HEADING.exec(line);

    if (match?.[1] === "##") {
      flush();
      seenHeading = true;
      const title = match[2];
      const id = SECTIONS[title as keyof typeof SECTIONS];
      if (!id) {
        errors.push(
          `Line ${index + 1}: unknown section "## ${title}". Use one of: ${Object.keys(SECTIONS).join(", ")}`,
        );
        current = null;
      } else if (sections[id] !== undefined) {
        errors.push(`Line ${index + 1}: section "## ${title}" appears twice`);
        current = null;
      } else {
        current = id;
      }
      return;
    }

    if (match?.[1] === "###" && current === "failureLog") failureEntries++;

    // Text under an unknown or repeated heading is already reported there.
    if (current) {
      buffer.push(line);
    } else if (line.trim() && !seenHeading && !reportedLeadingText) {
      reportedLeadingText = true;
      errors.push(
        `Line ${index + 1}: text before the first section; start with "## Brief"`,
      );
    }
  });
  flush();

  for (const [title, id] of Object.entries(SECTIONS)) {
    if (sections[id] === "") errors.push(`Section "## ${title}" is empty`);
  }

  return { sections, failureEntries, errors };
}
