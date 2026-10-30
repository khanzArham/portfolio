/**
 * Build-time search index (plan Step 20, Part A; runs before every build).
 *
 * 1. Downloads the pinned embedding model into public/models (once; it is
 *    gitignored) so the browser loads it from our own domain.
 * 2. Copies the ONNX Runtime WebAssembly files into public/ort.
 * 3. Embeds every public passage with the same model the browser will use
 *    and writes the Orama index to public/search-index.json.
 */
import { createHash } from "node:crypto";
import fs from "node:fs";
import { gzipSync } from "node:zlib";
import path from "node:path";
import { env, pipeline } from "@huggingface/transformers";
import { create, insertMultiple, save } from "@orama/orama";
import { getDossiers } from "@/lib/content/dossiers";
import { getEducation, getExperience, getSkills } from "@/lib/content/profile";
import { buildCorpus } from "@/lib/search/corpus";
import {
  EMBED_MODEL,
  SEARCH_SCHEMA,
  type IndexMeta,
} from "@/lib/search/config";
import { site } from "@/lib/site";

const PUBLIC = path.join(process.cwd(), "public");
const MODEL_DIR = path.join(PUBLIC, "models", EMBED_MODEL.id);
const ORT_DIR = path.join(PUBLIC, "ort");
const ORT_SOURCE = path.join(
  process.cwd(),
  "node_modules",
  "onnxruntime-web",
  "dist",
);

async function ensureModel() {
  for (const file of EMBED_MODEL.files) {
    const target = path.join(MODEL_DIR, file);
    if (fs.existsSync(target) && fs.statSync(target).size > 0) continue;
    const url = `https://huggingface.co/${EMBED_MODEL.id}/resolve/${EMBED_MODEL.revision}/${file}`;
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`Model download failed (${response.status}): ${url}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
    console.log(`  downloaded ${file}`);
  }

  // The weights are served to visitors, so they must be exactly the pinned
  // file: a corrupted or tampered download fails the build.
  const weights = fs.readFileSync(
    path.join(MODEL_DIR, "onnx", "model_quantized.onnx"),
  );
  const digest = createHash("sha256").update(weights).digest("hex");
  if (digest !== EMBED_MODEL.weightsSha256) {
    throw new Error(
      `Model weights hash mismatch: expected ${EMBED_MODEL.weightsSha256}, got ${digest}`,
    );
  }
}

function copyRuntime() {
  fs.mkdirSync(ORT_DIR, { recursive: true });
  const files = fs
    .readdirSync(ORT_SOURCE)
    .filter((f) => /^ort-wasm-simd-threaded.*\.(wasm|mjs)$/.test(f));
  for (const file of files) {
    fs.copyFileSync(path.join(ORT_SOURCE, file), path.join(ORT_DIR, file));
  }
  return files;
}

// What a visitor really receives (measured in Step 20): the model weights
// arrive uncompressed, the runtime WebAssembly compressed.
const rawSize = (p: string) => (fs.existsSync(p) ? fs.statSync(p).size : 0);
const compressedSize = (p: string) =>
  fs.existsSync(p) ? gzipSync(fs.readFileSync(p)).length : 0;

async function main() {
  await ensureModel();
  const runtimeFiles = copyRuntime();

  const docs = buildCorpus({
    dossiers: getDossiers(),
    skills: getSkills(),
    experience: getExperience(),
    education: getEducation(),
    bio: site.bio,
  });

  env.allowRemoteModels = false;
  env.localModelPath = path.join(PUBLIC, "models") + path.sep;
  const extractor = await pipeline("feature-extraction", EMBED_MODEL.id, {
    dtype: EMBED_MODEL.dtype,
  });
  // Documents are embedded without the query prefix (model card).
  const output = await extractor(
    docs.map((d) => `${d.title}. ${d.text}`),
    { pooling: EMBED_MODEL.pooling, normalize: true },
  );
  const vectors = output.tolist() as number[][];

  const db = create({ schema: SEARCH_SCHEMA });
  await insertMultiple(
    db,
    docs.map((doc, i) => ({ ...doc, embedding: vectors[i] })),
  );

  const modelBytes = EMBED_MODEL.files.reduce(
    (sum, f) => sum + rawSize(path.join(MODEL_DIR, f)),
    0,
  );
  // Chromium loads the asyncify runtime (measured in Step 20); other
  // variants stay available for browsers that pick them.
  const runtimeBytes = compressedSize(
    path.join(ORT_DIR, "ort-wasm-simd-threaded.asyncify.wasm"),
  );
  const meta: IndexMeta = {
    model: EMBED_MODEL.id,
    docs: docs.length,
    downloadBytes: modelBytes + runtimeBytes,
    builtAt: new Date().toISOString(),
  };

  fs.writeFileSync(
    path.join(PUBLIC, "search-index.json"),
    JSON.stringify({ meta, index: await save(db) }),
  );
  console.log(
    `build:search: ${docs.length} passages indexed with ${EMBED_MODEL.id}; runtime files: ${runtimeFiles.length}; visitor download ≈ ${(meta.downloadBytes / 1048576).toFixed(1)} MB`,
  );
}

main().catch((error) => {
  console.error(
    `build:search failed: ${error instanceof Error ? error.message : error}`,
  );
  process.exitCode = 1;
});
