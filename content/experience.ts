import type { z } from "zod";
import type { experienceSchema } from "@/lib/content/schemas";

// Source: Arham_Zahid_Khan_Generic_Software_Developer_CV_v2 (Oct 2026).
// Only what the CV states.
export const experience = [
  {
    organization: "Developers Hub",
    role: "AI Automation & Prompt Engineer Intern",
    period: { start: "2026-08", end: "2026-10" },
    location: "Lahore",
    achievements: [
      "Built and tested AI-driven automated workflows during a 10-week internship focused on LLM routing, JSON validation and error retries.",
      "Authored structured prompt contracts, system prompts and Claude skills defining explicit task context, output schemas and fallback behaviors.",
      "Built evaluation suites covering edge cases, malformed inputs and prompt-injection risks, and logged failures systematically by stage.",
      "Engineered interactive clarification loops that let agents ask follow-up questions when inputs were incomplete.",
      "Documented workflows, test results and failure logs for team reuse and maintainability.",
    ],
  },
  {
    organization: "NIAIS (National Initiative for AI & Security)",
    role: "Graphic Design Intern",
    period: { start: "2022-12", end: "2023-01" },
    location: "Lahore",
    achievements: [
      "Designed digital banners and visual content for national AI awareness campaigns.",
      "Delivered creative assets on tight deadlines while keeping branding consistent across all campaign materials.",
    ],
  },
] satisfies z.input<typeof experienceSchema>;
