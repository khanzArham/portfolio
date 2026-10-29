import { ImageResponse } from "next/og";
import { notFound } from "next/navigation";
import { getDossier, getDossiers } from "@/lib/content/dossiers";
import { OG_SIZE, OgFrame, OgTag, ogFonts, ogKeyMetrics } from "@/lib/og";
import { lightTokens as t } from "@/lib/tokens";

// Dossier share card (plan §6.3): case number, title, summary, two key
// metrics and stack tags. Generated at build time for every dossier.
export const alt = "Case file card: case number, title, key metrics and stack";
export const size = OG_SIZE;
export const contentType = "image/png";
export const dynamicParams = false;

export function generateStaticParams() {
  return getDossiers().map((d) => ({ slug: d.slug }));
}

const MAX_STACK_TAGS = 5;

export default async function Image({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const dossier = getDossier(slug);
  if (!dossier) notFound();

  const metrics = ogKeyMetrics(dossier);

  return new ImageResponse(
    <OgFrame
      stamp={dossier.caseNumber}
      footer={dossier.stack.slice(0, MAX_STACK_TAGS).map((item) => (
        <OgTag key={item}>{item}</OgTag>
      ))}
    >
      <div
        style={{
          display: "flex",
          fontFamily: "Fraunces",
          fontSize: dossier.title.length > 28 ? 64 : 80,
          lineHeight: 1.05,
        }}
      >
        {dossier.title}
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 32,
          color: t.muted,
          maxWidth: 1000,
          lineClamp: 2,
        }}
      >
        {dossier.summary}
      </div>
      {metrics.length > 0 && (
        <div style={{ display: "flex", gap: 56, marginTop: 8 }}>
          {metrics.map((m) => (
            <div
              key={m.label}
              style={{ display: "flex", flexDirection: "column" }}
            >
              <div
                style={{
                  display: "flex",
                  fontFamily: "IBM Plex Mono",
                  fontSize: 22,
                  color: t.muted,
                }}
              >
                {m.label.toUpperCase()}
              </div>
              <div
                style={{
                  display: "flex",
                  fontFamily: "Fraunces",
                  fontSize: 56,
                }}
              >
                {m.value}
              </div>
            </div>
          ))}
        </div>
      )}
    </OgFrame>,
    { ...size, fonts: await ogFonts() },
  );
}
