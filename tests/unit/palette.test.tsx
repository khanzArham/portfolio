import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { PaletteLauncher as CommandPalette } from "@/components/command-palette/palette-launcher";
import { SkillEvidence } from "@/components/skills/skill-evidence";
import type { DossierSummary } from "@/lib/content/dossiers";
import { isPaletteShortcut, matchesQuery } from "@/lib/palette";

const push = vi.fn();
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

vi.mock("@/lib/search/client", () => ({
  loadSearchIndex: async () => ({}),
  searchSite: async (_index: unknown, term: string) =>
    term === "firebase"
      ? [
          {
            url: "/experience",
            title: "Experience",
            passage: "Experience",
            snippet: "Built with Firebase",
            kind: "page",
          },
        ]
      : [],
}));

// cmdk measures the list and scrolls the selected item into view; jsdom has
// no layout.
beforeAll(() => {
  Element.prototype.scrollIntoView = () => {};
  globalThis.ResizeObserver ??= class {
    observe() {}
    unobserve() {}
    disconnect() {}
  };
});

const dossiers = [
  {
    slug: "order-tracker",
    caseNumber: "CASE-003",
    title: "Order Tracker",
    tags: ["Web" as const],
  },
  {
    slug: "brick-breaker",
    caseNumber: "CASE-001",
    title: "Brick Breaker",
    tags: ["Software" as const],
  },
];

const key = (init: KeyboardEventInit) => new KeyboardEvent("keydown", init);

describe("isPaletteShortcut", () => {
  it("accepts Ctrl + K and Cmd + K", () => {
    expect(isPaletteShortcut(key({ key: "k", ctrlKey: true }))).toBe(true);
    expect(isPaletteShortcut(key({ key: "k", metaKey: true }))).toBe(true);
    expect(
      isPaletteShortcut(key({ key: "K", ctrlKey: true, shiftKey: true })),
    ).toBe(true);
  });

  it("ignores K alone and other shortcuts", () => {
    expect(isPaletteShortcut(key({ key: "k" }))).toBe(false);
    expect(isPaletteShortcut(key({ key: "j", ctrlKey: true }))).toBe(false);
  });
});

describe("matchesQuery", () => {
  it("needs every word, in any order and case", () => {
    expect(matchesQuery("tracker ORD", "Order Tracker")).toBe(true);
    expect(matchesQuery("tracker game", "Order Tracker")).toBe(false);
    expect(matchesQuery("  ", "anything")).toBe(true);
  });
});

