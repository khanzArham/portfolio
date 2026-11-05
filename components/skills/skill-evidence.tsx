"use client";

import Link from "next/link";
import { useRef, useState } from "react";
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

// Category names have spaces and "&", which break id references.
const slug = (text: string) =>
  text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

/**
 * Which column (0 left, 1 right) each box goes in. The first four alternate
 * (AI and Frontend left, Backend and Tools right); any further box joins
 * whichever column is shorter so far, estimated from its label lengths.
 */
function splitColumns(groups: SkillGroup[]): number[] {
  const height = [0, 0];
  return groups.map((group, index) => {
    const column = index < 4 ? index % 2 : height[0] <= height[1] ? 0 : 1;
    height[column] +=
      40 + group.skills.reduce((sum, s) => sum + s.name.length + 6, 0);
    return column;
  });
}

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
  const evidenceRef = useRef<HTMLElement>(null);

  // Below lg the evidence sits under the skill boxes, so bring it into view
  // when a skill is chosen; otherwise the click seems to do nothing.
  const choose = (name: string | null) => {
    setSelected(name);
    const evidence = evidenceRef.current;
    if (!name || !evidence) return;
    const { top } = evidence.getBoundingClientRect();
    if (top < 0 || top > window.innerHeight * 0.6) {
      const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
      evidence.scrollIntoView({
        behavior: reduce ? "auto" : "smooth",
        block: "start",
      });
    }
  };

  const skill = groups
    .flatMap((g) => g.skills)
    .find((s) => s.name === selected);
  const used = new Set(skill?.dossiers ?? []);
  const roles = skill?.roles ?? [];
  // A project still in progress only plans to use the skill.
  const titles = (planned: boolean) =>
    dossiers
      .filter(
        (d) => used.has(d.slug) && (d.status === "in-progress") === planned,
      )
      .map((d) => d.title);
  const usedTitles = titles(false);
  const plannedTitles = titles(true);
  // With a skill chosen: only the work that used it, then the work that
  // plans to. With none: the newest case file (dossiers come newest first).
  const shown = selected
    ? [
        ...dossiers.filter(
          (d) => used.has(d.slug) && d.status !== "in-progress",
        ),
        ...dossiers.filter(
          (d) => used.has(d.slug) && d.status === "in-progress",
        ),
      ]
    : dossiers.slice(0, 1);

  const sources = [...usedTitles, ...roles.map((r) => `the ${r} role`)];
  const parts = [
    sources.length && `was used in ${list(sources)}`,
    plannedTitles.length && `is planned for ${list(plannedTitles)}`,
  ].filter(Boolean);
  const summary = !selected
    ? "Choose a skill to see the work that used it. Latest case file:"
    : parts.length
      ? `${selected} ${parts.join(", and ")}.`
      : `No published work shows ${selected} yet.`;

  const columns = splitColumns(groups);

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_minmax(0,24rem)]">
      {/* Two columns (see splitColumns). Each column stacks its boxes with
          the same gap, so every box is as tall as its content and no space
          is left between. */}
      <div className="grid content-start items-start gap-4 sm:grid-cols-2">
        {[0, 1].map((column) => (
          <div key={column} className="flex flex-col gap-4">
            {groups
              .filter((_, index) => columns[index] === column)
              .map(({ category, skills }) => (
                <section
                  key={category}
                  aria-labelledby={`skills-${slug(category)}`}
                  className="reveal flex flex-col gap-4 rounded-lg border border-line bg-surface-raised p-5"
                >
                  <h2
                    id={`skills-${slug(category)}`}
                    className="font-display text-base font-semibold"
                  >
                    {category}
                  </h2>
                  <ul className="flex flex-wrap gap-2">
                    {skills.map((skill) => {
                      const pressed = selected === skill.name;
                      return (
                        <li key={skill.name} className="reveal-pop">
                          <button
                            type="button"
                            aria-pressed={pressed}
                            onClick={() => choose(pressed ? null : skill.name)}
                            className={`inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-left text-sm transition-colors duration-fast ease-standard ${pressed ? "border-accent bg-accent text-on-accent" : "border-line hover:border-accent hover:bg-surface"}`}
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
        ))}
      </div>

      <section
        ref={evidenceRef}
        aria-labelledby="skills-evidence"
        className="flex scroll-mt-24 flex-col gap-4 lg:sticky lg:top-24 lg:self-start"
      >
        <h2
          id="skills-evidence"
          className="reveal-left font-display text-xl font-semibold"
        >
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
                className="flex flex-col gap-1 rounded-lg border border-line bg-surface-raised p-4 outline-2 outline-offset-4 outline-ink"
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
          {shown.map((dossier) => {
            const highlighted = used.has(dossier.slug);
            return (
              <li
                key={dossier.slug}
                data-highlighted={highlighted || undefined}
                className={`flex flex-col gap-2 rounded-lg transition-[outline-color] duration-fast ease-standard ${highlighted ? "outline-2 outline-offset-4 outline-ink" : "outline-transparent"}`}
              >
                {highlighted && (
                  <span className="self-start rounded-sm bg-accent px-2 py-0.5 font-mono text-xs text-on-accent">
                    {dossier.status === "in-progress" ? "Planned:" : "Uses"}{" "}
                    {selected}
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
