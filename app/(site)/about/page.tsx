import Link from "next/link";
import { site } from "@/lib/site";

// The resume download is added with the confirmed resume in Step 14.
export default function AboutPage() {
  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        About
      </h1>
      <div className="flex max-w-prose flex-col gap-4 text-lg leading-8">
        {site.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
      <p>
        <Link href="/contact" className="underline underline-offset-4">
          Get in touch
        </Link>
      </p>
    </div>
  );
}
