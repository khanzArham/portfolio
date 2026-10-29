# Portfolio Project Plan: "Field Dossier"

**Owner:** Arham Zahid Khan
**Positioning:** AI Engineer (in training), with frontend and product design background
**Concept:** Journey map + case-file dossiers
**Version:** 1.2
**Status:** Planning

---

## 1. Goals

### 1.1 Primary goal
Get the candidate shortlisted for AI engineer, ML engineer, and junior AI-focused full-stack roles within 60 seconds of a recruiter landing on the site.

### 1.2 Secondary goals
- Demonstrate engineering judgment, not just finished features (trade-offs, failure logs, visual evaluation metrics).
- Show frontend craft (performance, accessibility, responsive design).
- Serve as a living, deployed artifact that grows with each project.
- Provide machine-readable credentials for AI agents and automated recruiter screeners via `/llms.txt`.
- Show AI capability at launch through client-side features, not only through backend services.

### 1.3 Non-goals
- No generic "AI purple gradient" aesthetic.
- No unfinished projects presented as complete.
- No heavy 3D or effects that hurt performance or accessibility.
- No heavy backend AI dependencies in the first release (lightweight client-side search and micro-AI in MVP; backend AI added in later phases as separate services).

---

## 2. Audience and Visitor Journeys

| Visitor | Time budget | Needs | Primary path |
|---|---|---|---|
| Recruiter / sourcer | 30-60 sec | Role fit, resume, contact | Hero -> featured dossiers -> resume |
| Technical hiring manager | 3-5 min | Method, evaluation charts, trade-offs | Journey map -> dossier -> evaluation charts -> code links |
| Peer / engineer | 5+ min | Architecture, code quality | GitHub, architecture diagrams, README |
| AI Agent / LLM Scraper | < 5 sec | Plain text profile summary, key metrics | `/llms.txt` |

**Rule:** Every element on the page must help one of these visitors answer a specific question. If it does not, remove it.

---

## 3. Information Architecture

```
/                       Hero + Journey Map (Origin, Build, Field, Lab)
/llms.txt               AI Agent / LLM-readable profile summary
/projects               Index of dossiers (filterable by tag: ML, Web, AI, Design)
/projects/[slug]        Dossier (case file template, evaluation charts)
/experience             Field stations (internships, roles)
/education              Origin station (optional page; can live on home)
/skills                 Skills as evidence (skill -> projects that used it)
/lab                    Experiments and demos (added only when ready)
/about                  Short bio, values, resume download
/contact                Contact form or mailto, links
/uses                   Optional: tools and setup
```

Navigation: top bar with 5 items max (Work, Experience, Skills, Lab, About) plus a Contact button. Command palette (Cmd/Ctrl + K) provides full navigation and search.

---

## 4. Content Model

### 4.1 Dossier schema (per project)

Every project is stored as typed data (TypeScript or MDX frontmatter validated by a schema).

| Field | Required | Description |
|---|---|---|
| `slug` | Yes | URL identifier |
| `caseNumber` | Yes | e.g., `CASE-004`, used as a visual identity and in OG images |
| `title` | Yes | Project name |
| `summary` | Yes | One-line positioning (also used in `/llms.txt`) |
| `status` | Yes | `shipped`, `in-progress`, `archived` |
| `role` | Yes | Solo, team, and specific contribution |
| `period` | Yes | Start and end months |
| `tags` | Yes | ML, RAG, Web, Design, etc. |
| `brief` | Yes | Problem, audience, and why it mattered |
| `data` | If ML | Source, size, labeling, splits, known biases |
| `method` | Yes | Architecture or pipeline, and why these choices |
| `evaluation` | If ML/AI | Metrics, baseline, test set, and visual benchmark charts (see 4.3) |
| `failureLog` | Yes | What did not work and why (at least one entry) |
| `outcome` | Yes | Result, impact, or learning |
| `links` | Optional | Live demo, GitHub, Behance, write-up |
| `media` | Optional | Screenshots, GIFs, diagrams, demo video (with alt text) |
| `stack` | Yes | Technologies used (also rendered as tags in OG images) |
| `performance` | Optional | Measured runtime figures (e.g., latency, bundle size, Lighthouse score) with date and method |

