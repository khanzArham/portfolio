import type { z } from "zod";
import type { experienceSchema } from "@/lib/content/schemas";

// Placeholder until Step 14 adds real roles, periods and achievements.
export const experience = [
  {
    organization: "Placeholder organization",
    role: "Placeholder role",
    period: { start: "2025-01", end: "present" },
    achievements: ["Placeholder: real achievements are added in Step 14."],
  },
] satisfies z.input<typeof experienceSchema>;
