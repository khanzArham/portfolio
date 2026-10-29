import { CaseStamp } from "@/components/dossier/case-stamp";
import { DossierSection } from "@/components/dossier/dossier-section";
import { EvaluationSummary } from "@/components/dossier/evaluation-summary";
import { Tag } from "@/components/ui/tag";
import type { Dossier } from "@/lib/content/dossiers";
import { formatDate, formatPeriod, STATUS_LABELS } from "@/lib/format";

const LINK_LABELS = {
  demo: "Live demo",
  github: "GitHub",
  behance: "Behance",
  writeup: "Write-up",
} as const;

/** The dossier page: case header, metadata, then each section in order. */
export function CaseFile({ dossier }: { dossier: Dossier }) {
  const { sections, evaluation } = dossier;
  const links = Object.entries(dossier.links ?? {}) as [
    keyof typeof LINK_LABELS,
    string,
  ][];

  return (
    <article className="flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <CaseStamp caseNumber={dossier.caseNumber} size="lg" />
          <span className="font-mono text-sm text-muted">
            {STATUS_LABELS[dossier.status]}
          </span>
        </div>
        <h1 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          {dossier.title}
        </h1>
        <p className="max-w-prose text-lg text-muted">{dossier.summary}</p>

        <dl className="mt-2 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
          <dt className="font-mono text-muted">Role</dt>
          <dd>
            {dossier.role.type === "solo" ? "Solo" : "Team"} ·{" "}
            {dossier.role.contribution}
          </dd>
          <dt className="font-mono text-muted">Period</dt>
          <dd>{formatPeriod(dossier.period)}</dd>
          <dt className="font-mono text-muted">Tags</dt>
          <dd className="flex flex-wrap gap-2">
            {dossier.tags.map((tag) => (
              <Tag key={tag}>{tag}</Tag>
            ))}
          </dd>
          <dt className="font-mono text-muted">Updated</dt>
          <dd>
            <time dateTime={dossier.updated}>
              {formatDate(dossier.updated)}
            </time>
          </dd>
        </dl>

        {links.length > 0 && (
          <ul className="flex flex-wrap gap-4 text-sm">
            {links.map(([key, href]) => (
              <li key={key}>
                <a href={href} className="underline underline-offset-4">
                  {LINK_LABELS[key]}
                </a>
              </li>
            ))}
          </ul>
        )}
      </header>

      <DossierSection id="brief" title="Brief" source={sections.brief} />
      {sections.data !== undefined && (
        <DossierSection id="data" title="Data" source={sections.data} />
      )}
      <DossierSection id="method" title="Method" source={sections.method} />
      {evaluation && (
        <DossierSection id="evaluation" title="Evaluation">
          <EvaluationSummary evaluation={evaluation} />
        </DossierSection>
      )}
      <DossierSection
        id="failure-log"
        title="Failure Log"
        source={sections.failureLog}
      />
      <DossierSection id="outcome" title="Outcome" source={sections.outcome} />

      <DossierSection id="stack" title="Stack">
        <ul className="flex flex-wrap gap-2">
          {dossier.stack.map((item) => (
            <li key={item}>
              <Tag>{item}</Tag>
            </li>
          ))}
        </ul>
        {dossier.performance && (
          <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
            {dossier.performance.map((p) => (
              <div key={p.name} className="contents">
                <dt className="font-mono text-muted">{p.name}</dt>
                <dd>
                  {p.value} {p.unit}{" "}
                  <span className="text-muted">
                    ({p.method}, {formatDate(p.measuredAt)})
                  </span>
                </dd>
              </div>
            ))}
          </dl>
        )}
      </DossierSection>
    </article>
  );
}
