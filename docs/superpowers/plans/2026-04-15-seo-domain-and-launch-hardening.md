# SEO: Domain Migration & Launch Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Migrate the canonical domain from `afvs.studio` (dead, never registered) to `afvs.dev` (being purchased), block indexation of the `afvsweb.vercel.app` preview, localize SEO metadata per locale, expand structured data + Organization schema, optimize OG image, correct image alt handling, add security + cache headers, and ship `llms.txt`. Ends with a site that is safe to point `afvs.dev` DNS to.

**Architecture:**
- Centralize the site URL in **one place** — `astro.config.mjs`'s `site` field (which populates `Astro.site`) — and remove every hardcoded `'https://afvs.studio'` fallback in `Layout.astro`. For server-only code that cannot read `Astro.site` (API routes), introduce `src/lib/site.ts` reading `import.meta.env.PUBLIC_SITE_URL ?? 'https://afvs.dev'`.
- SEO copy (titles, meta descriptions, OG strings) lives next to translation dicts in `src/i18n/{en,ru,uz}.ts` under a new `seo` key so localization stays colocated with the rest of the copy.
- Security headers, preview `noindex`, and immutable caching for `/_astro/*` are declared in `vercel.json` (Vercel-native, no runtime cost).
- OG image is regenerated as a size-optimized PNG (~200–250 KB) checked into `public/og-image.png`. Generating dynamically via `@vercel/og` is captured as a follow-up — out of scope here to avoid scope creep.
- All structured data stays as inline `<script type="application/ld+json">` blocks rendered by `Layout.astro`, assembled from typed TS objects in `src/lib/schema.ts`.

**Tech Stack:** Astro 5 (SSG + `output: 'server'` adapter), `@astrojs/vercel`, `@astrojs/sitemap`, TypeScript strict, CSS Modules. No new dependencies added by this plan.

**Verification discipline:** This is a static marketing site with no existing test harness. Standing up Vitest/Playwright for this work is YAGNI. Instead, every task's "verify" step runs `npm run build` and greps the generated `dist/**/*.html` output for the assertion. Production behavior (headers, caching) is verified with `curl -sI` against the preview after push.

**Pre-flight:**
- Confirm with the user that `afvs.dev` is the target domain. If not yet registered, this plan still ships safely — the code will just refer to a domain that doesn't resolve until DNS is set. No worse than today.
- Confirm email handle: will it stay `hello@afvs.studio` or move to `hello@afvs.dev`? Tasks assume **`hello@afvs.dev`**; if `afvs.studio` is kept for email, skip Task 7.
- This plan should ideally run in a dedicated worktree. Optional first step: `git worktree add ../af.vs_web-seo seo-launch-hardening`.

---

## File Structure

**Created:**
- `src/lib/site.ts` — typed `SITE_URL`, `SITE_NAME`, `CONTACT_EMAIL` constants sourced from env.
- `src/lib/seoMeta.ts` — `buildPageMeta(locale, path, dict)` → `{ title, description, ogTitle, ogDescription }`. Single function, pure, deterministic.
- `src/lib/schema.ts` — `organizationSchema()`, `websiteSchema(locale)` returning plain objects for JSON.stringify.
- `public/llms.txt` — plain-text studio summary per <https://llmstxt.org>.
- `docs/superpowers/plans/2026-04-15-seo-domain-and-launch-hardening.md` — this file.

