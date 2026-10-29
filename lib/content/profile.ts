import type { z } from "zod";
import { education } from "@/content/education";
import { experience } from "@/content/experience";
import { skills } from "@/content/skills";
import type { Dossier } from "@/lib/content/dossiers";
import { ContentError, formatIssues } from "@/lib/content/errors";
import {
  educationSchema,
  experienceSchema,
  skillsSchema,
  type Skill,
} from "@/lib/content/schemas";

/** Validates content/experience.ts, education.ts and skills.ts. */
export function collectProfile() {
  const errors: string[] = [];
  const parse = <S extends z.ZodType>(
    file: string,
    schema: S,
    value: unknown,
  ): z.infer<S> | undefined => {
    const result = schema.safeParse(value);
    if (result.success) return result.data;
    errors.push(...formatIssues(file, result.error));
  };

  return {
    experience: parse("content/experience.ts", experienceSchema, experience),
    education: parse("content/education.ts", educationSchema, education),
    skills: parse("content/skills.ts", skillsSchema, skills),
    errors,
  };
}

function getProfile() {
  const { errors, experience, education, skills } = collectProfile();
  if (errors.length || !experience || !education || !skills) {
    throw new ContentError(errors);
  }
  return { experience, education, skills };
}

export const getExperience = () => getProfile().experience;
export const getEducation = () => getProfile().education;
export const getSkills = () => getProfile().skills;

const key = (name: string) => name.trim().toLowerCase();

/** Skills as evidence (plan §3): skill name -> slugs of dossiers using it. */
export function skillEvidence(
  skillList: Skill[],
  dossiers: Dossier[],
): Map<string, string[]> {
  return new Map(
    skillList.map((skill) => [
      skill.name,
      dossiers
        .filter((d) => d.stack.some((item) => key(item) === key(skill.name)))
        .map((d) => d.slug),
    ]),
  );
}

/**
 * Cross-checks dossier stacks against skills.ts.
 * A stack item with no matching skill is an error (keeps names consistent).
 * A skill no dossier uses yet is only a warning: profile content (Step 14)
 * lands before most dossiers (Steps 15 and 19).
 */
export function checkSkillCoverage(skillList: Skill[], dossiers: Dossier[]) {
  const known = new Set(skillList.map((s) => key(s.name)));
  const errors = dossiers.flatMap((d) =>
    d.stack
      .filter((item) => !known.has(key(item)))
      .map(
        (item) =>
          `content/projects/${d.slug}.mdx › stack: "${item}" is not in content/skills.ts`,
      ),
  );
  const warnings = [...skillEvidence(skillList, dossiers)]
    .filter(([, slugs]) => slugs.length === 0)
    .map(
      ([name]) =>
        `content/skills.ts: "${name}" is not used by any public dossier yet`,
    );
  return { errors, warnings };
}
