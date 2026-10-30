import { DataTable } from "@/components/charts/data-table";
import { EvaluationChart } from "@/components/charts/evaluation-chart";
import type { Evaluation } from "@/lib/content/schemas";

const formatValue = (value: number, unit?: string) =>
  unit ? `${value} ${unit}` : String(value);

/** Evaluation tab: summary, key metrics, every chart, test set, repro links. */
export function EvaluationSummary({ evaluation }: { evaluation: Evaluation }) {
  return (
    <>
      <p className="leading-7">{evaluation.summary}</p>

      <div className="mt-4">
        <DataTable
          caption="Key metrics"
          table={{
            columns: ["Metric", "Value", "Baseline"],
            rows: evaluation.metrics.map((m) => [
              m.name,
              formatValue(m.value, m.unit),
              m.baseline === undefined ? "–" : formatValue(m.baseline, m.unit),
            ]),
          }}
        />
      </div>

      {evaluation.charts.map((chart, i) => (
        <EvaluationChart key={`${chart.type}-${i}`} chart={chart} />
      ))}

      <dl className="mt-8 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
        <dt className="font-mono text-muted">Test set</dt>
        <dd>{evaluation.testSet}</dd>
        <dt className="font-mono text-muted">Reproduce</dt>
        <dd className="flex flex-wrap gap-4">
          {evaluation.reproducible.repo && (
            <a
              href={evaluation.reproducible.repo}
              className="underline underline-offset-4"
            >
              Repository
            </a>
          )}
          {evaluation.reproducible.notebook && (
            <a
              href={evaluation.reproducible.notebook}
              className="underline underline-offset-4"
            >
              Notebook
            </a>
          )}
        </dd>
      </dl>
    </>
  );
}