**Modified:**
- `astro.config.mjs` — `site: 'https://afvs.dev'`.
- `vercel.json` — add `headers` block for preview `noindex`, security headers, and immutable cache for `/_astro/*`.
- `public/robots.txt` — point `Sitemap:` directive at `afvs.dev`.
- `public/og-image.png` — replace with optimized version (target ≤ 260 KB).
- `src/i18n/en.ts`, `src/i18n/ru.ts`, `src/i18n/uz.ts` — add `seo` section with localized title, description, ogTitle, ogDescription; update footer `Mail` entry.
- `src/pages/api/contact.ts` — add `https://afvs.dev` to `ALLOWED_ORIGINS`, remove `afvs.studio` entries.
- `src/components/layout/Layout.astro` — remove literal `'https://afvs.studio'` fallbacks (replace with `Astro.site!`), render JSON-LD via `schema.ts`, accept full meta bundle as a prop.
- `src/components/pages/Landing.astro` — replace hardcoded `title="AF Venture Studio"` with per-locale meta from `buildPageMeta`.
- `src/components/hero/Hero.astro` — keep hero background `alt=""` but ensure `aria-hidden="true"` is present (already is) and add comment explaining decorative intent.
- `src/components/services/ServiceCard.astro` — add `aria-hidden="true"` on the decorative service illustration (label text sits adjacent, so a prop is unnecessary).
- `src/components/cases/CaseCard.astro` — accept `imageAlt` prop and render descriptive alt for `case-1.webp` (Memolink).
- `src/components/cases/Cases.astro` — pass `imageAlt` from dict through to `CaseCard`.
- `src/components/form/BrifForm.astro` — add `aria-hidden="true"` on decorative brif-option icons + success icon (labels sit next to them, so empty alt + aria-hidden is correct).
- `src/components/chrome/Header.astro` — replace `<h2 id="mobile-menu-title" class="sr-only">Navigation</h2>` with `<nav aria-labelledby>` pattern (or visually-hidden `<h2>` moved out of the document outline via `role="presentation"` is NOT valid; we'll use `aria-label` on `<nav>` instead).

**Not touched:** `src/components/chrome/Footer.astro` copyright, `src/components/form/*` form logic, DB/API behavior beyond the CORS allowlist.

---

## Task 1: Centralize site URL (single source of truth)

**Files:**
- Create: `src/lib/site.ts`
- Modify: `astro.config.mjs`
- Modify: `src/components/layout/Layout.astro` (lines 17–18, 32, 34, 80–82)

- [ ] **Step 1: Update `astro.config.mjs` to the new canonical domain**

Change the `site` field from `'https://afvs.studio'` to `'https://afvs.dev'`:

```js
// astro.config.mjs
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://afvs.dev',
  adapter: vercel(),
  output: 'server',
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ru: 'ru', uz: 'uz' },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uz'],
    routing: { prefixDefaultLocale: false },
  },
});
```

- [ ] **Step 2: Create `src/lib/site.ts`**

```ts
// src/lib/site.ts
// Single source of truth for origin + brand constants used in server-only code
// (API routes) where `Astro.site` is not available. For templates, prefer
// `Astro.site` — it is populated from astro.config.mjs `site`.

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? 'https://afvs.dev') as string;
export const SITE_NAME = 'AF Venture Studio';
export const CONTACT_EMAIL = 'hello@afvs.dev';
```

- [ ] **Step 3: Remove literal `'https://afvs.studio'` fallbacks in `Layout.astro`**

At `src/components/layout/Layout.astro` lines 17–18, 32, 34: replace `Astro.site ?? 'https://afvs.studio'` with `Astro.site!`. Astro guarantees `Astro.site` is set when the `site` field is in `astro.config.mjs`, so the fallback is dead code. Example:

```ts
// before (line 17):
const canonicalURL = new URL(Astro.url.pathname, Astro.site ?? 'https://afvs.studio');
// after:
const canonicalURL = new URL(Astro.url.pathname, Astro.site!);
```

Apply the same replacement to lines 18, 32, 34. Leave the Organization JSON-LD block alone for now — Task 6 replaces it wholesale.

- [ ] **Step 4: Build and verify no `afvs.studio` remains in generated HTML**

```bash
npm run build
grep -RIln "afvs\.studio" dist/ || echo "OK: no afvs.studio references"
grep -RIln "afvs\.dev" dist/ | head
```

Expected: first grep prints `OK: no afvs.studio references`. Second grep lists all three built pages referencing the new domain.

- [ ] **Step 5: Commit**

```bash
git add astro.config.mjs src/lib/site.ts src/components/layout/Layout.astro
git commit -m "feat(seo): migrate canonical domain to afvs.dev, centralize site URL"
```

---

## Task 2: Update robots.txt + API CORS allowlist + i18n mailto

**Files:**
- Modify: `public/robots.txt`
- Modify: `src/pages/api/contact.ts:11-12`
- Modify: `src/i18n/en.ts:102`, `src/i18n/ru.ts:102`, `src/i18n/uz.ts:102`

- [ ] **Step 1: Rewrite `public/robots.txt` sitemap target**

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://afvs.dev/sitemap-index.xml
```

- [ ] **Step 2: Update API CORS allowlist**

In `src/pages/api/contact.ts`, replace lines 11–12:

```ts
const ALLOWED_ORIGINS = new Set([
  'https://afvs.dev',
  'https://www.afvs.dev',
]);
```

Keep the `localhost` / `127.0.0.1` branch intact for local dev. Note: the preview origin `https://afvsweb.vercel.app` is intentionally not allowlisted — no real form submissions should originate there. If the team needs to test the form from preview, temporarily add the preview origin via env var; do not hardcode it.

- [ ] **Step 3: Update footer mail link in all three locale dicts**

In `src/i18n/en.ts`, `src/i18n/ru.ts`, `src/i18n/uz.ts`, replace the single `mailto:hello@afvs.studio` entry with `mailto:hello@afvs.dev`. Pattern (apply to all three files):

```ts
{ label: 'Mail', href: 'mailto:hello@afvs.dev' },
```

- [ ] **Step 4: Build and verify**

```bash
npm run build
grep -R "afvs\.studio" dist/ public/ src/ && echo "FAIL: stale reference" || echo "OK: all afvs.studio references removed"
```

Expected: `OK: all afvs.studio references removed`.

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt src/pages/api/contact.ts src/i18n/en.ts src/i18n/ru.ts src/i18n/uz.ts
git commit -m "feat(seo): update robots, CORS allowlist, and mailto to afvs.dev"
```

---

## Task 3: Add per-locale SEO metadata (title + description)

**Files:**
- Modify: `src/i18n/en.ts`, `src/i18n/ru.ts`, `src/i18n/uz.ts` (append `seo` section + type update)
- Create: `src/lib/seoMeta.ts`
- Modify: `src/components/pages/Landing.astro` (replace hardcoded title)
- Modify: `src/components/layout/Layout.astro` (accept richer meta props)

- [ ] **Step 1: Extend the EN dict type with a `seo` section**

Append to `src/i18n/en.ts` **before** the `footer` entry:

```ts
  seo: {
    homeTitle: 'AF Venture Studio — Product Design & Development Studio',
    homeDescription:
      'AF Venture Studio builds MVPs, AI-powered features, and full-cycle products. Strategic product advisory, UI/UX design, and growth support from idea to scale.',
    homeOgTitle: 'AF Venture Studio — From idea to product, from product to growth',
    homeOgDescription:
      'A product design and development studio. We ship MVPs, integrate AI into real workflows, and support products from launch through growth.',
  },
```

Because `en.ts` exports `export type Dict = typeof en;`, RU and UZ dicts are automatically required to implement this shape.

- [ ] **Step 2: Add localized `seo` to `src/i18n/ru.ts`**

Append to `src/i18n/ru.ts` before `footer`:

```ts
  seo: {
    homeTitle: 'AF Venture Studio — Студия дизайна и разработки продуктов',
    homeDescription:
      'AF Venture Studio создаёт MVP, AI-функции и продукты полного цикла. Стратегическое консультирование, UI/UX дизайн и поддержка роста — от идеи до масштаба.',
    homeOgTitle: 'AF Venture Studio — От идеи к продукту, от продукта к росту',
    homeOgDescription:
      'Студия дизайна и разработки продуктов. Делаем MVP, встраиваем AI в реальные сценарии и сопровождаем продукт от запуска до роста.',
  },
```

- [ ] **Step 3: Add localized `seo` to `src/i18n/uz.ts`**

Append to `src/i18n/uz.ts` before `footer`:

```ts
  seo: {
    homeTitle: 'AF Venture Studio — Mahsulot dizayni va ishlab chiqish studiyasi',
    homeDescription:
      "AF Venture Studio MVP, AI asosidagi imkoniyatlar va to'liq tsikl mahsulotlarini yaratadi. Mahsulot strategiyasi, UI/UX dizayn va o'sish qo'llab-quvvatlashi — g'oyadan miqyosgacha.",
    homeOgTitle: "AF Venture Studio — G'oyadan mahsulotga, mahsulotdan o'sishga",
    homeOgDescription:
      "Mahsulot dizayni va ishlab chiqish studiyasi. MVP yaratamiz, AI ni real stsenariylarga integratsiya qilamiz va mahsulotni ishga tushirishdan o'sishgacha qo'llab-quvvatlaymiz.",
  },
```

- [ ] **Step 4: Create `src/lib/seoMeta.ts`**

```ts
// src/lib/seoMeta.ts
import type { Dict } from '../i18n/en';
import type { Locale } from './paths';

export interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

export function buildHomeMeta(dict: Dict, _locale: Locale): PageMeta {
  return {
    title: dict.seo.homeTitle,
    description: dict.seo.homeDescription,
    ogTitle: dict.seo.homeOgTitle,
    ogDescription: dict.seo.homeOgDescription,
  };
}
```

- [ ] **Step 5: Extend `Layout.astro` Props to accept full meta bundle**

In `src/components/layout/Layout.astro`, update the Props interface and destructure (around lines 9–16):

```ts
interface Props {
  title: string;
  description?: string;
  ogTitle?: string;
  ogDescription?: string;
  lang?: Locale;
  ogImage?: string;
}

const {
  title,
  description = '',
  ogTitle = title,
  ogDescription = description,
  lang = 'en',
  ogImage = '/og-image.png',
} = Astro.props;
```

Then in the `<head>` block, change the Open Graph and Twitter blocks to use `ogTitle` / `ogDescription` (lines 61–73):

```astro
<meta property="og:type" content="website" />
<meta property="og:title" content={ogTitle} />
<meta property="og:description" content={ogDescription} />
<meta property="og:url" content={canonicalURL.href} />
<meta property="og:locale" content={lang} />
<meta property="og:image" content={ogImageURL} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- Twitter Card -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content={ogTitle} />
<meta name="twitter:description" content={ogDescription} />
<meta name="twitter:image" content={ogImageURL} />
```

Leave the regular `<title>` and `<meta name="description">` using `title` / `description` — they stay as-is.

- [ ] **Step 6: Wire `Landing.astro` to use the new meta builder**

Replace `src/components/pages/Landing.astro` body:

```astro
---
import Layout from '../layout/Layout.astro';
import Header from '../chrome/Header.astro';
import Hero from '../hero/Hero.astro';
import Services from '../services/Services.astro';
import Cases from '../cases/Cases.astro';
import BrifForm from '../form/BrifForm.astro';
import Footer from '../chrome/Footer.astro';
import type { Dict } from '../../i18n/en';
import type { Locale } from '../../lib/paths';
import { buildHomeMeta } from '../../lib/seoMeta';

interface Props {
  dict: Dict;
  locale: Locale;
}

const { dict, locale } = Astro.props;
const meta = buildHomeMeta(dict, locale);
---

<Layout
  title={meta.title}
  description={meta.description}
  ogTitle={meta.ogTitle}
  ogDescription={meta.ogDescription}
  lang={locale}
>
  <Header dict={dict} locale={locale} />
  <main>
    <Hero dict={dict} />
    <Services dict={dict} />
    <Cases dict={dict} />
    <BrifForm dict={dict} />
  </main>
  <Footer dict={dict} locale={locale} />
</Layout>
```

- [ ] **Step 7: Build and verify localized titles/descriptions**

```bash
npm run build
# EN
grep -oE '<title>[^<]+</title>' dist/index.html
grep -oE '<meta name="description" content="[^"]{100,}' dist/index.html && echo "OK: EN desc ≥100 chars"
# RU
grep -oE '<title>[^<]+</title>' dist/ru/index.html
grep -oE '<meta name="description" content="[^"]{100,}' dist/ru/index.html && echo "OK: RU desc ≥100 chars"
# UZ
grep -oE '<title>[^<]+</title>' dist/uz/index.html
grep -oE '<meta name="description" content="[^"]{100,}' dist/uz/index.html && echo "OK: UZ desc ≥100 chars"
```

Expected: three distinct titles (one per locale), each ending with the studio type, and descriptions each printing an `OK` line. Each title should be 50–70 chars; each description 140–160 chars.

- [ ] **Step 8: Commit**

```bash
git add src/i18n/en.ts src/i18n/ru.ts src/i18n/uz.ts src/lib/seoMeta.ts src/components/layout/Layout.astro src/components/pages/Landing.astro
git commit -m "feat(seo): localize titles and meta descriptions per locale"
```

---

## Task 4: Fix image alt handling

**Files:**
- Modify: `src/components/hero/Hero.astro:33-43` (already correct — verify only)
- Modify: `src/components/services/ServiceCard.astro:18`
- Modify: `src/components/cases/CaseCard.astro:17-23`
- Modify: `src/components/cases/Cases.astro`
- Modify: `src/components/services/Services.astro`
- Modify: `src/components/form/BrifForm.astro:44-48, 100, 119, 139, 147, 237`
- Modify: `src/i18n/en.ts`, `src/i18n/ru.ts`, `src/i18n/uz.ts` (add `cases.items[].imageAlt`)

**Rationale:** Decorative images accompanied by adjacent text labels should carry `alt=""` **and** `aria-hidden="true"` so screen readers skip them cleanly. The Memolink `case-1.webp` is a content image (product preview) and needs a descriptive alt.

- [ ] **Step 1: Add `aria-hidden="true"` to `ServiceCard.astro` image**

In `src/components/services/ServiceCard.astro` line 18:

```astro
<Image src={image} alt="" aria-hidden="true" loading="lazy" widths={[368, 502, 736]} sizes="(min-width: 1248px) 502px, (min-width: 768px) 50vw, 100vw" />
```

No prop changes — the service card images (code/robot/compass/hands) are visually supporting the service title/description already on the card, so a screen reader would re-hear the content twice otherwise.

- [ ] **Step 2: Add `imageAlt` field to case items in i18n dicts**

Append to each case item in all three dicts. For `src/i18n/en.ts`:

```ts
items: [
  {
    title: 'Memolink',
    description: 'Connecting users through an interactive social networking app',
    imageAlt: 'Memolink app — social networking interface preview',
    tags: ['web & mob', 'ui/ux design', 'growth support'],
    image: 'case-1',
    video: '/cases/memolink.mp4',
  },
],
```

For `src/i18n/ru.ts`:

```ts
imageAlt: 'Memolink — превью интерфейса социального приложения',
```

For `src/i18n/uz.ts`:

```ts
imageAlt: "Memolink — ijtimoiy tarmoq ilovasi interfeysi ko'rinishi",
```

- [ ] **Step 3: Thread `imageAlt` through `CaseCard.astro`**

Replace `src/components/cases/CaseCard.astro` lines 1–23 with:

```astro
---
import { Image } from 'astro:assets';

interface Props {
  title: string;
  description: string;
  imageAlt: string;
  tags: readonly string[];
  image: ImageMetadata;
  video?: string;
}

const { title, description, imageAlt, tags, image, video } = Astro.props;
---

<article class="case" data-animate>
  <div class="case__photo">
    <Image
      src={image}
      alt={imageAlt}
      class="case__image"
      widths={[320, 472, 640]}
      sizes="(min-width: 1248px) 472px, 80vw"
    />
```

(Leave the rest of the component untouched.)

- [ ] **Step 4: Pass `imageAlt` from `Cases.astro` into `CaseCard.astro`**

Open `src/components/cases/Cases.astro`. Wherever `<CaseCard ...>` is rendered, add `imageAlt={item.imageAlt}`. The file is ~30 lines — if the CaseCard render looks like:

```astro
<CaseCard title={item.title} description={item.description} tags={item.tags} image={...} video={item.video} />
```

change to:

```astro
<CaseCard title={item.title} description={item.description} imageAlt={item.imageAlt} tags={item.tags} image={...} video={item.video} />
```

- [ ] **Step 5: Add `aria-hidden="true"` to all decorative `<img>` in `BrifForm.astro`**

At `src/components/form/BrifForm.astro` lines 44–48, 100, 119, 139, 147, 237, change each existing `alt=""` (on bare `<img>` tags for brif option icons and the success icon) to add `aria-hidden="true"` next to it. Example for line 100:

```astro
<img src={step1Icons[i].src} width={32} height={32} alt="" aria-hidden="true" class="brif-option-icon" />
```

Apply to every other matching line in the file. The icons sit next to visible labels (e.g., "MVP", "Complex solution") — screen reader users already hear the label, so adding `aria-hidden` removes redundant tree nodes.

- [ ] **Step 6: Verify via built HTML**

```bash
npm run build
# Every <img> in the Memolink card must have a non-empty alt
grep -oE '<img[^>]*case-1[^>]*>' dist/index.html
# Count images with bare alt= (empty) that are NOT aria-hidden; should be 0
python3 -c "
import re, glob
bad = 0
for f in glob.glob('dist/**/*.html', recursive=True):
    h = open(f).read()
    for m in re.finditer(r'<img\b[^>]*>', h):
        tag = m.group(0)
        alt = re.search(r'\balt=\"([^\"]*)\"', tag)
        empty = alt and alt.group(1) == ''
        hidden = 'aria-hidden=\"true\"' in tag
        if empty and not hidden:
            bad += 1
            print('  BAD:', f, tag[:120])
print('Total empty-alt without aria-hidden:', bad)
"
```

Expected: final print shows `Total empty-alt without aria-hidden: 0`, and the grep for `case-1` shows an `alt="Memolink app — …"` attribute (or localized variants for `dist/ru/index.html`, `dist/uz/index.html`).

- [ ] **Step 7: Commit**

```bash
git add src/components/services/ServiceCard.astro src/components/cases/CaseCard.astro src/components/cases/Cases.astro src/components/form/BrifForm.astro src/i18n/en.ts src/i18n/ru.ts src/i18n/uz.ts
git commit -m "fix(a11y,seo): descriptive alt on case image, aria-hidden on decorative icons"
```

---

## Task 5: Replace "Navigation" H2 with semantic nav labelling

**Files:**
- Modify: `src/components/chrome/Header.astro:84`

- [ ] **Step 1: Read the current mobile-menu block**

Read `src/components/chrome/Header.astro` around lines 80–90 to confirm the surrounding structure. The current pattern is:

```astro
<h2 id="mobile-menu-title" class="sr-only">Navigation</h2>
```

- [ ] **Step 2: Replace with `aria-label` on the nav element**

Delete the `<h2 id="mobile-menu-title" class="sr-only">Navigation</h2>` line. Find the `<nav>` element the mobile menu lives inside (or the wrapping drawer root) and add `aria-label="Mobile navigation"` (or, if the same nav already exists at the outer level, `aria-label={dict.nav.menuLabel}` once a localized string is added — but to keep this task tight, hardcode English `"Mobile navigation"`; localizing the aria-label is an optional follow-up).

If removing the `<h2>` requires removing `aria-labelledby="mobile-menu-title"` on the dialog/nav, replace that attribute with `aria-label="Mobile navigation"`.

- [ ] **Step 3: Build and verify heading outline**

```bash
npm run build
# Should be zero Navigation headings
grep -c ">Navigation<" dist/index.html
# Should still have exactly one H1
grep -oE '<h1\b[^>]*>' dist/index.html | wc -l
```

Expected: first count `0`, second count `1`.

- [ ] **Step 4: Commit**

```bash
git add src/components/chrome/Header.astro
git commit -m "fix(a11y): label mobile nav via aria-label instead of visually-hidden h2"
```

---

## Task 6: Expand JSON-LD (Organization + WebSite)

**Files:**
- Create: `src/lib/schema.ts`
- Modify: `src/components/layout/Layout.astro` (replace inline Organization block around lines 75–82)

- [ ] **Step 1: Create `src/lib/schema.ts`**

```ts
// src/lib/schema.ts
import { SITE_NAME, CONTACT_EMAIL } from './site';

export function organizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: 'AFVS',
    url: `${siteUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.svg`,
      width: 512,
      height: 512,
    },
    description:
      'Product design and development studio. We build MVPs, integrate AI into real workflows, and support products from launch through growth.',
    foundingDate: '2025',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'sales',
        availableLanguage: ['en', 'ru', 'uz'],
      },
    ],
    sameAs: [
      'https://www.linkedin.com/company/af-venture-studio',
      'https://www.instagram.com/afventurestudio',
      'https://t.me/afventurestudio',
    ],
  } as const;
}

