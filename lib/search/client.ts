import {
  create,
  load,
  MODE_FULLTEXT_SEARCH,
  MODE_HYBRID_SEARCH,
  search,
} from "@orama/orama";
import {
  INDEX_PATH,
  SEARCH_SCHEMA,
  type IndexMeta,
  type SearchDoc,
} from "@/lib/search/config";

// Loads the prebuilt index on demand and searches it. With a query vector
// it runs hybrid (meaning + keywords); without one, keyword search only.

type SearchDb = ReturnType<typeof createDb>;
const createDb = () => create({ schema: SEARCH_SCHEMA });

export type LoadedIndex = { db: SearchDb; meta: IndexMeta };

export async function loadSearchIndex(
  fetcher: typeof fetch = fetch,
): Promise<LoadedIndex> {
  const response = await fetcher(INDEX_PATH);
  if (!response.ok) throw new Error(`Search index: HTTP ${response.status}`);
  const { meta, index } = (await response.json()) as {
    meta: IndexMeta;
    index: unknown;
  };
  const db = createDb();
  load(db, index as Parameters<typeof load>[1]);
  return { db, meta };
}

export type SearchResult = {
  url: string;
  /** The page or dossier, e.g. "Order Tracker". */
  title: string;
  /** The passage that matched, e.g. "Order Tracker: Method". */
  passage: string;
  snippet: string;
  kind: SearchDoc["kind"];
};

// Words too common to be worth highlighting or locating a snippet by.
const STOP_WORDS = new Set(
  "a an and are as at be by did do does for from has have how i in is it its me my of on or the to was what which who why will with you your each any all".split(
    " ",
  ),
);

/** Meaningful words from a query, for highlighting and snippets. */
export const queryTerms = (query: string) =>
  query
    .toLowerCase()
    .split(/[^\p{L}\p{N}+#.]+/u)
    .filter((term) => term.length > 1 && !STOP_WORDS.has(term));

/** ~180 characters around the first matching term. */
export function makeSnippet(text: string, terms: string[], size = 180) {
  const lower = text.toLowerCase();
  const at = terms
    .map((t) => lower.indexOf(t))
    .filter((i) => i >= 0)
    .sort((a, b) => a - b)[0];
  const start = Math.max(0, (at ?? 0) - 60);
  const end = Math.min(text.length, start + size);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).trim()}${end < text.length ? "…" : ""}`;
}

export async function searchSite(
  { db }: LoadedIndex,
  query: string,
  vector?: number[] | null,
  limit = 8,
): Promise<SearchResult[]> {
  const term = query.trim();
  if (!term) return [];

  const results = await search(
    db,
    vector
      ? {
          mode: MODE_HYBRID_SEARCH,
          term,
          vector: { value: vector, property: "embedding" },
          similarity: 0.3,
          properties: ["title", "text"],
          limit: limit * 3,
        }
      : {
          mode: MODE_FULLTEXT_SEARCH,
          term,
          properties: ["title", "text"],
          tolerance: 1,
          limit: limit * 3,
        },
  );

  // One result per page: the best-scoring passage wins.
  const seen = new Set<string>();
  const terms = queryTerms(term);
  const out: SearchResult[] = [];
  for (const hit of results.hits) {
    const doc = hit.document as unknown as SearchDoc;
    if (seen.has(doc.url)) continue;
    seen.add(doc.url);
    out.push({
      url: doc.url,
      title: doc.title.split(":")[0],
      passage: doc.title,
      snippet: makeSnippet(doc.text, terms),
      kind: doc.kind,
    });
    if (out.length === limit) break;
  }
  return out;
}
