import Link from "next/link";
import { CaseStamp } from "@/components/dossier/case-stamp";
import { Tag } from "@/components/ui/tag";
import { WindowBar } from "@/components/ui/window-bar";
import type { DossierSummary } from "@/lib/content/dossiers";
import { formatPeriod, STATUS_LABELS } from "@/lib/format";

const STATUS_DOT = {
  shipped: "bg-success",
  "in-progress": "bg-accent",
  archived: "bg-line-strong",
} as const;

const ROLE_LABELS = { solo: "Solo", team: "Team" } as const;

/** Cards show the first few stack items; the dossier page lists them all. */
const MAX_STACK = 6;

/**
 * A dossier as a small terminal window: a title bar with the file path,
 * then the case file. The whole card is one link (stretched over it).
 */
export function DossierCard({ dossier }: { dossier: DossierSummary }) {
  return (
    <article className="relative flex h-full flex-col overflow-hidden rounded-lg border border-line bg-surface-raised transition-colors duration-fast ease-standard hover:border-accent">
      <WindowBar path={`~/projects/${dossier.slug}`} />

      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center justify-between gap-3">
          <CaseStamp caseNumber={dossier.caseNumber} />
          <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-2 py-0.5 font-mono text-xs text-muted">
            <span
              aria-hidden="true"
              className={`size-1.5 rounded-full ${STATUS_DOT[dossier.status]}`}
            />
            {STATUS_LABELS[dossier.status]}
          </span>
        </div>
        <h3 className="font-display text-lg font-semibold tracking-tight">
          <Link
            href={`/projects/${dossier.slug}`}
            className="after:absolute after:inset-0 after:rounded-lg"
          >
            {dossier.title}
          </Link>
        </h3>
        <p className="text-muted">{dossier.summary}</p>
        <div className="flex flex-wrap gap-2 pt-1">
          {dossier.stack.slice(0, MAX_STACK).map((item) => (
            <Tag key={item} tone="tech">
              {item}
            </Tag>
          ))}
          {dossier.stack.length > MAX_STACK && (
            <Tag>+{dossier.stack.length - MAX_STACK} more</Tag>
          )}
        </div>
        {/* Pinned to the bottom, so cards in a row line up: the challenge
            gets two lines of room whatever its length. */}
        <div className="mt-auto flex flex-col gap-3 pt-2">
          {dossier.challenge && (
            <p className="min-h-10 text-sm">
              <span className="font-mono text-xs text-accent">challenge: </span>
              {dossier.challenge}
            </p>
          )}
          <div className="flex items-center justify-between gap-3 border-t border-line pt-3 font-mono text-xs text-muted">
            <span>
              {[...dossier.tags, ROLE_LABELS[dossier.roleType]].join(" · ")}
            </span>
            <span>{formatPeriod(dossier.period)}</span>
          </div>
        </div>
      </div>
    </article>
  );
}
