import type { Evaluation } from "@/lib/content/schemas";

const formatValue = (value: number, unit?: string) =>
  unit ? `${value} ${unit}` : String(value);

const cell = "border-b border-ink/10 px-3 py-2 text-left";

function DataTable({
  caption,
  columns,
  rows,
}: {
  caption: string;
  columns: string[];
  rows: (string | number)[][];
}) {
  return (
    <div className="mt-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption className="mb-2 text-left font-mono text-xs text-muted">
          {caption}
        </caption>
        <thead>
          <tr>
            {columns.map((column) => (
              <th key={column} scope="col" className={`${cell} font-semibold`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) => (
                <td key={j} className={`${cell} font-mono`}>
                  {value}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/**
 * Evaluation summary, key metrics and metric tables. The interactive charts
 * (confusion matrix, loss curve, trade-off scatter) arrive in Step 16.
 */
export function EvaluationSummary({ evaluation }: { evaluation: Evaluation }) {
  return (
    <>
      <p className="leading-7">{evaluation.summary}</p>

      <DataTable
        caption="Key metrics"
        columns={["Metric", "Value", "Baseline"]}
        rows={evaluation.metrics.map((m) => [
          m.name,
          formatValue(m.value, m.unit),
          m.baseline === undefined ? "–" : formatValue(m.baseline, m.unit),
        ])}
      />

      {evaluation.charts.map((chart, i) =>
        chart.type === "metric-table" ? (
          <DataTable
            key={i}
            caption={chart.caption}
            columns={chart.columns}
            rows={chart.rows}
          />
        ) : null,
      )}

      <dl className="mt-6 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-[max-content_1fr]">
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
