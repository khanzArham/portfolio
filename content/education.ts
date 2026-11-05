import type { z } from "zod";
import type { educationSchema } from "@/lib/content/schemas";

// Source: Arham_Zahid_Khan_Software_AI_Engineer_CV (Nov 2026).
export const education = [
  {
    institution: "University of Lahore",
    degree: "BS Computer Science",
    period: { start: "2023-09", end: "present" },
    details: [
      "Final year (7th semester).",
      "Core focus: Object-Oriented Programming, Data Structures & Algorithms, Database Management Systems, Web Development, Software Engineering.",
    ],
  },
] satisfies z.input<typeof educationSchema>;
