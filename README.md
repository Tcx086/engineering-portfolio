# Tom Chen — Engineering Portfolio

A static engineering portfolio for backend, data and market systems roles.

## Local development

Use Node 24 and the committed npm lockfile.

```sh
npm ci
npm run dev
```

```sh
npm run check
npm run build
npm test
npx playwright install chromium
npm run preview -- --port 4173
# In another terminal:
npm run test:browser
```

The browser suite checks all 12 routes at desktop and mobile sizes with axe WCAG A/AA checks, overflow checks, keyboard navigation, full/concise PDF and TXT downloads, native expandable technical sections and basic resource budgets. Public-monitor checks cover active-format test fixtures, refresh, delayed observations, HTTP failure, rejected private fields and JavaScript-disabled fallback. Reduced-motion checks save both architecture and source-landscape screenshots. `PORTFOLIO_BASE_URL` runs the suite against a deployment. Automated accessibility checks supplement human visual/keyboard review; they are not a conformance certification. Restart the preview server after rebuilding to reload its asset manifest.

## Architecture

- SvelteKit 3 + Svelte 5 + TypeScript, Tailwind CSS 4.
- `@sveltejs/adapter-static` prerenders the site into `build/`.
- `csr = false`: visitors receive complete HTML. Only the Microstructure page loads one native ES module for the read-only public monitor; other routes load no client JavaScript. There is no Svelte hydration runtime.
- Typed content in `src/lib/content.ts`; shared layout, responsive process diagrams and native expandable technical sections.
- No database, authentication, third-party fonts or analytics. The monitor's only runtime request is a same-origin static JSON artifact; it never contacts the collector or a private service.
- Vercel serves the static `build/` output; Cloudflare manages the portfolio subdomain's DNS. `vercel.json` supplies security headers and static hosting settings; `404.html` provides a real static error page. `_headers` retains equivalent Cloudflare-compatible headers.
- Sitemap, robots, canonical URLs and Open Graph metadata are included. The original `static/og.svg` and its raster export `static/og.png` are checked in together.

## Deployment and previews

The isolated Vercel project `tom-chen-engineering-portfolio` connects only to `Tcx086/engineering-portfolio`. The owner authorized Vercel as a fallback after a documented Cloudflare blocker.

Cloudflare Pages project creation with Git integration failed on October 18, 2026 with **8000011**: an internal issue with the account's Pages Git installation. No Pages project was created. The existing Wrangler sign-in was also expired and could not refresh non-interactively. Shared Git installations, existing projects and production applications were left untouched.

| Setting | Value |
| --- | --- |
| Framework preset | Other (`framework: null`; SvelteKit static adapter) |
| Production branch | `main` |
| Build command | `npm run check && npm run build && npm test` |
| Output directory | `build` |
| Node version | `24` (also pinned by `.node-version`) |
| Preview branches | All non-production branches |
| Custom domain | `portfolio.tcx086.com` |

Create a branch and push it to get an isolated Vercel preview. Validate the preview before merging into `main`. Vercel handles the Git-based build and deploy; the GitHub Actions workflow separately runs verification. No deployment secrets are stored in the repository.

Before first custom-domain setup, verify a successful isolated preview, add the new domain to this project, and create only the new `portfolio` CNAME in Cloudflare using Vercel's returned DNS target. If that name already exists, stop and inspect it. Never replace the root domain or alter another application's DNS, routes, bindings or secrets. Retain the DNS-only record so Vercel can validate ownership and issue TLS.

## Content maintenance

1. Edit `src/lib/content.ts` for project and note content. New project/note slugs are prerendered automatically.
2. Edit `src/lib/resume.json` for resume facts. Shared names, roles, dates, education and contacts serve both versions. `fullProfile`, `fullSkills` and `fullBullets` retain the master version's breadth; `concise` selects the three projects for the short PDF/TXT and HTML overview. Run `python scripts/generate-resume.py` with ReportLab and pypdf available to regenerate both PDFs, the concise TXT and the verification manifest. The script checks extracted facts, sections, pagination, metadata, contact-link annotations and PDF object structure. Render every page and inspect it after edits. Build verification rejects stale generated files.
3. Update the route expectations in `scripts/verify-build.mjs` and `tests/portfolio.spec.ts` when adding pages.
4. Run checks, build and focused verification before pushing. Review the preview at desktop and mobile sizes.
5. Keep approved contact details and canonical domain consistent across metadata, the sitemap and robots.

## Publication boundaries

