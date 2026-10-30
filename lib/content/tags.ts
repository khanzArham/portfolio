// Kept free of Zod so client components can import it without bundling Zod.

export const TAGS = ["ML", "AI", "RAG", "Web", "Software", "Design"] as const;
export type Tag = (typeof TAGS)[number];

/** Dossiers with any of these tags are AI projects (plan §4.1-4.2). */
export const AI_TAGS: readonly Tag[] = ["ML", "AI", "RAG"];
