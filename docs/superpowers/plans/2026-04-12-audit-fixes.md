# Audit Fixes Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix all CRITICAL, HIGH, and key MEDIUM issues found during the deployment readiness audit.

**Architecture:** Fixes are grouped by domain — CI/CD, API security/validation, form UX, navigation, SEO, and design tokens. Each task is independent and can be committed separately.

**Tech Stack:** Astro, TypeScript strict, CSS custom properties (`tokens.css`), Vercel Functions (`@vercel/node`)

---

## File Map

| Task | Files | Action |
|------|-------|--------|
| 1 | `.github/workflows/deploy.yml` | Modify: fix `main` → `master` |
| 2 | `api/contact.ts` | Modify: add validation, CORS, rate limiting |
| 3 | `src/db/client.ts` | Modify: add env var guard |
| 4 | `src/lib/telegram.ts` | Modify: escape `"` in HTML |
| 5 | `src/components/form/BrefForm.astro` | Modify: error state, labels, `projectName` |
| 6 | `src/components/chrome/Header.astro` | Modify: `#bref` → `#contact` |
| 7 | `src/components/layout/Layout.astro` | Modify: add OG, favicon, canonical |
| 8 | `public/robots.txt` | Create |
| 9 | `public/favicon.svg` | Create |
| 10 | `src/styles/tokens.css` | Modify: add light-surface tokens |
| 11 | `src/components/form/BrefForm.astro` | Modify: replace hardcoded hex with tokens |
| 12 | `src/components/hero/Hero.astro` | Modify: `preload="none"` |

---

## Task 1: Fix CI/CD branch mismatch (CRITICAL)

**Files:**
- Modify: `.github/workflows/deploy.yml:30,33,38`

**Why:** The workflow triggers on `master` but three inline conditionals compare against `refs/heads/main`. Production deploys never fire — everything goes to preview.

- [ ] **Step 1: Fix all three branch references**

In `.github/workflows/deploy.yml`, replace all three occurrences of `refs/heads/main` with `refs/heads/master`:

```yaml
# Line 30 — vercel pull
- name: Pull Vercel Environment
  run: vercel pull --yes --environment=${{ github.ref == 'refs/heads/master' && 'production' || 'preview' }} --token=${{ secrets.VERCEL_TOKEN }}

# Line 33 — vercel build
- name: Build
  run: vercel build ${{ github.ref == 'refs/heads/master' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }}

# Line 38 — vercel deploy
  run: |
    URL=$(vercel deploy --prebuilt ${{ github.ref == 'refs/heads/master' && '--prod' || '' }} --token=${{ secrets.VERCEL_TOKEN }})
    echo "url=$URL" >> "$GITHUB_OUTPUT"
```

- [ ] **Step 2: Verify the file**

Run: `grep -n 'refs/heads' .github/workflows/deploy.yml`
Expected: All lines show `refs/heads/master`, zero occurrences of `refs/heads/main`.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/deploy.yml
git commit -m "fix(ci): change refs/heads/main to refs/heads/master in deploy conditions"
```

---

## Task 2: Harden API endpoint — validation, CORS, rate limiting (CRITICAL + HIGH)

**Files:**
- Modify: `api/contact.ts`

**Why:** The API has no rate limiting (C2), no CORS/origin check (H1), no field length limits (H5), and an overly permissive email regex (H4).

- [ ] **Step 1: Add rate limiting, CORS, and field validation**

Replace the entire `api/contact.ts` with:

```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/client';
import { submissions } from '../src/db/schema';
import { sendTelegramMessage, formatSubmissionMessage } from '../src/lib/telegram';

interface ContactBody {
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
}

