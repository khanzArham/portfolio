import fs from "node:fs";
import path from "node:path";

// Optional files the owner drops into public/. Pages check them at build
// time, so adding one and redeploying is enough to switch a feature on.
const exists = (file: string) =>
  fs.existsSync(path.join(process.cwd(), "public", file));

/** The resume buttons and the /llms.txt line appear once this exists. */
export const hasResume = () => exists("resume.pdf");

/** The header avatar uses this photo when present, initials otherwise. */
export const profilePhoto = () =>
  ["profile.jpg", "profile.png", "profile.webp"].find(exists);
