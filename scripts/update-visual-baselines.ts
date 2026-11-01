/**
 * Visual baselines (`npm run test:visual:update`). Screenshots differ by
 * platform, so the baselines come from the same Playwright Linux image that
 * CI compares in. The container installs its own dependencies and builds
 * into anonymous volumes, leaving the local node_modules and .next alone.
 * Needs Docker running.
 */
import { spawnSync } from "node:child_process";
import { version } from "@playwright/test/package.json";

const image = `mcr.microsoft.com/playwright:v${version}-noble`;
const inContainer = [
  // The CPU runtime ships in onnxruntime-node; skip its CUDA download.
  "npm ci --no-audit --no-fund --onnxruntime-node-install=skip",
  "CONTENT_FIXTURES=1 npm run build",
  "CI=1 CONTACT_DRY_RUN=1 npx playwright test --project=visual --update-snapshots",
].join(" && ");

const result = spawnSync(
  "docker",
  [
    "run",
    "--rm",
    "--ipc=host",
    "-v",
    `${process.cwd()}:/work`,
    "-v",
    "/work/node_modules",
    "-v",
    "/work/.next",
    "-w",
    "/work",
    image,
    "bash",
    "-c",
    inContainer,
  ],
  { stdio: "inherit" },
);

process.exit(result.status ?? 1);
