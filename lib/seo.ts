import type { Metadata } from "next";
import { site } from "@/lib/site";

export const defaultTitle = `${site.owner} · ${site.role}`;

type PageMetadataInput = {
  /** Page title; the root layout adds " · {owner}". Omit for the home page. */
  title?: string;
  description: string;
  /** Route path, e.g. "/projects". Used for the canonical URL. */
  path: string;
  /** Keep the page out of search results (plan §10: unfinished Lab). */
  noIndex?: boolean;
};

/** Unique title, description, canonical URL and social tags per page. */
export function pageMetadata({
  title,
  description,
  path,
  noIndex,
}: PageMetadataInput): Metadata {
  const fullTitle = title ? `${title} · ${site.owner}` : defaultTitle;
  return {
    ...(title && { title }),
    description,
    alternates: { canonical: path },
    openGraph: {
      title: fullTitle,
      description,
      url: path,
      siteName: site.owner,
      locale: "en_US",
      type: "website",
    },
    twitter: { card: "summary_large_image", title: fullTitle, description },
    ...(noIndex && { robots: { index: false, follow: true } }),
  };
}

/** schema.org Person for the home and about pages (plan §7.3). */
export const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: site.owner,
  url: site.url,
  jobTitle: site.role,
  description: site.positioning,
  sameAs: [site.social.github, site.social.linkedin],
};

/**
 * JSON for a <script type="application/ld+json"> tag. "<" is escaped so a
 * value can never close the script element (Next.js JSON-LD guide).
 */
export function jsonLdScript(data: object) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}