### 4.2 Content rules
- Metrics must be real and sourced. No invented numbers.
- Every claim about AI capability must be backed by an eval, a demo, or a link.
- Failure log is mandatory for AI projects. It is a credibility signal.
- Write for a non-expert first paragraph, then go technical.

### 4.3 Evaluation block (structured, chart-ready)

The `evaluation` field holds a summary, metrics, and a list of charts. Each chart is data, not an image, so it renders natively and stays accessible.

```ts
evaluation: {
  summary: string;                 // one paragraph, plain language
  metrics: { name: string; value: number; baseline?: number; unit?: string }[];
  charts: Array<
    | { type: "confusion-matrix"; labels: string[]; matrix: number[][]; caption: string }
    | { type: "loss-curve"; epochs: number[]; series: { name: string; values: number[] }[]; caption: string }
    | { type: "tradeoff-scatter"; points: { label: string; latencyMs: number; accuracy: number }[]; xLabel: string; yLabel: string; caption: string }
    | { type: "metric-table"; columns: string[]; rows: (string | number)[][]; caption: string }
  >;
  testSet: string;                 // size and how it was held out
  reproducible: { repo?: string; notebook?: string }; // code that produced the numbers
}
```

Rules:
- Chart data comes from real runs. Export it from training or eval scripts into `*.eval.json`. Never hand-type chart numbers.
- Every chart has a caption and a text summary, so screen readers and AI agents get the same information.
- Charts are rendered with **Recharts** (primary). **Tremor** components are used for metric cards only, not for ML-specific plots.
- Chart data stays small (under about 50 KB per dossier). Larger data is summarized before it reaches the site.
- Every ML dossier links to the repo or notebook that produced its numbers (`reproducible`).

---

## 5. Visual and Interaction Design

### 5.1 Design direction: "Field Notebook" with equal Light and Dark themes
- **Light theme ("Warm paper"):** Warm paper background, ink-dark text, one accent color (road-sign yellow, linked to RoadGuard).
- **Dark theme ("Night field"):** Same identity in dark form: deep warm slate background (not pure black), paper-toned text, and the same accent tuned for contrast on dark surfaces.
- **Theme policy:** Both themes have equal priority. Every page, chart, dossier, and component is designed and reviewed in both.
- **Detection:** System theme detection through `next-themes` (`attribute="class"`, `enableSystem`, `defaultTheme="system"`). The visitor can override it, and the choice is remembered. `suppressHydrationWarning` on the root `html` element prevents a theme flash on load.
- **Charts:** Chart colors come from theme tokens, so charts stay readable in both themes.
- **Typography:** Display headings in a strong serif or grotesk. Body in a readable sans. Monospace for metadata (case numbers, dates, metrics, tags).
- **Iconography:** Minimal, line-based, consistent stroke.
- **Imagery & Data Viz:** Real screenshots, architecture diagrams, interactive evaluation charts. Avoid stock imagery.

### 5.2 Design tokens
Defined once as CSS variables, with a light and a dark value for each. Consumed everywhere, including charts and OG images.
- Color (light / dark): `--color-paper` / `--color-paper-dark`, `--color-ink` / `--color-ink-dark`, `--color-accent` / `--color-accent-dark`, `--color-muted`, `--color-success`, `--color-danger`
- Surface: `--color-surface`, `--color-surface-raised` (both themes)
- Spacing: 4px base scale
- Radius: `sm`, `md`, `lg`
- Motion: `duration-fast` (150ms), `duration-base` (250ms), `ease-standard`
- Breakpoints: Tailwind defaults, mobile-first

