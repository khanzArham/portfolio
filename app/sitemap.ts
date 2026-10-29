import type { MetadataRoute } from "next";
import { getDossiers } from "@/lib/content/dossiers";
import { site } from "@/lib/site";

// /lab is left out until it has demos (plan §10); it is also noindex.
const STATIC_ROUTES = [
  "/",
  "/projects",
  "/experience",
  "/skills",
  "/about",
  "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    ...STATIC_ROUTES.map((route) => ({ url: `${site.url}${route}` })),
    ...getDossiers().map((d) => ({
      url: `${site.url}/projects/${d.slug}`,
      lastModified: d.updated,
    })),
  ];
}
