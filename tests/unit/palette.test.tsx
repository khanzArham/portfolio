import { render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { CommandPalette } from "@/components/command-palette/command-palette";
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

    const dialog = screen.getByRole("dialog", { name: "Command palette" });
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
    expect(screen.getByRole("dialog")).toBeInTheDocument();
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
        { name: "React", dossiers: ["order-tracker"] },
        { name: "Docker", dossiers: [] },
      ],
    },
  ];
  const summaries: DossierSummary[] = dossiers.map((d) => ({
    ...d,
    summary: "",
    status: "shipped",
    period: { start: "2026", end: "2026" },
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

  it("says so when no dossier uses a skill yet", async () => {
    const user = userEvent.setup();
    render(<SkillEvidence groups={groups} dossiers={summaries} />);
    await user.click(screen.getByRole("button", { name: /Docker/ }));
    expect(screen.getByRole("status")).toHaveTextContent(
      "No published dossier uses Docker yet.",
    );
  });
});