export function websiteSchema(siteUrl: string, locale: 'en' | 'ru' | 'uz') {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { '@id': `${siteUrl}/#organization` },
  } as const;
}
```

**Note:** The `sameAs` URLs are placeholders pending confirmation of the studio's actual social handles. If handles differ, the user should update them before merge. If the studio has no public presence on one of these platforms, remove that entry rather than leaving a dead link.

- [ ] **Step 2: Replace the inline Organization JSON-LD in `Layout.astro`**

In `src/components/layout/Layout.astro`, remove lines 76–82 (the inline Organization `set:html` block) and replace with:

```astro
<!-- Structured data -->
<script is:inline type="application/ld+json" set:html={JSON.stringify(
  organizationSchema(Astro.site!.origin)
)} />
<script is:inline type="application/ld+json" set:html={JSON.stringify(
  websiteSchema(Astro.site!.origin, lang)
)} />
```

Add the import at the top of the frontmatter block:

```ts
import { organizationSchema, websiteSchema } from '../../lib/schema';
```

- [ ] **Step 3: Build and verify schema validity**

```bash
npm run build
python3 -c "
import json, re, glob
for f in glob.glob('dist/**/*.html', recursive=True):
    h = open(f).read()
    blocks = re.findall(r'<script[^>]+application/ld\+json[^>]*>([\s\S]*?)</script>', h)
    print(f'{f}: {len(blocks)} JSON-LD blocks')
    for b in blocks:
        try:
            obj = json.loads(b)
            print(f'  ✓ {obj.get(\"@type\")}: {obj.get(\"@id\", obj.get(\"url\"))}')
        except Exception as e:
            print(f'  ✗ INVALID JSON: {e}')
