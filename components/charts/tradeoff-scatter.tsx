"use client";

import {
  CartesianGrid,
  LabelList,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
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

const HEIGHT = 300;

type Point = { label: string; latencyMs: number; accuracy: number };

/**
 * Latency vs accuracy. One series (slot 1, so no legend box); each point is
 * direct-labeled with its name. Points are 10px with a 2px surface ring and
 * a transparent 24px hit area, so hover does not need pixel precision.
 */
export function TradeoffScatter({
  title,
  points,
  xLabel,
  yLabel,
}: {
  title: string;
  points: Point[];
  xLabel: string;
  yLabel: string;
}) {
  const colors = useChartColors();
  const reducedMotion = usePrefersReducedMotion();

  return (
    <div
      data-chart="tradeoff-scatter"
      data-animate={!reducedMotion}
      style={{ height: HEIGHT }}
    >
      {colors && (
        <ResponsiveContainer
          width="100%"
          height={HEIGHT}
          initialDimension={{ width: 600, height: HEIGHT }}
        >
          <ScatterChart
            title={title}
            margin={{ top: 16, right: 24, bottom: 24, left: 8 }}
          >
            <CartesianGrid stroke={colors["chart-grid"]} />
            <XAxis
              type="number"
              dataKey="latencyMs"
              name={xLabel}
              stroke={colors["chart-grid"]}
              tick={{ fill: colors.muted, fontSize: 12 }}
              tickLine={false}
              label={{
                value: xLabel,
                position: "insideBottom",
                offset: -16,
                fill: colors.muted,
                fontSize: 12,
              }}
            />
            <YAxis
              type="number"
              dataKey="accuracy"
              name={yLabel}
              domain={["auto", "auto"]}
              // Room above the top point for its direct label.
              padding={{ top: 28 }}
              stroke={colors["chart-grid"]}
              tick={{ fill: colors.muted, fontSize: 12 }}
              tickLine={false}
              width={64}
              label={{
                value: yLabel,
                angle: -90,
                position: "insideLeft",
                fill: colors.muted,
                fontSize: 12,
              }}
            />
            <Tooltip
              cursor={false}
              content={(props) => {
                const point = props.payload?.[0]?.payload as Point | undefined;
                return props.active && point ? (
                  <ChartTooltipBox
                    title={point.label}
                    rows={[
                      {
                        label: yLabel,
                        value: tooltipValue(point.accuracy),
                        color: colors["chart-1"],
                      },
                      {
                        label: xLabel,
                        value: tooltipValue(point.latencyMs),
                        color: colors["chart-1"],
                      },
                    ]}
                  />
                ) : null;
              }}
            />
            <Scatter
              data={points}
              fill={colors["chart-1"]}
              isAnimationActive={!reducedMotion}
              shape={(props: { cx?: number; cy?: number }) => (
                <g>
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={12}
                    fill="transparent"
                  />
                  <circle
                    cx={props.cx}
                    cy={props.cy}
                    r={5}
                    fill={colors["chart-1"]}
                    stroke={colors.paper}
                    strokeWidth={2}
                  />
                </g>
              )}
            >
              <LabelList
                dataKey="label"
                position="top"
                offset={12}
                fill={colors.ink}
                fontSize={12}
              />
            </Scatter>
          </ScatterChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
