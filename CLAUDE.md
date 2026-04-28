# CLAUDE.md — af.vs_web

Single-page landing at **afvs.dev**. Astro 5 in **hybrid mode** (`output: 'server'` + `prerender = true` on every page; only `/api/contact` and `/og/[locale].png` run as functions). CSS Modules, dark-only, i18n (en/ru/uz), Vercel/Linear/Framer-tier animations under a strict performance budget.

---

## Stack

**Use:**
- Astro 5.x — `output: 'server'`, adapter `@astrojs/vercel`. Pages set `export const prerender = true`; only API routes and OG image generation run on Fluid Compute.
- TypeScript strict (`astro/tsconfigs/strict` + `noUnusedLocals/Parameters`)
- CSS Modules (`*.module.css`) + `src/styles/tokens.css` (CSS custom properties, `@property` for animatable values)
- `@fontsource-variable/inter` (body) + `@fontsource-variable/unbounded` (display) — self-hosted via fontsource, latin + cyrillic subsets, preloaded in `Layout.astro`
- Astro built-in i18n (`prefixDefaultLocale: false`, default `en`) — matches afvs.dev production.
- Drizzle ORM + `@libsql/client` (Turso) — contact form persistence
- `@upstash/ratelimit` + `@upstash/redis` (rate limit by IP, fail-open if env missing)
- Zod (request validation)
- Vercel Analytics + Speed Insights
- Motion One (`motion`) — declarative element animations, hover/press states, bento card effects
- Canvas 2D — `Ambient/starfield.ts` (parallax stars, alpha-bucketed Path2D, 30fps, visibility-paused)
- OGL — `LightRays` shader (no Three.js)
- `astro:assets` `<Image />` for all raster — AVIF/WebP, responsive `widths`+`sizes`
- Satori + resvg-js — runtime OG image generation (`/og/[locale].png`, `prerender = false`)

**Never use:**
- Tailwind, UnoCSS, any utility-CSS or CSS-in-JS
- Alpine.js, htmx
- React, Vue, Svelte, Framer Motion — no islands framework
- `<style>` blocks inside `.astro` files — ever
- Three.js (too heavy — use OGL if WebGL needed)
- GSAP, ScrollTrigger, Lenis — not currently used; do not add without discussion. Scroll-reveal is implemented in `src/scripts/reveal.ts` with IntersectionObserver + CSS transitions, which has been sufficient.
- `any` type; default exports for components
- Co-Authored-By footer in commits

If an interactive island is genuinely unavoidable, pause and ask the user before adding one. Preferred fallback: Solid.js (smallest runtime).

---

## Directory

```
src/
  components/
    <domain>/<Name>/          domains: brief, cases, chrome, hero, services, ui
      <Name>.astro + <Name>.module.css [+ <Name>.ts | feature.ts]
  layouts/Layout.astro        only layout; owns <head>, fonts, analytics, hreflang, JSON-LD
  pages/
    index.astro               en (default), prerender = true
    ru/index.astro            prerender = true
    uz/index.astro            prerender = true
    api/contact.ts            SSR, prerender = false
    og/[locale].png.ts        dynamic OG image, prerender = false (Satori + resvg)
  i18n/
    en.ts, ru.ts, uz.ts       typed dictionaries; `en.ts` is the source of truth (`Dict` type)
    index.ts                  exports `getDict(locale)` and `Locale`
    formatWeeks.ts            locale-aware "N weeks" formatting
  db/
    client.ts                 drizzle + libsql/Turso client (cached per process)
    schema.ts                 `submissions` table
  lib/
    contact.ts                client-side fetch wrapper for /api/contact
    contactSchema.ts          Zod schema (incl. honeypot + startedAt)
    rateLimit.ts              Upstash sliding-window limiter, fail-open
    telegram.ts               HTML-escaped Telegram message sender
    paths.ts                  Locale type + switchLocaleUrl helper
    seoMeta.ts                buildHomeMeta(dict, locale) → page meta
    site.ts                   SITE_URL / SITE_NAME / CONTACT_EMAIL
    highlightAccents.ts       tokenizer for accent words in hero title
    og/                       Satori OG template, font loading, render entry
  scripts/
    reveal.ts                 IntersectionObserver-based reveal-on-scroll (loaded eagerly from Layout)
  assets/                     local raster/svg consumed by `astro:assets` <Image />
  styles/
    tokens.css                CSS custom properties (dark palette + RGB triplets + @property animatables)
    reset.css                 modern reset
    global.css                @layer composition + reveal base styles + scrollbar/skip-link
  env.d.ts                    Astro client types reference
```

One component = one folder with paired `.astro` + `.module.css`. No exceptions.

---

## CSS rules

