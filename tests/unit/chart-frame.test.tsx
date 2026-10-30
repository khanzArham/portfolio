import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ChartFrame } from "@/components/charts/chart-frame";

const table = {
  columns: ["Epoch", "train"],
  rows: [
    [1, 0.9],
    [2, 0.4],
  ],
};

describe("ChartFrame", () => {
  it("shows the caption and summary with the chart by default", () => {
    render(
      <ChartFrame caption="Loss curve" summary="Train fell." table={table}>
        <div>chart</div>
      </ChartFrame>,
    );
    expect(screen.getByRole("figure", { name: "Loss curve" })).toBeVisible();
    expect(screen.getByText("Train fell.")).toBeVisible();
    expect(screen.getByText("chart")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Data table" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("toggles to the data table with the keyboard", async () => {
    const user = userEvent.setup();
    render(
      <ChartFrame caption="Loss curve" summary="Train fell." table={table}>
        <div>chart</div>
      </ChartFrame>,
    );

    await user.tab();
    expect(screen.getByRole("button", { name: "Data table" })).toHaveFocus();
    await user.keyboard("{Enter}");

    expect(screen.getByRole("table", { name: "Loss curve" })).toBeVisible();
    expect(screen.getByRole("cell", { name: "0.4" })).toBeVisible();
    expect(screen.queryByText("chart")).not.toBeInTheDocument();

    await user.keyboard(" ");
    expect(screen.getByText("chart")).toBeInTheDocument();
  });

  it("has no toggle when the content is already a table", () => {
    render(
      <ChartFrame caption="Matrix" summary="All correct.">
        <table aria-label="m" />
      </ChartFrame>,
    );
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
