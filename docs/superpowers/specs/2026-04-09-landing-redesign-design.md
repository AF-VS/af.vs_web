# Landing Redesign — Design Spec

**Date:** 2026-04-09
**Status:** Approved
**Figma:** https://www.figma.com/design/L3skuk3D54hgX93qX7EIjd/AF.VS---web?node-id=277-735
**Visual reference:** `src/screens/{hero,services,cases,calculator,footer}.png`

## 1. Goal

Rewrite the entire public landing (`/` and `/ru/`) to match the new Figma design,
migrate off Tailwind onto scoped CSS + design tokens per `CLAUDE.md`, and replace
the current `motion` / `hls.js` interactivity stack with Alpine.js + Intersection
Observer + CSS keyframes.

The existing section structure (Hero → Services → Portfolio → Calculator → Footer)
stays the same. The design system components in `src/components/ui/` (Button,
Card, Input, Badge, Tag, SectionTitle) are already built and will be reused.

## 2. Scope

**In scope:**
- Full rewrite of Hero, Services, Portfolio (cases), Calculator, Footer, Header
- Foundation cleanup: remove Tailwind, `motion`, `hls.js`, `lucide-react`; add Alpine.js
- Global CSS: drop `@import "tailwindcss"`, keep the existing design tokens
- `astro.config.mjs`: remove `@tailwindcss/vite` plugin
- Replace remote HLS hero video with local `src/assets/afvs_bg.mov`
- Form in Footer: markup + Alpine client-side validation + success state only
- Update `CLAUDE.md` to reflect Astro 6.x (currently says 5.x)

**Out of scope (deferred):**
- Real form submission (Astro Actions + Formspree/Basin/Resend) — follow-up task
- Additional pages (`/about`, `/contact`, etc.)
- SEO metadata beyond existing `<title>` + favicon
- Removing `src/screens/*.png` (kept as visual reference)
- Old portfolio effects: magnetic cursor, spotlight beam, liquid-glass, sibling dimming

## 3. Asset Mapping

| Asset | Usage |
|---|---|
| `src/assets/afvs_bg.mov` | Hero background video (muted, autoplay, loop, playsinline) |
| `src/assets/compass.jpeg` | Services bento — «Разработка» card background |
| `src/assets/hands.jpeg` | Services bento — «Рост продукта» card background |
| `src/assets/robot_hand.jpeg` | Services bento — «Привлечение инвестиций» card background |
| `src/assets/bref_bg.jpeg` | Services bento — «Студийный формат» card background |

All images imported through Astro's `import` so Astro's build pipeline hashes
and optimizes them. Video is `<video src={afvsBg}>` — Astro emits it to `/_astro/`
at build time, no HLS needed.

## 4. Target File Structure

```
src/
  assets/                      # unchanged (images + video)
  components/
    ui/                        # design system atoms (unchanged)
      Button.astro
      Card.astro
      Input.astro
      Badge.astro
      Tag.astro
      SectionTitle.astro
    sections/                  # NEW — page sections
      Header.astro
      Hero.astro
      Services.astro
      Portfolio.astro
      Calculator.astro
      Footer.astro
  layouts/
    Layout.astro               # loads global.css, Alpine, mounts Header + Footer
  pages/
    index.astro                # Hero + Services + Portfolio + Calculator
    ru/index.astro             # identical, i18n routing only
  i18n/                        # unchanged
  styles/
    global.css                 # tokens, reset, @keyframes, .ds-container

docs/superpowers/specs/
  2026-04-09-landing-redesign-design.md   # this file
```

**File deletions (after migration):**
- `src/components/Hero.astro`
- `src/components/Services.astro`
- `src/components/Portfolio.astro`
- `src/components/Calculator.astro`
- `src/components/Footer.astro`
- `src/components/Welcome.astro` (was never wired up)
- `src/components/ui/header.astro` (moves to `sections/Header.astro`)

No `_old.astro` / backup files — git is the backup.

## 5. Foundation Changes (commit 1)

### `package.json`
- Remove: `@tailwindcss/vite`, `tailwindcss`, `hls.js`, `motion`, `lucide-react`
- Add: `alpinejs`, `@types/alpinejs`

### `astro.config.mjs`
```js
import { defineConfig } from 'astro/config';

export default defineConfig({});
```
Default SSG output. Vite plugins empty.

