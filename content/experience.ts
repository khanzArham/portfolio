import type { z } from "zod";
import type { experienceSchema } from "@/lib/content/schemas";

// Source: Arham_Zahid_Khan_CV_Contour (Oct 2026). Only what the CV states;
// no location is listed for Developers Hub, so none is shown.
export const experience = [
  {
    organization: "Developers Hub",
    role: "AI Automation Intern",
    period: { start: "2026-08", end: "2026-10" },
    achievements: [
      "Built and tested AI-driven automated workflows during a 10-week internship focused on AI automation.",
    ],
  },
  {
    organization: "NIAIS (National Initiative for AI & Security)",
    role: "Graphic Design Intern",
    period: { start: "2022-12", end: "2023-01" },
    location: "Lahore",
    achievements: [
      "Designed digital banners and visual content for national AI awareness campaigns.",
      "Delivered work on deadlines while keeping branding consistent across all materials.",
    ],
  },
] satisfies z.input<typeof experienceSchema>;
