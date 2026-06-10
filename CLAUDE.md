# TRT Guide — Clinic Comparison Hub

## What this app does
Affiliate review site comparing online TRT clinics. Users read full reviews (scored on a 10-point rubric), compare pricing, and follow affiliate links to sign up. Revenue = affiliate commissions.

## Stack
Express.js + EJS + PostgreSQL (Neon) on Render.

## Directory map
- `server.js` — Entry point; mounts middleware and routes only (≤300 lines, no business logic).
- `routes/` — One file per endpoint group using `express.Router()`.
- `db/` — Database access functions. Only `db/` may call `new Pool()`.
- `views/` — EJS templates. `views/partials/` for shared sections (header, footer, nav).
- `views/pages/` — Full page templates (reviews, legal, comparison, quiz).
- `public/css/` — Stylesheets. `theme.css` main, `quiz.css` quiz tool.
- `migrate.js` — Runs on every deploy; creates core tables and applies folder migrations.
- `migrations/` — Timestamp-prefixed SQL migration files (one-time DDL).
- `lib/` — Shared utility modules (landing context builder).
- `scripts/` — Build automation. `generate-sitemap.js` runs on every deploy to auto-generate public/sitemap.xml from content index.

## Database
- `users` — Polsia-managed subscription table (email, stripe_subscription_id, subscription_status, etc.).
- `quiz_responses` — Quiz lead capture (name, email, answers JSON, top match, UTM, affiliate click).
- `_migrations` — Migration tracking table (auto-created by migrate.js).

## External integrations
- Stripe: affiliate payouts handled by Polsia platform.
- Google Analytics 4 (GA4): pageviews, sessions, referral sources via `GA4_MEASUREMENT_ID` env var; snippet built by `lib/landing-context.js:buildGa4Snippet()`.

## Recent changes
- 2026-06-09 — IndexNow integration: `scripts/submit-indexnow.js` pings Bing/Yandex/Naver/Seznam/Yep with all sitemap URLs on every deploy. IndexNow key served via Express route at `/83aab6f56375eb123ee557d138ae69e4.txt`. Owner must add site to Bing Webmaster Tools once for authorization (see docs/seo-setup.md). Google Search Console requires one-time OAuth setup — see docs/seo-setup.md.
- 2026-06-09 — Rankings now computed dynamically from sort position in routes — not hardcoded in content-index.js. Homepage, /reviews hub, /comparison, and individual review pages all reflect live rank from score order. Adding a new clinic to content-index.js automatically slots it into the correct position everywhere.
- 2026-06-03 — Internal linking map built across all pages. Review template now shows 5 learn article cards + 3 buying guides + comparison link. Learn articles now show top 3 clinic review cards (TRT Nation, Fountain TRT, Peter MD) + 2 guide links. Homepage links to /reviews and /guides hubs. Guides hub and reviews-hub updated with cross-section CTAs.
- 2026-06-02 — Homepage now dynamically populates from `lib/content-index.js` — no hardcoded clinic/article lists. Added missing Jack Health, removed duplicate Peter MD entry, fixed rank ordering. All 11 clinic reviews + 8 learn articles appear automatically.
- 2026-05-30 — Added GA4 pageview tracking to all pages via `GA4_MEASUREMENT_ID` env var. Snippet injected by `lib/landing-context.js`. CLAUDE.md updated.
- 2026-05-29 — Added internal links to /learn hub from homepage and review pages. "Learn more" strip after clinic cards, "Related reading" panel on review pages.
- 2026-05-26 — Upgraded quiz CTA on homepage — new banner above fold with teal gradient, badge, headline, and prominent green button.
- 2026-05-26 — Built TRT Match Quiz at /quiz — 5-question step-by-step flow, weighted scoring (budget 35%, delivery 25%, telemedicine 20%, TRT status 20%), lead capture to quiz_responses table, affiliate click tracking. Header nav updated.
- 2026-05-26 — Added 6 /learn hub articles with full editorial content (what-is-trt, trt-lab-values, trt-for-beginners, trt-benefits, trt-side-effects, trt-cost). Sitemap updated.
- 2026-05-25 — Added SynergenX Health (7.2/10) and Low T Center (6.4/10) reviews — 7 clinics total. Homepage comparison table, /comparison page, and sitemap.xml updated.
- 2026-05-24 — Site skeleton: routes/, legal pages, 3 clinic reviews (TRT Nation, Fountain TRT, Hone Health), FTC/methodology stamps, comparison page.
- 2026-05-24 — Visual design overhaul: Wirecutter-grade editorial polish. New: score badge/pill system with tier colors, sticky review rail, hero panel table, unobtrusive FTC notice, dark footer, mobile CTA bar, hone-vs-marek-cost guide with side-by-side delta panel. All pages updated.
- 2026-05-24 — Bug fixes + design polish: Fixed homepage routing (comparison.js intercepted GET /), fixed rubric score rendering (clinic scores were overwritten by global RUBRIC), /reviews redirects to /comparison. Added CSS classes for pricing tables, cost callouts, guide CTAs. Homepage now data-driven from CLINICS. All 5 clinic reviews confirmed live.
- 2026-05-24 — Full rebrand: Site renamed from TestBench to TRT Guide. All templates, meta tags, OG/Twitter tags, FTC disclosures, legal pages, about/methodology pages updated. Analytics slug updated to 'trtguide'. Emails updated to @trtguide.com (inbox preserved as testbench@polsia.app per deliverability requirement).
- 2026-06-02 — Auto-generated sitemap.xml on every deploy via scripts/generate-sitemap.js. Reads clinic slugs from CLINICS export, learn/guides slugs from source files, writes valid XML to public/sitemap.xml with correct changefreq values. Added to npm build pipeline.