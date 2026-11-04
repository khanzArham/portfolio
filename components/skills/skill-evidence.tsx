"use client";

import Link from "next/link";
import { useState } from "react";
import { DossierCard } from "@/components/dossier/dossier-card";
import type { DossierSummary } from "@/lib/content/dossiers";

export type SkillGroup = {
  category: string;
  /**
   * Each skill with the slugs of the dossiers that used it, and the roles
   * ("Role, Organization") that used it.
   */
  skills: { name: string; dossiers: string[]; roles: string[] }[];
};

const list = (titles: string[]) =>
  titles.length < 3
    ? titles.join(" and ")
    : `${titles.slice(0, -1).join(", ")} and ${titles.at(-1)}`;

/**
 * Skills as evidence (plan §3, §6.5): choosing a skill moves the dossiers
 * whose stack lists it to the top, highlighted, and names the roles that
 * used it. Choosing it again clears the selection.
 */
export function SkillEvidence({
  groups,
  dossiers,
}: {
  groups: SkillGroup[];
  dossiers: DossierSummary[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const skill = groups
    .flatMap((g) => g.skills)
    .find((s) => s.name === selected);
  const used = new Set(skill?.dossiers ?? []);
  const roles = skill?.roles ?? [];
  const usedTitles = dossiers
    .filter((d) => used.has(d.slug))
    .map((d) => d.title);
  // Matching dossiers first; the rest keep their order below.
  const ordered = [
    ...dossiers.filter((d) => used.has(d.slug)),
    ...dossiers.filter((d) => !used.has(d.slug)),
  ];

  const sources = [...usedTitles, ...roles.map((r) => `the ${r} role`)];
  const summary = !selected
    ? "Choose a skill to see the work that used it."
    : sources.length
      ? `${selected} was used in ${list(sources)}.`
      : `No published work shows ${selected} yet.`;

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,24rem)]">
      <div className="flex flex-col gap-10">
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
              {skills.map((skill) => {
                const pressed = selected === skill.name;
                return (
                  <li key={skill.name}>
                    <button
                      type="button"
                      aria-pressed={pressed}
                      onClick={() => setSelected(pressed ? null : skill.name)}
                      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 transition-colors duration-fast ease-standard ${pressed ? "bg-ink text-paper" : "border border-ink/15 hover:bg-surface"}`}
                    >
                      {skill.name}
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>

      <section
        aria-labelledby="skills-evidence"
        className="flex flex-col gap-4 lg:sticky lg:top-8 lg:self-start"
      >
        <h2 id="skills-evidence" className="font-display text-xl font-semibold">
          Evidence
        </h2>
        <p role="status" className="text-muted">
          {summary}
        </p>
        {dossiers.length === 0 && (
          <p className="text-sm text-muted">
            Case files are being prepared; skills link to them as they are
            published.
          </p>
        )}
        {roles.length > 0 && (
          <ul className="flex flex-col gap-2">
            {roles.map((role) => (
              <li
                key={role}
                className="flex flex-col gap-1 rounded-lg border border-ink/15 bg-surface-raised p-4 outline-2 outline-offset-4 outline-ink"
              >
                <span className="self-start rounded-sm bg-accent px-2 py-0.5 font-mono text-xs text-on-accent">
                  Role
                </span>
                <Link
                  href="/experience#field-title"
                  className="font-medium underline underline-offset-4"
                >
                  {role}
                </Link>
              </li>
            ))}
          </ul>
        )}
        <ul className="flex flex-col gap-4">
          {ordered.map((dossier) => {
            const highlighted = used.has(dossier.slug);
            return (
              <li
                key={dossier.slug}
                data-highlighted={highlighted || undefined}
                className={`flex flex-col gap-2 rounded-lg transition-[outline-color] duration-fast ease-standard ${highlighted ? "outline-2 outline-offset-4 outline-ink" : "outline-transparent"}`}
              >
                {highlighted && (
                  <span className="self-start rounded-sm bg-accent px-2 py-0.5 font-mono text-xs text-on-accent">
                    Uses {selected}
                  </span>
                )}
                <DossierCard dossier={dossier} />
              </li>
            );
          })}
        </ul>
      </section>
    </div>
  );
}