### 5.3 Core interactions (MVP)
1. **Journey map:** Stations on a path. Scroll progresses the path line. Click opens dossier.
2. **Dossier open:** File slides out with a clear close control. Keyboard and back-button compatible.
3. **Dossier tabs:** Brief / Method / Evaluation / Failure Log / Outcome as switchable sections on desktop, accordion on mobile.
4. **Evaluation charts:** Confusion matrices, loss curves, and latency vs. accuracy plots rendered from dossier data. Each chart has a caption, a text summary, and a toggle to a data table. Charts respond to theme changes.
5. **Skills as evidence:** Clicking a skill highlights linked projects.
6. **Command palette & micro-AI search:** Cmd/Ctrl + K, keyboard-first. Semantic search over pages and dossiers, powered by Orama Search. A natural-language query (e.g., "Which project used a CNN?") is embedded in the browser with Transformers.js, so meaning is matched, not just keywords. The UI states that the model runs locally and downloads once on first use. If the model cannot load, search falls back to Orama full-text search and says so. No query is sent to a server.

### 5.4 Deferred interactions
- Hover video previews
- Scroll-driven storytelling beyond the journey line
- Easter eggs
- 3D elements (only if they explain something specific)
- Server-side AI chat (Phase 5, after backend services are ready)

### 5.5 Motion rules
- Respect `prefers-reduced-motion`: disable transforms, keep opacity and instant state changes.
- No motion longer than 500ms for UI feedback.
- No scroll hijacking.
- Chart entrance animations are off under reduced motion.

---

## 6. Technical Architecture

### 6.1 Stack

| Layer | Choice | Reason |
|---|---|---|
| Framework | Next.js (App Router) | SSG/SSR, metadata API, image optimization, strong ecosystem |
| Language | TypeScript (strict) | Type-safe content models and components |
| Styling | Tailwind CSS v4 | Fast iteration, design tokens via CSS variables |
| Theme Management | next-themes | System detection, user override, no theme flash on load |
| Components | Radix UI primitives + custom styling | Accessible dialogs, menus, tabs out of the box |
| Data Visualization | Recharts (primary); Tremor UI for metric cards | Interactive evaluation charts (confusion matrix, loss curves, latency vs. accuracy) |
| Motion | Motion (Framer Motion) | Layout and gesture animations for React |
| Scroll effects | GSAP ScrollTrigger (only if needed) | Precise scroll-linked timelines |
| Content | MDX for long-form dossiers, TS/JSON for structured data, validated with Zod | Versioned, typed, easy to edit |
| Command palette | cmdk + Orama Search | Accessible, lightweight semantic search over site content |
| Search index | Orama, built at build time with precomputed embeddings | Hybrid full-text and vector search with no server |
| Micro-AI (client-side) | Transformers.js (`@huggingface/transformers`) in a Web Worker | Query embeddings in the browser, no server or API cost |
| Forms | React Hook Form + Next.js Server Actions + Zod + React `useActionState` | Type-safe submission without a dedicated API route |
| Rate limiting | Upstash Redis (free tier) used inside the Server Action | Server Actions have no built-in rate limit; this adds per-IP limits |
| Email delivery | Resend (free tier) | Direct email delivery via Server Actions |
| Analytics | Vercel Analytics + Speed Insights | Privacy-friendly, no cookie banner needed |
| Dynamic OG images | Next.js `opengraph-image.tsx` (`next/og`) | Automatically draws case number, key metrics, and tech tags per dossier |
| Agent readability | `/llms.txt` route generated at build time | Machine-readable summary for recruiter tools and LLMs |
| Testing (unit) | Vitest + Testing Library | Fast component and utility tests |
| Testing (e2e) | Playwright | Real browser flows, screenshots for regression |
| Accessibility | axe-core (in Playwright) + manual keyboard checks | Automated and manual coverage |
| Lint and format | ESLint (flat config) + Prettier | Consistent code quality |
| Hosting | Vercel (Hobby/free tier) | Zero-config Next.js deploys and previews |
| Repo | GitHub, PR-based workflow | Preview deployments per PR |
| CI | GitHub Actions | Lint, type-check, tests, build, Lighthouse CI |
| Domain | Custom domain (e.g., arhamzahid.dev) | Professional identity |

### 6.2 Project structure

