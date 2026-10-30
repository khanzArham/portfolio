// @vitest-environment node
import { create, insertMultiple, save } from "@orama/orama";
import { describe, expect, it } from "vitest";
import { loadEmbedder } from "@/lib/ai/embed-client";
import {
  loadSearchIndex,
  makeSnippet,
  queryTerms,
  searchSite,
} from "@/lib/search/client";
import {
  EMBED_MODEL,
  SEARCH_SCHEMA,
  type SearchDoc,
} from "@/lib/search/config";
import { buildCorpus, stripMarkdown } from "@/lib/search/corpus";

// A unit vector along one axis stands in for a real embedding, so a query
// vector "means" exactly one document (the worker is mocked away).
const axis = (i: number) =>
  Array.from({ length: EMBED_MODEL.dims }, (_, j) => (j === i ? 1 : 0));

const docs: SearchDoc[] = [
  {
    id: "a",
    kind: "dossier",
    title: "Order Tracker: Method",
    url: "/projects/order-tracker",
    text: "React with Firebase security rules per user.",
  },
  {
    id: "b",
    kind: "dossier",
    title: "Brick Breaker: Method",
    url: "/projects/brick-breaker",
    text: "C++ game with collision physics.",
  },
  {
    id: "c",
    kind: "skills",
    title: "Skills: Web",
    url: "/skills",
    text: "React, Next.js, Firebase",
  },
];

async function fixtureIndex() {
  const db = create({ schema: SEARCH_SCHEMA });
  await insertMultiple(
    db,
    docs.map((d, i) => ({ ...d, embedding: axis(i) })),
  );
  const raw = JSON.stringify({
    meta: { model: "test", docs: 3, downloadBytes: 1, builtAt: "" },
    index: await save(db),
  });
  return loadSearchIndex((async () => new Response(raw)) as typeof fetch);
}

describe("searchSite", () => {
  it("returns the expected dossier for a known query (worker mocked)", async () => {
    const index = await fixtureIndex();
    // The query shares no keyword with Brick Breaker; only its vector does.
    const results = await searchSite(index, "arcade", axis(1));
    expect(results[0]).toMatchObject({
      url: "/projects/brick-breaker",
      title: "Brick Breaker",
      passage: "Brick Breaker: Method",
    });
  });

  it("falls back to keyword search without a vector", async () => {
    const index = await fixtureIndex();
    const results = await searchSite(index, "firebase");
    expect(results.map((r) => r.url)).toEqual(
      expect.arrayContaining(["/projects/order-tracker", "/skills"]),
    );
  });

  it("keeps one result per page and ignores empty queries", async () => {
    const index = await fixtureIndex();
    const results = await searchSite(index, "react");
    expect(new Set(results.map((r) => r.url)).size).toBe(results.length);
    expect(await searchSite(index, "   ")).toEqual([]);
  });
});

describe("query helpers", () => {
  it("drops stop words", () => {
    expect(queryTerms("Which project used a CNN for images?")).toEqual([
      "project",
      "used",
      "cnn",
      "images",
    ]);
  });

  it("centers the snippet on the first matching term", () => {
    const text = `${"x ".repeat(100)}Firebase rules here ${"y ".repeat(100)}`;
    const snippet = makeSnippet(text, ["firebase"]);
    expect(snippet).toContain("Firebase rules here");
    expect(snippet.startsWith("…")).toBe(true);
  });
});

describe("corpus", () => {
  it("strips markdown to plain words", () => {
    expect(stripMarkdown("## Title\n- **Bold** [link](/x) `code`")).toBe(
      "Title Bold link code",
    );
  });

  it("builds passages from content and skips empty text", () => {
    const corpus = buildCorpus({
      dossiers: [],
      skills: [
        { name: "Python", category: "Languages" },
        { name: "React", category: "Web" },
      ],
      experience: [],
      education: [
        {
          institution: "Uni",
          degree: "BS",
          period: { start: "2023", end: "present" },
        },
      ],
      bio: ["About me."],
    });
    expect(corpus.map((d) => d.id)).toEqual([
      "skills-Languages",
      "skills-Web",
      "page-about",
    ]);
  });
});

it("embedder resolves to null where Web Workers are unavailable", async () => {
  expect(await loadEmbedder()).toBeNull();
});
