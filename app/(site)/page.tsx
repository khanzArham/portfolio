import { site } from "@/lib/site";

// Placeholder until Step 9 builds the hero and featured dossiers.
export default function HomePage() {
  return (
    <>
      <h1 className="font-display text-5xl font-semibold tracking-tight">
        {site.owner}
      </h1>
      <p className="mt-4 text-lg text-muted">AI Engineer (in training)</p>
    </>
  );
}
