"use client";

import {
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useMediaQuery } from "@/components/dossier/use-media-query";

export type DossierSectionItem = {
  id: string;
  title: string;
  content: ReactNode;
};

const DESKTOP = "(min-width: 768px)";

/**
 * Dossier sections as tabs on desktop and an accordion on mobile (plan
 * §5.3), from ONE render of each section, so charts are never duplicated.
 * CSS decides which controls show; ARIA roles follow the breakpoint after
 * hydration. Both layouts start with the first section open, so server
 * HTML matches either and nothing shifts. Inactive panels stay in the HTML
 * (hidden), so crawlers and agents still read every section.
 */
export function DossierSections({
  sections,
}: {
  sections: DossierSectionItem[];
}) {
  const base = useId();
  const isDesktop = useMediaQuery(DESKTOP, true);
  const [active, setActive] = useState(sections[0]?.id);
  const [open, setOpen] = useState(() => new Set([sections[0]?.id]));
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const tabId = (id: string) => `${base}-tab-${id}`;
  const panelId = (id: string) => `${base}-panel-${id}`;
  const toggleId = (id: string) => `${base}-toggle-${id}`;

  // WAI-ARIA tabs: arrows move and select, Home/End jump to the ends.
  const onTabKeyDown = (event: KeyboardEvent, index: number) => {
    const last = sections.length - 1;
    const next =
      event.key === "ArrowRight"
        ? (index + 1) % sections.length
        : event.key === "ArrowLeft"
          ? (index - 1 + sections.length) % sections.length
          : event.key === "Home"
            ? 0
            : event.key === "End"
              ? last
              : null;
    if (next === null) return;
    event.preventDefault();
    setActive(sections[next].id);
    tabRefs.current[next]?.focus();
  };

  const toggle = (id: string) =>
    setOpen((current) => {
      const updated = new Set(current);
      if (updated.has(id)) updated.delete(id);
      else updated.add(id);
      return updated;
    });

  return (
    <div className="flex flex-col gap-6">
      <div
        role="tablist"
        aria-label="Dossier sections"
        className="hidden gap-1 overflow-x-auto border-b border-ink/10 md:flex"
      >
        {sections.map((section, index) => {
          const selected = active === section.id;
          return (
            <button
              key={section.id}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={tabId(section.id)}
              aria-selected={selected}
              aria-controls={panelId(section.id)}
              tabIndex={selected ? 0 : -1}
              onClick={() => setActive(section.id)}
              onKeyDown={(event) => onTabKeyDown(event, index)}
              className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-fast ease-standard ${selected ? "border-ink text-ink dark:border-accent" : "border-transparent text-muted hover:text-ink"}`}
            >
              {section.title}
            </button>
          );
        })}
      </div>

      {sections.map((section) => {
        const expanded = open.has(section.id);
        const visible = isDesktop ? active === section.id : expanded;
        return (
          <div key={section.id} className="md:contents">
            {/* Accordion header: display:none on desktop, so screen readers
                there get only the tabs. */}
            <h2 className="border-t border-ink/10 md:hidden">
              <button
                type="button"
                id={toggleId(section.id)}
                aria-expanded={expanded}
                aria-controls={panelId(section.id)}
                onClick={() => toggle(section.id)}
                className="flex w-full items-center justify-between py-4 text-left font-display text-xl font-semibold"
              >
                {section.title}
                <svg
                  aria-hidden="true"
                  viewBox="0 0 24 24"
                  className={`size-5 text-muted transition-transform duration-fast ease-standard ${expanded ? "rotate-90" : ""}`}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M9 6l6 6-6 6" />
                </svg>
              </button>
            </h2>
            <div
              id={panelId(section.id)}
              role={isDesktop ? "tabpanel" : "region"}
              aria-labelledby={
                isDesktop ? tabId(section.id) : toggleId(section.id)
              }
              tabIndex={isDesktop ? 0 : undefined}
              hidden={!visible}
              className="pb-4 md:pb-0"
            >
              {section.content}
            </div>
          </div>
        );
      })}
    </div>
  );
}
