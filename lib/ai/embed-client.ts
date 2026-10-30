"use client";

import type { WorkerRequest, WorkerResponse } from "@/lib/ai/embed.worker";

// Main-thread side of the embedding worker. Every failure (no Worker, no
// WebAssembly, blocked download, timeout, model error) resolves to null, so
// the search UI can fall back to keyword search (plan §6.6).

export type Embedder = {
  embed: (text: string) => Promise<number[] | null>;
  dispose: () => void;
};

const LOAD_TIMEOUT_MS = 120_000;
const EMBED_TIMEOUT_MS = 10_000;

export function loadEmbedder({
  onProgress,
}: {
  /** Fraction 0-1 of the one-time download. */
  onProgress?: (fraction: number) => void;
} = {}): Promise<Embedder | null> {
  if (typeof Worker === "undefined" || typeof WebAssembly === "undefined") {
    return Promise.resolve(null);
  }

  let worker: Worker;
  try {
    worker = new Worker(new URL("./embed.worker.ts", import.meta.url), {
      type: "module",
    });
  } catch {
    return Promise.resolve(null);
  }

  const files = new Map<string, { loaded: number; total: number }>();
  const pending = new Map<number, (vector: number[] | null) => void>();
  let nextId = 0;

  const send = (request: WorkerRequest) => worker.postMessage(request);

  return new Promise((resolve) => {
    let settled = false;
    const finish = (embedder: Embedder | null) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      if (!embedder) worker.terminate();
      resolve(embedder);
    };
    const timer = setTimeout(() => finish(null), LOAD_TIMEOUT_MS);

    const embedder: Embedder = {
      embed: (text) =>
        new Promise((done) => {
          const id = nextId++;
          const timeout = setTimeout(() => {
            pending.delete(id);
            done(null);
          }, EMBED_TIMEOUT_MS);
          pending.set(id, (vector) => {
            clearTimeout(timeout);
            done(vector);
          });
          send({ type: "embed", id, text });
        }),
      dispose: () => worker.terminate(),
    };

    worker.onmessage = (event: MessageEvent<WorkerResponse>) => {
      const message = event.data;
      if (message.type === "progress") {
        files.set(message.file, message);
        const totals = [...files.values()];
        const loaded = totals.reduce((sum, f) => sum + f.loaded, 0);
        const total = totals.reduce((sum, f) => sum + f.total, 0);
        if (total > 0) onProgress?.(loaded / total);
      } else if (message.type === "ready") {
        onProgress?.(1);
        finish(embedder);
      } else if (message.type === "vector") {
        pending.get(message.id)?.(message.vector);
        pending.delete(message.id);
      } else if (message.id !== undefined) {
        pending.get(message.id)?.(null);
        pending.delete(message.id);
      } else {
        finish(null);
      }
    };
    worker.onerror = () => finish(null);

    send({ type: "load" });
  });
}
