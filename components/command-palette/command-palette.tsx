"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, type RefObject } from "react";
import type { DossierSummary } from "@/lib/content/dossiers";
import { matchesQuery } from "@/lib/palette";
import { switchTheme } from "@/lib/theme-transition";
import type { LoadedIndex, SearchResult } from "@/lib/search/client";
import { contactItem, site, visibleNavItems } from "@/lib/site";

export type PaletteDossier = Pick<
  DossierSummary,
  "slug" | "caseNumber" | "title" | "tags"
>;

const pages = [{ label: "Home", href: "/" }, ...visibleNavItems, contactItem];

const themes = [
  { theme: "light", label: "Use light theme" },
  { theme: "dark", label: "Use dark theme" },
  { theme: "system", label: "Use system theme" },
] as const;

type CopyState = "idle" | "copied" | "failed";

const itemClass =
  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface";
const groupClass =
  "px-1 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted";

/**
 * The palette dialog (plan §6.6): pages, dossiers, actions, and keyword
 * results from the Step 20 index. Loaded on demand by PaletteLauncher, so
 * cmdk and Radix Dialog are not in the initial page JavaScript. Radix traps
 * focus and closes on Escape; focus then returns to the launcher button.
 */
export default function PaletteDialog({
  dossiers,
  open,
  onOpenChange: setOpen,
  returnFocusTo,
}: {
  dossiers: PaletteDossier[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  returnFocusTo: RefObject<HTMLButtonElement | null>;
}) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchFailed, setSearchFailed] = useState(false);
  const [copy, setCopy] = useState<CopyState>("idle");
  const index = useRef<Promise<LoadedIndex> | null>(null);

  const term = query.trim();

  // Debounced keyword search; stale responses are dropped.
  useEffect(() => {
    if (term.length < 2) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const m = await import("@/lib/search/client");
        index.current ??= m.loadSearchIndex();
        const found = await m.searchSite(await index.current, term, null, 5);
        if (!cancelled) setResults(found);
      } catch {
        index.current = null;
        if (!cancelled) setSearchFailed(true);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [term]);

  const onOpenChange = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setResults([]);
      setSearchFailed(false);
      setCopy("idle");
    }
  };

  const go = (href: string) => {
    onOpenChange(false);
    router.push(href);
  };

  const copyEmail = async () => {
    try {
      await navigator.clipboard.writeText(site.email);
      setCopy("copied");
    } catch {
      setCopy("failed");
    }
  };

  const matchedPages = pages.filter((p) => matchesQuery(term, p.label));
  const matchedDossiers = dossiers.filter((d) =>
    matchesQuery(term, d.title, d.caseNumber, ...d.tags),
  );
  const matchedThemes = themes.filter((t) =>
    matchesQuery(term, t.label, "theme dark light mode"),
  );
  const showCopy = matchesQuery(term, "copy email address", site.email);
  // Results already listed as a page or dossier above are not repeated.
  const listed = new Set([
    ...matchedPages.map((p) => p.href),
    ...matchedDossiers.map((d) => `/projects/${d.slug}`),
  ]);
  const searchResults =
    term.length < 2 ? [] : results.filter((r) => !listed.has(r.url));

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-paper/80 backdrop-blur-sm" />
        <Dialog.Content
          onCloseAutoFocus={(event) => {
            event.preventDefault();
            returnFocusTo.current?.focus();
          }}
          className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-surface-raised"
        >
          <Dialog.Title className="sr-only">Command palette</Dialog.Title>
          <Dialog.Description className="sr-only">
            Search pages, dossiers and actions. Use the arrow keys to move and
            Enter to select.
          </Dialog.Description>

          <Command label="Command palette" shouldFilter={false} loop>
            <Command.Input
              value={query}
              onValueChange={setQuery}
              placeholder="Search pages, dossiers and actions"
              className="w-full border-b border-line bg-transparent px-4 py-3 text-ink outline-none placeholder:text-muted"
            />
            <Command.List className="max-h-[60vh] overflow-y-auto py-2">
              <Command.Empty className="px-4 py-6 text-center text-sm text-muted">
                No matches.
              </Command.Empty>

              {matchedPages.length > 0 && (
                <Command.Group heading="Pages" className={groupClass}>
                  {matchedPages.map((page) => (
                    <Command.Item
                      key={page.href}
                      value={`page ${page.href}`}
                      onSelect={() => go(page.href)}
                      className={itemClass}
                    >
                      {page.label}
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {matchedDossiers.length > 0 && (
                <Command.Group heading="Dossiers" className={groupClass}>
                  {matchedDossiers.map((d) => (
                    <Command.Item
                      key={d.slug}
                      value={`dossier ${d.slug}`}
                      onSelect={() => go(`/projects/${d.slug}`)}
                      className={itemClass}
                    >
                      <span>{d.title}</span>
                      <span className="font-mono text-xs text-muted">
                        {d.caseNumber}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}

              {(matchedThemes.length > 0 || showCopy) && (
                <Command.Group heading="Actions" className={groupClass}>
                  {matchedThemes.map((t) => (
                    <Command.Item
                      key={t.theme}
                      value={`theme ${t.theme}`}
                      onSelect={() => {
                        switchTheme(setTheme, t.theme);
                        onOpenChange(false);
                      }}
                      className={itemClass}
                    >
                      {t.label}
                    </Command.Item>
                  ))}
                  {showCopy && (
                    <Command.Item
                      value="copy email"
                      onSelect={copyEmail}
                      className={itemClass}
                    >
                      <span>
                        {copy === "copied" ? "Email copied" : "Copy email"}
                      </span>
                      <span className="font-mono text-xs text-muted">
                        {site.email}
                      </span>
                    </Command.Item>
                  )}
                </Command.Group>
              )}

              {searchResults.length > 0 && (
                <Command.Group heading="Search results" className={groupClass}>
                  {searchResults.map((r) => (
                    <Command.Item
                      key={r.url}
                      value={`result ${r.url}`}
                      onSelect={() => go(r.url)}
                      className={`${itemClass} flex-col items-start gap-0.5`}
                    >
                      <span className="font-medium">{r.title}</span>
                      <span className="line-clamp-2 text-xs text-muted">
                        {r.snippet}
                      </span>
                    </Command.Item>
                  ))}
                </Command.Group>
              )}
            </Command.List>
          </Command>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-line px-4 py-2 text-xs text-muted">
            <p role="status">
              {copy === "copied"
                ? "Email address copied."
                : copy === "failed"
                  ? `Couldn't copy. The address is ${site.email}.`
                  : searchFailed
                    ? "Search is unavailable right now."
                    : "Keyword search. Semantic search is on the Work page."}
            </p>
            <p>
              <kbd className="font-mono">Esc</kbd> to close
            </p>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
