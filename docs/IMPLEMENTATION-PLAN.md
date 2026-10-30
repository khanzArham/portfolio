# Implementation Plan: Zero to MVP

**Source:** portfolio-project-plan-v1.2.md
**Repo:** portfolio (GitHub, public)
**Workflow:** One branch per step, pull request into main, merged with a merge commit so every commit is kept.
**Commit style:** Conventional Commits (feat, fix, chore, docs, test, content, ci, style).

---

## Prerequisites

- Node.js 20.9 or newer (LTS 22 recommended), npm, and Git installed.
- GitHub account, with GitHub CLI logged in.
- Vercel account, signed in with GitHub.
- VS Code with ESLint, Prettier, and Tailwind CSS IntelliSense.
- Python 3.10 or newer (only needed for the evaluation export in Step 15).
- Git identity set on the machine, and default branch set to main.

## Working rules for every step

1. Start from an up-to-date main, and create a branch for the step.
2. Make small commits while working.
3. Run lint, type check, unit tests, and build locally before pushing.
4. Push, open a pull request, and wait for CI to pass.
5. Merge with a merge commit, then delete the branch.
6. Do not start the next step until the current step's "Done when" is true.

---

## Step 1: GitHub repository setup

**Goal:** An empty, protected repo with a clear workflow.

**Work:**
- Create the public repo named portfolio with a short description, and clone it locally.
- In repo settings, keep Issues on and Wiki off.
- Enable merge commits. Disable squash merging and rebase merging, so every commit is kept.
- Add a branch protection rule for main: require a pull request (zero approvals, since you work solo), require status checks to pass, and do not allow bypassing. The CI check is added to this rule in Step 7.
- Optionally create labels: content, ai, a11y, perf, bug.

**Done when:** The repo exists locally and on GitHub, and main is protected.

---

## Step 2: Scaffold Next.js

**Goal:** A runnable Next.js app with the App Router, TypeScript, Tailwind v4, and ESLint, created inside the repo.

**Work:**
- Scaffold the app into the existing repo folder, with the App Router, TypeScript, Tailwind, ESLint, the `@/*` import alias, and no src directory.
- Check the default page in the dev server, then stop it.
- Commit the scaffold.

**Done when:** The dev server shows the default page, and the production build passes.

---

## Step 3: Project dependencies

**Goal:** Install everything the plan needs, in grouped commits so each group can be reverted on its own.

**Work, by group:**
- Group A, UI and theming: next-themes, Motion, cmdk, and Radix Dialog and Tabs.
- Group B, content and forms: Zod, gray-matter, React Hook Form with its resolver, and the MDX packages.
- Group C, charts and search: Recharts, Orama, and Transformers.js.
- Group D, services and analytics: Resend, Upstash Redis and rate limiting, and Vercel Analytics and Speed Insights.
- Group E, dev and test tooling: Vitest with coverage and jsdom, Testing Library, Playwright, axe-core for Playwright, Lighthouse CI, Prettier, and the Prettier ESLint config.

**Notes:**
- Tremor is optional. Add it only if a metric card needs it, in Step 16.
- GSAP is not installed now. Add it only if a scroll effect truly needs it.

**Done when:** The build still passes, and every group is in its own commit.

---

## Step 4: Tooling and scripts

**Goal:** One command per check, used both locally and in CI.

**Work:**
- Add npm scripts for dev, build, start, lint, format and format check, type check, unit tests, E2E tests, Lighthouse, and content validation.
- Configure Prettier, Vitest (jsdom, with the jest-dom setup), Playwright (one Chromium project, with a local server for tests), and Lighthouse CI (placeholder config).
- Add a content validation script as a placeholder. It is filled in Step 8.
- Make the unit test command pass when there are no tests yet.

**Done when:** Lint, type check, format check, and unit tests all pass.

---

## Step 5: Design tokens and theming

**Goal:** Light and Dark themes both work from the first page, with no theme flash.

**Work:**
- Define design tokens as CSS variables with a Light value ("Warm paper") and a Dark value ("Night field") for each: paper, ink, accent (road-sign yellow), muted, success, danger, surface, and raised surface. Add spacing, radius, and motion tokens.
- Map the tokens into the Tailwind theme.
- Wrap the app in a theme provider with class-based switching, system detection, and system as the default.
- Build a theme toggle that is accessible and cycles through system, light, and dark.
- Load the display, body, and monospace fonts through the framework's font system.
- Suppress the hydration warning on the root html element.