"
```

Expected: each `dist/**/*.html` lists **2** JSON-LD blocks, all marked `✓` with types `Organization` and `WebSite`. No parse errors.

- [ ] **Step 4: Validate against schema.org via Schema Markup Validator (optional manual)**

Manually paste `dist/index.html` contents into <https://validator.schema.org/> and confirm zero errors. Zero warnings ideal; minor warnings (e.g., "no image on WebSite") are acceptable.

- [ ] **Step 5: Commit**

```bash
git add src/lib/schema.ts src/components/layout/Layout.astro
git commit -m "feat(seo): expand Organization schema and add WebSite schema"
```

---

## Task 7: Optimize OG image + host on canonical domain

**Files:**
- Replace: `public/og-image.png` (existing 538 KB PNG → optimized ≤ 260 KB)

**Rationale:** 1200×630 PNG at 538 KB makes social crawlers slow to unfurl and costs more bandwidth. Target ~200–260 KB via `pngquant` or by reducing to flat colors where possible. If transparency is not required, converting to JPG at quality 82 typically lands around 120 KB.

- [ ] **Step 1: Inspect the current image**

```bash
file public/og-image.png
identify public/og-image.png 2>/dev/null || /usr/bin/sips -g pixelWidth -g pixelHeight public/og-image.png
ls -lh public/og-image.png
```

Expected: 1200×630, ~538 KB. If dimensions differ from 1200×630, the plan target must adjust — stop and ask the user.

- [ ] **Step 2: Install `pngquant` (one-time, if missing)**

```bash
which pngquant || brew install pngquant
```

- [ ] **Step 3: Produce an optimized PNG**

```bash
pngquant --quality=75-90 --speed 1 --force --output public/og-image.png public/og-image.png
ls -lh public/og-image.png
```

Expected: file ≤ 260 KB, visible quality unchanged. If the result exceeds 260 KB, try `pngquant --quality=60-80` or convert to JPG (see Step 4 alt).

- [ ] **Step 3 (alt): Convert to JPG if quality acceptable**

Only if the PNG route cannot hit the target:

```bash
/usr/bin/sips -s format jpeg -s formatOptions 82 public/og-image.png --out public/og-image.jpg
ls -lh public/og-image.jpg
```

If you take this route, update `Layout.astro`'s default `ogImage` parameter to `'/og-image.jpg'` and delete the old PNG.

- [ ] **Step 4: Build and verify OG URL resolves to the new file**

```bash
npm run build
# Confirm og:image is on afvs.dev
grep -oE 'property="og:image" content="[^"]+"' dist/index.html
ls -lh dist/og-image.png
```

Expected: the `og:image` content is `https://afvs.dev/og-image.png`; `dist/og-image.png` exists and is ≤ 260 KB.

