import { getSkills } from "@/lib/content/profile";
import { SKILL_CATEGORIES } from "@/lib/content/schemas";

// Grouped by category. Linking skills to dossiers comes in Step 21.
export default function SkillsPage() {
  const skills = getSkills();
  const groups = SKILL_CATEGORIES.map((category) => ({
    category,
    skills: skills.filter((s) => s.category === category),
  })).filter((group) => group.skills.length > 0);

  return (
    <div className="flex flex-col gap-10">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Skills
      </h1>
      {groups.map(({ category, skills }) => (
        <section
          key={category}
          aria-labelledby={`skills-${category}`}
          className="flex flex-col gap-4"
        >
          <h2
            id={`skills-${category}`}
            className="font-display text-xl font-semibold"
          >
            {category}
          </h2>
          <ul className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <li
                key={skill.name}
                className="rounded-md border border-ink/15 px-3 py-1.5"
              >
                {skill.name}
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
