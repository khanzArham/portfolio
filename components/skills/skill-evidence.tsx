"use client";

import { useState } from "react";
import { DossierCard } from "@/components/dossier/dossier-card";
import type { DossierSummary } from "@/lib/content/dossiers";

export type SkillGroup = {
  category: string;
  /** Each skill with the slugs of the dossiers that used it. */
  skills: { name: string; dossiers: string[] }[];
};

const list = (titles: string[]) =>
  titles.length < 3
    ? titles.join(" and ")
    : `${titles.slice(0, -1).join(", ")} and ${titles.at(-1)}`;

/**
 * Skills as evidence (plan §3, §6.5): choosing a skill highlights the
 * dossiers whose stack lists it. Choosing it again clears the highlight.
 */
export function SkillEvidence({
  groups,
  dossiers,
}: {
  groups: SkillGroup[];
  dossiers: DossierSummary[];
}) {
  const [selected, setSelected] = useState<string | null>(null);

  const used = new Set(
    groups.flatMap((g) => g.skills).find((s) => s.name === selected)
      ?.dossiers ?? [],
  );
  const usedTitles = dossiers
    .filter((d) => used.has(d.slug))
    .map((d) => d.title);

  const summary = !selected
    ? "Choose a skill to see the dossiers that used it."
    : usedTitles.length
      ? `${selected} was used in ${list(usedTitles)}.`
      : `No published dossier uses ${selected} yet.`;

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
                      {/* aria-label is not allowed on a plain span, so the
                          count is spoken through visually hidden text. */}
                      <span
                        aria-hidden="true"
                        className={`font-mono text-xs ${pressed ? "text-paper" : "text-muted"}`}
                      >
                        {skill.dossiers.length}
                      </span>
                      <span className="sr-only">
                        , used in {skill.dossiers.length}{" "}
                        {skill.dossiers.length === 1 ? "dossier" : "dossiers"}
                      </span>
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
        <ul className="flex flex-col gap-4">
          {dossiers.map((dossier) => {
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
