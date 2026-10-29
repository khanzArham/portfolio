const monthFormat = new Intl.DateTimeFormat("en-US", {
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dayFormat = new Intl.DateTimeFormat("en-US", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

/** "2025-03" -> "Mar 2025"; "present" -> "Present". */
export function formatMonth(value: string) {
  if (value === "present") return "Present";
  return monthFormat.format(new Date(`${value}-01T00:00:00Z`));
}

/** { start: "2025-01", end: "present" } -> "Jan 2025 – Present". */
export function formatPeriod(period: { start: string; end: string }) {
  return `${formatMonth(period.start)} – ${formatMonth(period.end)}`;
}

/** "2026-10-29" -> "Oct 29, 2026". */
export function formatDate(value: string) {
  return dayFormat.format(new Date(`${value}T00:00:00Z`));
}

export const STATUS_LABELS = {
  shipped: "Shipped",
  "in-progress": "In progress",
  archived: "Archived",
} as const;
