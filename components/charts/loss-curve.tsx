"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  ChartTooltipBox,
  tooltipValue,
} from "@/components/charts/chart-tooltip";
import {
  useChartColors,
  usePrefersReducedMotion,
} from "@/components/charts/use-chart-theme";

const HEIGHT = 280;
const SERIES_TOKENS = ["chart-1", "chart-2", "chart-3"] as const;

/** Loss per epoch: 2px lines, crosshair tooltip, legend for 2+ series. */
export function LossCurve({
  title,
  rows,
  seriesNames,
}: {
  title: string;
  rows: Record<string, number>[];
  seriesNames: string[];
}) {
  const colors = useChartColors();
  const reducedMotion = usePrefersReducedMotion();
  // Color follows the series' position in the data, never its rank.
  const seriesColor = (i: number) =>
    colors ? colors[SERIES_TOKENS[i % SERIES_TOKENS.length]] : "";

  return (
    <div data-chart="loss-curve" data-animate={!reducedMotion}>
      {seriesNames.length > 1 && (
        <ul className="mb-2 flex flex-wrap gap-4 text-sm" aria-hidden="true">
          {seriesNames.map((name, i) => (
            <li key={name} className="flex items-center gap-2">
              <span
                className="h-0.5 w-4 rounded-full"
                style={{ backgroundColor: seriesColor(i) }}
              />
              {name}
            </li>
          ))}
        </ul>
      )}
      {/* Fixed height includes the axis band, so nothing is clipped.
          Recharts' accessibility layer makes the chart focusable, and the
          arrow keys move the tooltip, so keyboard users get the hover. */}
      <div style={{ height: HEIGHT }}>
        {colors && (
          <ResponsiveContainer
            width="100%"
            height={HEIGHT}
            initialDimension={{ width: 600, height: HEIGHT }}
          >
            <LineChart
              data={rows}
              title={title}
              margin={{ top: 8, right: 16, bottom: 8, left: 0 }}
            >
              <CartesianGrid stroke={colors["chart-grid"]} vertical={false} />
              <XAxis
                dataKey="epoch"
                stroke={colors["chart-grid"]}
                tick={{ fill: colors.muted, fontSize: 12 }}
                tickLine={false}
                label={{
                  value: "Epoch",
                  position: "insideBottomRight",
                  offset: -4,
                  fill: colors.muted,
                  fontSize: 12,
                }}
              />
              <YAxis
                stroke={colors["chart-grid"]}
                tick={{ fill: colors.muted, fontSize: 12 }}
                tickLine={false}
                width={44}
              />
              <Tooltip
                cursor={{ stroke: colors.muted, strokeWidth: 1 }}
                content={(props) =>
                  props.active && props.payload?.length ? (
                    <ChartTooltipBox
                      title={`Epoch ${props.label}`}
                      rows={props.payload.map((p, i) => ({
                        label: String(p.name),
                        value: tooltipValue(p.value),
                        color: seriesColor(i),
                      }))}
                    />
                  ) : null
                }
              />
              {seriesNames.map((name, i) => (
                <Line
                  key={name}
                  dataKey={name}
                  name={name}
                  type="monotone"
                  stroke={seriesColor(i)}
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  dot={false}
                  activeDot={{
                    r: 5,
                    fill: seriesColor(i),
                    stroke: colors.paper,
                    strokeWidth: 2,
                  }}
                  isAnimationActive={!reducedMotion}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
