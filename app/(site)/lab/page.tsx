import { pageMetadata } from "@/lib/seo";

// Placeholder. Kept out of navigation, the sitemap and search results until
// the Lab has working demos (plan §10, Phase 5).
export const metadata = pageMetadata({
  title: "Lab",
  description: "Experiments and demos.",
  path: "/lab",
  noIndex: true,
});

export default function LabPage() {
  return (
    <>
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Lab
      </h1>
      <p className="mt-4 text-muted">
        Experiments will appear here when ready.
      </p>
    </>
  );
}
