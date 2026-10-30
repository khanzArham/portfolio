import { fmt } from "@/lib/charts";

export type TooltipRow = { label: string; value: string; color: string };

/**
 * Hover and focus readout (dataviz interaction rules): the value leads and
 * is strong, the series name follows, and each row is keyed by a short
 * stroke of the series color. Text never wears the series color.
 */
export function ChartTooltipBox({
  title,
  rows,
}: {
  title: string;
  rows: TooltipRow[];
}) {
  return (
    <div className="rounded-md border border-ink/15 bg-surface-raised px-3 py-2 text-sm shadow-sm">
      <p className="font-mono text-xs text-muted">{title}</p>
      <ul className="mt-1 flex flex-col gap-0.5">
        {rows.map((row) => (
          <li key={row.label} className="flex items-center gap-2">
            <span
              aria-hidden="true"
              className="h-0.5 w-3 rounded-full"
              style={{ backgroundColor: row.color }}
            />
            <span className="font-semibold tabular-nums">{row.value}</span>
            <span className="text-muted">{row.label}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export const tooltipValue = (value: unknown) =>
  typeof value === "number" ? fmt(value) : String(value);
