# Changelog

All notable changes to this site. Dates are YYYY-MM-DD.

## Unreleased

### Added

- **"Ask the site" search on the Work page (Step 20).** Keyword search works
  immediately; semantic search is opt-in and runs entirely in the visitor's
  browser. Nothing typed is sent to a server, and the page makes no
  third-party requests.
- **Quality gates (Step 22).** Every pull request now runs Lighthouse
  against its Vercel preview with the plan §7.1 budgets, axe checks on every
  page in light and dark themes, and screenshot comparisons of home,
  projects and a dossier with charts at mobile and desktop widths.

### Changed

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
