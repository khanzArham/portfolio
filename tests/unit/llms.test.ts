// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildLlmsTxt, type LlmsDossier } from "@/lib/llms";
import { site } from "@/lib/site";

const dossiers: LlmsDossier[] = [
  {
    slug: "roadguard",
    caseNumber: "CASE-004",
    title: "RoadGuard",
    summary: "Pothole detection from dashcam frames.",
    status: "shipped",
    stack: ["PyTorch", "FastAPI"],
  },
  {
    slug: "order-tracker",
    caseNumber: "CASE-002",
    title: "Order Tracker",
    summary: "Order tracking app.",
    status: "in-progress",
    stack: ["React"],
  },
];

describe("buildLlmsTxt", () => {
  const text = buildLlmsTxt({ dossiers, hasResume: false });

  it("follows the llmstxt.org shape: H1, summary quote, sections", () => {
    const lines = text.split("\n");
    expect(lines[0]).toBe("# Arham Zahid Khan");
    expect(lines[2]).toBe(`> ${site.positioning}`);
    expect(text).toContain("## Sections");
    expect(text).toContain("## Dossiers");
    expect(text).toContain("## Contact");
  });

  it("lists every dossier with link, summary, status and stack", () => {
    expect(text).toContain(
      "- [RoadGuard (CASE-004)](https://portfolio-khanzarham.vercel.app/projects/roadguard): Pothole detection from dashcam frames. Status: Shipped. Stack: PyTorch, FastAPI.",
    );
    expect(text).toContain("[Order Tracker (CASE-002)]");
    expect(text).toContain("Status: In progress.");
  });

  it("says so when no dossiers are published", () => {
    expect(buildLlmsTxt({ dossiers: [], hasResume: false })).toContain(
      "- No dossiers published yet.",
    );
  });

  it("lists the resume only when it exists", () => {
    expect(text).not.toContain("resume.pdf");
    expect(buildLlmsTxt({ dossiers, hasResume: true })).toContain(
      "[Resume (PDF)](https://portfolio-khanzarham.vercel.app/resume.pdf)",
    );
  });

  it("uses only absolute https or mailto links", () => {
    const links = [...text.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
    expect(links.length).toBeGreaterThan(0);
    for (const link of links) expect(link).toMatch(/^(https:\/\/|mailto:)/);
  });

  it("contains no private details", () => {
    expect(text).not.toMatch(/\+?\d[\d\s()-]{8,}\d/); // phone numbers
    expect(text.toLowerCase()).not.toMatch(/address|phone|whatsapp/);
  });
});
