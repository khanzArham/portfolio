import type { z } from "zod";
import type { skillsSchema } from "@/lib/content/schemas";

// Source: Arham_Zahid_Khan_Generic_Software_Developer_CV_v2 (Oct 2026),
// "Technical Skills", plus VS Code, Vercel, HTML5 / CSS3, LangChain and
// CrewAI (owner, 2026-11-04), Pydantic from CareerSyncAI's design, and
// Postman, OOP and System Architecture from the Software & AI Engineer CV
// (Nov 2026). MS SQL is gone: that CV does not list it. Names must match dossier `stack` entries and
// role `skills` (case-insensitive); that match links a skill to its
// evidence. `implies` lists skills that using this one also shows, so
// work that lists MySQL is evidence for SQL too.
export const skills = [
  { name: "LangChain", category: "AI & LLM Orchestration" },
  { name: "CrewAI", category: "AI & LLM Orchestration", implies: ["Python"] },
  { name: "Google Gemini API", category: "AI & LLM Orchestration" },
  { name: "Anthropic Claude", category: "AI & LLM Orchestration" },
  {
    name: "Claude Code",
    category: "AI & LLM Orchestration",
    implies: ["Anthropic Claude"],
  },
  {
    name: "Claude Skills & Plugins",
    category: "AI & LLM Orchestration",
    implies: ["Anthropic Claude"],
  },
  { name: "MCP (Model Context Protocol)", category: "AI & LLM Orchestration" },
  {
    name: "Prompt Engineering & Contracts",
    category: "AI & LLM Orchestration",
  },
  { name: "Structured JSON Output", category: "AI & LLM Orchestration" },
  { name: "Ground-Truth Eval Suites", category: "AI & LLM Orchestration" },
  { name: "AI Automation Workflows", category: "AI & LLM Orchestration" },

  { name: "Python", category: "Backend & Databases" },
  {
    name: "FastAPI",
    category: "Backend & Databases",
    implies: ["Python", "REST APIs"],
  },
  { name: "Pydantic", category: "Backend & Databases", implies: ["Python"] },
  { name: "C++", category: "Backend & Databases" },
  { name: "SQL", category: "Backend & Databases" },
  { name: "MySQL", category: "Backend & Databases", implies: ["SQL"] },
  { name: "PostgreSQL", category: "Backend & Databases", implies: ["SQL"] },
  { name: "Firebase", category: "Backend & Databases" },
  { name: "Alembic", category: "Backend & Databases", implies: ["Python"] },
  { name: "JWT Authentication", category: "Backend & Databases" },

  {
    name: "React",
    category: "Frontend Development",
    implies: ["JavaScript", "HTML5 / CSS3"],
  },
  { name: "Next.js", category: "Frontend Development", implies: ["React"] },
  {
    name: "TypeScript",
    category: "Frontend Development",
    implies: ["JavaScript"],
  },
  { name: "JavaScript", category: "Frontend Development" },
  {
    name: "Tailwind CSS",
    category: "Frontend Development",
    implies: ["HTML5 / CSS3"],
  },
  { name: "HTML5 / CSS3", category: "Frontend Development" },

  { name: "Git", category: "Tools & Workflow" },
  { name: "GitHub", category: "Tools & Workflow", implies: ["Git"] },
  { name: "Postman", category: "Tools & Workflow" },
  { name: "VS Code", category: "Tools & Workflow" },
  { name: "REST APIs", category: "Tools & Workflow" },
  { name: "Vercel", category: "Tools & Workflow" },
  { name: "Docker", category: "Tools & Workflow" },
  {
    name: "Swagger / OpenAPI",
    category: "Tools & Workflow",
    implies: ["REST APIs"],
  },
  { name: "Linux", category: "Tools & Workflow" },

  { name: "Object-Oriented Programming", category: "Software Engineering" },
  { name: "System Architecture", category: "Software Engineering" },
] satisfies z.input<typeof skillsSchema>;
