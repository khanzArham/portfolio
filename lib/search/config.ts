// Shared by the build-time indexer (Node) and the browser worker, so both
// embed with exactly the same model (plan Step 20, Part A).

export const EMBED_MODEL = {
  /** Snowflake arctic-embed-xs: Apache-2.0, 384-dim, strong small retriever. */
  id: "Snowflake/snowflake-arctic-embed-xs",
  /** Pinned Hugging Face commit, so every build downloads identical files. */
  revision: "d8c86521100d3556476a063fc2342036d45c106f",
  /** int8 weights: onnx/model_quantized.onnx (21.9 MB). */
  dtype: "q8",
  /** SHA-256 of the weights at `revision` (Hugging Face LFS oid). */
  weightsSha256:
    "e6aa5e656466a73d7c3111e9a3378bd13e5b93af30eaac2b3f13fd56692589a1",
  dims: 384,
  files: [
    "config.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "special_tokens_map.json",
    "onnx/model_quantized.onnx",
  ],
  /** The model card's recipe: CLS pooling, normalized, prefix on queries only. */
  pooling: "cls",
  queryPrefix: "Represent this sentence for searching relevant passages: ",
} as const;

/** Served from our own domain (approved), so the CSP stays 'self'. */
export const MODEL_BASE_PATH = "/models/";
export const ORT_BASE_PATH = "/ort/";
export const INDEX_PATH = "/search-index.json";

/** Orama schema, identical at build time and in the browser. */
export const SEARCH_SCHEMA = {
  id: "string",
  kind: "string",
  title: "string",
  url: "string",
  text: "string",
  embedding: "vector[384]",
} as const;

export type SearchDoc = {
  id: string;
  kind: "dossier" | "skills" | "experience" | "education" | "page";
  title: string;
  url: string;
  text: string;
};

export type IndexMeta = {
  model: string;
  docs: number;
  /** One-time download a visitor opts into: model files + runtime wasm. */
  downloadBytes: number;
  builtAt: string;
};
