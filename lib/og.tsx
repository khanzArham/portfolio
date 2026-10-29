import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ReactNode } from "react";
import type { Dossier } from "@/lib/content/dossiers";
import { site } from "@/lib/site";
import { lightTokens as t } from "@/lib/tokens";

// Shared pieces for the next/og share images (1200 x 630, plan §6.3).
// next/og renders flexbox-only inline styles, not Tailwind classes.

export const OG_SIZE = { width: 1200, height: 630 };

/**
 * Up to two callouts for a dossier card: evaluation metrics first (plan
 * §6.3), then measured performance. Real numbers only; none if absent.
 */
export function ogKeyMetrics(
  dossier: Pick<Dossier, "evaluation" | "performance">,
) {
  const format = (value: number, unit?: string) =>
    unit ? `${value} ${unit}` : String(value);
  return [
    ...(dossier.evaluation?.metrics ?? []).map((m) => ({
      label: m.name,
      value: format(m.value, m.unit),
    })),
    ...(dossier.performance ?? []).map((p) => ({
      label: p.name,
      value: format(p.value, p.unit),
    })),
  ].slice(0, 2);
}

/**
 * Bundled TTFs (next/og cannot use woff2 or the next/font files). Each path
 * is written out in full so Turbopack's file tracing sees exactly these
 * three files, not the whole folder.
 */
export async function ogFonts() {
  const [display, sans, mono] = await Promise.all([
    readFile(
      path.join(process.cwd(), "assets", "fonts", "Fraunces-SemiBold.ttf"),
    ),
    readFile(
      path.join(process.cwd(), "assets", "fonts", "IBMPlexSans-Regular.ttf"),
    ),
    readFile(
      path.join(process.cwd(), "assets", "fonts", "IBMPlexMono-Medium.ttf"),
    ),
  ]);
  return [
    {
      name: "Fraunces",
      data: display,
      weight: 600 as const,
      style: "normal" as const,
    },
    {
      name: "IBM Plex Sans",
      data: sans,
      weight: 400 as const,
      style: "normal" as const,
    },
    {
      name: "IBM Plex Mono",
      data: mono,
      weight: 500 as const,
      style: "normal" as const,
    },
  ];
}

const domain = new URL(site.url).host;

/** Paper card with the owner in the top bar and the domain at the bottom. */
export function OgFrame({
  stamp,
  children,
  footer,
}: {
  stamp?: string;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: 64,
        backgroundColor: t.paper,
        color: t.ink,
        fontFamily: "IBM Plex Sans",
        borderTop: `12px solid ${t.accent}`,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          fontFamily: "IBM Plex Mono",
          fontSize: 24,
        }}
      >
        {stamp ? (
          <div
            style={{
              display: "flex",
              backgroundColor: t.accent,
              color: t["on-accent"],
              padding: "6px 16px",
              borderRadius: 6,
              fontSize: 30,
            }}
          >
            {stamp}
          </div>
        ) : (
          <div style={{ display: "flex" }} />
        )}
        <div style={{ display: "flex", color: t.muted, letterSpacing: 2 }}>
          {site.owner.toUpperCase()}
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {children}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          gap: 24,
          fontFamily: "IBM Plex Mono",
          fontSize: 22,
          color: t.muted,
        }}
      >
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          {footer}
        </div>
        <div style={{ display: "flex" }}>{domain}</div>
      </div>
    </div>
  );
}

export function OgTag({ children }: { children: ReactNode }) {
  return (
    <div
      style={{
        display: "flex",
        border: `2px solid ${t.muted}`,
        borderRadius: 6,
        padding: "4px 12px",
      }}
    >
      {children}
    </div>
  );
}
