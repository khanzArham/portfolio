import { MDXRemote } from "next-mdx-remote-client/rsc";
import { mdxComponents } from "@/components/dossier/mdx-components";

/** A dossier section's MDX body. The tab or accordion header titles it. */
export function MdxBody({ source }: { source: string }) {
  return (
    <div className="max-w-prose">
      {/* No onError: a broken section fails the build instead of rendering. */}
      <MDXRemote source={source} components={mdxComponents} />
    </div>
  );
}
