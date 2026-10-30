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
export function JourneyMap({ stations }: { stations: Station[] }) {
  return (
    <section aria-labelledby="journey-title" className="flex flex-col gap-6">
      <h2 id="journey-title" className="font-display text-2xl font-semibold">
        Journey
      </h2>

      <div className="relative">
        {/* Track and scroll-linked fill, centered on the 12px dots. */}
        <div
          aria-hidden="true"
          className="absolute top-2 bottom-2 left-[5px] w-0.5 rounded-full bg-ink/15"
        >
          <div className="journey-path-fill h-full w-full rounded-full bg-ink dark:bg-accent" />
        </div>

        <ol className="flex flex-col gap-6">
          {stations.map((station) => (
            <li key={station.id} className="relative pl-8">
              <span
                aria-hidden="true"
                className="absolute top-1.5 left-0 size-3 rounded-full border-2 border-paper bg-ink ring-2 ring-ink dark:bg-accent dark:ring-accent"
              />
              <details className="group">
                <summary className="flex cursor-pointer list-none flex-col gap-0.5 rounded-md [&::-webkit-details-marker]:hidden">
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

                <div className="mt-3 flex flex-col gap-3">
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
                    className="self-start text-sm text-muted underline underline-offset-4 hover:text-ink"
                  >
                    {station.linkLabel}
                  </Link>
                </div>
              </details>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
