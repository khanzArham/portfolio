import { Suspense } from "react";
import {
  DossierGrid,
  ProjectFilter,
} from "@/components/dossier/project-filter";
import { getDossiers, toSummary } from "@/lib/content/dossiers";

export default function ProjectsPage() {
  const dossiers = getDossiers().map(toSummary);

  return (
    <div className="flex flex-col gap-8">
      <h1 className="font-display text-4xl font-semibold tracking-tight">
        Work
      </h1>
      {dossiers.length === 0 ? (
        <p className="text-muted">Project dossiers are being prepared.</p>
      ) : (
        // The filter reads ?tag= in the browser; until then (and without
        // JavaScript) the full list renders from the static HTML.
        <Suspense fallback={<DossierGrid dossiers={dossiers} />}>
          <ProjectFilter dossiers={dossiers} />
        </Suspense>
      )}
    </div>
  );
}