**Done when:** The toggle works, system preference is respected on first visit, reload shows no flash, and text and accent colors pass a contrast check in both themes.

---

## Step 6: Base layout and navigation

**Goal:** Header, footer, skip link, and placeholder pages, all keyboard-accessible.

**Work:**
- Build the header with five items (Work, Experience, Skills, Lab, About), a Contact button, and the theme toggle. On mobile, the menu uses a Radix dialog.
- Build the footer with GitHub, LinkedIn, email, and copyright.
- Add a skip link that appears on focus.
- Create a route group for the site, with the header, footer, and a main landmark.
- Add placeholder pages for home, projects, experience, skills, lab, about, and contact. Each has one h1.

**Tests:** Header links render with the right hrefs. The skip link works with the keyboard.

**Done when:** Every placeholder route loads, and the unit and E2E navigation tests pass.

---

## Step 7: CI pipeline and Vercel deployment

**Goal:** Every pull request runs checks and gets a preview URL. Main deploys to production.

**Work:**
- Add a GitHub Actions workflow that runs on pull requests and on pushes to main. The job is named CI, and it runs format check, lint, type check, content validation, unit tests, build, and E2E tests with Chromium.
- Connect the repo to Vercel as a Next.js project, and keep the defaults.
- Enable Vercel Analytics and Speed Insights.
- Add the CI check to the branch protection rule from Step 1.

**Done when:** A test pull request shows green CI and a Vercel preview, and merging to main deploys production.

---

## Step 8: Content model and validation

**Goal:** All content is typed, and invalid content fails the build.

**Work:**
- Define schemas for dossiers, evaluation (the chart types from plan section 4.3), experience, education, and skills.
- Write a loader that reads dossier MDX files, validates frontmatter, and returns them sorted. Also add a lookup by slug.
- Add typed data files for experience, education, and skills, with placeholder data until Step 14.
- Add a fixture dossier whose filename starts with an underscore, so it is excluded from the public site.
- Make the validation script load all content, and exit with readable errors on failure.

**Tests:** A valid fixture passes. A missing failure log on an AI project fails. An unknown chart type fails.

**Done when:** Validation passes on the fixture, and fails on a deliberately broken copy, which is then deleted.

---

## Step 9: Static pages from content

**Goal:** Every page renders from content, with no animation yet.

**Work:**
- Home: hero with name, role, positioning line, and call-to-action buttons, plus featured dossiers.
- Projects index: all dossiers, with a tag filter.
- Dossier page: generated for each slug, unknown slugs show not found, and sections for brief, method, evaluation, failure log, outcome, and stack.
- Experience, education, skills (grouped by category, not linked yet), and about pages.
- Shared components for the case file layout, sections, cards, and tags.

**Tests:** A smoke test visits every route, checks for one h1, and checks for no console errors.

**Done when:** All routes render, the fixture dossier shows every section, and the smoke test passes.

---

## Step 10: Contact form

**Goal:** A working contact form with no public API route.

**Setup outside the code:**
- Create a Resend account, and set up a sender (sandbox for testing, verified domain later).
- Create a free Upstash Redis database.
- Store the keys in local environment files (already ignored by Git), and in Vercel's environment variables for Production and Preview.

**Work:**
- Write a Zod schema for name, email, and message with length limits. Include a honeypot field that must stay empty.
- Write a server action that validates input, checks the honeypot, applies a per-IP rate limit (for example, three messages per hour), sends the email through Resend, and returns a typed success or error result.
- Build the form with labels, error messages linked to inputs, a pending state, and a success state. Use the server action hook and the form library's Zod resolver.

**Tests:** Schema cases (valid, bad email, filled honeypot). Action with mocked services, including the rate-limit branch. E2E submit flow.

**Done when:** A real message arrives in your inbox from the preview deployment, and the fourth message within an hour is rate-limited.

---

## Step 11: SEO and security

**Goal:** Search and link previews work, and basic security headers are in place.

**Work:**
- Add a sitemap and robots file.
- Add a metadata helper, and set a unique title and description on every page.
- Add Person structured data on home and about.
- Set security headers and a content security policy in the Next config.

**Done when:** The SEO Lighthouse score is 95 or higher on home, and the preview URL reports the core security headers.

---

## Step 12: Dynamic Open Graph images

