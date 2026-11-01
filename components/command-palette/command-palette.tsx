"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import type { DossierSummary } from "@/lib/content/dossiers";
import { isPaletteShortcut, matchesQuery } from "@/lib/palette";
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

const noop = () => () => {};
const isMac = () => /Mac|iPhone|iPad/.test(navigator.userAgent);

const itemClass =
  "flex cursor-pointer items-center justify-between gap-3 rounded-md px-3 py-2 text-sm data-[selected=true]:bg-surface";
const groupClass =
  "px-1 pb-2 [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:font-mono [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:text-muted";

/**
 * Cmd/Ctrl + K palette (plan §6.6): pages, dossiers, actions, and keyword
 * results from the Step 20 index. Radix Dialog traps focus, closes on
 * Escape and returns focus to the trigger. The index loads on first search.
 */
export function CommandPalette({ dossiers }: { dossiers: PaletteDossier[] }) {
  const router = useRouter();
  const { setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searchFailed, setSearchFailed] = useState(false);
  const [copy, setCopy] = useState<CopyState>("idle");
  const index = useRef<Promise<LoadedIndex> | null>(null);
  // "Ctrl K" on the server and during hydration, the real key afterwards.
  const shortcut = useSyncExternalStore(
    noop,
    () => (isMac() ? "⌘K" : "Ctrl K"),
    () => "Ctrl K",
  );

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (!isPaletteShortcut(event)) return;
      event.preventDefault();
      setOpen((wasOpen) => !wasOpen);
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

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
      <Dialog.Trigger asChild>
        <button
          type="button"
          aria-keyshortcuts="Control+K Meta+K"
          className="inline-flex h-10 items-center gap-2 rounded-md px-2.5 text-sm text-ink transition-colors duration-fast ease-standard hover:bg-surface md:border md:border-ink/15"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            className="size-5"
            fill="none"
            stroke="currentColor"
            strokeWidth={1.5}
            strokeLinecap="round"
          >
            <circle cx="11" cy="11" r="6.5" />
            <path d="M16 16l4.5 4.5" />
          </svg>
          <span className="sr-only md:not-sr-only">Search</span>
          <kbd
            aria-hidden="true"
            className="hidden font-mono text-xs text-muted md:inline"
          >
            {shortcut}
          </kbd>
        </button>
      </Dialog.Trigger>

      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-40 bg-paper/80 backdrop-blur-sm" />
        <Dialog.Content className="fixed top-[12vh] left-1/2 z-50 w-[calc(100%-2rem)] max-w-xl -translate-x-1/2 overflow-hidden rounded-lg border border-ink/15 bg-surface-raised shadow-lg">
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
              className="w-full border-b border-ink/10 bg-transparent px-4 py-3 text-ink outline-none placeholder:text-muted"
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
                        setTheme(t.theme);
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

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-ink/10 px-4 py-2 text-xs text-muted">
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
