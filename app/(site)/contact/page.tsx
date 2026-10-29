import { site } from "@/lib/site";

// Placeholder until Step 10 adds the contact form.
export default function ContactPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Contact
      </h1>
      <p className="mt-4 text-muted">
        Email{" "}
        <a
          href={`mailto:${site.email}`}
          className="text-ink underline underline-offset-4"
        >
          {site.email}
        </a>
        .
      </p>
    </>
  );
}