### `src/styles/global.css`
- Remove `@import "tailwindcss";` (line 1)
- Keep everything else (tokens, `.ds-container`, breakpoints comment)
- Add: a `*, *::before, *::after { box-sizing: border-box }` reset
- Add: `body { background: var(--color-bg); color: var(--color-text); font-family: var(--font-sans); margin: 0; }`
- Add: shared `@keyframes fade-up` used by reveal animations
- Add: `.reveal` base class (opacity 0 + translateY) + `.reveal.is-visible` end state

### `src/layouts/Layout.astro`
- Imports Alpine via a module `<script>`:
  ```astro
  <script>
    import Alpine from 'alpinejs';
    window.Alpine = Alpine;
    Alpine.start();
  </script>
  ```
  Astro bundles this once; Alpine processes `x-data` across all sections.
- Removes Tailwind-specific `class="scroll-smooth snap-y snap-mandatory ..."` on `<html>`
- Replaces with native CSS: `html { scroll-behavior: smooth; }` in `global.css`
- Drops `snap-y snap-mandatory` — it caused accessibility issues and does not match Figma
- Keeps `<Header />` at top and `<Footer />` at bottom
- Keeps `<slot />` for page content
- Loads Google Fonts (`Instrument Sans`, `Instrument Serif`) via `<link>` in `<head>`

### `CLAUDE.md`
- Change "Astro 5.x (stable, not 6.x which is beta)" → "Astro 6.x"
- Remove the sentence about 6.x being beta

## 6. Animations & Interactivity

**Reveal on scroll (all sections):**
Single shared `IntersectionObserver` in `Layout.astro` `<script>`:
```js
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('is-visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.15 });
document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
```
Elements add `class="reveal"` and optionally `style="--reveal-delay: 200ms"` for stagger.

**Alpine.js ownership:**
- Header: mobile menu open/close state, scroll-shrink state (`@scroll.window`)
- Calculator: `x-data` with category/platform/timeline state + computed price/devs
- Footer form: `x-data` with form state + client-side validation + success state
- Portfolio: `x-data` with current index, prev/next handlers, `x-ref` for scroll container

**CSS keyframes (global.css):**
- `fade-up` — used by `.reveal`
- `hero-text-in` — hero headline/subtitle/CTA stagger on load (no IO, runs immediately)

**No magnetic cursors, no spotlight beam, no liquid glass, no sibling dimming.**
These were removed because (a) they don't appear in Figma, (b) they doubled the JS
footprint of the old Portfolio, (c) they fight with `prefers-reduced-motion`.

## 7. Per-Section Design

### 7.1 Header (`components/sections/Header.astro`)

Fixed top bar, centered pill container. Logo AF.VS left, nav center (Услуги,
Кейсы, Калькулятор), EN/RU toggle right. On scroll past 20px: container shrinks
(max-width narrows, height shrinks, background fills with `rgba(10,10,10,0.8)` +
backdrop blur, border appears).

Mobile: hamburger button toggles a full-screen overlay with centered nav + lang
toggle. All state via Alpine `x-data="{ open: false }"`.

Scoped CSS — no Tailwind. Uses tokens: `--color-bg`, `--color-border`, `--radius-full`,
`--font-sans`, `--space-*`.

### 7.2 Hero (`components/sections/Hero.astro`)

**Layout:** full-viewport dark section. Centered content: `<h1>` (`От идеи к продукту`),
subtitle, primary CTA button (`<Button variant="primary" icon="arrow-down">Начать</Button>`).

**Background:**
1. `<video src={import('../../assets/afvs_bg.mov')}>` absolute-positioned, `object-fit: cover`, `opacity: 0.5`
2. Overlay: `rgba(0,0,0,0.6)` + `backdrop-filter: blur(2px)`
3. Gradient top-left + bottom-right (blue/indigo glow) — decorative
4. Bottom fade-to-black gradient for smooth transition into next section

**Animations:**
- Video fades in (`opacity 0 → 0.5` over 2s) on `playing` event
- Headline / subtitle / button use `hero-text-in` keyframe with staggered delays (0.2s, 0.4s, 0.6s)

**Typography:**
- `<h1>`: `font-size: var(--text-hero)` (clamp 3rem–6rem), weight 600, tracking tight, gradient text `white → #b4c0ff`
- Subtitle: `--text-lg`, `color: rgba(255,255,255,0.7)`, `max-width: 40ch`
- CTA: existing `<Button>` component