**Goal:** Each dossier link shares a card with its case number, key metrics, and stack tags.

**Work:**
- Add a site default image with name and role.
- Add a dossier image generator that draws the case number, title, summary, two key metrics from the evaluation, and stack tags. Bundle the font it uses.

**Done when:** A social share debugger shows the dossier card on the preview URL.

---

## Step 13: llms.txt for AI agents

**Goal:** A plain-text summary, generated at build time, that matches the site.

**Work:**
- Add a route that returns plain text at build time. It includes name, positioning, sections with links, one line per dossier (summary, status, stack, URL), and the resume link.

**Tests:** Every public dossier appears. No private field (such as phone or address) appears.

**Done when:** The endpoint returns the summary on the preview URL, and the test passes.

---

## Step 14: Real profile content

**Goal:** Replace placeholder data with your real information. This step is content, not code.

**Work:**
- Experience: NIAIS and Developers Hub, with role, period, and two or three achievements each. Use numbers only when you can back them up.
- Education: University of Lahore, BS Computer Science, section 7(C), and expected graduation.
- Skills: grouped by category, and only skills you use confidently.
- Hero copy: name, role, positioning line, and calls to action.
- Resume: confirm the latest version before adding it (open question 3 in the plan).

**Done when:** Every claim on the site can be traced to a document you have, and one peer has read it through.

---

## Step 15: First full case file

> **Changed 2026-10-29:** RoadGuard was removed as the first case file because it is not the owner's project. **Decided 2026-10-30:** CareerSyncAI is the first case file (open question 6). It has no evaluation yet, so Part A builds one in its repo.

**Goal:** One complete dossier with real evaluation data. This validates the whole template.

**Part A, in the project's own repo:**
- Write an export script that reads the saved predictions, labels, and training log, and writes the evaluation JSON in the format from plan section 4.3.
- Check at least one metric by hand against the notebook output.

**Part B, in the portfolio repo:**
- Add the exported evaluation file to the content folder.
- Write the dossier with all required fields. The failure log must name a specific pattern of errors, not a general statement.
- Add a link to the code or notebook that produced the numbers.

**Done when:** Content validation passes, the dossier renders its metric table (charts come in Step 16), and the failure log is specific.

---

## Step 16: Evaluation charts

**Goal:** Interactive, accessible, theme-aware charts inside the dossier's Evaluation tab.

**Work:**
- Build the confusion matrix, loss curve, and trade-off scatter using Recharts, with colors from theme tokens.
- Build an accessible metric table.
- Wrap each chart in a frame with a caption, a text summary, and a toggle to show the data as a table.
- Pick the right chart from the data type, and turn off animation when reduced motion is on.

**Tests:** Each chart shows its caption and table toggle with fixture data.

**Done when:** The first dossier's charts render in both themes, the toggles work with the keyboard, and reduced motion disables animation.

---

## Step 17: Journey map

**Goal:** The main interaction on the home page, with a text alternative.

**Work:**
- Build the journey map with four stations (Origin, Build, Field, Lab). The path line progresses as the visitor scrolls. Stations are buttons.
- Build a plain ordered list as the alternative for screen readers and for small screens where needed.
- Hide the Lab station until the Lab page has content (plan section 10).

**Done when:** The map works with mouse, keyboard, and screen reader (through the list), and the path respects reduced motion.

---

## Step 18: Dossier tabs and mobile accordion

**Goal:** Dossier navigation that works on desktop and mobile.

**Work:**
- On desktop, show the dossier sections as tabs: brief, method, evaluation, failure log, outcome.
- On mobile, show the same content as an accordion, from one shared content source, so charts are not duplicated.
- Add the "file slides out" open effect, and turn it off under reduced motion.
- Make sure the close control and back button behave correctly.

**Done when:** The dossier works at 375 pixels and 1280 pixels wide, and the keyboard can switch tabs and close it.

---

## Step 19: Remaining dossiers

**Goal:** Full content for the MVP project set.

**Work:**
- CareerSyncAI (FYP), including survey and interview evidence if you can share it.
- Order Tracker app.
- Behance entries as link-only items under the design tag. Do not invent case studies.

**Done when:** Every dossier meets the definition of done in plan section 15, and each appears in llms.txt.

---

## Step 20: Micro-AI search ("Ask the dossiers")

**Goal:** Semantic search that runs in the browser, with a full-text fallback. This is the most technical step.

