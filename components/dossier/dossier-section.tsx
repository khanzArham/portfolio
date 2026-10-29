import { MDXRemote } from "next-mdx-remote-client/rsc";
import type { ReactNode } from "react";
import { mdxComponents } from "@/components/dossier/mdx-components";

/** A titled dossier section. Pass MDX source, or children for custom UI. */
export function DossierSection({
  id,
  title,
  source,
  children,
}: {
  id: string;
  title: string;
  source?: string;
  children?: ReactNode;
}) {
  return (
    <section
      aria-labelledby={`${id}-title`}
      className="border-t border-ink/10 pt-8"
    >
      <h2 id={`${id}-title`} className="font-display text-2xl font-semibold">
        {title}
      </h2>
      <div className="mt-4 max-w-prose">
        {/* No onError: a broken section fails the build instead of rendering. */}
        {source !== undefined && (
          <MDXRemote source={source} components={mdxComponents} />
        )}
        {children}
      </div>
    </section>
  );
}
