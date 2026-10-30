// @vitest-environment node
import { describe, expect, it } from "vitest";
import { buildJourney } from "@/lib/journey";

const education = [
  {
    institution: "University of Lahore",
    degree: "BS Computer Science",
    period: { start: "2023-09", end: "present" },
  },
];
const experience = [
  {
    organization: "Org B",
    role: "Intern",
    period: { start: "2026-08", end: "2026-10" },
    achievements: ["x"],
  },
  {
    organization: "Org A",
    role: "Designer",
    period: { start: "2022-12", end: "2023-01" },
    achievements: ["y"],
  },
];
const inProgress = [{ name: "CareerSyncAI", status: "In design" }];

describe("buildJourney", () => {
  it("builds Origin, Build and Field in the plan's order, without Lab", () => {
    const stations = buildJourney({
      education,
      experience,
      dossiers: [],
      inProgress,
    });
    expect(stations.map((s) => s.name)).toEqual(["Origin", "Build", "Field"]);
  });

  it("summarizes each station from content", () => {
    const [origin, build, field] = buildJourney({
      education,
      experience,
      dossiers: [],
      inProgress,
    });
    expect(origin.summary).toBe("BS Computer Science · 2023–present");
    expect(build.summary).toBe("1 project in progress");
    expect(field.summary).toBe("2 roles · 2022–2026");
  });

  it("shows unpublished projects honestly, without a link", () => {
    const build = buildJourney({
      education,
      experience,
      dossiers: [],
      inProgress,
    })[1];
    expect(build.items).toEqual([{ title: "CareerSyncAI", meta: "In design" }]);
  });

  it("switches Build to case files once a dossier ships", () => {
    const build = buildJourney({
      education,
      experience,
      inProgress,
      dossiers: [
        {
          slug: "careersyncai",
          caseNumber: "CASE-001",
          title: "CareerSyncAI",
          summary: "s",
          status: "in-progress",
          period: { start: "2026-01", end: "present" },
          tags: ["AI"],
        },
      ],
    })[1];
    expect(build.summary).toBe("1 case file");
    expect(build.items).toEqual([
      {
        title: "CareerSyncAI (CASE-001)",
        meta: "In progress",
        href: "/projects/careersyncai",
      },
    ]);
  });
});
