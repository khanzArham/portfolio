import { ImageResponse } from "next/og";
import { OG_SIZE, OgFrame, ogFonts } from "@/lib/og";
import { site } from "@/lib/site";
import { lightTokens as t } from "@/lib/tokens";

// Site default share card: name, role and positioning line.
export const alt = `${site.owner}, ${site.role}`;
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    <OgFrame>
      <div
        style={{
          display: "flex",
          fontFamily: "IBM Plex Mono",
          fontSize: 30,
          color: t.muted,
        }}
      >
        {site.role}
      </div>
      <div
        style={{
          display: "flex",
          fontFamily: "Fraunces",
          fontSize: 96,
          lineHeight: 1.05,
        }}
      >
        {site.owner}
      </div>
      <div style={{ display: "flex", fontSize: 36, maxWidth: 960 }}>
        {site.positioning}
      </div>
    </OgFrame>,
    { ...size, fonts: await ogFonts() },
  );
}