```
portfolio/
├─ app/
│  ├─ (site)/
│  │  ├─ page.tsx                  # Home: hero + journey map
│  │  ├─ projects/
│  │  │  ├─ page.tsx               # Dossier index + search
│  │  │  └─ [slug]/
│  │  │     ├─ page.tsx            # Dossier (tabs, charts)
│  │  │     └─ opengraph-image.tsx # Dossier OG image (caseNumber, metrics, stack tags)
│  │  ├─ experience/page.tsx
│  │  ├─ skills/page.tsx
│  │  ├─ lab/page.tsx
│  │  ├─ about/page.tsx
│  │  └─ contact/page.tsx
│  ├─ actions/
│  │  └─ contact.ts                # Server Action: Zod validation, rate limit, email
│  ├─ llms.txt/
│  │  └─ route.ts                  # Build-time generated plain text endpoint for LLM scrapers
│  ├─ opengraph-image.tsx          # Site default OG image
│  ├─ sitemap.ts
│  ├─ robots.ts
│  └─ layout.tsx                   # ThemeProvider (next-themes), fonts, metadata
├─ components/
│  ├─ ui/                          # Primitives (Button, Dialog, Tabs)
│  ├─ journey/                     # Journey map, station, path
│  ├─ dossier/                     # Case file, sections, metadata
│  ├─ charts/                      # Recharts wrappers: confusion matrix, loss curve, trade-off scatter
│  ├─ command-palette/             # cmdk modal wired to Orama search
│  ├─ search/                      # Micro-AI status, fallback notice, results
│  └─ layout/                      # Header, footer, theme toggle
├─ content/
│  ├─ projects/*.mdx               # Dossier content
│  ├─ projects/*.eval.json         # Chart data exported from training/eval scripts
│  ├─ experience.ts
│  ├─ education.ts
│  └─ skills.ts
├─ lib/
│  ├─ content/                     # Loaders and Zod schemas
│  ├─ search/
│  │  ├─ build-index.ts            # Build-time Orama index with precomputed embeddings
│  │  └─ client.ts                 # Orama client loader
│  ├─ ai/
│  │  ├─ embed.worker.ts           # Web Worker running Transformers.js
│  │  └─ embed-client.ts           # Main-thread API for the worker, with fallback
│  ├─ seo.ts
│  └─ analytics.ts
├─ styles/
│  └─ tokens.css                   # Light and dark token values
├─ tests/
│  ├─ unit/
│  └─ e2e/
├─ public/
│  ├─ search-index.json            # Generated Orama index (build output)
│  ├─ models/                      # Quantized embedding model files, if self-hosted
│  └─ resume.pdf
├─ .github/workflows/
│  ├─ ci.yml
│  └─ lighthouse.yml
├─ README.md
├─ CHANGELOG.md
└─ package.json
```

### 6.3 Rendering strategy
- **Static generation (SSG)** for all pages and `/llms.txt`. Content is known at build time, so no runtime server is needed.
- **Dynamic OG images** generated at build time per dossier. Each image draws:
  - the dossier `caseNumber` (large, as the visual identity),
  - the title and one-line summary,
  - dynamic metric callouts (for example, F1 score or latency) from `evaluation` and `performance`, with labels,
  - stack tags from `stack`.
  Images are generated with `next/og`. Fonts are bundled, and each image is checked in the share debugger before launch.
- **Client components** only for interactive islands: journey map, command palette and search, dossier tabs and charts, theme toggle, contact form UI.
- **Server components & Actions** for content rendering and contact form processing. No public API route is exposed for the form.
- **Micro-AI model and search index** are loaded only when the visitor opens the palette or search panel. They are never part of the initial bundle.

### 6.4 Data flow
```
MDX / TS content + *.eval.json
   -> Zod validation (build fails on invalid content)
   -> Loaders (lib/content)
   -> Build outputs: Orama index (with embeddings), /llms.txt, OG images, sitemap
   -> Server components (pages)
   -> Client islands (charts, palette, search, micro-AI worker)
```

Content errors are caught at build time, not in production.

### 6.5 Future AI integration (out of MVP scope)
The portfolio will call heavy backend AI services (RAG, job matcher) through a thin proxy.

```
Browser -> Next.js Server Action / route handler (rate limit, validation, CORS)
        -> AI service (separate repo: RAG, job matcher)
        -> Response with citations and fallback
```