**Part A, build-time index:**
- Collect dossier and skill text, create an Orama database, embed each document with the same model the browser will use, and write the index file. Run this before every build.

**Part B, browser worker:**
- Run the embedding model in a Web Worker, so the main thread stays responsive. Use a quantized model.
- Build a main-thread client that handles loading, timeouts, and failures, and returns nothing on failure so the UI can fall back.

**Part C, search UI and fallback:**
- Load the index on first open, and run hybrid search (vector plus full-text).
- Build a panel that says the model runs in the browser, states the size of the one-time download, shows results with the matching passage, and shows a notice when only full-text search is used.

**Tests:** A known query returns the expected dossier (with the worker mocked). With the worker disabled, the fallback notice appears.

**Done when:**
- Model size and load time are measured on a mid-range Android device and recorded in the changelog.
- DevTools shows no search query sent over the network.
- If the model breaks the mobile budget, the feature is cut back to full-text search, and the decision is recorded in the changelog.

---

## Step 21: Command palette and skills as evidence

**Goal:** Keyboard-first navigation and search, and skills linked to the projects that used them.

**Work:**
- Build the command palette with Cmd or Ctrl + K, and a visible trigger button. It has groups for pages, dossiers, and actions (theme toggle, copy email), and uses the search from Step 20.
- On the skills page, clicking a skill highlights the dossiers that used it.

**Tests:** Open, search, keyboard selection, and Escape to close, with focus returned to the trigger.

**Done when:** The palette works with the keyboard alone.

---

## Step 22: Performance, accessibility, and visual regression

**Goal:** Meet every budget in plan sections 7.1 and 7.2.

**Work:**
- Run Lighthouse on the production build, fix issues until budgets pass, and enforce the budgets in the Lighthouse config.
- Add accessibility checks for every route, in both themes, to the E2E suite.
- Add screenshot baselines for home, projects, and one dossier with charts, at mobile and desktop widths, in both themes.
- Run Lighthouse on pull requests in CI.

**Done when:** Lighthouse, accessibility, and visual tests are all green in CI. Lighthouse is added as a required check.

---

## Step 23: Launch

**Goal:** Live on a custom domain, tested, shared, and tagged as v1.0.0.

**Work:**
1. Buy a domain (for example, arhamzahid.dev), connect it in Vercel, and enable HTTPS redirect.
2. Confirm the email and rate-limit keys are set for Production.
3. Test on desktop Chrome, Edge, Firefox, and Safari, and on iOS Safari and Android Chrome. Include one mid-range Android device.
4. Do a keyboard-only walkthrough and a reduced-motion check. Log issues, and fix any blockers.
5. Complete the release checklist in plan section 9.4.
6. Share with three to five peers or mentors, and ask: "In 30 seconds, what does this person do?" Record the answers.
7. Update the changelog with the MVP entry and the micro-AI measurements.
8. Update the README: what the site is, the stack, how to run it locally, how content works, how to add a dossier, and a link to the plan.
9. Tag the release as v1.0.0, and publish a GitHub release with the changelog entry as notes.

**Done when:** The custom domain serves the site over HTTPS, the release checklist is complete, and the v1.0.0 tag and release exist.

---

## Step 24: After MVP

The RAG project and the Job Matcher each get their own repo and plan. They connect only through the proxy in plan section 6.5. Start them after the MVP tag exists.

---

## Branch and commit map (expected shape of main)

- Initial commit from the scaffold
- Step 2 through Step 7: setup, tooling, theme, layout, and CI
- Step 8 through Step 13: content model, pages, contact, SEO, OG images, and llms.txt
- Step 14 and Step 15: content and the first full dossier
- Step 16 through Step 22: charts, journey map, dossier tabs, dossiers, micro-AI, palette, and quality
- Step 23: launch and v1.0.0 tag

Each step is one merge commit on main, so the history shows each step as a visible unit.

---

## Rules that keep the project on track

1. One step at a time. Do not start Step N+1 until Step N's "Done when" is true.
2. If a step grows past about two days, split it into two pull requests.
3. Never commit environment files, API keys, or private data. Check the list of changed files before every commit.
4. Use content commits for writing and data changes, feat for new behavior, fix for bugs, and test for tests only.
5. Update the changelog in the same step that changes behavior, not at the end.
6. Package versions change quickly. Read each library's current docs when you install it.
