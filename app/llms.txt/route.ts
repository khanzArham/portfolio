import fs from "node:fs";
import path from "node:path";
import { getDossiers } from "@/lib/content/dossiers";
import { buildLlmsTxt } from "@/lib/llms";

// Generated once at build time (GET handlers are dynamic by default).
export const dynamic = "force-static";

export function GET() {
  const body = buildLlmsTxt({
    dossiers: getDossiers(),
    // Listed only once the confirmed resume is added (Step 14).
    hasResume: fs.existsSync(path.join(process.cwd(), "public", "resume.pdf")),
  });

  return new Response(body, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
