import type { MDXComponents } from "next-mdx-remote-client/rsc";

// Section bodies sit under an h2, so MDX headings start at h3.
export const mdxComponents: MDXComponents = {
  h3: (props) => (
    <h3
      className="mt-8 font-display text-xl font-semibold first:mt-0"
      {...props}
    />
  ),
  h4: (props) => <h4 className="mt-6 font-semibold" {...props} />,
  p: (props) => <p className="mt-4 leading-7 first:mt-0" {...props} />,
  ul: (props) => <ul className="mt-4 list-disc space-y-2 pl-6" {...props} />,
  ol: (props) => <ol className="mt-4 list-decimal space-y-2 pl-6" {...props} />,
  a: (props) => (
    <a className="underline underline-offset-4 hover:text-muted" {...props} />
  ),
  blockquote: (props) => (
    <blockquote
      className="mt-4 border-l-2 border-ink/30 pl-4 text-muted"
      {...props}
    />
  ),
  pre: (props) => (
    <pre
      className="mt-4 overflow-x-auto rounded-md bg-surface p-4 font-mono text-sm"
      {...props}
    />
  ),
  code: (props) => <code className="font-mono text-[0.9em]" {...props} />,
  hr: () => <hr className="my-8 border-ink/10" />,
};