- Heavy AI services live in their own repos and deployments.
- The portfolio holds only a service URL and a server-side secret.
- MVP includes lightweight client-side micro-AI (see 6.6); complex models land in Phase 5.
- Each AI feature has a visible fallback when unavailable.

### 6.6 Client-side micro-AI (MVP)
This gives visible AI capability at launch, with no backend and no API cost.

- **Model:** A small, quantized sentence-embedding model run through Transformers.js in a Web Worker, so the main thread stays responsive.
- **Precomputed embeddings:** Dossier and skill text is embedded at build time and stored in the Orama index. In the browser, only the visitor's query is embedded.
- **Search flow:** Query -> embedding in worker -> Orama hybrid search (vector and full-text) -> ranked dossiers with the matching passage highlighted.
- **Transparency:** The UI states that the model runs in the visitor's browser, how big the one-time download is, and that no query is sent to a server.
- **Fallback:** If WebGPU or WASM is unavailable, the visitor declines the download, or the worker fails, the panel uses Orama full-text search and says so.
- **Loading:** The model loads on first interaction with the panel, with a progress indicator. The browser caches it after the first load.
- **Budget:** Model size and load time are measured and recorded in CHANGELOG. The feature is removed if it breaks the mid-range mobile performance budget.

---

## 7. Quality Standards

### 7.1 Performance budgets
| Metric | Target |
|---|---|
| Lighthouse Performance (mobile) | >= 90 |
| Lighthouse Accessibility | >= 95 |
| Lighthouse Best Practices | >= 95 |
| Lighthouse SEO | >= 95 |
| LCP | < 2.5s |
| CLS | < 0.1 |
| INP | < 200ms |
| JS shipped to home page | Keep minimal; measure each addition |
| Micro-AI model and worker | Not in initial bundle; loaded on demand; size and load time documented |

### 7.2 Accessibility
- WCAG 2.2 AA as the baseline, checked in both Light and Dark themes.
- All interactive elements reachable and operable by keyboard.
- Visible focus states across Light and Dark themes.
- Color contrast checked for all tokens in both themes, including chart colors.
- Charts have captions, text summaries, and a data table alternative.
- Alt text for every meaningful image and chart; decorative images marked as such.
- Reduced motion respected.
- Journey map has a text-based list alternative.
- Search results and micro-AI status messages announced to screen readers via live regions.

### 7.3 SEO and discoverability
- Unique `title` and `description` per page.
- Open Graph, Twitter card metadata, and dynamic dossier OG images.
- `/llms.txt`, `sitemap.xml`, and `robots.txt`.
- Structured data (`Person` schema) on home and about.
- Semantic HTML: one `h1` per page, logical heading order.

### 7.4 Security and privacy
- No secrets in client code. Use environment variables for server-only keys.
- Contact form validated on the server with Zod in the Server Action, rate-limited per IP through Upstash Redis, and protected against spam with a honeypot field. Cloudflare Turnstile is added if spam appears.
- Strict security headers (CSP, `X-Content-Type-Options`, `Referrer-Policy`) via `next.config`.
- Analytics without personal data collection. No third-party trackers.
- Micro-AI runs entirely in the visitor's browser. Search queries are not sent to any server or logged.
- `/llms.txt` and OG data contain only public information.
- Resume PDF is intentionally public. No other private data on the site.

### 7.5 Browser and device support
- Latest two versions of Chrome, Edge, Firefox, Safari.
- iOS Safari and Android Chrome tested manually before each release.
- Micro-AI tested on a mid-range Android device, since WASM performance varies there.

---

## 8. Testing Strategy

| Level | Tool | What is covered |
|---|---|---|
| Content validation | Zod in build | All dossiers, eval JSON, and data files valid |
| Unit | Vitest | Utilities, loaders, formatters, Server Action validation |
| Component | Testing Library | Tabs, charts (rendered with fixture data), palette search, form validation |
| E2E | Playwright | Navigation, dossier open/close, palette, contact form, keyboard flows, theme switching |
| Visual regression | Playwright screenshots | Key pages and charts at desktop and mobile widths, in Light and Dark themes |
| Accessibility | axe-core in Playwright | No critical or serious violations in either theme |
| Performance | Lighthouse CI | Budgets enforced on every PR |
| Agent readability | Build-time check | `/llms.txt` lists every public dossier and all links resolve |
| Micro-AI | Playwright with fixture index | Known queries return the expected dossier; fallback works with the worker disabled |

