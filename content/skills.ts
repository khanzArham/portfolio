import type { z } from "zod";
import type { skillsSchema } from "@/lib/content/schemas";

// Placeholder until Step 14. Names must match dossier `stack` entries
// (case-insensitive); that match is what links a skill to its evidence.
export const skills = [
  { name: "TypeScript", category: "Languages" },
  { name: "Python", category: "Languages" },
] satisfies z.input<typeof skillsSchema>;