Content is based on the approved owner brief, reviewed private engineering documentation and the master resume as a factual reference. Private material is summarized, never copied into this repository. The public contact is **tom863631@gmail.com**; the master resume's private contact fields and old LinkedIn account are excluded.

- FOMC capture counts describe **one documented event capture**, not general completeness, uptime or a later 24-hour campaign.
- Situation Monitor's case study omits undated totals. The full resume preserves the supplied v4.4 historical counts and parity result with explicit source-version labels; these are not claims about current totals or throughput.
- The Linux note distinguishes a software-preparation snapshot and synthetic checks from physical-host acceptance.
- Lomidance is part-time contract collaboration. No commercial source, proprietary architecture or internal operational artifacts are included.
- Resume facts were checked against the actual owner-supplied `Tom_Chen_Master_Resume_v4_4.pdf`. The full public derivative includes all six quantitative/analytical projects, contracted work, volunteering, education, skills, languages and hobby. The concise version remains an unchanged one-page engineering selection. Private contact and work-authorization fields are excluded.
- Portfolio optimization describes implemented comparisons confirmed by that source. Reproducible results are not published, and no return, alpha or method-ranking claim is made.
- There is no CS degree, institutional quant employment, audited trading return or autonomous multi-agent product claim.

The build verification includes a focused public-output privacy scan. Also inspect source changes manually before publication: no pattern-based scan can identify every confidential statement.

## Public monitor publication contract

The v1.4 visual system uses obsidian `#080808`, charcoal `#191715`, gold `#D7AF58`, bronze `#AA8242` and ivory `#F1E4C9`. Original symmetrical, stepped-city SVG framing is concentrated in the hero; section diamonds and restrained double borders frame featured evidence and diagrams. Poiret One is a self-hosted 7.8 KB display font (OFL license alongside the font); body copy retains the system sans-serif stack. No third-party font requests or animation library are needed. Decoration is noninteractive and reduced-motion overrides remain in place. Resume artifacts and factual project content are unchanged.

The v1.4 release remains **SNAPSHOT ONLY / LIVE INTEGRATION UNVERIFIED**. The collector panel separates Current Operations from the Documented Research Capture. Current values remain unpublished; historical FOMC numbers are not substituted for persistence counters.

The isolated service, disabled exporter, exact public schema, source-access blocker, resource limits, test procedure and shutdown instructions are documented in [telemetry/README.md](telemetry/README.md). The existing remote heartbeat path was inspected and does not transport the required persisted counters. No active collector runtime, integrity contract, private monitor or unrelated service has been changed. The preview service is tested with clearly labeled synthetic fixtures; those do not establish a real live integration. Production still uses its honest static fallback and cannot claim LIVE.

The viewer validates the 12-field allowlist, bounds streamed responses, rejects regressing observations, checks every 30 seconds while visible and marks observations older than three minutes delayed even if requests keep succeeding. Failed reads retain last verified values and mark them unavailable. Elapsed time stays fixed at the source observation. Its isolated module budget is 12 KB (raised from 9 KB for bounded reads, independent freshness checks and regression validation). Other routes load no client JavaScript.

The architecture views are original semantic HTML/CSS diagrams. Microstructure shows exchange feeds, WebSocket collection, normalization, storage, validation/reconciliation and replay/research, with a monitoring/lifecycle band across the pipeline. Situation Monitor shows six categorical source inputs and a five-stage processing/history/presentation flow. They describe responsibilities, not operational topology or live source health. The original skyline linework and share image use no licensed character or movie artwork.

## Full resume provenance and layout

Portfolio v1.2's public full resume was transcribed and edited from the actual two-page Master Resume v4.4 supplied by the owner. It is generated from selected public-safe facts, never by redacting or copying the original PDF's objects. The original and its extracted text remain outside tracked files and public output.

The derivative uses three pages with 10-point body text: professional profile/skills/work, quantitative projects, then analytical projects/volunteering/education/languages/hobby. A two-page flow split the primary case study and required further compression; the third page preserves readable type and all six projects. Repetitive prose and stack descriptions were consolidated. The original document's application-use notice, private contact/authorization details, personal trading-capital amount, confidential Lomidance module details, closed-test-user reference and volatile authored-commit total were omitted. No major section or project was removed.

The existing `/tom-chen-resume.pdf` and TXT bytes are preserved. The primary download is `/tom-chen-master-resume-public.pdf`. Only approved public contacts and city-level location appear. PDF generation permits only the intended contact-link annotations and rejects forms, attachments, optional-content layers, scripts, embedded objects and invisible text modes. These structural checks complement source review and rendered inspection; they do not make privacy review exhaustive.