---

## 9. CI/CD and Release Process

### 9.1 Branching
- `main` is always deployable.
- Feature branches per section or project (`feat/dossier-ui`, `content/roadguard`).
- Pull requests required, even for solo work, to keep history clean and reviewable.

### 9.2 Pipeline (GitHub Actions)
On every pull request:
1. Install dependencies (cached).
2. Lint and format check.
3. Type check (`tsc --noEmit`).
4. Content validation (dossiers, eval JSON, schemas).
5. Build search index and `/llms.txt`.
6. Unit and component tests.
7. Build.
8. Playwright E2E against the preview deployment.
9. Lighthouse CI against the preview deployment.

On merge to `main`:
- Vercel production deployment.

### 9.3 Preview deployments
Every PR gets a Vercel preview URL. Use it to review on mobile and in both themes before merging.

### 9.4 Release checklist
- [ ] All CI checks green
- [ ] Mobile and desktop manual check, Light and Dark themes
- [ ] Keyboard-only walkthrough
- [ ] Reduced motion check
- [ ] Charts render correctly with real eval data, with captions and text summaries
- [ ] Command palette search works, and fallback works with the micro-AI worker disabled
- [ ] `/llms.txt` endpoint loads and lists current dossiers
- [ ] Resume PDF is current
- [ ] Contact form tested end-to-end (Server Action, rate limit, email received)
- [ ] Links verified (GitHub, LinkedIn, Behance, live demos)
- [ ] OG previews verified for home and at least one dossier (share debugger)
- [ ] CHANGELOG updated

---

## 10. Content Inventory (MVP)

| Content | Source | Status |
|---|---|---|
| Hero copy and positioning | Owner | To write |
| Origin station (BS CS, University of Lahore) | Owner | To write |
| Build station: RoadGuard dossier | Owner + project repo | To write (highest priority ML evidence) |
| RoadGuard eval data (confusion matrix, loss curves, metric table) | Training and eval scripts (export to `*.eval.json`) | To export |
| Build station: CareerSyncAI (FYP) dossier | Owner + project docs | To write |
| Build station: Order Tracker app | Owner | To write |
| Field station: NIAIS internship | Owner | To write |
| Field station: Developers Hub internship | Owner | To write |
| Skills with evidence mapping | Owner | To write |
| Behance case studies (linked) | Behance | Link only |
| Resume PDF | Owner | Confirm latest version |
| `/llms.txt` content | Generated from content files | Generated at build |
| Lab station | Future | Placeholder hidden until ready |

---

## 11. Phased Roadmap

### Phase 0: Foundation (Week 1)
- Repo, Next.js + TypeScript + Tailwind setup
- `next-themes` configuration for Light/Dark mode
- ESLint, Prettier, Vitest, Playwright configured
- CI pipeline running on empty pages
- Vercel project linked, preview deployments working
- Design tokens (Light and Dark values) and base layout

**Exit criteria:** Empty site deploys from `main` in both themes, CI green.

### Phase 1: Content, Structure, and Agent Readability (Weeks 2-3)
- Content schemas and Zod validation (including the evaluation block)
- Home, Projects index, About, Contact (Server Action), Experience, Skills pages (static, no animation)
- `/llms.txt` route implementation
- Resume download, SEO basics, sitemap, dynamic OG image generator
- First dossier fully written (RoadGuard) with evaluation metrics table to validate the template

**Exit criteria:** Recruiter and AI-ready static site, live, with one complete dossier.

### Phase 2: Journey, Dossier Charts, and Micro-AI (Weeks 4-5)
- Journey map with scroll-linked progress
- Dossier case file UI with tabs (desktop) and accordion (mobile)
- Evaluation charts (Recharts) with captions, text summaries, and data table toggles
- Micro-AI search: Transformers.js in a Web Worker, precomputed embeddings in Orama, full-text fallback
- Remaining dossiers written
- Keyboard and reduced-motion support

