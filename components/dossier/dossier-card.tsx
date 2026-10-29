import Link from "next/link";
import { CaseStamp } from "@/components/dossier/case-stamp";
import { Tag } from "@/components/ui/tag";
import type { DossierSummary } from "@/lib/content/dossiers";
import { formatPeriod, STATUS_LABELS } from "@/lib/format";

export function DossierCard({ dossier }: { dossier: DossierSummary }) {
  return (
    <article className="relative flex h-full flex-col gap-3 rounded-lg border border-ink/10 bg-surface-raised p-5 transition-colors duration-fast ease-standard hover:border-ink/30">
      <div className="flex items-center justify-between gap-3">
        <CaseStamp caseNumber={dossier.caseNumber} />
        <span className="font-mono text-xs text-muted">
          {STATUS_LABELS[dossier.status]}
        </span>
      </div>
      <h3 className="font-display text-xl font-semibold">
        {/* The stretched link makes the whole card clickable. */}
        <Link
          href={`/projects/${dossier.slug}`}
          className="after:absolute after:inset-0 after:rounded-lg"
        >
          {dossier.title}
        </Link>
      </h3>
      <p className="text-muted">{dossier.summary}</p>
      <div className="mt-auto flex flex-wrap items-center gap-2 pt-2">
        {dossier.tags.map((tag) => (
          <Tag key={tag}>{tag}</Tag>
        ))}
        <span className="ml-auto font-mono text-xs text-muted">
          {formatPeriod(dossier.period)}
        </span>
      </div>
    </article>
  );
}
