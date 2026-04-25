# CLAUDE.md — af.vs_web

Single-page landing at **afvs.dev**. Astro 5 SSR, CSS Modules, dark-only, i18n (ru/en/uz), Vercel/Linear/Framer-tier animations under a strict performance budget.

---

## Stack

**Use:**
- Astro 5.x — `output: 'server'`, adapter `@astrojs/vercel`
- TypeScript strict
- CSS Modules (`*.module.css`) + `src/styles/tokens.css` (CSS custom properties)
- `@fontsource-variable/inter` + `@fontsource-variable/space-grotesk` (self-hosted, subset)
- Astro built-in i18n (`prefixDefaultLocale: false`, default `en`) — matches afvs.dev production.
- Drizzle ORM + `@libsql/client` (contact form persistence)
- `@upstash/ratelimit` + `@upstash/redis` (rate limit by IP)
- Zod (request validation)
- Vercel Analytics + Speed Insights
- Motion One (`motion`) — primary animation lib
- GSAP + ScrollTrigger — scroll-linked sequences only
- Lenis — smooth scroll
- Canvas 2D / OGL — shaders, particles, background effects

**Never use:**
- Tailwind, UnoCSS, any utility-CSS or CSS-in-JS
- Alpine.js, htmx
- React, Vue, Svelte, Framer Motion — no islands framework
- `<style>` blocks inside `.astro` files — ever
- Three.js (too heavy — use OGL if WebGL needed)
- `any` type; default exports for components
- Co-Authored-By footer in commits

If an interactive island is genuinely unavoidable, pause and ask the user before adding one. Preferred fallback: Solid.js (smallest runtime).

---

## Directory

```
src/
  components/<Name>/<Name>.astro + <Name>.module.css [+ <Name>.ts]
  layouts/Layout.astro        only layout; owns <head>, fonts, analytics, hreflang
  pages/
    index.astro               en (default)
    ru/index.astro
    uz/index.astro
    api/contact.ts            SSR, prerender = false
  i18n/
    en.ts, ru.ts, uz.ts       typed dictionaries; `en.ts` is the source of truth (`Dict` type)
    index.ts                  exports `getDict(locale)` and `Locale`
  lib/
    db.ts                     drizzle client
    ratelimit.ts              upstash client
    telegram.ts               notification sender
  scripts/                    lazy-loaded animation modules (dynamic import only)
  styles/
    tokens.css                CSS custom properties (dark palette)
    reset.css                 modern reset
    global.css                @layer composition
```

One component = one folder with paired `.astro` + `.module.css`. No exceptions.

---

## CSS rules

- Every component has its own `*.module.css`; import it as `import s from './X.module.css'` and use `class:list={[s.root]}`.
- **No `<style>` in `.astro` files.** If a rule feels too small for a module, it still goes in the module.
- Global tokens in `src/styles/tokens.css`: colors (HSL), spacing scale, radii, shadows, z-index, typography scale, easing curves, durations.
- **Dark-only.** Do not write `prefers-color-scheme` branches. No theme toggle, no light overrides.
- Use CSS nesting (Lightning CSS handles it) — no SCSS/PostCSS plugins.
- `@layer` order: `reset → tokens → base → components → utilities`.
- Fluid sizing via `clamp()` — no breakpoint-driven typography.
- Class names in camelCase (CSS Modules convention): `s.heroTitle`, not `s['hero-title']`.

---

## Animation rules

Goal: Vercel/Linear/Framer feel, Lighthouse ≥ 95.

- **Motion One** for declarative element animations, hover/press states, enter/exit.
- **GSAP + ScrollTrigger** for scroll choreography (Linear-style hero pinning, timeline sequences).
- **Lenis** mounted once in `Layout.astro` for smooth scroll; integrate with ScrollTrigger via its `scrollerProxy`.
- **Canvas/OGL** for backgrounds and shader effects — fullscreen, `position: fixed; z-index: -1; pointer-events: none`.
- **Always lazy-load** animation modules: `const { animate } = await import('motion')` inside `IntersectionObserver` callbacks or after first user interaction. Never top-level import in a page/component that ships to the client.
- Respect `prefers-reduced-motion: reduce` — guard every non-trivial animation with the media query and return an instant state.
- Use `transform` / `opacity` / `filter` only on the compositor path. Avoid animating `width`, `height`, `top`, `left`.
- Preload shader/image assets used in the LCP viewport.

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
- `Layout.astro` emits `<link rel="alternate" hreflang="…">` for all locales and a canonical URL on `afvs.dev`.

---

## Backend pattern (contact form)

`src/pages/api/contact.ts` with `export const prerender = false`:

1. Parse body → validate with Zod schema.
2. Upstash ratelimit by IP (e.g. 5 req / 10 min).
3. Drizzle insert into `submissions`.
4. Send Telegram notification via bot token.
5. Respond `{ ok: true }` or `{ ok: false, error }` with correct HTTP status.

All secrets come from `.env.local` locally and Vercel env vars in deploy. Never commit secrets. Never log PII.

---

## SEO

- `site: 'https://afvs.dev'` in `astro.config.mjs`.
- `@astrojs/sitemap` with per-locale entries; canonical domain is `afvs.dev`.
- Every page frontmatter: `title`, `description`, `ogImage`.
- `robots.txt`: `Allow: /`, `Disallow: /api/`, points to `https://afvs.dev/sitemap-index.xml`.
- `Layout.astro` emits `Organization` + `WebSite` JSON-LD (linked via `@id`) for Google rich results, Knowledge Panel eligibility, and AI search citation.
- DNS verification TXT records for Google Search Console and Yandex.Webmaster live in Vercel DNS on `afvs.dev` — keep them when editing DNS.
- OG images: static `/public/og/*.png` initially; Satori/`@vercel/og` later if needed.

---

## TypeScript & code style

- `tsconfig.json` extends Astro strict; `noImplicitAny`, `strictNullChecks`, `exactOptionalPropertyTypes` all on.
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
