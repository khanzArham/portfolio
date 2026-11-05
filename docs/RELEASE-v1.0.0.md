# Release checklist: v1.0.0

Release date: 2026-11-05. Site: https://portfolio-khanzarham.vercel.app

The checklist from plan §9.4, with the status of each item at launch and
how it was checked. "Owner" marks a check only the owner can do.

## Plan §9.4

| Item | Status | How it was checked |
| --- | --- | --- |
| All CI checks green | Done | PR #25: CI and Lighthouse passed (Lighthouse re-run to confirm). Every page's median Performance 99, Accessibility, Best Practices and SEO 100, LCP 2.0–2.1 s, CLS 0. |
| Mobile and desktop manual check, Light and Dark themes | Done | Owner reviewed the deployed site. Visual regression covers home, Work and a dossier with charts at 375 px and 1280 px in both themes. |
| Keyboard-only walkthrough | Owner | E2E covers the command palette, dossier tabs and accordion, journey stations, the mobile menu (focus returns to its button) and the contact form. A full manual pass is still to do. |
| Reduced motion check | Done | E2E checks the journey animation under both settings; visual and accessibility tests run with reduced motion, where every scroll effect, the menu slide and the theme cross-fade are off. |
| Charts render with real eval data, with captions and text summaries | Not yet applicable | No public dossier has evaluation data yet: CareerSyncAI, the AI project, is in design. Chart rendering, captions and summaries are tested on the fixture dossier. |
| Command palette search works, and fallback works with the micro-AI worker disabled | Done | E2E: palette search, keyboard navigation and theme actions; keyword search works before semantic search is turned on. |
| `/llms.txt` loads and lists current dossiers | Done | Live: lists CASE-001 to CASE-004 and the résumé; E2E checks its links resolve. |
| Résumé PDF is current | Done | Software & AI Engineer CV (Nov 2026) at `/resume.pdf`, published as supplied by the owner, including phone number and schools at the owner's decision. Note: it describes CareerSyncAI as under development; the site says "in design". |
| Contact form tested end to end (Server Action, rate limit, email received) | Done, preview | Step 10: real emails arrived with the right reply-to, and the fourth message within an hour was blocked. Production uses the same keys (set for Production and Preview). Owner: send one message from the live site. |
| Links verified (GitHub, LinkedIn, Behance, live demos) | Partly | GitHub profile and repository return 200. LinkedIn blocks automated checks (status 999): owner to click once. No Behance or public demo links are listed. |
| OG previews verified for home and at least one dossier | Partly | Live: `og:image` and `summary_large_image` on home and dossiers; images return 200. Owner: run one URL through LinkedIn Post Inspector. |
| CHANGELOG updated | Done | `CHANGELOG.md`, section 1.0.0. |

## Implementation plan, Step 23

| Item | Status |
| --- | --- |
| Custom domain | Deferred: launch on `portfolio-khanzarham.vercel.app`; a domain later only changes `site.url`. |
| Email and rate-limit keys set for Production | Done (owner, Vercel). |
| Browsers | Automated smoke on the live site in Chromium (Chrome, Edge), Firefox and WebKit (Safari), desktop and mobile sizes: every page 200 with one heading, theme toggle, mobile menu with résumé, contact form labels, no console errors. Owner: real iPhone and Android devices, including one mid-range Android. |
| Keyboard and reduced motion | See above. |
| Peer read-through ("In 30 seconds, what does this person do?") | Owner, after launch. |
| Changelog MVP entry and micro-AI measurements | Done; the Android timing is pending (owner). |
| README | Done. |
| v1.0.0 tag and GitHub release | With this release. |
