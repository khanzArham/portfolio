import { ContactForm } from "@/components/contact/contact-form";
import { pageMetadata } from "@/lib/seo";
import { site } from "@/lib/site";

export const metadata = pageMetadata({
  title: "Contact",
  description: `Contact ${site.owner} about a role, or send feedback on the site or a project.`,
  path: "/contact",
});

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Contact
        </h1>
        {/* Left-aligned: the long email address would stretch a justified line. */}
        <p className="max-w-2xl text-left text-muted">
          Have a project in mind, a job opportunity, or feedback? Feel free to
          reach out directly via email at{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-ink underline underline-offset-4"
          >
            {site.email}
          </a>{" "}
          or send a message below.
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
