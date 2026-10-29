import { notFound } from "next/navigation";
import { CaseFile } from "@/components/dossier/case-file";
import { getDossier, getDossiers } from "@/lib/content/dossiers";
import { pageMetadata } from "@/lib/seo";

// Every dossier is generated at build time; any other slug is a 404.
export const dynamicParams = false;

export function generateStaticParams() {
  return getDossiers().map((d) => ({ slug: d.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const dossier = getDossier(slug);
  if (!dossier) return {};
  return pageMetadata({
    title: `${dossier.title} (${dossier.caseNumber})`,
    description: dossier.summary,
    path: `/projects/${dossier.slug}`,
    ownOgImage: true,
  });
}

export default async function DossierPage({
  params,
}: PageProps<"/projects/[slug]">) {
  const { slug } = await params;
  const dossier = getDossier(slug);
  if (!dossier) notFound();

  return <CaseFile dossier={dossier} />;
}
