import { ContactForm } from "@/components/contact/contact-form";
import { site } from "@/lib/site";

export default function ContactPage() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Contact
        </h1>
        <p className="max-w-prose text-muted">
          Send a message below, or email{" "}
          <a
            href={`mailto:${site.email}`}
            className="text-ink underline underline-offset-4"
          >
            {site.email}
          </a>
          .
        </p>
      </div>
      <ContactForm />
    </div>
  );
}
