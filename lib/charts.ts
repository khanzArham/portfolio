import type { Chart } from "@/lib/content/schemas";

// Text summaries and table views computed from chart data (plan §4.3: every
// chart has a caption, a text summary and a table alternative). Computed,
// not hand-written, so they can never disagree with the chart.

type ChartOf<T extends Chart["type"]> = Extract<Chart, { type: T }>;
export type ChartTable = { columns: string[]; rows: (string | number)[][] };

const number = new Intl.NumberFormat("en-US", { maximumFractionDigits: 3 });
export const fmt = (value: number) => number.format(value);
const pct = (part: number, whole: number) =>
  whole === 0 ? "0%" : `${Math.round((part / whole) * 100)}%`;

export function summarizeConfusion(chart: ChartOf<"confusion-matrix">) {
  const { labels, matrix } = chart;
  const total = matrix.flat().reduce((a, b) => a + b, 0);
  const correct = labels.reduce((sum, _, i) => sum + matrix[i][i], 0);

  let worst = { count: 0, actual: "", predicted: "" };
  matrix.forEach((row, i) =>
    row.forEach((count, j) => {
      if (i !== j && count > worst.count) {
        worst = { count, actual: labels[i], predicted: labels[j] };
      }
    }),
  );

  const errors = worst.count
    ? ` The most common error: ${fmt(worst.count)} "${worst.actual}" ${worst.count === 1 ? "item" : "items"} predicted as "${worst.predicted}".`
    : " No item was misclassified.";
  return `Of ${fmt(total)} test items, ${fmt(correct)} (${pct(correct, total)}) were classified correctly.${errors}`;
}

export function summarizeLossCurve(chart: ChartOf<"loss-curve">) {
  const { epochs, series } = chart;
  const parts = series.map((s) => {
    const first = s.values[0];
    const last = s.values[s.values.length - 1];
    const verb = last < first ? "fell" : last > first ? "rose" : "stayed";
    return verb === "stayed"
      ? `${s.name} stayed at ${fmt(first)}`
      : `${s.name} ${verb} from ${fmt(first)} to ${fmt(last)}`;
  });
  return `Over ${epochs.length} epochs, ${parts.join("; ")}.`;
}

export function summarizeScatter(chart: ChartOf<"tradeoff-scatter">) {
  const best = chart.points.reduce((a, b) => (b.accuracy > a.accuracy ? b : a));
  const fastest = chart.points.reduce((a, b) =>
    b.latencyMs < a.latencyMs ? b : a,
  );
  const describe = (p: (typeof chart.points)[number]) =>
    `${p.label} (${fmt(p.accuracy)} at ${fmt(p.latencyMs)} ms)`;
  return best === fastest
    ? `${best.label} is both the most accurate and the fastest: ${describe(best)}.`
    : `Most accurate: ${describe(best)}. Fastest: ${describe(fastest)}.`;
}

export function chartSummary(chart: Chart): string {
  switch (chart.type) {
    case "confusion-matrix":
      return summarizeConfusion(chart);
    case "loss-curve":
      return summarizeLossCurve(chart);
    case "tradeoff-scatter":
      return summarizeScatter(chart);
    case "metric-table":
      return `${chart.rows.length} ${chart.rows.length === 1 ? "row" : "rows"} comparing ${chart.columns.slice(1).join(", ")}.`;
  }
}

export function lossCurveTable(chart: ChartOf<"loss-curve">): ChartTable {
  return {
    columns: ["Epoch", ...chart.series.map((s) => s.name)],
    rows: chart.epochs.map((epoch, i) => [
      epoch,
      ...chart.series.map((s) => s.values[i]),
    ]),
  };
}

export function scatterTable(chart: ChartOf<"tradeoff-scatter">): ChartTable {
  return {
    columns: ["Model", chart.xLabel, chart.yLabel],
    rows: chart.points.map((p) => [p.label, p.latencyMs, p.accuracy]),
  };
}

/** Rows of { epoch, [series]: value } for Recharts. */
export function lossCurveRows(chart: ChartOf<"loss-curve">) {
  return chart.epochs.map((epoch, i) => ({
    epoch,
    ...Object.fromEntries(chart.series.map((s) => [s.name, s.values[i]])),
  }));
}

export const SEQ_STEPS = 7;

/**
 * Sequential step 1..7 for a count; 0 maps to the step nearest the surface.
 * Fill and text come from --color-seq-N / --color-on-seq-N, which each
 * theme defines (text >= 4.5:1 on every step).
 */
export function seqStep(value: number, max: number) {
  if (max <= 0) return 1;
  return 1 + Math.round((value / max) * (SEQ_STEPS - 1));
}