describe("CommandPalette", () => {
  it("opens from the trigger, searches, and selects with the keyboard", async () => {
    const user = userEvent.setup();
    render(<CommandPalette dossiers={dossiers} />);
    await user.click(screen.getByRole("button", { name: "Search" }));

    // The dialog is loaded on demand, so it appears a moment after the click.
    const dialog = await screen.findByRole("dialog", {
      name: "Command palette",
    });
    await user.keyboard("order");
    expect(within(dialog).getByText("Order Tracker")).toBeInTheDocument();
    expect(within(dialog).queryByText("Brick Breaker")).not.toBeInTheDocument();

    await user.keyboard("{Enter}");
    expect(push).toHaveBeenCalledWith("/projects/order-tracker");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("opens with Ctrl + K and returns focus to the trigger on Escape", async () => {
    const user = userEvent.setup();
    render(<CommandPalette dossiers={dossiers} />);
    const trigger = screen.getByRole("button", { name: "Search" });
    trigger.focus();

    await user.keyboard("{Control>}k{/Control}");
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it("adds results from the site index", async () => {
    const user = userEvent.setup();
    render(<CommandPalette dossiers={dossiers} />);
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.keyboard("firebase");

    const group = await screen.findByRole("group", { name: "Search results" });
    expect(within(group).getByText("Built with Firebase")).toBeInTheDocument();
  });

  it("copies the email address", async () => {
    const user = userEvent.setup();
    render(<CommandPalette dossiers={dossiers} />);
    await user.click(screen.getByRole("button", { name: "Search" }));
    await user.keyboard("copy{Enter}");

    await waitFor(() =>
      expect(screen.getByRole("status")).toHaveTextContent(
        "Email address copied.",
      ),
    );
  });
});

describe("SkillEvidence", () => {
  const groups = [
    {
      category: "Web",
      skills: [
        { name: "React", dossiers: ["order-tracker"], roles: [] },
        { name: "C++", dossiers: ["brick-breaker"], roles: [] },
        {
          name: "Prompt Engineering & Contracts",
          dossiers: [],
          roles: ["AI Intern, Developers Hub"],
        },
        { name: "Docker", dossiers: [], roles: [] },
        {
          name: "Vercel",
          dossiers: ["order-tracker", "brick-breaker"],
          roles: [],
        },
      ],
    },
  ];
  const summaries: DossierSummary[] = dossiers.map((d) => ({
    ...d,
    summary: "",
    status: "shipped",
    period: { start: "2026", end: "2026" },
    stack: ["React"],
    roleType: "solo",
  }));

  it("highlights the dossiers that used a skill, and clears on a second click", async () => {
    const user = userEvent.setup();
    render(<SkillEvidence groups={groups} dossiers={summaries} />);
    const react = screen.getByRole("button", { name: /React/ });

    await user.click(react);
    expect(react).toHaveAttribute("aria-pressed", "true");
    expect(screen.getByRole("status")).toHaveTextContent(
      "React was used in Order Tracker.",
    );
    expect(screen.getByText("Uses React")).toBeInTheDocument();

    await user.click(react);
    expect(screen.queryByText("Uses React")).not.toBeInTheDocument();
  });

  it("shows the newest case file by default, then only the matching work", async () => {
    const user = userEvent.setup();
    render(<SkillEvidence groups={groups} dossiers={summaries} />);
    const titles = () =>
      screen.getAllByRole("heading", { level: 3 }).map((h) => h.textContent);
    expect(titles()).toEqual([summaries[0].title]);

    await user.click(screen.getByRole("button", { name: "C++" }));
    expect(titles()).toEqual(["Brick Breaker"]);

    await user.click(screen.getByRole("button", { name: "C++" }));
    expect(titles()).toEqual([summaries[0].title]);
  });

  it("shows the roles that used a skill", async () => {
    const user = userEvent.setup();
    render(<SkillEvidence groups={groups} dossiers={summaries} />);
    await user.click(
      screen.getByRole("button", { name: "Prompt Engineering & Contracts" }),
    );
    expect(screen.getByRole("status")).toHaveTextContent(
      "Prompt Engineering & Contracts was used in the AI Intern, Developers Hub role.",
    );
    expect(
      screen.getByRole("link", { name: "AI Intern, Developers Hub" }),
    ).toHaveAttribute("href", "/experience#field-title");
  });

  it("calls an in-progress project planned, not used", async () => {
    const user = userEvent.setup();
    const withPlanned = summaries.map((d) =>
      d.slug === "order-tracker" ? { ...d, status: "in-progress" as const } : d,
    );
    render(<SkillEvidence groups={groups} dossiers={withPlanned} />);
    await user.click(screen.getByRole("button", { name: "Vercel" }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "Vercel was used in Brick Breaker, and is planned for Order Tracker.",
    );
    expect(screen.getByText("Planned: Vercel")).toBeInTheDocument();
    expect(screen.getByText("Uses Vercel")).toBeInTheDocument();
    // Used before planned, although Order Tracker comes first in the input.
    const titles = screen
      .getAllByRole("heading", { level: 3 })
      .map((h) => h.textContent);
    expect(titles.indexOf("Brick Breaker")).toBeLessThan(
      titles.indexOf("Order Tracker"),
    );
  });

  it("puts boxes after the fourth in the shorter column", () => {
    const box = (category: string, names: string[]) => ({
      category,
      skills: names.map((name) => ({ name, dossiers: [], roles: [] })),
    });
    const five = [
      box("Long", ["A very long skill name", "Another long skill name"]),
      box("Short", ["Go"]),
      box("Third", ["Rust"]),
      box("Fourth", ["Zig"]),
      box("Fifth", ["Lua"]),
    ];
    render(<SkillEvidence groups={five} dossiers={summaries} />);
    const column = (name: string) =>
      screen.getByRole("region", { name }).parentElement;
    expect(column("Third")).toBe(column("Long"));
    expect(column("Fourth")).toBe(column("Short"));
    // The left column is taller (the long box), so the fifth goes right.
    expect(column("Fifth")).toBe(column("Short"));
  });

  it("says so when no work shows a skill yet", async () => {
    const user = userEvent.setup();
    render(<SkillEvidence groups={groups} dossiers={summaries} />);
    await user.click(screen.getByRole("button", { name: /Docker/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "No published work shows Docker yet.",
    );
  });
});
