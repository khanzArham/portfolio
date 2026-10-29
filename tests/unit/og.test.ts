// @vitest-environment node
import { describe, expect, it } from "vitest";
import { ogKeyMetrics } from "@/lib/og";

const metric = (name: string, value: number, unit?: string) => ({
  name,
  value,
  unit,
});

describe("ogKeyMetrics", () => {
  it("takes the first two evaluation metrics, with units", () => {
    expect(
      ogKeyMetrics({
        evaluation: {
          summary: "",
          metrics: [
            metric("F1", 0.91),
            metric("Latency", 42, "ms"),
            metric("AUC", 0.9),
          ],
          charts: [],
          testSet: "",
          reproducible: {},
        },
      }),
    ).toEqual([
      { label: "F1", value: "0.91" },
      { label: "Latency", value: "42 ms" },
    ]);
  });

  it("falls back to measured performance", () => {
    expect(
      ogKeyMetrics({
        performance: [
          {
            name: "Lighthouse",
            value: 98,
            unit: "score",
            measuredAt: "2026-10-29",
            method: "mobile",
          },
        ],
      }),
    ).toEqual([{ label: "Lighthouse", value: "98 score" }]);
  });

  it("shows nothing rather than inventing numbers", () => {
    expect(ogKeyMetrics({})).toEqual([]);
  });
});
