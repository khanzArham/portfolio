/**
 * Content validation (`npm run validate:content`, also run before every
 * build). Checks every dossier (fixtures included), eval JSON file and
 * profile data file, then cross-checks public dossier stacks against skills.
 * Exits with code 1 on any error so CI and the build fail.
 */
import { collectDossiers } from "@/lib/content/dossiers";
import { checkSkillCoverage, collectProfile } from "@/lib/content/profile";

function main(): void {
  const all = collectDossiers({ includeFixtures: true, includeDrafts: true });
  const publicDossiers = collectDossiers().dossiers;
  const profile = collectProfile();
  const errors = [...all.errors, ...profile.errors];
  const warnings: string[] = [];

  if (!errors.length && profile.skills) {
    const coverage = checkSkillCoverage(profile.skills, publicDossiers);
    errors.push(...coverage.errors);
    warnings.push(...coverage.warnings);
  }

  console.log(
    `validate:content: ${all.dossiers.length} dossier(s) parsed (${publicDossiers.length} public), profile data checked`,
  );
  for (const warning of warnings) console.warn(`  warning: ${warning}`);

  if (errors.length) {
    console.error(`\n${errors.length} content error(s):`);
    for (const error of errors) console.error(`  ✗ ${error}`);
    process.exitCode = 1;
    return;
  }
  console.log("validate:content: OK");
}

main();
