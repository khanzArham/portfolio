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
  type Experience,
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

/** Work experience as evidence: skill name -> "Role, Organization" labels. */
export function roleEvidence(
  skillList: Skill[],
  experience: Experience,
): Map<string, string[]> {
  return new Map(
    skillList.map((skill) => [
      skill.name,
      experience
        .filter((e) => e.skills?.some((s) => key(s) === key(skill.name)))
        .map((e) => `${e.role}, ${e.organization}`),
    ]),
  );
}

/**
 * Cross-checks dossier stacks and role skills against skills.ts.
 * A name with no matching skill is an error (keeps names consistent).
 * A skill with no evidence yet (no public dossier, no role) is only a
 * warning: profile content (Step 14) lands before most dossiers.
 */
export function checkSkillCoverage(
  skillList: Skill[],
  dossiers: Dossier[],
  experience: Experience = [],
) {
  const known = new Set(skillList.map((s) => key(s.name)));
  const errors = [
    ...dossiers.flatMap((d) =>
      d.stack
        .filter((item) => !known.has(key(item)))
        .map(
          (item) =>
            `content/projects/${d.slug}.mdx › stack: "${item}" is not in content/skills.ts`,
        ),
    ),
    ...experience.flatMap((e) =>
      (e.skills ?? [])
        .filter((item) => !known.has(key(item)))
        .map(
          (item) =>
            `content/experience.ts › ${e.organization} skills: "${item}" is not in content/skills.ts`,
        ),
    ),
  ];
  const roles = roleEvidence(skillList, experience);
  const warnings = [...skillEvidence(skillList, dossiers)]
    .filter(([name, slugs]) => !slugs.length && !roles.get(name)?.length)
    .map(
      ([name]) =>
        `content/skills.ts: "${name}" has no evidence yet (no public dossier or role uses it)`,
    );
  return { errors, warnings };
}
