import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { ContactForm } from "@/components/contact/contact-form";

const sendContact = vi.hoisted(() => vi.fn());
vi.mock("@/app/actions/contact", () => ({ sendContact }));

describe("ContactForm", () => {
  it("labels every field", () => {
    render(<ContactForm />);
    for (const label of ["Name", "Email", "Message"]) {
      expect(screen.getByLabelText(label)).toBeInTheDocument();
    }
  });

  it("shows linked errors and does not submit invalid input", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText("Email"), "not-an-email");
    await user.click(screen.getByRole("button", { name: "Send message" }));

    const email = screen.getByLabelText("Email");
    expect(email).toHaveAttribute("aria-invalid", "true");
    expect(email).toHaveAccessibleDescription("Enter a valid email address");
    expect(screen.getByLabelText("Name")).toHaveAccessibleDescription(
      "Enter your name",
    );
    expect(sendContact).not.toHaveBeenCalled();
  });

  // ByRole queries respect aria-hidden (ByLabelText does not), so this
  // checks what assistive tech actually exposes.
  it("keeps the honeypot out of the accessibility tree", () => {
    render(<ContactForm />);
    expect(screen.getAllByRole("textbox")).toHaveLength(3);
    expect(
      screen.queryByRole("textbox", { name: "Leave this field empty" }),
    ).not.toBeInTheDocument();
  });
});