**Exit criteria:** Journey, dossiers, and charts work on desktop and mobile in both themes. Micro-AI works with documented size and load time, and the fallback passes tests. A11y checks pass.

### Phase 3: Skills, Palette, and Polish (Weeks 6-7)
- Skills as evidence (linked highlighting)
- Command palette wired to Orama search across pages and dossiers
- Performance pass, Lighthouse budgets enforced in CI
- Visual regression baseline in both themes

**Exit criteria:** All budgets met, E2E suite green.

### Phase 4: Launch (Week 8)
- Custom domain, analytics, security headers
- Cross-browser and device testing, including a mid-range Android device for micro-AI
- Share with 3-5 peers or mentors for feedback (30-second test)
- Apply to roles with the live link

**Exit criteria:** Release checklist complete.

### Phase 5: Heavy Lab and AI Integration (After RAG and Job Matcher are built)
- Lab station with working demos
- AI proxy route with rate limiting and fallback
- Case files for backend AI projects, including eval results and chart data
- `/llms.txt` updated with AI projects

**Exit criteria:** Each AI feature has a working demo, an evaluation, and a documented fallback.

---

## 12. Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Over-animated design hurts performance | High | Performance budgets in CI, JS audit per addition |
| Scope creep into too many interactions | High | MVP interaction list is fixed; new ideas go to backlog |
| Micro-AI model too large for mobile | High | Quantized small model, lazy load, measured budget, full-text fallback, removal rule |
| Chart data hand-typed and inaccurate | High | Charts generated from export scripts only; reproducibility links in dossier |
| Dark theme looks like an afterthought | Medium | Both themes in design reviews, visual regression in both |
| Thin AI evidence at launch | Medium | Honest status labels, failure logs, focus on ML project depth |
| Content stalls (writing dossiers) | Medium | Template-first, one dossier at a time, ship partial content |
| Accessibility regressions | Medium | axe in E2E, keyboard checklist in release process |
| Spam or abuse of contact form | Medium | Server-side Zod validation, Upstash rate limit, honeypot, Turnstile if needed |
| Free-tier limits | Low | Static site stays within Vercel Hobby limits; monitor usage |
| Stale content | Medium | Quarterly content review, last-updated date on each dossier, `/llms.txt` regenerated on build |

---

## 13. Success Metrics

- **Recruiter test:** 3 out of 5 testers explain what the candidate does within 30 seconds.
- **Engagement:** Average visit includes at least one dossier open and one chart viewed (Vercel Analytics custom events, no personal data).
- **Micro-AI use:** Share of visitors who open search and complete a query.
- **Theme:** Share of visits in Dark mode, to confirm the dark theme gets real use.
- **Performance:** All Lighthouse budgets met on mobile.
- **Outcome:** Interview requests and response rate tracked manually against applications sent.

---

## 14. Open Questions

1. Primary target roles: AI engineer only, or AI engineer plus frontend developer?
2. Domain name: is `arhamzahid.dev` (or similar) available and affordable?
3. Resume: which version is the current master?
4. Contact method: form, direct email, or both?
5. Micro-AI model: which quantized embedding model to use, after measuring size and quality on a sample of dossier text?
6. Which dossier carries the first full set of evaluation charts? (Proposed: RoadGuard.)

---

## 15. Definition of Done (per dossier)

- [ ] All required schema fields filled with real content
- [ ] At least one failure log entry (for AI projects, required)
- [ ] Evaluation metrics and charts generated from real eval data, with captions and text summaries (for ML/AI projects)
- [ ] Reproducibility link (repo or notebook) for evaluation numbers
- [ ] Media with alt text
- [ ] Links verified
- [ ] Included in `/llms.txt`, and dossier OG image renders correctly
- [ ] Passes content validation and E2E smoke test
- [ ] Reviewed on mobile and desktop, in both themes
- [ ] Status label accurate (`shipped` / `in-progress` / `archived`)
