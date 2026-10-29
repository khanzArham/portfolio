import type { z } from "zod";
import type { educationSchema } from "@/lib/content/schemas";

// Placeholder until Step 14 adds the real degree and dates.
export const education = [
  {
    institution: "Placeholder university",
    degree: "Placeholder degree",
    period: { start: "2022-09", end: "present" },
  },
] satisfies z.input<typeof educationSchema>;
