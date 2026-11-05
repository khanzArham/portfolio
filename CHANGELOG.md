# Changelog

All notable changes to this site. Dates are YYYY-MM-DD.

## Unreleased

### Added

- **Resume download.** The Software & AI Engineer CV (Nov 2026) is at
  `/resume.pdf`, with Download Resume buttons on home and About and a line
  in `/llms.txt`.
- **First public case files.** Order Tracker (CASE-003, featured on home),
  Rental Property Management System (CASE-002, renamed from Smart Property
  Rental System) and Brick Breaker (CASE-001), each with the owner's role,
  method, a real failure log and outcome.
- **CareerSyncAI case file (CASE-004, in progress).** The final year project
  in its design phase: the problem, the owner's role and the planned
  architecture. Dossiers marked `in-progress` may now omit the failure log
  and evaluation until there is real work to report; the page says so.
- **"Ask the site" search on the Work page (Step 20).** Keyword search works
  immediately; semantic search is opt-in and runs entirely in the visitor's
  browser. Nothing typed is sent to a server, and the page makes no
  third-party requests.
- **Quality gates (Step 22).** Every pull request now runs Lighthouse
  against its Vercel preview with the plan §7.1 budgets, axe checks on every
  page in light and dark themes, and screenshot comparisons of home,
  projects and a dossier with charts at mobile and desktop widths.

### Changed

- **Contact.** A new intro for projects, roles and feedback. Name and Email
  sit side by side from md up, with 8px between label and field, example
  placeholders, a darker border on hover and an accent glow on focus, and
  16px between the field row, the message and the send button. The send
  button has a paper-plane icon, spans the width on phones and fits its
  label from md up. The About page ends with two cards,
  FOR EMPLOYERS (Get in touch, Resume) and FOR VISITORS (Send feedback),
  whose buttons share one size and carry inline icons (no icon library).
- **Header.** Sticky with a blurred background, an avatar before the name
  (initials; a photo at `public/profile.jpg` replaces them), and a Resume
  download next to Contact; the mobile menu has Download Resume too.
- **More scroll effects.** The hero eases away as you scroll past it,
  section titles slide in, skill chips pop in, and the journey dots pop in
  turn. Off under reduced motion, like the rest.
- **Justified text.** Paragraphs are justified where the measure is wide
  (from 640px up), with no hyphenation and balanced line breaks. Phones,
  narrow cards, headings and monospace labels stay left-aligned, which keeps
  the gaps between words even.
- **Theme switch** cross-fades the whole page (View Transitions API) instead
  of snapping; instant under reduced motion or in browsers without it.
- **Cursors.** Buttons, menu triggers and the theme switch show the pointer;
  the header search shows a text cursor.
- **Fixed:** Turbopack's disk cache could keep an old `globals.css` in both
  `next dev` and `next build`; it is now off for both (fresh, slightly slower
  compiles).
- **Motion.** The mobile menu slides in from the right with a fading
  backdrop and its links rise in turn; it slides out on close. Cards, the
  journey and skill boxes rise into place as they scroll into view, a thin
  bar under the header tracks reading progress, and in-page links scroll
  smoothly. All CSS (no new libraries), and all off under reduced motion.
- **Journey** spans the full width on wider screens: first station left,
  last right, the rest centred.
- **LinkedIn** links point to linkedin.com/in/arhamzahidkhan. The About
  card keeps the Email button and drops the repeated address.
- **Matched to the Software & AI Engineer CV (Nov 2026).** About opens
  with "Software & AI Engineer" and the profile card shows the location.
  Education lists the CV's core focus. Skills add Postman and a Software
  Engineering box (Object-Oriented Programming, System Architecture); MS SQL
  is gone, as the CV does not list it. Order Tracker adds Tailwind CSS; the
  rental case file is now "Smart Property Rental Management System"; Brick
  Breaker's fix is described as continuous collision detection;
  CareerSyncAI plans recruiter and candidate dashboards with a Kanban
  pipeline. Every skill now leads to evidence.
