import Link from "next/link";
import { CaseStamp } from "@/components/dossier/case-stamp";
import { MdxBody } from "@/components/dossier/mdx-body";
import {
  DossierSections,
  type DossierSectionItem,
} from "@/components/dossier/dossier-sections";
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

/**
 * The dossier page (plan §5.3): the case file slides in, has a clear close
 * control, and shows its sections as tabs (desktop) or an accordion
 * (mobile). Data and Evaluation appear only when the dossier has them.
 */
export function CaseFile({ dossier }: { dossier: Dossier }) {
  const { sections, evaluation } = dossier;
  const links = Object.entries(dossier.links ?? {}) as [
    keyof typeof LINK_LABELS,
    string,
  ][];

  const items: DossierSectionItem[] = [
    {
      id: "brief",
      title: "Brief",
      content: <MdxBody source={sections.brief} />,
    },
    ...(sections.data !== undefined
      ? [
          {
            id: "data",
            title: "Data",
            content: <MdxBody source={sections.data} />,
          },
        ]
      : []),
    {
      id: "method",
      title: "Method",
      content: <MdxBody source={sections.method} />,
    },
    ...(evaluation
      ? [
          {
            id: "evaluation",
            title: "Evaluation",
            content: <EvaluationSummary evaluation={evaluation} />,
          },
        ]
      : []),
    {
      id: "failure-log",
      title: "Failure Log",
      content: <MdxBody source={sections.failureLog} />,
    },
    {
      id: "outcome",
      title: "Outcome",
      content: <MdxBody source={sections.outcome} />,
    },
  ];

  return (
    <article className="case-file-enter flex flex-col gap-10">
      <header className="flex flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <CaseStamp caseNumber={dossier.caseNumber} size="lg" />
            <span className="font-mono text-sm text-muted">
              {STATUS_LABELS[dossier.status]}
            </span>
          </div>
          <Link
            href="/projects"
            className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-sm text-muted transition-colors duration-fast ease-standard hover:bg-surface hover:text-ink"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
              strokeLinecap="round"
            >
              <path d="M6 6l12 12M18 6L6 18" />
            </svg>
            Close file
          </Link>
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
          <dt className="font-mono text-muted">Stack</dt>
          <dd className="flex flex-wrap gap-2">
            {dossier.stack.map((item) => (
              <Tag key={item}>{item}</Tag>
            ))}
          </dd>
          {dossier.performance?.map((p) => (
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

      <DossierSections sections={items} />
    </article>
  );
}
