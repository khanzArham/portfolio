import Link from "next/link";
import { SiteShell } from "@/components/layout/site-shell";

// Rendered for unknown URLs and notFound(), with the normal site chrome.
export default function NotFound() {
  return (
    <SiteShell>
      <div className="flex flex-col gap-4">
        <p className="font-mono text-sm text-muted">404</p>
        <h1 className="font-display text-4xl font-semibold tracking-tight">
          Page not found
        </h1>
        <p className="text-muted">This file is not in the archive.</p>
        <p>
          <Link href="/" className="underline underline-offset-4">
            Back to home
          </Link>
        </p>
      </div>
    </SiteShell>
  );
}
