// @vitest-environment node
import { describe, expect, it } from "vitest";
import {
  chartSummary,
  lossCurveRows,
  lossCurveTable,
  scatterTable,
  seqStep,
  SEQ_STEPS,
} from "@/lib/charts";
import type { Chart } from "@/lib/content/schemas";

const confusion: Chart = {
  type: "confusion-matrix",
  labels: ["good", "cracked"],
  matrix: [
    [8, 2],
    [1, 9],
  ],
  caption: "c",
};

const loss: Chart = {
  type: "loss-curve",
  epochs: [1, 2, 3],
  series: [
    { name: "train", values: [1, 0.5, 0.25] },
    { name: "validation", values: [1.2, 1.2, 1.2] },
  ],
  caption: "c",
};

const scatter: Chart = {
  type: "tradeoff-scatter",
  points: [
    { label: "small", latencyMs: 10, accuracy: 0.7 },
    { label: "large", latencyMs: 40, accuracy: 0.81234 },
  ],
  xLabel: "Latency (ms)",
  yLabel: "Accuracy",
  caption: "c",
};

describe("chartSummary", () => {
  it("states accuracy and the most common confusion", () => {
    expect(chartSummary(confusion)).toBe(
      'Of 20 test items, 17 (85%) were classified correctly. The most common error: 2 "good" items predicted as "cracked".',
    );
  });

  it("says when nothing was misclassified", () => {
    const perfect = {
      ...confusion,
      matrix: [
        [3, 0],
        [0, 4],
      ],
    } as Chart;
    expect(chartSummary(perfect)).toContain("No item was misclassified.");
  });

  it("describes each loss series from first to last epoch", () => {
    expect(chartSummary(loss)).toBe(
      "Over 3 epochs, train fell from 1 to 0.25; validation stayed at 1.2.",
    );
  });

  it("names the most accurate and the fastest point, rounded", () => {
    expect(chartSummary(scatter)).toBe(
      "Most accurate: large (0.812 at 40 ms). Fastest: small (0.7 at 10 ms).",
    );
  });

  it("handles one point that is best on both axes", () => {
    const one = {
      ...scatter,
      points: [{ label: "only", latencyMs: 5, accuracy: 0.9 }],
    } as Chart;
    expect(chartSummary(one)).toBe(
      "only is both the most accurate and the fastest: only (0.9 at 5 ms).",
    );
  });
});

describe("table views", () => {
  it("turns a loss curve into epoch rows", () => {
    if (loss.type !== "loss-curve") throw new Error();
    expect(lossCurveTable(loss)).toEqual({
      columns: ["Epoch", "train", "validation"],
      rows: [
        [1, 1, 1.2],
        [2, 0.5, 1.2],
        [3, 0.25, 1.2],
      ],
    });
    expect(lossCurveRows(loss)[1]).toEqual({
      epoch: 2,
      train: 0.5,
      validation: 1.2,
    });
  });

  it("turns a scatter into model rows", () => {
    if (scatter.type !== "tradeoff-scatter") throw new Error();
    expect(scatterTable(scatter).columns).toEqual([
      "Model",
      "Latency (ms)",
      "Accuracy",
    ]);
  });
});

describe("seqStep", () => {
  it("maps 0 to the first step and the max to the last", () => {
    expect(seqStep(0, 9)).toBe(1);
    expect(seqStep(9, 9)).toBe(SEQ_STEPS);
    expect(seqStep(0, 0)).toBe(1);
  });
});
