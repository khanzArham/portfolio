import { render, screen, within } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { isActivePath } from "@/components/layout/nav-link";
import { site } from "@/lib/site";

vi.mock("next/navigation", () => ({
  usePathname: () => "/projects/sample-project",
}));

describe("Header", () => {
  it("links each nav item to its route", () => {
    render(<Header />);
    const nav = screen.getByRole("navigation", { name: "Main" });

    const expected = {
      Work: "/projects",
      Experience: "/experience",
      Skills: "/skills",
      About: "/about",
    };
    for (const [label, href] of Object.entries(expected)) {
      expect(within(nav).getByRole("link", { name: label })).toHaveAttribute(
        "href",
        href,
      );
    }
  });

  it("keeps the Lab out of navigation until it has content", () => {
    render(<Header />);
    expect(screen.queryByRole("link", { name: "Lab" })).not.toBeInTheDocument();
  });

  it("links the name home and the Contact button to /contact", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: site.owner })).toHaveAttribute(
      "href",
      "/",
    );
    expect(screen.getByRole("link", { name: "Contact" })).toHaveAttribute(
      "href",
      "/contact",
    );
  });

  it("marks the current section with aria-current", () => {
    render(<Header />);
    expect(screen.getByRole("link", { name: "Work" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Skills" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});

describe("isActivePath", () => {
  it.each([
    ["/projects", "/projects", true],
    ["/projects/sample-project", "/projects", true],
    ["/projects-archive", "/projects", false],
    ["/", "/projects", false],
    [null, "/projects", false],
  ])("pathname %s with href %s -> %s", (pathname, href, expected) => {
    expect(isActivePath(pathname, href)).toBe(expected);
  });
});

describe("Footer", () => {
  it("links to GitHub, LinkedIn and email", () => {
    render(<Footer />);
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      site.social.github,
    );
    expect(screen.getByRole("link", { name: "LinkedIn" })).toHaveAttribute(
      "href",
      site.social.linkedin,
    );
    expect(screen.getByRole("link", { name: "Email" })).toHaveAttribute(
      "href",
      `mailto:${site.email}`,
    );
  });
});
