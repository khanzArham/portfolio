// @vitest-environment node
import { describe, expect, it } from "vitest";
import { periodSchema, TAGS } from "@/lib/content/schemas";
import { formatMonth, formatPeriod } from "@/lib/format";

describe("year-only periods (no invented months)", () => {
  it("accepts YYYY, quoted or as a YAML number", () => {
    expect(periodSchema.parse({ start: 2024, end: 2024 })).toEqual({
      start: "2024",
      end: "2024",
    });
    expect(
      periodSchema.safeParse({ start: "2025", end: "present" }).success,
    ).toBe(true);
  });

  it("still rejects invalid months", () => {
    expect(
      periodSchema.safeParse({ start: "2025-13", end: "2026" }).success,
    ).toBe(false);
  });

  it("formats years and single-year spans", () => {
    expect(formatMonth("2024")).toBe("2024");
    expect(formatMonth("2025-03")).toBe("Mar 2025");
    expect(formatPeriod({ start: "2024", end: "2024" })).toBe("2024");
    expect(formatPeriod({ start: "2025", end: "present" })).toBe(
      "2025 – Present",
    );
  });
});

it("includes the Software tag", () => {
  expect(TAGS).toContain("Software");
});
