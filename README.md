# Arham Zahid Khan: Portfolio

The personal site of Arham Zahid Khan, a Software & AI Engineer. Each
project is presented as a **case file**: the brief, the method, the
evaluation where there is one, and a **failure log** of what went wrong and
what changed. The aim is to show how the work was done, not only what was
built.

**Live:** https://portfolio-khanzarham.vercel.app

## What is on the site

- **Work:** case files (dossiers) with tabs on desktop and an accordion on
  mobile, filters by tag, and charts for projects that have evaluation data.
- **Ask the site:** keyword search on every page (Ctrl/⌘ K), plus optional
  semantic search on the Work page that runs entirely in the browser. Nothing
  typed is sent to a server.
- **Skills as evidence:** choosing a skill shows the projects and roles that
  used it, and marks planned use separately from shipped work.
- **Journey, Experience, About, Contact:** a journey map, roles and
  education, a profile card, a résumé download and a contact form (email via
  Resend, rate-limited with Upstash).
- Light and dark themes, reduced-motion support, and `/llms.txt` for AI
  agents.

## Stack

| Area      | Choice                                                            |
| --------- | ----------------------------------------------------------------- |
| Framework | Next.js 16 (App Router, Turbopack), React 19, TypeScript (strict) |
| Styling   | Tailwind CSS v4 with design tokens in `styles/tokens.css`         |
| Content   | MDX dossiers and TypeScript data files, validated with Zod        |
| UI        | Radix Dialog, cmdk, Recharts, next-themes                         |
| Search    | Orama (hybrid), Transformers.js in a Web Worker for embeddings    |
| Contact   | Server Action, Resend, Upstash Redis rate limiting                |
| Testing   | Vitest, Playwright (E2E, axe accessibility, visual regression)    |
| Quality   | Lighthouse CI budgets on every pull request                       |
| Hosting   | Vercel, with Vercel Analytics and Speed Insights                  |

## Run it locally

Requires Node.js 22.

```bash
npm install
npm run dev          # http://localhost:3000
```

The contact form works without keys in development: it validates and
rate-limits in memory and never sends. To send real email, copy
`.env.example` to `.env.local` and fill in the Resend and Upstash values.

The first build downloads the semantic-search model and builds the search
index (`npm run build:search`, run automatically before `npm run build`).

### Scripts

| Command                                                       | What it does                                                |
| ------------------------------------------------------------- | ----------------------------------------------------------- |
| `npm run dev`                                                 | Development server                                          |
| `npm run build` / `npm run start`                             | Production build and server (validates content first)       |
| `npm run lint` / `npm run typecheck` / `npm run format:check` | Static checks                                               |
| `npm test`                                                    | Unit and component tests (Vitest)                           |
| `npm run test:e2e`                                            | End-to-end and accessibility tests (Playwright, Chromium)   |
| `npm run test:visual:update`                                  | Refresh screenshot baselines in the Playwright Docker image |
| `npm run validate:content`                                    | Check every dossier and profile file against the schemas    |
| `npm run lighthouse`                                          | Lighthouse CI against a local production build              |

E2E and visual tests use the test fixtures, so build with
`CONTENT_FIXTURES=1 npm run build` first and run them with `CI=1`.

## How content works

All content lives in `content/` and is validated at build time; a bad file
fails the build.

| File                                | Holds                                                                                                        |
| ----------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `content/projects/<slug>.mdx`       | One dossier: frontmatter plus `## Brief`, `## Method`, `## Failure Log`, `## Outcome` (and `## Data` for ML) |
| `content/projects/<slug>.eval.json` | Evaluation data and charts (required for ML, AI and RAG projects)                                            |
| `content/skills.ts`                 | Skills by category; `implies` links related skills (MySQL → SQL)                                             |
| `content/experience.ts`             | Roles; each may list the skills it used                                                                      |
| `content/education.ts`              | Education                                                                                                    |
| `lib/site.ts`                       | Name, role, bio, links and availability                                                                      |

Files starting with `_` are test fixtures; they appear only with
`CONTENT_FIXTURES=1` (CI and tests), never on the live site.

### Add a dossier

1. Create `content/projects/<slug>.mdx`. The file name must match `slug`.
2. Fill in the frontmatter: `caseNumber` (`CASE-005`), `title`, a one-line
   `summary` (160 characters at most), `status` (`shipped`, `in-progress` or
   `archived`), `role`, `period`, `updated`, `tags` and `stack`. Every stack
   item must be a skill in `content/skills.ts`.
3. Write the sections. Every failure log entry is a `### ` heading saying
   what went wrong, then why, and what changed. A project still
   `in-progress` may leave out the failure log and evaluation until there is
   real work to report.
4. For an ML, AI or RAG project, add `<slug>.eval.json` with real
   evaluation data.
5. Optional: `featured: true` puts it on the home page (three at most),
   `draft: true` keeps it off the live site, and `links`, `media` and
   `performance` add more detail.
6. Run `npm run validate:content`, then `npm run dev` to preview.

Use `content/projects/_fixture.mdx` as a reference for every field.

### Optional files

- `public/resume.pdf`: shows the Download Resume buttons and the
  `/llms.txt` résumé line.
- `public/profile.jpg`: replaces the initials avatar in the header.

## Quality gates

Every pull request runs:

- **CI:** format, lint, type check, content validation, unit tests, build,
  E2E and accessibility tests (axe, both themes), and visual regression in
  the Playwright Docker image.
- **Lighthouse:** against the pull request's Vercel preview, with budgets of
  Performance 90+, Accessibility, Best Practices and SEO 95+, LCP under
  2.5 s and CLS under 0.1.

Both are required checks on `main`.

## Project documents

- [Project plan](docs/portfolio-project-plan-v1.2.md): goals, audience,
  design system, content model and quality standards.
- [Implementation plan](docs/IMPLEMENTATION-PLAN.md): the step-by-step
  build.
- [Changelog](CHANGELOG.md)
- [Release checklist v1.0.0](docs/RELEASE-v1.0.0.md)