// --- Rate limiting (in-memory, per-instance) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX = 5; // max 5 requests per IP per minute

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// --- CORS ---
const ALLOWED_ORIGINS = [
  'https://afvs.studio',
  'https://www.afvs.studio',
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  // Allow localhost in development
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

// --- Validation ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LEN = 500;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 20;

function truncate(val: unknown, max: number): string {
  const s = typeof val === 'string' ? val.trim() : '';
  return s.slice(0, max);
}

function validate(body: unknown): { ok: true; data: ContactBody } | { ok: false; error: string } {
  const b = body as Record<string, unknown>;

  const name = truncate(b.name, MAX_FIELD_LEN);
  const email = truncate(b.email, MAX_EMAIL_LEN);

  if (!name) return { ok: false, error: 'name is required' };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'valid email is required' };

  return {
    ok: true,
    data: {
      productType: truncate(b.productType, MAX_FIELD_LEN),
      readinessStage: truncate(b.readinessStage, MAX_FIELD_LEN),
      platform: truncate(b.platform, MAX_FIELD_LEN),
      industry: truncate(b.industry, MAX_FIELD_LEN),
      name,
      projectName: truncate(b.projectName, MAX_FIELD_LEN),
      email,
      phone: truncate(b.phone, MAX_PHONE_LEN),
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    if (isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin!);
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
  }

  // Rate limit
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const result = validate(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const { data } = result;

  try {
    await db.insert(submissions).values({
      productType: data.productType,
      readinessStage: data.readinessStage,
      platform: data.platform,
      industry: data.industry,
      name: data.name,
      projectName: data.projectName || null,
      email: data.email,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[api/contact] DB insert failed:', err);
    return res.status(500).json({ error: 'Database error' });
  }

  // Telegram — fire and forget
  try {
    const message = formatSubmissionMessage(data);
    await sendTelegramMessage(message);
  } catch (err) {
    console.warn('[api/contact] Telegram failed:', err);
  }

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --project tsconfig.server.json --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add api/contact.ts
git commit -m "fix(api): add rate limiting, CORS, and field length validation"
```

---

## Task 3: Guard env vars in DB client (MEDIUM)

**Files:**
- Modify: `src/db/client.ts`

**Why:** `process.env.TURSO_DATABASE_URL!` crashes with an opaque libsql error if the env var is missing. Should fail fast with a clear message.

- [ ] **Step 1: Add runtime check**

Replace the entire `src/db/client.ts`:

```typescript
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const url = process.env.TURSO_DATABASE_URL;
if (!url) throw new Error('TURSO_DATABASE_URL is not configured');

const turso = createClient({
  url,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso, { schema });
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --project tsconfig.server.json --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Commit**

```bash
git add src/db/client.ts
git commit -m "fix(db): add runtime guard for TURSO_DATABASE_URL"
```

---

## Task 4: Fix Telegram HTML escaping (LOW)

**Files:**
- Modify: `src/lib/telegram.ts:56-61`

**Why:** `escapeHtml` doesn't escape `"`, which Telegram's HTML parser recognizes in attributes.

- [ ] **Step 1: Add quote escaping**

In `src/lib/telegram.ts`, replace the `escapeHtml` function:

```typescript
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/telegram.ts
git commit -m "fix(telegram): escape double quotes in HTML messages"
```

---

## Task 5: Fix form UX — error handling, labels, `projectName` (HIGH)

**Files:**
- Modify: `src/components/form/BrefForm.astro:164-194` (HTML inputs)
- Modify: `src/components/form/BrefForm.astro:367-371` (JS error handling)

**Why:** (H2) API errors are silently swallowed — user sees "success" on failure. (H3) No `<label>` elements — WCAG failure. (M7) `projectName` has `required` but is optional server-side.

- [ ] **Step 1: Add labels and fix `projectName` required attribute**

In `BrefForm.astro`, replace the Step 5 contact form HTML (lines 158–194):

```astro
<!-- Step 5: Contact Form -->
<div class="bref-step" data-step="5">
  <div class="bref-step-header">
    <h3 class="bref-step-title">{dict.bref.steps.contact.title}</h3>
    <p class="bref-step-description">{dict.bref.steps.contact.description}</p>
  </div>
  <div class="bref-inputs">
    <label class="bref-input-label">
      <span class="sr-only">{dict.bref.steps.contact.name}</span>
      <input
        type="text"
        class="bref-input"
        name="name"
        placeholder={dict.bref.steps.contact.name}
        required
      />
    </label>
    <label class="bref-input-label">
      <span class="sr-only">{dict.bref.steps.contact.projectName}</span>
      <input
        type="text"
        class="bref-input"
        name="projectName"
        placeholder={dict.bref.steps.contact.projectName}
      />
    </label>
    <label class="bref-input-label">
      <span class="sr-only">{dict.bref.steps.contact.email}</span>
      <input
        type="email"
        class="bref-input"
        name="email"
        placeholder={dict.bref.steps.contact.email}
        required
      />
    </label>
    <label class="bref-input-label">
      <span class="sr-only">{dict.bref.steps.contact.phone}</span>
      <input
        type="tel"
        class="bref-input"
        name="phone"
        value="+998 "
        data-phone
      />
    </label>
  </div>
  <p class="bref-error" data-bref-error aria-live="polite"></p>
</div>
```

- [ ] **Step 2: Add error styles and sr-only utility**

In `BrefForm.astro`, add these CSS rules inside the existing `<style>` block (after `.bref-input:focus`):

```css
/* ── Accessibility — screen reader only ──── */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.bref-input-label {
  display: contents;
}

/* ── Error message ─────────────────────────── */
.bref-error {
  color: #d32f2f;
  font-family: var(--font-body);
  font-size: var(--font-size-caption);
  line-height: var(--line-height-body);
  margin: 8px 0 0;
  min-height: 1.5em;
}
```

- [ ] **Step 3: Fix JS error handling — show error instead of fake success**

In `BrefForm.astro`, replace the `.catch()` block in the `sendContact` promise chain (lines 367–371):

```javascript
.catch((err) => {
  const errorEl = wizard!.querySelector<HTMLParagraphElement>('[data-bref-error]');
  if (errorEl) {
    errorEl.textContent = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
  }
})
```

- [ ] **Step 4: Build and verify**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 5: Commit**

```bash
git add src/components/form/BrefForm.astro
git commit -m "fix(form): show error on API failure, add labels, make projectName optional"
```

---

## Task 6: Fix Header nav link `#bref` → `#contact` (MEDIUM)

**Files:**
- Modify: `src/components/chrome/Header.astro:25,79`

**Why:** The "Bref" nav link targets `#bref` but the section has `id="contact"`. The click does nothing.

- [ ] **Step 1: Fix both desktop and mobile nav links**

In `Header.astro`, change line 25:

```astro
<!-- was: <a class="nav-link" href="#bref">{dict.nav.bref}</a> -->
<a class="nav-link" href="#contact">{dict.nav.bref}</a>
```

And line 79:

```astro
<!-- was: <a href="#bref" data-mobile-link>{dict.nav.bref}</a> -->
<a href="#contact" data-mobile-link>{dict.nav.bref}</a>
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/chrome/Header.astro
git commit -m "fix(nav): header Bref link targets #contact to match form section id"
```

---

## Task 7: Add SEO metadata — OG tags, favicon, canonical (MEDIUM)

**Files:**
- Modify: `src/components/layout/Layout.astro`
- Create: `public/favicon.svg`

**Why:** Missing Open Graph tags, favicon, and canonical URL hurts social sharing and SEO for a marketing site.

- [ ] **Step 1: Create a simple SVG favicon**

Create `public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="8" fill="#158ef2"/>
  <text x="50%" y="54%" dominant-baseline="central" text-anchor="middle" fill="#fff" font-family="sans-serif" font-weight="700" font-size="18">A</text>
</svg>
```

- [ ] **Step 2: Update Layout.astro with full metadata**

Replace `src/components/layout/Layout.astro`:

```astro
---
import '../../styles/tokens.css';
import '../../styles/global.css';
import GlowBackground from './GlowBackground.astro';

interface Props {
  title: string;
  description?: string;
  lang?: 'en' | 'ru' | 'uz';
}

const { title, description = '', lang = 'en' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site ?? 'https://afvs.studio');
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#060b14" />
    <title>{title}</title>

    <!-- Canonical -->
    <link rel="canonical" href={canonicalURL.href} />

    <!-- Favicon -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL.href} />
    <meta property="og:locale" content={lang} />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
  </head>
  <body>
    <GlowBackground />
    <slot />
  </body>
</html>
```

- [ ] **Step 3: Build and verify**

Run: `npm run build`
Expected: Build succeeds. Check `dist/index.html` contains `og:title` meta tag.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/Layout.astro public/favicon.svg
git commit -m "feat(seo): add OG tags, Twitter Card, favicon, canonical URL"
```

---

## Task 8: Add robots.txt and sitemap (MEDIUM)

**Files:**
- Create: `public/robots.txt`

**Why:** No `robots.txt` means no crawl guidance. Astro can auto-generate sitemaps.

- [ ] **Step 1: Create robots.txt**

Create `public/robots.txt`:

```
User-agent: *
Allow: /

Sitemap: https://afvs.studio/sitemap-index.xml
```

- [ ] **Step 2: Install Astro sitemap integration**

Run: `npx astro add sitemap --yes`
Expected: `@astrojs/sitemap` added to `package.json` and `astro.config.mjs`.

- [ ] **Step 3: Add `site` to Astro config**

In `astro.config.mjs`, add the `site` field (needed by sitemap and canonical URLs):

```javascript
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://afvs.studio',
  adapter: vercel(),
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uz'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

- [ ] **Step 4: Build and verify sitemap is generated**

Run: `npm run build`
Expected: `dist/sitemap-index.xml` exists.

Run: `cat dist/sitemap-index.xml`
Expected: Contains references to `/`, `/ru/`, `/uz/`.

- [ ] **Step 5: Commit**

```bash
git add public/robots.txt astro.config.mjs package.json package-lock.json
git commit -m "feat(seo): add robots.txt and auto-generated sitemap"
```

---

## Task 9: Add light-surface design tokens (MEDIUM)

**Files:**
- Modify: `src/styles/tokens.css`

**Why:** BrefForm uses 15+ hardcoded hex colors (`#eff2fa`, `#000305`, `#fff`, `#c4c8d4`, etc.) that violate the project convention. Need tokens for light surfaces used in the form.

- [ ] **Step 1: Add light-surface tokens to tokens.css**

In `src/styles/tokens.css`, after the `--border-card` line (line 17), add:

```css
/* ── Surfaces (light — for form panels) ──── */
--surface-light:       #eff2fa;
--surface-light-card:  #ffffff;
--surface-light-muted: #dde1ea;

/* ── Text on light ──────────────────────────── */
--text-dark-primary:   #000305;
--text-dark-secondary: rgba(0, 0, 0, 0.6);
--text-dark-tertiary:  rgba(0, 0, 0, 0.4);
--text-dark-divider:   rgba(0, 0, 0, 0.06);

/* ── Neutral ────────────────────────────────── */
--neutral-400: #c4c8d4;
```

- [ ] **Step 2: Commit tokens**

```bash
git add src/styles/tokens.css
git commit -m "feat(tokens): add light-surface and text-dark design tokens"
```

---

## Task 10: Replace hardcoded hex in BrefForm with tokens (MEDIUM)

**Files:**
- Modify: `src/components/form/BrefForm.astro` (CSS section)

**Why:** The project convention prohibits hardcoded hex values. After Task 9 adds the tokens, swap them in.

- [ ] **Step 1: Replace all hardcoded hex values in BrefForm CSS**

Apply these substitutions in the `<style>` block of `BrefForm.astro`:

| Hardcoded | Token |
|-----------|-------|
| `#eff2fa` | `var(--surface-light)` |
| `#fff` (backgrounds) | `var(--surface-light-card)` |
| `#dde1ea` | `var(--surface-light-muted)` |
| `#000305` | `var(--text-dark-primary)` |
| `rgba(0, 0, 0, 0.6)` (text) | `var(--text-dark-secondary)` |
| `rgba(0, 0, 0, 0.4)` (placeholders) | `var(--text-dark-tertiary)` |
| `rgba(0, 0, 0, 0.06)` (dividers) | `var(--text-dark-divider)` |
| `#c4c8d4` | `var(--neutral-400)` |
| `rgba(21, 142, 242, 0.04)` | `color-mix(in srgb, var(--primary-default) 4%, transparent)` |
| `rgba(21, 142, 242, 0.08)` | `color-mix(in srgb, var(--primary-default) 8%, transparent)` |
| `#031626` | `var(--surface-card)` (close enough, or add a new token) |

Specific lines to change (key examples):

```css
/* Line 552: .bref-right background */
background: var(--surface-light);

/* Line 574: .bref-progress-track background */
background: var(--surface-light-muted);

/* Line 619: .bref-dot-number color */
color: var(--surface-light-card);

/* Line 634: .bref-dot.upcoming background */
background: var(--neutral-400);

/* Line 657: .bref-step-title color */
color: var(--text-dark-primary);

/* Line 664: .bref-step-description color */
color: var(--text-dark-secondary);

/* Line 679: .bref-options background */
background: var(--surface-light-card);

/* Line 696: .bref-option border-bottom */
border-bottom: 1px solid var(--text-dark-divider);

/* Line 710: .bref-option:hover background */
background: color-mix(in srgb, var(--primary-default) 4%, transparent);

/* Line 714: .bref-option.selected background */
background: color-mix(in srgb, var(--primary-default) 8%, transparent);

/* Line 743: .bref-option-label color */
color: var(--text-dark-primary);

/* Line 747: .bref-option--other color */
color: var(--text-dark-tertiary);

/* Line 757: .bref-other-input color */
color: var(--text-dark-primary);

/* Line 763: placeholder color */
color: var(--text-dark-tertiary);

/* Line 772: .bref-radio border */
border: 2px solid var(--neutral-400);

/* Line 793: .bref-radio::after background */
background: var(--surface-light-card);

/* Line 801: .bref-inputs background */
background: var(--surface-light-card);

/* Line 818: .bref-input color */
color: var(--text-dark-primary);

/* Line 828: .bref-input::placeholder color */
color: var(--text-dark-tertiary);

/* Line 833: .bref-input:focus background */
background: color-mix(in srgb, var(--primary-default) 4%, transparent);

/* Line 884: .bref-btn color */
color: var(--surface-light-card);

/* Line 866: .bref-success-title color */
color: var(--text-dark-primary);

/* Line 872: .bref-success-description color */
color: var(--surface-card);
```

- [ ] **Step 2: Build and verify**

Run: `npm run build`
Expected: Build succeeds with 0 errors.

- [ ] **Step 3: Verify no hardcoded hex remains**

Run: `grep -n '#eff2fa\|#000305\|#031626\|#dde1ea\|#c4c8d4' src/components/form/BrefForm.astro`
Expected: 0 matches.

- [ ] **Step 4: Commit**

```bash
git add src/components/form/BrefForm.astro
git commit -m "refactor(form): replace hardcoded hex colors with design tokens"
```

---

## Task 11: Change hero video preload to `none` (MEDIUM)

**Files:**
- Modify: `src/components/hero/Hero.astro:35`

**Why:** `preload="auto"` eagerly downloads ~19 MB of video. On mobile this is devastating. The video already has a 2-second `setTimeout` before play, so `preload="none"` is fine — the browser will buffer on `play()`.

- [ ] **Step 1: Change preload attribute**

In `Hero.astro` line 35, change:

```astro
<!-- was: preload="auto" -->
preload="none"
```

- [ ] **Step 2: Commit**

```bash
git add src/components/hero/Hero.astro
git commit -m "perf(hero): change video preload from auto to none"
```

---

## Task 12: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds, 3 pages, 0 errors.

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: 0 errors.

- [ ] **Step 3: Verify no `refs/heads/main` in workflow**

Run: `grep 'refs/heads/main' .github/workflows/deploy.yml`
Expected: No output (exit code 1).

- [ ] **Step 4: Verify no hardcoded hex in BrefForm**

Run: `grep -cE '#[0-9a-fA-F]{3,6}' src/components/form/BrefForm.astro`
Expected: Only `#d32f2f` (error color) remains, which is acceptable as a semantic one-off.

- [ ] **Step 5: Check sitemap generation**

Run: `ls dist/sitemap*.xml`
Expected: `dist/sitemap-index.xml` exists.
