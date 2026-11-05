import Link from "next/link";
import type { Station } from "@/lib/journey";

/**
 * Journey map (plan §5.3). The map IS an ordered list, so screen readers
 * get the plain list (plan §7.2) from the same markup; the path and dots
 * are decoration. Each station is a native <details> disclosure: its
 * <summary> acts as the button, the browser exposes expanded/collapsed,
 * and it works without JavaScript. The path fills as the list scrolls
 * through the viewport (CSS scroll-driven animation, see globals.css).
 */
// On md+ the stations spread across the full width: the first is aligned
// left, the last right and any between centred, each with its dot.
const ALIGN = {
  start: { text: "", dot: "md:left-0", items: "", self: "" },
  center: {
    text: "md:text-center",
    dot: "md:left-1/2 md:-translate-x-1/2",
    items: "md:items-center",
    self: "md:self-center",
  },
  end: {
    text: "md:text-right",
    dot: "md:right-0 md:left-auto",
    items: "md:items-end",
    self: "md:self-end",
  },
} as const;

const alignAt = (index: number, count: number) =>
  ALIGN[index === 0 ? "start" : index === count - 1 ? "end" : "center"];

export function JourneyMap({ stations }: { stations: Station[] }) {
  return (
    <section
      aria-labelledby="journey-title"
      className="journey reveal flex flex-col gap-6"
    >
      <h2
        id="journey-title"
        className="reveal-left font-display text-2xl font-semibold"
      >
        Journey
      </h2>

      <div className="relative">
        {/* Track and scroll-linked fill, centered on the 12px dots: a
            vertical line on small screens, and on md+ a horizontal one
            across the full width, from the first dot to the last. */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[5px] w-0.5 rounded-full bg-ink/15 md:top-[5px] md:right-1.5 md:bottom-auto md:left-1.5 md:h-0.5 md:w-auto"
        >
          <div className="journey-path-fill h-full w-full rounded-full bg-ink dark:bg-accent" />
        </div>

        <ol className="flex flex-col gap-6 md:flex-row md:items-start md:gap-8">
          {stations.map((station, index) => {
            const align = alignAt(index, stations.length);
            return (
              <li
                key={station.id}
                className={`relative pl-8 md:flex-1 md:pt-8 md:pl-0 ${align.text}`}
              >
                <span
                  aria-hidden="true"
                  className={`journey-dot absolute top-1.5 left-0 size-3 rounded-full border-2 border-paper bg-ink ring-2 ring-ink md:top-0 dark:bg-accent dark:ring-accent ${align.dot}`}
                />
                <details className="group">
                  <summary
                    className={`flex cursor-pointer list-none flex-col gap-0.5 rounded-md [&::-webkit-details-marker]:hidden ${align.items}`}
                  >
                    <span className="flex items-center gap-2 font-display text-xl font-semibold">
                      {station.name}
                      <svg
                        aria-hidden="true"
                        viewBox="0 0 24 24"
                        className="size-4 text-muted transition-transform duration-fast ease-standard group-open:rotate-90"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth={1.5}
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>
                    <span className="font-mono text-sm text-muted">
                      {station.summary}
                    </span>
                  </summary>

                  <div className={`mt-3 flex flex-col gap-3 ${align.items}`}>
                    {station.items.length > 0 && (
                      <ul className="flex flex-col gap-2">
                        {station.items.map((item) => (
                          <li key={item.title}>
                            {item.href ? (
                              <Link
                                href={item.href}
                                className="underline underline-offset-4"
                              >
                                {item.title}
                              </Link>
                            ) : (
                              <span>{item.title}</span>
                            )}
                            <span className="block font-mono text-xs text-muted">
                              {item.meta}
                            </span>
                          </li>
                        ))}
                      </ul>
                    )}
                    <Link
                      href={station.href}
                      className={`self-start text-sm text-muted underline underline-offset-4 hover:text-ink ${align.self}`}
                    >
                      {station.linkLabel}
                    </Link>
                  </div>
                </details>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
