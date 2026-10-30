import type { z } from "zod";
import type { educationSchema } from "@/lib/content/schemas";

// Source: Arham_Zahid_Khan_Generic_Software_Developer_CV_v2 (Oct 2026).
export const education = [
  {
    institution: "University of Lahore",
    degree: "BS Computer Science",
    period: { start: "2023-09", end: "present" },
    details: [
      "Final year (7th semester).",
      "Relevant coursework: Object-Oriented Programming, Data Structures & Algorithms, Database Management Systems, Web Development, Operating Systems, Computer Networks.",
    ],
  },
] satisfies z.input<typeof educationSchema>;
