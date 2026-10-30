"use client";

import { useId, useState, type ReactNode } from "react";
import { DataTable } from "@/components/charts/data-table";
import type { ChartTable } from "@/lib/charts";

/**
 * Figure around every chart (plan §5.3): caption, a text summary that is
 * always visible, and a toggle between the chart and its data table.
 * Without a `table` the content is already a table and needs no toggle.
 */
export function ChartFrame({
  caption,
  summary,
  table,
  children,
}: {
  caption: string;
  summary: string;
  table?: ChartTable;
  children: ReactNode;
}) {
  const [showTable, setShowTable] = useState(false);
  const regionId = useId();
  const captionId = useId();

  return (
    // aria-labelledby names the figure in every tool, not just browsers that
    // derive the name from <figcaption>.
    <figure aria-labelledby={captionId} className="mt-8 flex flex-col gap-3">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <figcaption id={captionId} className="font-medium">
          {caption}
        </figcaption>
        {table && (
          // A toggle keeps one label; aria-pressed carries the state.
          <button
            type="button"
            aria-controls={regionId}
            aria-pressed={showTable}
            onClick={() => setShowTable((v) => !v)}
            className={`rounded-md border px-3 py-1 font-mono text-xs transition-colors duration-fast ease-standard ${showTable ? "border-ink bg-ink text-paper" : "border-ink/20 text-muted hover:text-ink"}`}
          >
            Data table
          </button>
        )}
      </div>
      <p className="text-sm text-muted">{summary}</p>
      <div id={regionId}>
        {table && showTable ? (
          <DataTable caption={caption} table={table} captionHidden />
        ) : (
          children
        )}
      </div>
    </figure>
  );
}
