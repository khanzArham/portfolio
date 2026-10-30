import { fmt, seqStep } from "@/lib/charts";

/**
 * Confusion matrix as a real table: rows are the actual class, columns the
 * predicted class. Each count is printed; the blue shade (one hue, light to
 * dark) only reinforces magnitude, so nothing depends on color alone.
 */
export function ConfusionMatrix({
  caption,
  labels,
  matrix,
}: {
  caption: string;
  labels: string[];
  matrix: number[][];
}) {
  const max = Math.max(...matrix.flat());

  return (
    <div className="overflow-x-auto">
      <table className="border-separate border-spacing-0.5 text-sm">
        <caption className="sr-only">
          {caption}. Rows: actual class. Columns: predicted class.
        </caption>
        <thead>
          <tr>
            <td className="px-3 py-2 font-mono text-xs text-muted">
              Actual ↓ / Predicted →
            </td>
            {labels.map((label) => (
              <th
                key={label}
                scope="col"
                className="px-3 py-2 text-center font-mono text-xs font-medium"
              >
                {label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={labels[i]}>
              <th
                scope="row"
                className="px-3 py-2 text-left font-mono text-xs font-medium"
              >
                {labels[i]}
              </th>
              {row.map((count, j) => {
                const step = seqStep(count, max);
                return (
                  <td
                    key={labels[j]}
                    title={`Actual ${labels[i]}, predicted ${labels[j]}: ${fmt(count)}`}
                    className={`min-w-14 rounded-sm px-3 py-3 text-center font-mono tabular-nums ${i === j ? "font-semibold" : ""}`}
                    style={{
                      backgroundColor: `var(--color-seq-${step})`,
                      color: `var(--color-on-seq-${step})`,
                    }}
                  >
                    {fmt(count)}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
