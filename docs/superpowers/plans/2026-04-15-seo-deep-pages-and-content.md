# SEO: Deep Pages & Content Expansion — Scoped Outline

> **⚠️ This is a scoped outline, NOT an executable implementation plan.**
>
> This work is **creative content + IA work**, not pure config/implementation. Before it becomes an executable plan via `superpowers:writing-plans`, it MUST go through `superpowers:brainstorming` so user intent, content strategy, and per-page copy requirements are locked down first. Writing service and case-study pages without that step produces generic, un-rankable content.
>
> **Prerequisite:** `2026-04-15-seo-domain-and-launch-hardening.md` merged and deployed. Do not start this work until the domain migration is done — new pages will inherit the centralized site URL, JSON-LD helpers, and localized meta infrastructure from Plan 1.

**Goal:** Expand the site from a single-page landing into a shallow site with 4 service pages and 1 full case study. Each page ranks for its own intent keyword, adds ~600–1,200 words of unique content, and lifts the E-E-A-T score from 50 → 70+ and AI Search Readiness from 40 → 70+.

**Why not just execute:** Service pages need real copy, not templated fluff — what is the actual engagement model for "Build"? What deliverables, timelines, team composition? "Memolink" case study needs role, challenge, approach, outcome, metrics. This information lives in the user's head (or in DESIGN.md / Figma / past engagement notes), not in the audit. Brainstorming is where we extract it.

---

## Scope (to be refined during brainstorming)

### Pages to add

| Route | Purpose | Minimum word count | Target intent |
|-------|---------|-------------------|---------------|
| `/services/build/` | Detail engagement for MVP / full-cycle product delivery | 700+ | "MVP development agency", "product development studio" |
| `/services/ai/` | AI features, integrations, agent workflows | 700+ | "AI integration agency", "LLM product development" |
| `/services/advisory/` | Product strategy, delivery setup, discovery | 600+ | "product strategy consultant", "fractional CPO" |
| `/services/growth/` | Post-launch expansion, iteration, support | 600+ | "product growth agency" |
| `/cases/memolink/` | Full Memolink case study — role, challenge, approach, outcome, visuals | 800+ | brand + "social app case study" |

Each page must exist in all three locales (`/ru/services/build/`, etc.) — that's 15 page instances.

### SEO infrastructure changes these pages require

1. **BreadcrumbList schema** on every deep page (Home → Services → Build, etc.).
2. **`Service` schema entries** for each service page, either as top-level `Service` items or as `hasOfferCatalog` entries on the Organization node.
3. **`CreativeWork` / `Article` schema** on the Memolink case study.
4. **Internal linking:** the landing page service cards should link to their dedicated pages; the case card should link to the case study. Related-service cross-links on each service page (e.g. Build → AI, Advisory).
5. **Sitemap entries** — `@astrojs/sitemap` will auto-generate once the pages exist, but verify all 15 entries are included.
6. **Navigation:** Header `Services` and `Cases` menu items currently scroll to anchors (`#services`, `#cases`); decide whether to keep anchor behavior on the landing page and add proper nav entries for deep pages, or convert to dropdown.
7. **Localized OG images per page** (optional, nice-to-have) — each service could have a bespoke 1200×630 unfurl generated via `@vercel/og`.
8. **`Article` vs `CreativeWork`** for the Memolink case — decide based on whether it's positioned as an editorial retrospective (Article) or a portfolio piece (CreativeWork with `workExample`).

---

## Open questions for brainstorming

Answer these before writing the executable plan:

### Content strategy

1. **Target persona per service page** — who is the buyer? Founders pre-seed? Series A CTOs? Enterprise innovation leads? Different audiences need different proof points.
2. **Engagement model for each service** — fixed-price? T&M? Retainer? Equity? Readers want price transparency or at minimum "starts at $X" / "2–6 week engagements".
3. **Team composition per service** — who works on Build vs AI vs Advisory? Named teammates with bios lifts E-E-A-T substantially.
4. **Case study depth for Memolink** — what's the NDA envelope? Can we show metrics (MAU, retention, conversion lift)? Screenshots? Video?
5. **Tone per locale** — should RU copy mirror EN word-for-word or adapt for the CIS market (different proof points, testimonials from regional clients)?

### Information architecture

6. **Deep-page navigation pattern** — dropdown in header, a `/services/` index page, or anchor links only on the landing?
7. **Case study listing** — is Memolink the first of many, or a one-off for now? If there'll be 4+ cases in 6 months, add `/cases/` index now.
8. **Footer changes** — add links to deep pages in the footer nav?
9. **Blog / Insights section** — out of scope for this plan but worth deciding now so the URL structure leaves room (`/blog/`, `/insights/`, `/journal/`)?

### Technical

10. **Reusable page shell** — extract a `DeepPageLayout.astro` that wraps `Layout.astro` with breadcrumb + standard hero + related links? Or compose inline?
11. **Copy storage** — keep per-page copy in `src/i18n/*.ts` dicts, or move to per-page markdown files in `src/content/` with Astro Content Collections?
12. **Images** — does the studio have brand illustration stock for service pages, or do we need to commission?
13. **Schema generator location** — extend `src/lib/schema.ts` (Plan 1 introduces it) with `serviceSchema()`, `breadcrumbSchema()`, `caseStudySchema()` helpers?

---

## Rough task shape (do not implement yet)

Once brainstorming clarifies the above, the executable plan will likely look like:

1. Content collections setup (if we adopt `src/content/` for per-page copy).
2. Extend `schema.ts` with `breadcrumbSchema`, `serviceSchema`, `caseStudySchema` helpers.
3. Build `DeepPageLayout.astro` (breadcrumb + hero + meta bundle + schema composition).
4. Build each service page (EN + RU + UZ) — 4 services × 3 locales = 12 pages.
5. Build the Memolink case study page — 3 locales.
6. Wire internal links from landing service/case cards to deep pages.
7. Update header nav / footer nav.
8. Verify sitemap includes all new URLs and hreflang groups are reciprocal.
9. Post-deploy: resubmit `afvs.dev/sitemap-index.xml` in GSC, request indexing for the 15 new URLs via `scripts/indexing_notify.py`.

Each of those is 2–5 steps. Full plan will be ~40–60 steps, ~10–15 commits.

---

## Kickoff

When ready to turn this outline into an executable plan:

```text
Use the superpowers:brainstorming skill to explore the questions above, then
use superpowers:writing-plans to produce the detailed step-by-step plan.
```

Do not skip brainstorming. Service pages written from the audit alone will be thin, generic, and un-rankable — the exact failure mode the audit flagged in the first place.
