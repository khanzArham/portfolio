// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import {
  collectDossiers,
  getDossiers,
  MAX_EVAL_BYTES,
  parseDossier,
  PROJECTS_DIR,
} from "@/lib/content/dossiers";
import {
  checkSkillCoverage,
  collectProfile,
  skillEvidence,
} from "@/lib/content/profile";
import { parseSections } from "@/lib/content/sections";

const fixture = {
  fileName: "_fixture.mdx",
  source: fs.readFileSync(path.join(PROJECTS_DIR, "_fixture.mdx"), "utf8"),
  evaluationJson: fs.readFileSync(
    path.join(PROJECTS_DIR, "_fixture.eval.json"),
    "utf8",
  ),
};

const errorsFor = (patch: Partial<typeof fixture>) =>
  parseDossier({ ...fixture, ...patch }).errors;

const withoutSection = (source: string, heading: string) =>
  source.replace(new RegExp(`## ${heading}\\n[\\s\\S]*?(?=\\n## |$)`), "");

describe("parseDossier", () => {
  it("accepts the valid fixture", () => {
    const { dossier, errors } = parseDossier(fixture);
    expect(errors).toEqual([]);
    expect(dossier?.isAiProject).toBe(true);
    expect(dossier?.updated).toBe("2026-10-29");
    expect(dossier?.evaluation?.charts).toHaveLength(4);
    expect(Object.keys(dossier?.sections ?? {})).toEqual([
      "brief",
      "data",
      "method",
      "failureLog",
      "outcome",
    ]);
  });

  it("rejects an AI project without a failure log", () => {
    const errors = errorsFor({
      source: withoutSection(fixture.source, "Failure Log"),
    });
    expect(errors).toContainEqual(
      expect.stringContaining('missing required section "## Failure Log"'),
    );
  });

  it("rejects a failure log with no entries", () => {
    const errors = errorsFor({
      source: fixture.source.replace("### Fixture failure entry\n", ""),
    });
    expect(errors).toContainEqual(
      expect.stringContaining('needs at least one "### " entry'),
    );
  });

  it("rejects an unknown chart type", () => {
    const errors = errorsFor({
      evaluationJson: fixture.evaluationJson.replace(
        '"confusion-matrix"',
        '"pie-chart"',
      ),
    });
    expect(errors).toContainEqual(
      expect.stringMatching(/charts\.0\.type: Invalid discriminator value/),
    );
  });

  it("requires evaluation data for AI projects", () => {
    const errors = errorsFor({ evaluationJson: undefined });
    expect(errors).toContainEqual(
      expect.stringContaining("AI project (tags ML/AI/RAG) needs"),
    );
  });

  it("requires a Data section for ML projects only", () => {
    const noData = withoutSection(fixture.source, "Data");
    expect(errorsFor({ source: noData })).toContainEqual(
      expect.stringContaining('ML project needs a "## Data" section'),
    );
    const webOnly = noData.replace("tags: [ML, Web]", "tags: [Web]");
    expect(errorsFor({ source: webOnly, evaluationJson: undefined })).toEqual(
      [],
    );
  });

  it("requires the slug to match the file name", () => {
    expect(errorsFor({ fileName: "_other.mdx" })).toContainEqual(
      expect.stringContaining('must match the file name "other"'),
    );
  });

  it("rejects malformed chart data", () => {
    const errors = errorsFor({
      evaluationJson: fixture.evaluationJson.replace(
        '"values": [1, 0.6, 0.4]',
        '"values": [1, 0.6]',
      ),
    });
    expect(errors).toContainEqual(
      expect.stringContaining("one value per epoch"),
    );
  });

  it("rejects evaluation files over the size limit", () => {
    const json = JSON.parse(fixture.evaluationJson);
    json.summary = "x".repeat(MAX_EVAL_BYTES);
    expect(errorsFor({ evaluationJson: JSON.stringify(json) })).toContainEqual(
      expect.stringContaining("over the 50 KB limit"),
    );
  });
});

describe("parseSections", () => {
  it("ignores headings inside code fences", () => {
    const { sections, errors } = parseSections(
      "## Brief\n```md\n## Not a section\n```\n## Outcome\nDone.",
    );
    expect(errors).toEqual([]);
    expect(sections.brief).toContain("## Not a section");
    expect(sections.outcome).toBe("Done.");
  });

  it("reports unknown, repeated and leading content", () => {
    const { errors } = parseSections(
      "Intro\n## Brief\nA\n## Breif\nB\n## Brief\nC",
    );
    expect(errors).toEqual([
      expect.stringContaining("text before the first section"),
      expect.stringContaining('unknown section "## Breif"'),
      expect.stringContaining('section "## Brief" appears twice'),
    ]);
  });
});

describe("content folder", () => {
  it("keeps fixtures off the public site", () => {
    expect(getDossiers().map((d) => d.slug)).not.toContain("fixture");
    expect(
      collectDossiers({ includeFixtures: true }).dossiers.map((d) => d.slug),
    ).toContain("fixture");
  });

  it("has valid profile data", () => {
    expect(collectProfile().errors).toEqual([]);
  });
});

describe("skills as evidence", () => {
  const { dossier } = parseDossier(fixture);
  const dossiers = dossier ? [dossier] : [];

  it("links skills to dossiers by stack name, ignoring case", () => {
    const evidence = skillEvidence(
      [
        { name: "python", category: "Languages" },
        { name: "Rust", category: "Languages" },
      ],
      dossiers,
    );
    expect(evidence.get("python")).toEqual(["fixture"]);
    expect(evidence.get("Rust")).toEqual([]);
  });

  it("errors on stack items missing from skills, warns on unused skills", () => {
    const { errors, warnings } = checkSkillCoverage(
      [
        { name: "Python", category: "Languages" },
        { name: "Rust", category: "Languages" },
      ],
      dossiers,
    );
    expect(errors).toEqual([
      expect.stringContaining('"TypeScript" is not in content/skills.ts'),
    ]);
    expect(warnings).toEqual([expect.stringContaining('"Rust"')]);
  });
});