- Every component has its own `*.module.css`; import it as `import s from './X.module.css'` and use `class:list={[s.root]}`.
- **No `<style>` in `.astro` files.** If a rule feels too small for a module, it still goes in the module.
- Global tokens in `src/styles/tokens.css`: colors (hex + RGB triplets for `rgba()` consumers), spacing scale (clamp-based), radii, glass surfaces/borders, shadows, scrollbar styling, semantic colors.
- **Dark-only.** Do not write `prefers-color-scheme` branches. No theme toggle, no light overrides.
- Use CSS nesting (Lightning CSS handles it) — no SCSS/PostCSS plugins.
- `@layer` order: `reset → tokens → base → components → utilities`.
- **Sizing:** fluid `clamp()` for radii, padding, container widths and section spacing. Typography is **stepped via `@media`** in `tokens.css` (sm/md/lg/xl/2xl/3xl/4xl) so hero headings stay single-line per locale (Cyrillic/Latin character density differs). `:lang(ru) { --lang-scale }` adds an optical boost ≥768px.
- `@property --edge-proximity`, `@property --cursor-angle` — Houdini animatable custom properties used by Button border-glow. Extend this pattern for any value that needs to be animated by Motion or CSS transitions.
- Class names in camelCase (CSS Modules convention): `s.heroTitle`, not `s['hero-title']`.
- Avoid `:global(...)` selectors in module CSS. They exist (e.g. `Hero.module.css` `.cta :global(a)`) only as a last resort; prefer passing a class via slot/prop.

---

## Animation rules

Goal: Vercel/Linear/Framer feel, Lighthouse ≥ 95.

- **Reveal-on-scroll** is handled by `src/scripts/reveal.ts` — IntersectionObserver + CSS transitions on `[data-reveal]`, with `[data-reveal-group]` + `[data-reveal-stagger]` for cascades and `[data-reveal-immediate]` for above-the-fold. This is the default; do not reach for an animation library to do reveals.
- **Motion One** (`motion`) — declarative element animations: bento-card tilt/magnetism, particle spawn/cleanup, hover spotlight. Used in `src/scripts/servicesBento.ts` and similar interaction-tier modules.
- **OGL** — `LightRays` hero shader. Self-contained `mountLightRays` with full cleanup (`disposed` flag, `cancelAnimationFrame`, `WEBGL_lose_context`, `ResizeObserver.disconnect`).
- **Canvas 2D** — `Ambient/starfield.ts` (parallax starfield). Uses Path2D alpha-bucket batching, throttled to 30fps, paused on `visibilitychange`.
- **Background/shader layers** — fullscreen, `position: fixed; z-index: -1; pointer-events: none`.
- **Lazy-load heavy animation modules** through dynamic `import()` inside an `IntersectionObserver` callback (see `Services.astro` → `servicesBento.ts`). Top-level `import` of `motion` is allowed inside a script that itself is dynamically imported, since it lands in its own chunk and never enters the initial bundle.
- **Respect `prefers-reduced-motion: reduce`** — guard every non-trivial animation. The pattern is: read `matchMedia` once at the top of the init function, return early or apply a static fallback (see `starfield.ts`, `reveal.ts`, `servicesBento.ts`).
- Use `transform` / `opacity` / `filter` only on the compositor path. Avoid animating `width`, `height`, `top`, `left`.
- Preload shader/image assets used in the LCP viewport (`<link rel="preload">` for the latin font is mounted in `Layout.astro`).
- `pointer: coarse` and `window.innerWidth <= 768/900` are used to disable cursor-driven effects on mobile (no tilt, no spotlight, no particles).

---

## Performance budgets (enforced)

- Lighthouse: Performance ≥ 95, Accessibility ≥ 95, Best Practices ≥ 95, SEO = 100.
- Initial client JS ≤ 100 KB gzipped. Animation libs excluded from initial bundle via dynamic import.
- LCP ≤ 2.5s, CLS < 0.1, INP < 200ms.
- Fonts: subset to latin + cyrillic, `font-display: swap`, preload one weight per family, use variable fonts.
- Images: always via `astro:assets` `<Image />`, AVIF + WebP, `loading="lazy"` except the hero LCP image.
- Never render a heavy effect above the fold without a deferred-paint strategy.

---

## i18n

- `astro.config.mjs`: `i18n: { defaultLocale: 'en', locales: ['en','ru','uz'], routing: { prefixDefaultLocale: false } }`.
- Translations in `src/i18n/{en,ru,uz}.ts` — typed TS modules with nested objects (`a11y`, `nav`, `seo`, `hero`, …).
- `en.ts` is the source of truth: it exports `Dict = typeof en`. `ru.ts` and `uz.ts` must satisfy `Dict`; missing/extra keys are a type error at build.
- Pages get a dictionary via `getDict(locale)` from `src/i18n/index.ts` and access strings as `dict.section.key`. No string literal stays hardcoded in components.
- `Layout.astro` emits `<link rel="alternate" hreflang="…">` for all locales (incl. `x-default → en`) and a canonical URL on `afvs.dev`.
- For locale-prefix manipulation (switch language, build alt URLs), use `switchLocaleUrl` / `getLocaleUrl` from `src/lib/paths.ts`. Do not re-implement the regex strip in components.
- Page routes: `pages/index.astro` serves `en` (no prefix); `pages/[locale]/index.astro` with `getStaticPaths` serves `ru`/`uz`. Both delegate to `src/layouts/Home.astro` for the section composition.

