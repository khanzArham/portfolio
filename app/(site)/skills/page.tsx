import { SkillEvidence } from "@/components/skills/skill-evidence";
import { getDossiers, toSummary } from "@/lib/content/dossiers";
import { getSkills, skillEvidence } from "@/lib/content/profile";
import { SKILL_CATEGORIES } from "@/lib/content/schemas";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Skills",
  description: `Technical skills of ${site.owner}, each linked to the projects that used it.`,
  path: "/skills",
});

// Grouped by category; each skill carries the dossiers whose stack lists it.
export default function SkillsPage() {
  const skills = getSkills();
  const dossiers = getDossiers();
  const evidence = skillEvidence(skills, dossiers);
  const groups = SKILL_CATEGORIES.map((category) => ({
    category,
    skills: skills
      .filter((s) => s.category === category)
      .map((s) => ({ name: s.name, dossiers: evidence.get(s.name) ?? [] })),
  })).filter((group) => group.skills.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Skills
      </h1>
      <SkillEvidence groups={groups} dossiers={dossiers.map(toSummary)} />
    </div>
  );
}