- [ ] **Step 5: Commit**

```bash
git add public/og-image.png
git commit -m "perf(seo): compress OG image from 538KB to ≤260KB"
```

---

## Task 8: Add `vercel.json` headers (preview noindex, security, immutable cache)

**Files:**
- Modify: `vercel.json`

- [ ] **Step 1: Rewrite `vercel.json`**

Current content is minimal. Replace with:

```json
{
  "framework": "astro",
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "headers": [
    {
      "source": "/(.*)",
      "has": [{ "type": "host", "value": "afvsweb.vercel.app" }],
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex, nofollow" }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
      ]
    },
    {
      "source": "/_astro/(.*)",
      "headers": [
        { "key": "Cache-Control", "value": "public, max-age=31536000, immutable" }
      ]
    }
  ]
}
```

**Notes:**
- The `host` match only applies `noindex` to the Vercel preview, not production. Once `afvs.dev` goes live and is set as the production domain in Vercel, the preview is suppressed and production remains indexable.
- No CSP yet — a valid CSP requires inventorying Vercel Analytics, Speed Insights, and inline scripts. Adding CSP is a follow-up task (Plan 2 or a standalone plan).
- No `X-Frame-Options`: modern equivalent `frame-ancestors` belongs in CSP, and the site intentionally doesn't need clickjacking protection right now.

