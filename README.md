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

The browser suite checks all 12 routes at desktop and mobile sizes with axe WCAG A/AA checks, overflow checks, keyboard navigation, a resume download and basic resource budgets. It saves representative screenshots in ignored `test-results/`. `PORTFOLIO_BASE_URL` runs the same suite against a deployment. Automated accessibility checks supplement human visual/keyboard review; they are not a conformance certification.

## Architecture

- SvelteKit 3 + Svelte 5 + TypeScript, Tailwind CSS 4.
- `@sveltejs/adapter-static` prerenders the site into `build/`.
- `csr = false`: visitors receive complete HTML; no client JavaScript is loaded.
- Typed content in `src/lib/content.ts`; shared layout and original SVG diagrams.
- No database, authentication, third-party fonts, analytics or runtime API calls.
- Cloudflare Pages serves static files. `_headers` supplies security headers; `404.html` provides a real static error page.
- Sitemap, robots, canonical URLs and Open Graph metadata are included. The original `static/og.svg` and its raster export `static/og.png` are checked in together.

## Deployment and previews

Use a **new, isolated** Cloudflare Pages project named `tom-chen-engineering-portfolio` connected only to `Tcx086/engineering-portfolio`:

| Setting | Value |
| --- | --- |
| Production branch | `main` |
| Build command | `npm run check && npm run build && npm test` |
| Output directory | `build` |
| Node version | `24` (also pinned by `.node-version`) |
| Preview branches | All non-production branches |
| Custom domain | `portfolio.tcx086.com` |

Create a branch and push it to get an isolated Pages preview. Validate the preview before merging into `main`. Pages handles the Git-based build and deploy; a separate deployment token or GitHub Actions deployment workflow is unnecessary.

Before first custom-domain setup, verify a successful isolated preview, add the new domain to this Pages project, and create only the new `portfolio` CNAME pointing at the project's returned `pages.dev` hostname. If that name already exists, stop and inspect it. Never replace the root domain or alter another application's DNS, routes, bindings or secrets.

## Content maintenance

1. Edit `src/lib/content.ts` for project and note content. New project/note slugs are prerendered automatically.
2. Keep the public HTML resume and `static/tom-chen-resume.txt` consistent.
3. Update the route expectations in `scripts/verify-build.mjs` and `tests/portfolio.spec.ts` when adding pages.
4. Run checks, build and focused verification before pushing. Review the preview at desktop and mobile sizes.
5. Keep approved contact details and canonical domain consistent across metadata, the sitemap and robots.

## Publication boundaries

Content is based on the approved owner brief, reviewed private engineering documentation and the master resume as a factual reference. Private material is summarized, never copied into this repository. The public contact is **tom863631@gmail.com**; the master resume's private contact fields and old LinkedIn account are excluded.

- FOMC capture counts describe **one documented event capture**, not general completeness, uptime or a later 24-hour campaign.
- Situation Monitor's historical 106K/207K counts and 110-item parity total are withheld pending dated, scoped evidence.
- The Linux note distinguishes a software-preparation snapshot and synthetic checks from physical-host acceptance.
- Lomidance is part-time contract collaboration. No commercial source, proprietary architecture or internal operational artifacts are included.
- Portfolio optimization describes an approved independent research scope. Reproducible results are not provided, and no return, alpha or method-ranking claim is made.
- There is no CS degree, institutional quant employment, audited trading return or autonomous multi-agent product claim.

The build verification includes a focused public-output privacy scan. Also inspect source changes manually before publication: no pattern-based scan can identify every confidential statement.
