import { getDossiers } from "@/lib/content/dossiers";
import { buildLlmsTxt } from "@/lib/llms";
import { hasResume } from "@/lib/public-files";

// Generated once at build time (GET handlers are dynamic by default).
export const dynamic = "force-static";

export function GET() {
  const body = buildLlmsTxt({
    dossiers: getDossiers(),
    // Listed only once public/resume.pdf exists.
    hasResume: hasResume(),
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
