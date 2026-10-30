"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import type { Embedder } from "@/lib/ai/embed-client";
import type { LoadedIndex, SearchResult } from "@/lib/search/client";

type Mode = "keyword" | "loading" | "semantic" | "failed";

const mb = (bytes: number) => `${Math.round(bytes / 1048576)} MB`;

/** Wraps query terms in <mark>; text only, never HTML (labels are data). */
function Highlight({ text, terms }: { text: string; terms: string[] }) {
  if (!terms.length) return <>{text}</>;
  const escaped = terms.map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"));
  // Match at the start of a word only: "design" marks "Designed", but a
  // term never lights up the middle of another word.
  const parts = text.split(
    new RegExp(`(?<![\\p{L}\\p{N}])(${escaped.join("|")})`, "giu"),
  );
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="rounded-sm bg-accent px-0.5 text-on-accent">
            {part}
          </mark>
        ) : (
          part
        ),
      )}
    </>
  );
}

/**
 * "Ask the site" (plan §5.3, §6.6). Keyword search works at once; semantic
 * search is opt-in and runs entirely in this browser. Index, search code and
 * model all load on demand, never in the initial bundle.
 */
export function SiteSearch() {
  const inputId = useId();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [terms, setTerms] = useState<string[]>([]);
  const [mode, setMode] = useState<Mode>("keyword");
  const [progress, setProgress] = useState(0);
  const [downloadBytes, setDownloadBytes] = useState<number | null>(null);
  const [indexError, setIndexError] = useState(false);
  const index = useRef<Promise<LoadedIndex> | null>(null);
  const embedder = useRef<Embedder | null>(null);

  const getIndex = () => {
    index.current ??= import("@/lib/search/client").then(async (m) => {
      const loaded = await m.loadSearchIndex();
      setDownloadBytes(loaded.meta.downloadBytes);
      return loaded;
    });
    return index.current;
  };

  // Debounced search; stale responses are dropped. An empty query loads
  // nothing, so the index never downloads before the visitor searches.
  useEffect(() => {
    if (!query.trim()) return;
    let cancelled = false;
    const timer = setTimeout(async () => {
      try {
        const { searchSite, queryTerms } = await import("@/lib/search/client");
        const loaded = await getIndex();
        const vector =
          mode === "semantic" && query.trim()
            ? await embedder.current?.embed(query.trim())
            : null;
        if (mode === "semantic" && query.trim() && !vector) setMode("failed");
        const found = await searchSite(loaded, query, vector);
        if (!cancelled) {
          setResults(found);
          setTerms(queryTerms(query));
        }
      } catch {
        if (!cancelled) setIndexError(true);
      }
    }, 150);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, mode]);

  const enableSemantic = async () => {
    setMode("loading");
    setProgress(0);
    const { loadEmbedder } = await import("@/lib/ai/embed-client");
    const loaded = await loadEmbedder({ onProgress: setProgress });
    embedder.current = loaded;
    setMode(loaded ? "semantic" : "failed");
  };

  useEffect(() => () => embedder.current?.dispose(), []);

  const status =
    mode === "semantic"
      ? "Semantic search is on. It runs on this device."
      : mode === "loading"
        ? `Loading the search model: ${Math.round(progress * 100)}%`
        : mode === "failed"
          ? "Semantic search couldn't load on this device, so results use keyword search."
          : "Keyword search.";

  return (
    <section
      aria-labelledby={`${inputId}-title`}
      className="flex flex-col gap-4 rounded-lg border border-ink/10 bg-surface-raised p-5"
    >
      <h2
        id={`${inputId}-title`}
        className="font-display text-xl font-semibold"
      >
        Ask the site
      </h2>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={inputId} className="text-sm text-muted">
          Search projects, skills and experience
        </label>
        <input
          id={inputId}
          type="search"
          value={query}
          onFocus={() => void getIndex().catch(() => setIndexError(true))}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="e.g. Which work used Firebase?"
          className="w-full rounded-md border border-ink/25 bg-paper px-3 py-2 text-ink"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3 text-sm">
        {(mode === "keyword" || mode === "failed") && (
          <button
            type="button"
            onClick={enableSemantic}
            disabled={mode === "failed"}
            className="rounded-md border border-ink/25 px-3 py-1.5 font-medium transition-colors duration-fast ease-standard hover:bg-surface disabled:opacity-60"
          >
            Turn on semantic search
            {downloadBytes ? ` (${mb(downloadBytes)} download)` : ""}
          </button>
        )}
        {mode === "loading" && (
          <progress
            value={progress}
            max={1}
            aria-label="Search model download"
            className="h-2 w-40 accent-ink"
          />
        )}
        <p role="status" className="text-muted">
          {status}
        </p>
      </div>

      <p className="text-xs text-muted">
        Semantic search runs entirely in your browser: a one-time download,
        cached afterwards. Nothing you type is sent to a server.
      </p>

      {indexError && (
        <p role="alert" className="text-sm text-danger">
          Search is unavailable right now.
        </p>
      )}

      {query.trim() && !indexError && (
        <div className="flex flex-col gap-2">
          <p aria-live="polite" className="font-mono text-xs text-muted">
            {results.length} {results.length === 1 ? "result" : "results"}
          </p>
          <ul className="flex flex-col gap-3">
            {results.map((result) => (
              <li key={result.url}>
                <Link
                  href={result.url}
                  className="font-medium underline underline-offset-4"
                >
                  {result.title}
                </Link>
                {result.passage !== result.title && (
                  <span className="ml-2 font-mono text-xs text-muted">
                    {result.passage.split(":")[1]?.trim()}
                  </span>
                )}
                <p className="mt-1 text-sm text-muted">
                  <Highlight text={result.snippet} terms={terms} />
                </p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