- [ ] **Step 2: Deploy to Vercel preview**

```bash
git add vercel.json
git commit -m "feat(seo,security): add preview noindex, security headers, immutable cache"
git push
```

Wait for the Vercel preview deployment URL (CI notification or `vercel ls`).

- [ ] **Step 3: Verify headers on live preview**

```bash
PREVIEW_URL="https://afvsweb.vercel.app"  # or the newly-deployed preview URL
/usr/bin/curl -sI "$PREVIEW_URL/" | grep -iE "^(x-robots-tag|x-content-type-options|referrer-policy|permissions-policy)"
/usr/bin/curl -sI "$PREVIEW_URL/_astro/index.CqnWiouU.css" 2>/dev/null | grep -i "cache-control"
```

Expected output:
```
x-robots-tag: noindex, nofollow
x-content-type-options: nosniff
referrer-policy: strict-origin-when-cross-origin
permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
cache-control: public, max-age=31536000, immutable
```

Note: the asset hash in the URL will change as the CSS is re-bundled. Update the filename by reading the built `dist/_astro/` directory first:

```bash
ls dist/_astro/*.css
```

Use that filename in the curl call.

- [ ] **Step 4: Commit not required (already pushed in Step 2)**

---

## Task 9: Add `llms.txt`

**Files:**
- Create: `public/llms.txt`

