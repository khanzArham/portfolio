"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { DossierCard } from "@/components/dossier/dossier-card";
import type { DossierSummary } from "@/lib/content/dossiers";
import { TAGS, type Tag } from "@/lib/content/tags";

export function DossierGrid({ dossiers }: { dossiers: DossierSummary[] }) {
  return (
    <ul className="grid gap-4 sm:grid-cols-2">
      {dossiers.map((dossier) => (
        <li key={dossier.slug}>
          <DossierCard dossier={dossier} />
        </li>
      ))}
    </ul>
  );
}

const isTag = (value: string | null): value is Tag =>
  TAGS.includes(value as Tag);

/** Tag filter synced to ?tag= so a filtered list can be shared. */
export function ProjectFilter({ dossiers }: { dossiers: DossierSummary[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const param = useSearchParams().get("tag");
  const active = isTag(param) ? param : null;

  // Only offer tags that at least one dossier uses.
  const tags = TAGS.filter((tag) => dossiers.some((d) => d.tags.includes(tag)));
  const visible = active
    ? dossiers.filter((d) => d.tags.includes(active))
    : dossiers;

  const select = (tag: Tag | null) =>
    router.replace(tag ? `${pathname}?tag=${tag}` : pathname, {
      scroll: false,
    });

  const buttonClass = (pressed: boolean) =>
    `rounded-md px-3 py-1.5 font-mono text-sm transition-colors duration-fast ease-standard ${pressed ? "bg-ink text-paper" : "border border-ink/15 text-muted hover:text-ink"}`;

  return (
    <div className="flex flex-col gap-6">
      <div
        role="group"
        aria-label="Filter by tag"
        className="flex flex-wrap gap-2"
      >
        <button
          type="button"
          aria-pressed={active === null}
          onClick={() => select(null)}
          className={buttonClass(active === null)}
        >
          All
        </button>
        {tags.map((tag) => (
          <button
            key={tag}
            type="button"
            aria-pressed={active === tag}
            onClick={() => select(tag)}
            className={buttonClass(active === tag)}
          >
            {tag}
          </button>
        ))}
      </div>

      <p role="status" className="font-mono text-sm text-muted">
        {visible.length} {visible.length === 1 ? "dossier" : "dossiers"}
        {active ? ` tagged ${active}` : ""}
      </p>

      <DossierGrid dossiers={visible} />
    </div>
  );
}
