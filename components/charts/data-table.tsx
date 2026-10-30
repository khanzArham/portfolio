import type { ChartTable } from "@/lib/charts";
import { fmt } from "@/lib/charts";

const cell = "border-b border-ink/10 px-3 py-2 text-left";

/** Accessible data table: caption, column headers, tabular numbers. */
export function DataTable({
  caption,
  table,
  captionHidden = false,
}: {
  caption: string;
  table: ChartTable;
  /** Hide the caption visually when a figure caption already shows it. */
  captionHidden?: boolean;
}) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-sm">
        <caption
          className={
            captionHidden
              ? "sr-only"
              : "mb-2 text-left font-mono text-xs text-muted"
          }
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {table.columns.map((column) => (
              <th key={column} scope="col" className={`${cell} font-semibold`}>
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row, i) => (
            <tr key={i}>
              {row.map((value, j) =>
                j === 0 ? (
                  <th key={j} scope="row" className={`${cell} font-normal`}>
                    {typeof value === "number" ? fmt(value) : value}
                  </th>
                ) : (
                  <td key={j} className={`${cell} font-mono tabular-nums`}>
                    {typeof value === "number" ? fmt(value) : value}
                  </td>
                ),
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