- **New look: "Software & AI Engineer Studio".** Slate neutrals with a
  sky (light) or cyan (dark) accent and indigo stack badges, about 90% neutral.
  1px borders replace shadows. Inter for text and headings, JetBrains Mono for
  metadata. Every colour pair is AA: sky-600 and slate-500 were deepened
  slightly in light mode to pass on all surfaces. Share images use the same
  look.
- **Hero.** The role is now "Software & AI Engineer", with an availability
  pill. A "Download Resume" button appears once `public/resume.pdf` exists.
- **Project cards** look like small terminal windows (red, amber and green
  window controls, then the file path): status,
  up to six stack badges ("+N more" beyond that), then, pinned to the bottom
  so cards in a row line up, the first failure log entry as the challenge,
  tags and role. The home link to all dossiers reads "See all work".
- **Skills** sit in two columns of boxes, each as tall as its content: AI &
  LLM Orchestration, Backend & Databases, Frontend Development, Tools &
  Workflow, Software Engineering; boxes after the fourth join the shorter
  column. Added VS Code, Vercel, HTML5 / CSS3, LangChain, CrewAI and
  Pydantic.
  - The evidence panel shows only the work behind the chosen skill (work that
    used it, then work that plans to), and the newest case file by default.
    On smaller screens, choosing a skill scrolls to the evidence.
  - Skills can imply others (MySQL implies SQL, Next.js implies React and so
    JavaScript), so related skills share their evidence.
  - Shipped dossiers also list Git and GitHub, and Order Tracker JavaScript
    and HTML5 / CSS3. CareerSyncAI lists its planned stack, shown as
    "Planned stack" and "Planned:", never "Uses", while it is in progress.
- **About page.** The bio fills its column beside a profile card: role,
  availability, education, latest role, current project, and GitHub,
  LinkedIn and Email as buttons with their logos.
- **Footer.** "Designed & Built by" credit with a link to the source code;
  links to other sites open in a new tab.
- **Home page.** The journey map runs left to right on wider screens (still
  top to bottom on phones), so the featured dossiers show without scrolling.
  Three dossiers are featured, with a link to all case files.
- **Skills page.** The counts beside each skill are gone. Choosing a skill
  moves the dossiers that used it to the top, and also lists the roles that
  used it (from the internship), so more skills lead to evidence.
- **Footer.** GitHub, LinkedIn and Email links now have icons.
- **Development preview.** `npm run dev` no longer shows the test fixtures;
  they appear only with `CONTENT_FIXTURES=1` (CI and tests).
- **Faster first load (Step 22).** The command palette and mobile menu load
  on demand instead of with every page, Fraunces ships one weight instead of
  the full variable range, and the contact form validates with `zod/mini`.
- **Fixed:** the contact page no longer triggers a Content Security Policy
  error (Zod tried to compile validators with `new Function`).

### Micro-AI measurements (plan §6.6, Step 20)

| Item                         | Value                                                                            |
| ---------------------------- | -------------------------------------------------------------------------------- |
| Model                        | `Snowflake/snowflake-arctic-embed-xs`, int8 (Apache-2.0), 384 dims               |
| Pinned revision              | `d8c86521100d3556476a063fc2342036d45c106f`, weights hash checked at build        |
| Model weights                | 21.9 MB (served uncompressed)                                                    |
| Runtime (ONNX Runtime web)   | `ort-wasm-simd-threaded.asyncify.wasm`: 6.4 MB transferred (13.6 MB raw)         |
| First-time download          | **28.5 MB measured** (button states 29 MB); 0 MB on later visits (browser cache) |
| Load time, desktop           | ~4.0 s to ready (Chromium, Windows, localhost, 2026-10-30)                       |
| Load time, mid-range Android | **Pending**: measure on a real device after deploy (plan §7.5)                   |
| Initial page load            | Model, runtime and index are not loaded until the visitor searches               |

Fixed during measurement: Transformers.js 4 fetched the model weights twice
in parallel (50.4 MB). The worker now pre-loads each file once into the
cache that Transformers.js reads first.

**Budget rule (plan §6.6):** if the Android measurement breaks the mobile
performance budget, semantic search is removed and the panel keeps keyword
search. Record that decision here.
