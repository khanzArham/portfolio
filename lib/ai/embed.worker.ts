/// <reference lib="webworker" />
// Embeds search queries off the main thread (plan §6.6). Model and runtime
// come from our own domain only; nothing is sent anywhere.
import { env, pipeline } from "@huggingface/transformers";
import {
  EMBED_MODEL,
  MODEL_BASE_PATH,
  ORT_BASE_PATH,
} from "@/lib/search/config";

env.allowRemoteModels = false;
env.allowLocalModels = true;
env.localModelPath = MODEL_BASE_PATH;
if (env.backends.onnx.wasm) {
  env.backends.onnx.wasm.wasmPaths = ORT_BASE_PATH;
  // One thread and no proxy worker: needs no cross-origin isolation.
  env.backends.onnx.wasm.numThreads = 1;
  env.backends.onnx.wasm.proxy = false;
}

export type WorkerRequest =
  { type: "load" } | { type: "embed"; id: number; text: string };

export type WorkerResponse =
  | { type: "progress"; file: string; loaded: number; total: number }
  | { type: "ready" }
  | { type: "vector"; id: number; vector: number[] }
  | { type: "error"; id?: number; message: string };

const post = (message: WorkerResponse) => self.postMessage(message);

let extractor: ReturnType<typeof loadPipeline> | undefined;

/**
 * Downloads each model file exactly once into the cache Transformers.js
 * reads first ("transformers-cache"). Left to itself, Transformers.js 4
 * fetched the 21.9 MB weights twice in parallel (measured in Step 20).
 */
async function warmCache() {
  if (typeof caches === "undefined") return;
  const cache = await caches.open("transformers-cache");
  const base = new URL(
    `${MODEL_BASE_PATH}${EMBED_MODEL.id}/`,
    self.location.href,
  );
  await Promise.all(
    EMBED_MODEL.files.map(async (file) => {
      const url = new URL(file, base).href;
      if (await cache.match(url)) return;
      const response = await fetch(url);
      if (!response.ok || !response.body) {
        throw new Error(`Model file ${file}: HTTP ${response.status}`);
      }
      const total = Number(response.headers.get("content-length")) || 0;
      const reader = response.body.getReader();
      const chunks: Uint8Array[] = [];
      let loaded = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value);
        loaded += value.length;
        post({ type: "progress", file, loaded, total: total || loaded });
      }
      await cache.put(
        url,
        new Response(new Blob(chunks as BlobPart[]), {
          headers: response.headers,
        }),
      );
    }),
  );
}

async function loadPipeline() {
  await warmCache();
  return pipeline("feature-extraction", EMBED_MODEL.id, {
    dtype: EMBED_MODEL.dtype,
    device: "wasm",
  });
}

self.onmessage = async (event: MessageEvent<WorkerRequest>) => {
  const request = event.data;
  try {
    extractor ??= loadPipeline();
    const model = await extractor;
    if (request.type === "load") {
      post({ type: "ready" });
      return;
    }
    // Queries take the model card's prefix; documents were embedded without.
    const output = await model(EMBED_MODEL.queryPrefix + request.text, {
      pooling: EMBED_MODEL.pooling,
      normalize: true,
    });
    post({
      type: "vector",
      id: request.id,
      vector: Array.from(output.data as Float32Array),
    });
  } catch (error) {
    post({
      type: "error",
      id: request.type === "embed" ? request.id : undefined,
      message: error instanceof Error ? error.message : String(error),
    });
  }
};
