import { ChartFrame } from "@/components/charts/chart-frame";
import { ConfusionMatrix } from "@/components/charts/confusion-matrix";
import { DataTable } from "@/components/charts/data-table";
import { LossCurve } from "@/components/charts/loss-curve";
import { TradeoffScatter } from "@/components/charts/tradeoff-scatter";
import {
  chartSummary,
  lossCurveRows,
  lossCurveTable,
  scatterTable,
} from "@/lib/charts";
import type { Chart } from "@/lib/content/schemas";

/** Picks the chart form from the data type (plan §4.3, Step 16). */
export function EvaluationChart({ chart }: { chart: Chart }) {
  const summary = chartSummary(chart);

  switch (chart.type) {
    case "loss-curve":
      return (
        <ChartFrame
          caption={chart.caption}
          summary={summary}
          table={lossCurveTable(chart)}
        >
          <LossCurve
            title={chart.caption}
            rows={lossCurveRows(chart)}
            seriesNames={chart.series.map((s) => s.name)}
          />
        </ChartFrame>
      );
    case "tradeoff-scatter":
      return (
        <ChartFrame
          caption={chart.caption}
          summary={summary}
          table={scatterTable(chart)}
        >
          <TradeoffScatter
            title={chart.caption}
            points={chart.points}
            xLabel={chart.xLabel}
            yLabel={chart.yLabel}
          />
        </ChartFrame>
      );
    // These two are tables already, so they need no table toggle.
    case "confusion-matrix":
      return (
        <ChartFrame caption={chart.caption} summary={summary}>
          <ConfusionMatrix
            caption={chart.caption}
            labels={chart.labels}
            matrix={chart.matrix}
          />
        </ChartFrame>
      );
    case "metric-table":
      return (
        <ChartFrame caption={chart.caption} summary={summary}>
          <DataTable
            caption={chart.caption}
            table={{ columns: chart.columns, rows: chart.rows }}
            captionHidden
          />
        </ChartFrame>
      );
  }
}
