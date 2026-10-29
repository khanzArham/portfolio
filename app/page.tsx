import { ThemeToggle } from "@/components/layout/theme-toggle";

// Temporary token preview. Step 6 replaces this page and moves the toggle
// into the header.
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-12">
      <div className="flex items-center justify-between">
        <p className="font-mono text-sm text-muted">Design tokens · preview</p>
        <ThemeToggle />
      </div>

      <h1 className="font-display text-5xl font-semibold tracking-tight">
        Field Dossier
      </h1>

      <p className="max-w-prose text-lg leading-8">
        Body text in IBM Plex Sans on warm paper. Headings use Fraunces, and
        metadata uses IBM Plex Mono.
      </p>

      <span className="self-start rounded-sm bg-accent px-2 py-1 font-mono text-sm font-medium text-on-accent">
        CASE-000
      </span>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-lg bg-surface p-4">
          <p className="font-mono text-xs text-muted">surface</p>
          <p className="mt-2 text-success">Success text sample</p>
        </div>
        <div className="rounded-lg bg-surface-raised p-4">
          <p className="font-mono text-xs text-muted">surface-raised</p>
          <p className="mt-2 text-danger">Danger text sample</p>
        </div>
      </div>
    </main>
  );
}