### 7.3 Services (`components/sections/Services.astro`)

Section header with centered `<SectionTitle title="Наши услуги" subtitle="Инновационные решения..." />`.

**Bento grid** (desktop ≥984px), 6-col × 2-row:
- Card 1 — `col-span-4 row-span-2` (left, large) — **Разработка** with `compass.jpeg`
- Card 2 — `col-span-2 row-span-1` (top-right) — **Рост продукта** with `hands.jpeg`
- Card 3 — `col-span-2 row-span-1` (middle-right) — **Привлечение инвестиций** with `robot_hand.jpeg`
- Card 4 — `col-span-6 row-span-1` (bottom, wide) — **Студийный формат** with `bref_bg.jpeg`

Mobile: single column, each card `min-height: 280px`.

**Card anatomy** (each card uses `<Card variant="bento">`):
- Background image layer at `opacity: 0.25`, `filter: grayscale(0.4) blur(0.5px)`
- Dark gradient overlay `linear-gradient(135deg, rgba(10,15,36,0.85) 0%, rgba(10,15,36,0.55) 100%)`
- Numbered badge `<Badge label="01" />` top
- `<h3>` title
- `<ul>` items with `•` bullets
- Hover: border accents, image layer brightens slightly (CSS only, no JS)

Cards have `.reveal` class with staggered delays 0ms / 150ms / 300ms / 450ms.

### 7.4 Portfolio (`components/sections/Portfolio.astro`)

Section header with left-aligned `<SectionTitle align="left" />` + prev/next arrow buttons on the right.

**Carousel:** horizontal scroll container with `scroll-snap-type: x mandatory`, cards use
`scroll-snap-align: center`. Each card: preview image on top, tags row
(using `<Tag />` atoms), project name (large), subtitle (muted).

**Alpine `x-data`:**
```js
{
  currentIndex: 0,
  scroll(dir) {
    const card = this.$refs.track.querySelector('.portfolio-card');
    const width = card.offsetWidth + 24;
    this.$refs.track.scrollBy({ left: dir * width, behavior: 'smooth' });
  }
}
```

Prev / next buttons: circular, border, hover → white. 48×48px. No magnetic effect.

Existing portfolio data (`portfolioData` in `i18n/ui.ts`) reused as-is.
Existing project media files in `public/portfolio/*.{png,jpg,mp4}` stay where they are.
Hover video preview: kept — simple, no library needed (`video.play()` on `mouseenter`).

Scroll-snap + native overflow gives drag-to-scroll on desktop and swipe on touch — no custom gesture JS needed.

### 7.5 Calculator (`components/sections/Calculator.astro`)

Section header with centered title. Glassmorphic container, 2-column layout (desktop):

**Left column** — inputs:
- «Выберите категорию» — 4 pill buttons (Лендинг, E-commerce, SaaS/WebApp, Мобильные приложения)
- «Выберите платформу» — 4 pill buttons (Только Web, iOS, Android, Кросс-платформа)
- «Сроки проекта» — range slider 1–12 months + chip showing current value

**Right column** — outputs:
- «Ориентировочная стоимость» — big `$X,XXX` number
- «Требуются разработчики» — `N Разработчик(-ов)`
- CTA button `<Button variant="primary">Получить точный расчёт</Button>`

**Alpine `x-data`:**
```js
{
  category: 'landing',
  platform: 'web',
  timeline: 3,
  get price() {
    const base = { landing: 2000, ecommerce: 8000, saas: 15000, mobile: 12000 }[this.category];
    const modifier = { web: 1.0, ios: 1.3, android: 1.25, cross: 1.4 }[this.platform];
    const standardTimeline = ({ landing: 2.5, ecommerce: 4, saas: 6.5, mobile: 4 })[this.category];
    const timelineFactor = standardTimeline / this.timeline;
    return Math.max(2000, Math.round((base * modifier * timelineFactor) / 1000) * 1000);
  },
  get devs() {
    const baseDevs = { landing: 1, ecommerce: 2, saas: 3, mobile: 2 }[this.category];
    const timelineFactor = ({ landing: 2.5, ecommerce: 4, saas: 6.5, mobile: 4 })[this.category] / this.timeline;
    return Math.max(1, Math.ceil(baseDevs * timelineFactor * 0.8));
  }
}
```