---

## Backend pattern (contact form)

`src/pages/api/contact.ts` with `export const prerender = false`:

1. CORS check — allow `afvs.dev`, `www.afvs.dev`, and `localhost:*` for dev. `OPTIONS` preflight is implemented.
2. Rate-limit by IP (`x-forwarded-for` then `clientAddress`) via `lib/rateLimit.ts`. Sliding window 5 req / 1 min, prefix `afvs:contact`. **Fail-open** if Upstash env vars are missing or the call throws — better to lose a bot than 500 a real lead. Logs a warning on first miss and on every transient failure.
3. Parse JSON → validate with Zod (`lib/contactSchema.ts`). Field caps: `name` 120, `email` 254, `phone` 32, etc.
4. **Antibot**: honeypot field `website` (any non-empty value → 200 OK with no DB write so we don't tip the bot off). Time-trap: reject submissions where `Date.now() - data.startedAt < 3000ms`. `startedAt` is client-supplied; the real abuse defence remains rate-limit.
5. Drizzle insert into `submissions` (Turso/libSQL). `created_at` is stored as ISO-8601 text for compatibility with existing rows; new columns/migrations may switch to `integer({ mode: 'timestamp' })`.
6. Telegram notification via `lib/telegram.ts` — HTML-escaped (`&`, `<`, `>`, `"`). Failures log `console.warn` and do not bubble up; the lead is already in the DB. **There is no second-channel fallback today** — adding email/Sentry is a known gap.
7. Respond `{ ok: true }` or `{ error }` with the correct HTTP status; honeypot/time-trap return 200 OK.

All secrets come from `.env.local` locally and Vercel env vars in deploy. Never commit secrets. Never log PII.

---

## SEO

- `site: 'https://afvs.dev'` in `astro.config.mjs`.
- `@astrojs/sitemap` with per-locale entries; canonical domain is `afvs.dev`.
- Every page frontmatter: `title`, `description`, `ogImage`.
- `robots.txt` (`public/robots.txt`): `Allow: /`, `Disallow: /api/`, points to `https://afvs.dev/sitemap-index.xml`.
- `Layout.astro` emits `Organization` + `WebSite` JSON-LD (linked via `@id`) for Google rich results, Knowledge Panel eligibility, and AI search citation.
- DNS verification TXT records for Google Search Console and Yandex.Webmaster live in Vercel DNS on `afvs.dev` — keep them when editing DNS.
- **OG images: prerendered at build** via Satori + `@resvg/resvg-js` at `/og/[locale].png` (`prerender = true` with `getStaticPaths` over the three locales). Crawlers hit a static asset — no cold starts. `Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800`.
- `vercel.json` ships strict security headers (HSTS preload, `X-Frame-Options: DENY`, nosniff, Permissions-Policy locking down `interest-cohort`/camera/mic/geo) and `X-Robots-Tag: noindex, nofollow` for any `*.vercel.app` host so preview URLs don't get indexed (afvsweb.vercel.app de-indexing is in progress; do not relax this rule).

---

## TypeScript & code style

- `tsconfig.json` extends Astro strict; `noImplicitAny`, `strictNullChecks`, `noUnusedLocals`, `noUnusedParameters`, and `exactOptionalPropertyTypes` are all enabled.
- Component props: `interface Props { … }` declared above the component, destructured from `Astro.props`.
- Filenames: PascalCase for components (`Hero.astro`, `Hero.module.css`), camelCase for helpers (`formatDate.ts`).
- No default exports for components.
- No comments that describe *what* the code does — only *why* when non-obvious.
- Don't add abstractions, feature flags, or backwards-compat shims for hypothetical futures.

---

## Git / commits

- Default branch is `main` — also the Vercel production branch (push to `main` triggers a Production deploy).
- Feature work goes on short-lived branches; merge to `main` via PR.
- Conventional commits: `feat:`, `fix:`, `perf:`, `refactor:`, `style:`, `chore:`, `docs:`.
- Atomic commits — one logical change each.
- **No Co-Authored-By Claude footer.** Personal attribution only.
- Never `--no-verify`, never force-push.

---

## Before claiming done

Run all three before saying a feature is complete:
1. `pnpm build` succeeds with zero warnings.
2. `pnpm astro check` passes.
3. Manual smoke: open the page locally, scroll through every section, toggle locales, submit the contact form.

If the work is UI-visible and you cannot open a browser, say so explicitly — do not claim success from a green build alone.