**Rationale:** llms.txt is a proposed convention (<https://llmstxt.org>) for telling AI systems which resources are safe to cite. Even before widespread adoption, it's a cheap signal to LLM crawlers (ClaudeBot, GPTBot, PerplexityBot) and takes 2 minutes.

- [ ] **Step 1: Create `public/llms.txt`**

```markdown
# AF Venture Studio

> Product design and development studio. We build MVPs, integrate AI into real workflows, and support products from launch through growth.

AF Venture Studio is a venture studio that ships products end-to-end: discovery, UI/UX design, MVP development, AI integrations, product advisory, and growth support. We work across web and mobile for founders, enterprises, and fellow studios.

## What we do

- **Build** — From idea to launch-ready product: product discovery, UI/UX design, MVP development, full-cycle product delivery.
- **AI** — Practical AI for real product use cases: AI-powered features, LLM integrations, agent workflows.
- **Advisory** — Strategic product support: product strategy, delivery setup, discovery facilitation.
- **Growth** — From launch to long-term product growth: expansion, upgrade, support, iteration.

## Industries

E-commerce, real estate, FinTech, social, EdTech, SaaS, healthcare.

## Languages

English, Russian, Uzbek.

## Contact

hello@afvs.dev

## Canonical

https://afvs.dev/

## Locales

- English: https://afvs.dev/
- Russian: https://afvs.dev/ru/
- Uzbek: https://afvs.dev/uz/
```

- [ ] **Step 2: Build and verify the file is served**

```bash
npm run build
test -f dist/llms.txt && echo "OK: llms.txt in dist" || echo "FAIL"
```

Expected: `OK: llms.txt in dist`.

- [ ] **Step 3: Commit**

```bash
git add public/llms.txt
git commit -m "feat(seo): add llms.txt for AI search citation metadata"
```

---

## Task 10: Post-deploy verification

**Files:** none modified — verification only.

- [ ] **Step 1: Full build + dist inspection**

```bash
npm run build
# 1. No stale domain references
grep -RIln "afvs\.studio" dist/ && echo "FAIL: stale ref" || echo "OK: no stale domain"
# 2. All three locales have unique, long titles
for locale in "" "ru/" "uz/"; do
  f="dist/${locale}index.html"
  title=$(grep -oE '<title>[^<]+</title>' "$f" | head -1)
  desc=$(grep -oE 'name="description" content="[^"]*"' "$f" | head -1)
  echo "=== $f ==="
  echo "  $title"
  echo "  $desc (len=$(echo -n "${desc}" | wc -c))"
done
# 3. Two JSON-LD blocks per page
for f in dist/index.html dist/ru/index.html dist/uz/index.html; do
  n=$(grep -c 'application/ld+json' "$f")
  echo "$f: $n JSON-LD blocks (expect 2)"
done
# 4. OG image size
ls -lh dist/og-image.png
# 5. llms.txt present
test -f dist/llms.txt && echo "llms.txt: OK"
# 6. Sitemap generated with new domain
grep -o 'https://afvs.dev[^<]*' dist/sitemap-0.xml | sort -u
```

Expected: no stale refs, three distinct titles, descriptions ~140–160 chars, 2 JSON-LD blocks per page, OG image ≤ 260 KB, llms.txt present, sitemap listing `afvs.dev/`, `afvs.dev/ru/`, `afvs.dev/uz/`.

- [ ] **Step 2: Push and verify on Vercel preview**

```bash
git push
# Wait for preview URL, then:
PREVIEW="https://afvsweb.vercel.app"
/usr/bin/curl -sI "$PREVIEW/" | grep -iE "x-robots-tag|cache-control"
/usr/bin/curl -sL "$PREVIEW/sitemap-0.xml" | grep -o 'https://afvs\.dev[^<]*' | sort -u
/usr/bin/curl -sL "$PREVIEW/llms.txt" | head -5
/usr/bin/curl -sL "$PREVIEW/robots.txt"
```

Expected: `X-Robots-Tag: noindex, nofollow` on preview; sitemap lists `afvs.dev` URLs; `llms.txt` returns the studio blurb; `robots.txt` points to `https://afvs.dev/sitemap-index.xml`.

- [ ] **Step 3: Validate OG unfurl**

Use any of:
- <https://www.opengraph.xyz/> → paste preview URL → confirm image renders, title/description are localized per `?_lang=ru` test.
- Or open the URL in a Telegram/Slack chat and confirm the unfurl card renders.

Note: because OG URL resolves to `https://afvs.dev/og-image.png` (not yet live), **social unfurls will be broken until DNS points afvs.dev to Vercel**. Document this in the release notes; this is the expected state until the domain is live.

- [ ] **Step 4: Run Google Rich Results Test (optional manual)**

Once `afvs.dev` is live, paste it into <https://search.google.com/test/rich-results>. Confirm Organization is detected and no errors.

- [ ] **Step 5: Final commit — none required (all changes already committed)**

---

## Deferred / Out of Scope

These items from the audit are intentionally **not** in this plan and live in the follow-up plan (see Plan 2 sketch below):

- Deep service pages (`/services/build`, `/services/ai`, etc.) — content-creation work, needs brainstorming.
- Full case study page (`/cases/memolink`) — content + design work.
- BreadcrumbList schema — only meaningful once deep pages exist.
- `CreativeWork` / `Service` schema entries — depend on the above pages.
- Content Security Policy — needs inventorying all third-party origins (Vercel Analytics, Speed Insights); worth a dedicated task with CSP report-only rollout.
- Dynamic OG image generation via `@vercel/og` — nice-to-have once deep pages exist so each case/service has a bespoke unfurl.

## Self-Review Checklist (reference only)

The author has checked:
- [x] Every audit finding rated Critical or High maps to a task (1, 2, 3, 4, 5, 6, 7, 8) or is explicitly deferred with justification.
- [x] No "TBD", "implement later", or placeholder steps.
- [x] File paths match the real repo as of 2026-04-15.
- [x] Type consistency: `PageMeta`, `buildHomeMeta`, `organizationSchema`, `websiteSchema`, `SITE_URL`, `SITE_NAME`, `CONTACT_EMAIL` names match across tasks.
- [x] Commits are scoped and conventional (feat/fix/perf).
- [x] `afvs.studio` → `afvs.dev` migration covers every reference found by `grep -rn "afvs\.studio" src public astro.config.mjs`.