Formatting: `Intl.NumberFormat` for price, pluralization via helper (`price` displayed as `$${price.toLocaleString()}`; `devs` as `${devs} ${devs === 1 ? t.dev : t.devs}`).

No orb animations, no `motion.animate()`. Static glassmorphic card + CSS gradient background blobs (pure CSS, no JS).

### 7.6 Footer (`components/sections/Footer.astro`)

Dark section (`--color-bg-footer`). 2-col desktop grid:

**Left column:** `<h2>Давайте создадим что-то великое.</h2>` + form (3 `<Input>` fields: название проекта, ваше имя, контакт) + submit button.

**Right column:** 2 sub-columns — Social (LinkedIn, Telegram, Whatsapp, Instagram, YouTube) and Contact (hello@af.vs, @afvs_contact).

**Below columns:** giant `AF.VS` wordmark (`font-size: clamp(8rem, 15vw, 16rem)`), hairline divider, copyright row (© 2026 AF.VS + «При поддержке af.vs»).

**Form validation** (Alpine):
```js
{
  form: { projectName: '', yourName: '', contact: '' },
  errors: {},
  submitted: false,
  submit() {
    this.errors = {};
    if (!this.form.projectName) this.errors.projectName = true;
    if (!this.form.yourName) this.errors.yourName = true;
    if (!this.form.contact) this.errors.contact = true;
    if (Object.keys(this.errors).length) return;
    this.submitted = true; // show success state
  }
}
```

On success: fade form out, show confirmation message ("Заявка принята. Свяжемся с вами в течение 24 часов.").

## 8. Delivery Plan (commit-by-commit)

Each step is one commit, verifiable in `npm run dev`. Every section commit both
creates the new file under `components/sections/` **and** updates `Layout.astro`
or `pages/index.astro` + `pages/ru/index.astro` to import the new path **and**
deletes the old file in `components/`.

1. **Foundation** — drop Tailwind/motion/hls/lucide, add Alpine, update `global.css`, `astro.config.mjs`, `CLAUDE.md`. Existing components continue to render (they still use Tailwind classes) but with Tailwind gone they'll look broken — that's expected, next commits fix each section.
2. **Header** — create `sections/Header.astro`, update `Layout.astro` import, delete `components/ui/header.astro`
3. **Hero** — create `sections/Hero.astro` (local video, no HLS, CSS animations), update both `pages/index.astro` imports, delete `components/Hero.astro`
4. **Services** — create `sections/Services.astro` with bento grid + photo backgrounds, update imports, delete `components/Services.astro`
5. **Portfolio** — create `sections/Portfolio.astro` with Alpine carousel, update imports, delete `components/Portfolio.astro`
6. **Calculator** — create `sections/Calculator.astro` with Alpine state, update imports, delete `components/Calculator.astro`
7. **Footer** — create `sections/Footer.astro` with Alpine form validation, update `Layout.astro` import, delete `components/Footer.astro`
8. **Final cleanup** — delete `components/Welcome.astro` (unused), verify no stale imports, `npm run build` clean

After each step: `npm run build` must succeed; from step 2 onward, the affected section should visually match its screen in `src/screens/`.

## 9. Verification Criteria

For each section, visually compare against `src/screens/*.png`:
- Layout, spacing, typography match within reasonable tolerance
- Interactions work on desktop + mobile (tested at 375px, 768px, 1280px)
- No Tailwind classes anywhere in `src/**/*.astro` (grep-verify: `rg "class=.*\b(flex|grid|bg-|text-|p[xy]?-|m[xy]?-)" src/components/sections/ src/layouts/` should return zero Tailwind-pattern matches)
- `npm run build` succeeds, bundle size smaller than current
- Lighthouse performance score ≥90 on hero page (desktop)
- Accessible: Tab order works, focus visible, `prefers-reduced-motion` honored for reveal animations

## 10. Open Questions / Follow-ups

None blocking. Post-launch items:
- Real form submission (Astro Actions + 3rd-party email relay)
- Image optimization beyond Astro defaults (e.g., explicit `<Picture>` srcset)
- Adding `prefers-reduced-motion` media query overrides for all keyframes (will be added during step 1 but worth auditing once all sections are in)
