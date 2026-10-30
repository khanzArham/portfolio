// @vitest-environment node
import fs from "node:fs";
import path from "node:path";
import { expect, it } from "vitest";
import { lightTokens } from "@/lib/tokens";

it("lib/tokens.ts matches the light values in styles/tokens.css", () => {
  const css = fs.readFileSync(
    path.join(process.cwd(), "styles", "tokens.css"),
    "utf8",
  );
  // Match the block openings: the file's header comment mentions both names.
  const theme = css.slice(css.indexOf("@theme {"), css.indexOf("\n.dark {"));
  const fromCss = Object.fromEntries(
    [...theme.matchAll(/--color-([a-z0-9-]+):\s*(#[0-9a-f]{6})/gi)].map(
      ([, name, value]) => [name, value.toLowerCase()],
    ),
  );
  expect(fromCss).toEqual(lightTokens);
});
