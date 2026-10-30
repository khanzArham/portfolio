import type { z } from "zod";
import type { skillsSchema } from "@/lib/content/schemas";

// Source: Arham_Zahid_Khan_Generic_Software_Developer_CV_v2 (Oct 2026),
// "Technical Skills". Design tools are left out (target roles: AI engineer
// only). Names must match dossier `stack` entries (case-insensitive); that
// match links a skill to its evidence.
export const skills = [
  { name: "Python", category: "Languages" },
  { name: "TypeScript", category: "Languages" },
  { name: "JavaScript", category: "Languages" },
  { name: "SQL", category: "Languages" },
  { name: "C++", category: "Languages" },

  { name: "Google Gemini API", category: "ML & AI" },
  { name: "Anthropic Claude", category: "ML & AI" },
  { name: "Claude Code", category: "ML & AI" },
  { name: "Claude Skills & Plugins", category: "ML & AI" },
  { name: "MCP (Model Context Protocol)", category: "ML & AI" },
  { name: "Prompt Engineering & Contracts", category: "ML & AI" },
  { name: "Structured JSON Output", category: "ML & AI" },
  { name: "Ground-Truth Eval Suites", category: "ML & AI" },
  { name: "AI Automation Workflows", category: "ML & AI" },

  { name: "FastAPI", category: "Web" },
  { name: "REST APIs", category: "Web" },
  { name: "JWT Authentication", category: "Web" },
  { name: "React", category: "Web" },
  { name: "Next.js", category: "Web" },
  { name: "Tailwind CSS", category: "Web" },
  { name: "Firebase", category: "Web" },

  { name: "PostgreSQL", category: "Data & Tools" },
  { name: "MySQL", category: "Data & Tools" },
  { name: "MS SQL", category: "Data & Tools" },
  { name: "Alembic", category: "Data & Tools" },
  { name: "Docker", category: "Data & Tools" },
  { name: "Git", category: "Data & Tools" },
  { name: "GitHub", category: "Data & Tools" },
  { name: "Swagger / OpenAPI", category: "Data & Tools" },
  { name: "Linux", category: "Data & Tools" },
] satisfies z.input<typeof skillsSchema>;
