# Landing Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rewrite the public landing (`/` + `/ru/`) to match the new Figma design, migrating from Tailwind to scoped CSS + design tokens, and from `motion`/`hls.js` to Alpine.js + Intersection Observer + CSS keyframes.

**Architecture:** Each section (Header, Hero, Services, Portfolio, Calculator, Footer) is rewritten as a self-contained `.astro` file under `src/components/sections/`. Reusable atoms (Button, Card, Input, Badge, Tag, SectionTitle) already exist in `src/components/ui/`. Foundation commit strips Tailwind/motion/hls/lucide and adds Alpine; each subsequent commit replaces one section end-to-end (create new file → update imports → delete old file).

**Tech Stack:** Astro 6.0.8 (SSG), TypeScript, Alpine.js 3, native CSS with custom properties, Intersection Observer API, `<video>` for hero background. No Tailwind, no animation libraries.

**Spec:** `docs/superpowers/specs/2026-04-09-landing-redesign-design.md`

---

## Task 1: Foundation — strip Tailwind, add Alpine, update globals

**Files:**
- Modify: `package.json`
- Modify: `astro.config.mjs`
- Modify: `src/styles/global.css`
- Modify: `src/layouts/Layout.astro`
- Modify: `CLAUDE.md`

**Note:** After this commit, existing Tailwind-based sections will render without Tailwind styles (broken visuals). That's expected — Tasks 2–7 replace each section one by one.

- [ ] **Step 1.1: Remove Tailwind / motion / hls / lucide deps**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm uninstall @tailwindcss/vite tailwindcss hls.js motion lucide-react
```

Expected: npm completes without error, `node_modules/@tailwindcss`, `node_modules/motion`, `node_modules/hls.js`, `node_modules/lucide-react` all removed.

- [ ] **Step 1.2: Install Alpine.js**

Run:
```bash
npm install alpinejs
npm install -D @types/alpinejs
```

Expected: `package.json` now has `alpinejs` under dependencies and `@types/alpinejs` under devDependencies. No other changes.

- [ ] **Step 1.3: Simplify `astro.config.mjs`**

Replace the entire contents of `astro.config.mjs` with:

```js
// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
export default defineConfig({});
```

- [ ] **Step 1.4: Strip Tailwind import from `global.css` and add reset + reveal keyframes**

In `src/styles/global.css`:

1. Delete line 1: `@import "tailwindcss";`
2. After the existing `.ds-container` media queries (end of file), append:

```css
/* ─── Base reset ─────────────────────────────────────── */

*,
*::before,
*::after {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
  overflow-x: hidden;
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
  cursor: pointer;
}

img,
video {
  display: block;
  max-width: 100%;
}

/* ─── Reveal-on-scroll ───────────────────────────────── */

@keyframes fade-up {
  from {
    opacity: 0;
    transform: translateY(24px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.reveal {
  opacity: 0;
  transform: translateY(24px);
  transition:
    opacity 800ms cubic-bezier(0.16, 1, 0.3, 1),
    transform 800ms cubic-bezier(0.16, 1, 0.3, 1);
  transition-delay: var(--reveal-delay, 0ms);
}

.reveal.is-visible {
  opacity: 1;
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .reveal,
  .reveal.is-visible {
    opacity: 1;
    transform: none;
    transition: none;
  }

  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 1.5: Rewrite `Layout.astro`**

Replace the entire contents of `src/layouts/Layout.astro` with:

```astro
---
import '../styles/global.css';
import Header from '../components/ui/header.astro';
import Footer from '../components/Footer.astro';
import { getLangFromUrl } from '../i18n/utils';

const lang = getLangFromUrl(Astro.url);
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" />
    <meta name="generator" content={Astro.generator} />

    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      rel="stylesheet"
      href="https://fonts.googleapis.com/css2?family=Instrument+Sans:wght@400;500;600;700&family=Instrument+Serif&display=swap"
    />

    <title>AF.VS — От идеи к продукту</title>
  </head>
  <body>
    <Header />
    <slot />
    <Footer />

    <script>
      import Alpine from 'alpinejs';
      // @ts-expect-error — Alpine attaches itself to window
      window.Alpine = Alpine;
      Alpine.start();

      // Shared reveal-on-scroll observer
      const io = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              io.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.15, rootMargin: '0px 0px -80px 0px' }
      );

      document.querySelectorAll('.reveal').forEach((el) => io.observe(el));
    </script>
  </body>
</html>
```

**Note:** Layout still imports `components/ui/header.astro` and `components/Footer.astro` — those are the OLD files. Tasks 2 and 7 will switch them.

- [ ] **Step 1.6: Update `CLAUDE.md` to reflect Astro 6.x**

Find the line in `CLAUDE.md`:
```
- **Astro 5.x** (stable, not 6.x which is beta) — SSG by default; use Astro Islands for interactive components
```

Replace with:
```
- **Astro 6.x** — SSG by default; use Astro Islands for interactive components
```

- [ ] **Step 1.7: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build completes without error. It's OK if pages look visually broken — Tailwind is gone but old components still reference Tailwind classes which will no-op.

- [ ] **Step 1.8: Commit**

```bash
git add package.json package-lock.json astro.config.mjs src/styles/global.css src/layouts/Layout.astro CLAUDE.md
git commit -m "$(cat <<'EOF'
chore: drop tailwind, add alpine.js, reset globals

Foundation for landing redesign: removes Tailwind, motion, hls.js,
lucide-react and introduces Alpine.js for interactivity. Adds base
reset, reveal keyframes, and prefers-reduced-motion support to
global.css. Layout.astro now bootstraps Alpine and a shared
IntersectionObserver. CLAUDE.md bumped to Astro 6.x.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 2: Header — rewrite with scoped CSS + Alpine

**Files:**
- Create: `src/components/sections/Header.astro`
- Modify: `src/layouts/Layout.astro` (import path)
- Delete: `src/components/ui/header.astro`

- [ ] **Step 2.1: Create `src/components/sections/Header.astro`**

Create the file with these contents:

```astro
---
import { getLangFromUrl, useTranslations } from '../../i18n/utils';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const homeHref = lang === 'en' ? '/' : '/ru/';
---

<header
  class="site-header"
  x-data="{ open: false, scrolled: false }"
  x-init="window.addEventListener('scroll', () => scrolled = window.scrollY > 20, { passive: true })"
  :class="{ 'is-scrolled': scrolled, 'is-open': open }"
>
  <div class="site-header__bar">
    <a href={homeHref} class="site-header__logo">AF.VS</a>

    <nav class="site-header__nav" aria-label="Primary">
      <a href="#services">{t('nav.services')}</a>
      <a href="#cases">{t('nav.cases')}</a>
      <a href="#calculator">{t('nav.calculator')}</a>
    </nav>

    <div class="site-header__lang" role="tablist" aria-label="Language">
      <div class="site-header__lang-thumb" data-lang={lang}></div>
      <a href="/" class:list={['site-header__lang-btn', lang === 'en' && 'is-active']}>EN</a>
      <a href="/ru/" class:list={['site-header__lang-btn', lang === 'ru' && 'is-active']}>RU</a>
    </div>

    <button
      type="button"
      class="site-header__toggle"
      aria-label="Menu"
      @click="open = !open"
    >
      <svg x-show="!open" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
      <svg x-show="open" x-cloak xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
    </button>
  </div>

  <div class="site-header__mobile" x-show="open" x-cloak x-transition.opacity.duration.300ms>
    <nav class="site-header__mobile-nav" @click="open = false">
      <a href="#services">{t('nav.services')}</a>
      <a href="#cases">{t('nav.cases')}</a>
      <a href="#calculator">{t('nav.calculator')}</a>
      <div class="site-header__mobile-lang">
        <a href="/" class:list={['site-header__lang-btn', lang === 'en' && 'is-active']}>EN</a>
        <span>·</span>
        <a href="/ru/" class:list={['site-header__lang-btn', lang === 'ru' && 'is-active']}>RU</a>
      </div>
    </nav>
  </div>
</header>

<style>
  [x-cloak] { display: none !important; }

  .site-header {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    padding: var(--space-4);
    pointer-events: none;
  }

  .site-header__bar {
    margin-inline: auto;
    max-width: var(--container);
    height: 72px;
    padding-inline: var(--space-6);
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--space-6);
    border: 1px solid transparent;
    border-radius: var(--radius-full);
    pointer-events: auto;
    transition:
      max-width var(--ease-slow),
      height var(--ease-slow),
      background var(--ease-slow),
      border-color var(--ease-slow),
      backdrop-filter var(--ease-slow);
  }

  .site-header.is-scrolled .site-header__bar {
    max-width: 920px;
    height: 56px;
    background: rgba(10, 10, 10, 0.8);
    border-color: var(--color-border);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
  }

  .site-header__logo {
    font-family: var(--font-sans);
    font-size: var(--text-xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    color: var(--color-text);
    transition: font-size var(--ease-slow);
  }

  .site-header.is-scrolled .site-header__logo {
    font-size: var(--text-lg);
  }

  .site-header__nav {
    display: none;
    gap: var(--space-12);
    font-family: var(--font-sans);
    font-size: var(--text-base);
  }

  .site-header__nav a {
    color: rgba(255, 255, 255, 0.8);
    transition: color var(--ease-default);
  }

  .site-header__nav a:hover {
    color: var(--color-text);
  }

  @media (min-width: 744px) {
    .site-header__nav {
      display: flex;
    }
  }

  .site-header__lang {
    display: none;
    position: relative;
    width: 84px;
    height: 40px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: var(--radius-full);
    padding: 4px;
    font-family: var(--font-sans);
  }

  @media (min-width: 744px) {
    .site-header__lang {
      display: flex;
    }
  }

  .site-header__lang-thumb {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 36px;
    height: 30px;
    border-radius: var(--radius-full);
    background: #161616;
    border: 1px solid rgba(255, 255, 255, 0.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.8);
    transition: transform var(--ease-default);
  }

  .site-header__lang-thumb[data-lang='ru'] {
    transform: translateX(40px);
  }

  .site-header__lang-btn {
    position: relative;
    z-index: 1;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--text-xs);
    font-weight: 500;
    letter-spacing: 0.1em;
    color: rgba(255, 255, 255, 0.4);
    transition: color var(--ease-default);
  }

  .site-header__lang-btn.is-active {
    color: var(--color-text);
  }

  .site-header__toggle {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    background: transparent;
    border: none;
    color: var(--color-text);
  }

  @media (min-width: 744px) {
    .site-header__toggle {
      display: none;
    }
  }

  .site-header__mobile {
    position: fixed;
    inset: 0;
    background: rgba(10, 10, 10, 0.95);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    z-index: -1;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
  }

  .site-header__mobile-nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: var(--space-8);
    font-family: var(--font-sans);
    font-size: var(--text-2xl);
    color: rgba(255, 255, 255, 0.8);
  }

  .site-header__mobile-nav a:hover {
    color: var(--color-text);
  }

  .site-header__mobile-lang {
    display: flex;
    gap: var(--space-4);
    margin-top: var(--space-8);
    font-size: var(--text-lg);
  }
</style>
```

- [ ] **Step 2.2: Update `Layout.astro` import path**

In `src/layouts/Layout.astro`, replace:
```astro
import Header from '../components/ui/header.astro';
```
with:
```astro
import Header from '../components/sections/Header.astro';
```

- [ ] **Step 2.3: Delete old header**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/ui/header.astro
```

- [ ] **Step 2.4: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. Open `npm run dev`, verify the new header appears, scrolls shrink it, mobile hamburger toggles overlay.

- [ ] **Step 2.5: Commit**

```bash
git add src/components/sections/Header.astro src/layouts/Layout.astro
git add -u src/components/ui/header.astro
git commit -m "$(cat <<'EOF'
feat(sections): rewrite Header with scoped CSS + Alpine

Drops Tailwind from the header, uses design tokens, and switches
scroll/menu state to Alpine x-data. Moves the file from
components/ui/ (atom bucket) to components/sections/ (page sections).

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 3: Hero — rewrite with local video + CSS animations

**Files:**
- Create: `src/components/sections/Hero.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`
- Delete: `src/components/Hero.astro`

**Reference:** `src/screens/hero.png`

- [ ] **Step 3.1: Create `src/components/sections/Hero.astro`**

Create the file with these contents:

```astro
---
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
import Button from '../ui/Button.astro';
import afvsBg from '../../assets/afvs_bg.mov';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
---

<section id="hero" class="hero">
  <video
    class="hero__video"
    src={afvsBg}
    autoplay
    muted
    loop
    playsinline
    preload="auto"
  ></video>

  <div class="hero__overlay" aria-hidden="true"></div>
  <div class="hero__glow hero__glow--tl" aria-hidden="true"></div>
  <div class="hero__glow hero__glow--br" aria-hidden="true"></div>
  <div class="hero__fade" aria-hidden="true"></div>

  <div class="hero__content ds-container">
    <h1 class="hero__title">{t('hero.title')}</h1>
    <p class="hero__subtitle">{t('hero.subtitle')}</p>
    <div class="hero__cta">
      <Button variant="primary" icon="arrow-down" href="#services">
        {t('hero.cta')}
      </Button>
    </div>
  </div>
</section>

<style>
  .hero {
    position: relative;
    width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    background: var(--color-bg);
    color: var(--color-text);
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .hero__video {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    opacity: 0;
    animation: hero-video-in 2000ms 400ms ease-out forwards;
  }

  @keyframes hero-video-in {
    to { opacity: 0.5; }
  }

  .hero__overlay {
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.55);
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    pointer-events: none;
  }

  .hero__glow {
    position: absolute;
    width: 100%;
    height: 500px;
    pointer-events: none;
    mix-blend-mode: screen;
    filter: blur(100px);
  }

  .hero__glow--tl {
    top: 0;
    left: 0;
    background: linear-gradient(135deg, rgba(48, 84, 255, 0.35), transparent 60%);
  }

  .hero__glow--br {
    bottom: 0;
    right: 0;
    background: linear-gradient(315deg, rgba(99, 102, 241, 0.35), transparent 60%);
  }

  .hero__fade {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 200px;
    background: linear-gradient(to top, var(--color-bg), transparent);
    pointer-events: none;
    z-index: 2;
  }

  .hero__content {
    position: relative;
    z-index: 3;
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: var(--space-12);
  }

  .hero__title {
    margin: 0;
    font-family: var(--font-sans);
    font-weight: 600;
    font-size: var(--text-hero);
    line-height: 1;
    letter-spacing: -0.04em;
    background: linear-gradient(180deg, #ffffff 50%, var(--color-accent-light) 100%);
    -webkit-background-clip: text;
    background-clip: text;
    -webkit-text-fill-color: transparent;
    opacity: 0;
    transform: scale(0.92);
    animation: hero-in 800ms 200ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  .hero__subtitle {
    margin: 0;
    max-width: 40ch;
    font-size: var(--text-lg);
    line-height: 1.65;
    color: rgba(255, 255, 255, 0.7);
    opacity: 0;
    animation: hero-fade-in 700ms 400ms ease-out forwards;
  }

  .hero__cta {
    opacity: 0;
    transform: translateY(20px);
    animation: hero-up 600ms 600ms ease-out forwards;
  }

  @keyframes hero-in {
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  @keyframes hero-fade-in {
    to { opacity: 1; }
  }

  @keyframes hero-up {
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    .hero__video,
    .hero__title,
    .hero__subtitle,
    .hero__cta {
      opacity: 1;
      transform: none;
      animation: none;
    }
    .hero__video { opacity: 0.5; }
  }
</style>
```

- [ ] **Step 3.2: Update `src/pages/index.astro`**

Replace entire contents with:

```astro
---
import Layout from '../layouts/Layout.astro';
import Hero from '../components/sections/Hero.astro';
import Services from '../components/Services.astro';
import Portfolio from '../components/Portfolio.astro';
import Calculator from '../components/Calculator.astro';
---

<Layout>
  <Hero />
  <Services />
  <Portfolio />
  <Calculator />
</Layout>
```

- [ ] **Step 3.3: Update `src/pages/ru/index.astro`**

Replace entire contents with:

```astro
---
import Layout from '../../layouts/Layout.astro';
import Hero from '../../components/sections/Hero.astro';
import Services from '../../components/Services.astro';
import Portfolio from '../../components/Portfolio.astro';
import Calculator from '../../components/Calculator.astro';
---

<Layout>
  <Hero />
  <Services />
  <Portfolio />
  <Calculator />
</Layout>
```

- [ ] **Step 3.4: Delete old Hero**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/Hero.astro
```

- [ ] **Step 3.5: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. In `npm run dev`: the hero matches `src/screens/hero.png` — centered headline, subtitle, pill CTA, video background fades in.

- [ ] **Step 3.6: Commit**

```bash
git add src/components/sections/Hero.astro src/pages/index.astro src/pages/ru/index.astro
git add -u src/components/Hero.astro
git commit -m "$(cat <<'EOF'
feat(sections): rewrite Hero with local video + CSS animations

Replaces the remote HLS stream with the local afvs_bg.mov asset,
switches from motion.js to CSS keyframes, and rebuilds the layout
with scoped CSS + design tokens. Matches src/screens/hero.png.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 4: Services — bento grid with photo backgrounds

**Files:**
- Create: `src/components/sections/Services.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`
- Delete: `src/components/Services.astro`

**Reference:** `src/screens/services.png`

- [ ] **Step 4.1: Create `src/components/sections/Services.astro`**

Create the file with these contents:

```astro
---
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
import { servicesData } from '../../i18n/ui';
import SectionTitle from '../ui/SectionTitle.astro';
import Badge from '../ui/Badge.astro';
import compass from '../../assets/compass.jpeg';
import hands from '../../assets/hands.jpeg';
import robotHand from '../../assets/robot_hand.jpeg';
import brefBg from '../../assets/bref_bg.jpeg';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const cards = servicesData[lang];

const bentoCards = [
  { ...cards[0], image: compass.src, className: 'services__card--hero' },
  { ...cards[1], image: hands.src, className: 'services__card--top' },
  { ...cards[2], image: robotHand.src, className: 'services__card--mid' },
  { ...cards[3], image: brefBg.src, className: 'services__card--wide' },
];
---

<section id="services" class="services">
  <div class="services__pattern" aria-hidden="true"></div>

  <div class="ds-container services__container">
    <div class="reveal">
      <SectionTitle title={t('services.title')} subtitle={t('services.subtitle')} />
    </div>

    <div class="services__grid">
      {bentoCards.map((card, i) => (
        <article
          class:list={['services__card', card.className, 'reveal']}
          style={`--reveal-delay: ${(i + 1) * 120}ms`}
        >
          <div
            class="services__card-bg"
            style={`background-image: url(${card.image});`}
            aria-hidden="true"
          ></div>
          <div class="services__card-overlay" aria-hidden="true"></div>
          <div class="services__card-content">
            <header class="services__card-header">
              <Badge label={`0${i + 1}`} />
              <span class="services__card-rule"></span>
            </header>
            <h3 class="services__card-title">{card.title}</h3>
            <ul class="services__card-list">
              {card.items.map((item) => (
                <li>
                  <span class="services__card-dot"></span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </article>
      ))}
    </div>
  </div>
</section>

<style>
  .services {
    position: relative;
    padding-block: var(--space-24);
    background: var(--color-bg);
    overflow: hidden;
  }

  .services__pattern {
    position: absolute;
    inset: 0;
    opacity: 0.2;
    pointer-events: none;
    background-image: radial-gradient(circle at center, rgba(48, 84, 255, 0.35) 1px, transparent 1px);
    background-size: 40px 40px;
  }

  .services__container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-16);
  }

  .services__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-6);
  }

  @media (min-width: 984px) {
    .services__grid {
      grid-template-columns: repeat(6, 1fr);
      grid-auto-rows: minmax(180px, auto);
      gap: var(--space-6);
    }

    .services__card--hero { grid-column: span 4; grid-row: span 2; min-height: 420px; }
    .services__card--top  { grid-column: span 2; grid-row: span 1; min-height: 200px; }
    .services__card--mid  { grid-column: span 2; grid-row: span 1; min-height: 200px; }
    .services__card--wide { grid-column: span 6; grid-row: span 1; min-height: 140px; }
  }

  .services__card {
    position: relative;
    overflow: hidden;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    min-height: 260px;
    transition:
      border-color var(--ease-default),
      transform var(--ease-default),
      box-shadow var(--ease-default);
  }

  .services__card:hover {
    border-color: var(--color-border-hover);
    transform: translateY(-4px);
    box-shadow: var(--glow-accent);
  }

  .services__card-bg {
    position: absolute;
    inset: 0;
    background-size: cover;
    background-position: center;
    opacity: 0.22;
    filter: grayscale(0.35);
    transition: opacity var(--ease-slow), transform var(--ease-slow);
  }

  .services__card:hover .services__card-bg {
    opacity: 0.32;
    transform: scale(1.04);
  }

  .services__card-overlay {
    position: absolute;
    inset: 0;
    background: linear-gradient(135deg, rgba(10, 15, 36, 0.85) 0%, rgba(10, 15, 36, 0.55) 100%);
    pointer-events: none;
  }

  .services__card-content {
    position: relative;
    z-index: 1;
    height: 100%;
    padding: var(--space-8);
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .services__card--wide .services__card-content {
    flex-direction: row;
    align-items: center;
    gap: var(--space-8);
  }

  @media (max-width: 743px) {
    .services__card--wide .services__card-content {
      flex-direction: column;
      align-items: flex-start;
    }
  }

  .services__card-header {
    display: flex;
    align-items: center;
    gap: var(--space-3);
  }

  .services__card-rule {
    flex: 0 0 32px;
    height: 1px;
    background: linear-gradient(90deg, var(--color-accent), transparent);
  }

  .services__card-title {
    margin: 0;
    font-size: var(--text-lg);
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--color-text);
  }

  .services__card--hero .services__card-title {
    font-size: var(--text-2xl);
  }

  .services__card-list {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    color: rgba(255, 255, 255, 0.7);
    font-size: var(--text-sm);
  }

  .services__card--wide .services__card-list {
    flex-direction: row;
    flex-wrap: wrap;
    gap: var(--space-1) var(--space-6);
  }

  .services__card-list li {
    display: flex;
    align-items: center;
    gap: var(--space-2);
  }

  .services__card-dot {
    width: 4px;
    height: 4px;
    border-radius: var(--radius-full);
    background: rgba(48, 84, 255, 0.5);
    flex-shrink: 0;
  }
</style>
```

- [ ] **Step 4.2: Update both `pages/index.astro` files to import the new Services**

In `src/pages/index.astro`, replace:
```
import Services from '../components/Services.astro';
```
with:
```
import Services from '../components/sections/Services.astro';
```

In `src/pages/ru/index.astro`, replace:
```
import Services from '../../components/Services.astro';
```
with:
```
import Services from '../../components/sections/Services.astro';
```

- [ ] **Step 4.3: Delete old Services**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/Services.astro
```

- [ ] **Step 4.4: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. In dev, the services section has a 4-card bento grid with photo backgrounds, matching `src/screens/services.png`.

- [ ] **Step 4.5: Commit**

```bash
git add src/components/sections/Services.astro src/pages/index.astro src/pages/ru/index.astro
git add -u src/components/Services.astro
git commit -m "$(cat <<'EOF'
feat(sections): rewrite Services as bento grid with photo backgrounds

4-card bento layout (Разработка / Рост / Инвестиции / Студийный
формат) with compass, hands, robot_hand, bref_bg images as card
backgrounds. Uses design tokens, scoped CSS, reveal-on-scroll
animation. Matches src/screens/services.png.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 5: Portfolio — carousel with Alpine scroll controls

**Files:**
- Create: `src/components/sections/Portfolio.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`
- Delete: `src/components/Portfolio.astro`

**Reference:** `src/screens/cases.png`

- [ ] **Step 5.1: Create `src/components/sections/Portfolio.astro`**

Create the file with these contents:

```astro
---
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
import { portfolioData } from '../../i18n/ui';
import Tag from '../ui/Tag.astro';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const projects = portfolioData[lang];

const media: Record<string, { web: string; mob?: string; video?: string }> = {
  memolink: { web: '/portfolio/memolink_web.png', mob: '/portfolio/memolink_mob.jpg', video: '/portfolio/memolink.mp4' },
  pandev:   { web: '/portfolio/pandev_web.png', video: '/portfolio/pandev.mp4' },
  neva:     { web: '/portfolio/neva_web.png', mob: '/portfolio/neva_mob.jpg' },
  hrms:     { web: '/portfolio/hrms_web.jpg', mob: '/portfolio/hrms_mob.jpg' },
};
---

<section
  id="cases"
  class="portfolio"
  x-data="{
    scroll(dir) {
      const track = this.$refs.track;
      const card = track.querySelector('.portfolio__card');
      if (!card) return;
      const width = card.offsetWidth + 24;
      track.scrollBy({ left: dir * width, behavior: 'smooth' });
    }
  }"
>
  <div class="ds-container portfolio__header">
    <div class="reveal">
      <h2 class="portfolio__title">{t('portfolio.title')}</h2>
      <p class="portfolio__subtitle">{t('portfolio.subtitle')}</p>
    </div>
    <div class="portfolio__nav reveal" style="--reveal-delay: 150ms">
      <button type="button" class="portfolio__arrow" @click="scroll(-1)" aria-label="Previous">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
      </button>
      <button type="button" class="portfolio__arrow" @click="scroll(1)" aria-label="Next">
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg>
      </button>
    </div>
  </div>

  <div class="portfolio__track" x-ref="track">
    {projects.map((p) => {
      const m = media[p.id] ?? { web: '' };
      return (
        <article class="portfolio__card reveal">
          <div class="portfolio__preview">
            <img src={m.web} alt={p.name} class="portfolio__preview-img" />
            {m.video && (
              <video
                class="portfolio__preview-video"
                src={m.video}
                muted
                loop
                playsinline
                preload="metadata"
              ></video>
            )}
            {m.mob && (
              <img src={m.mob} alt="" class="portfolio__preview-mob" aria-hidden="true" />
            )}
          </div>
          <div class="portfolio__tags">
            <Tag label={p.type.toUpperCase()} variant="outline" />
            <Tag label={t('portfolio.type.design')} variant="outline" />
            <Tag label={t('portfolio.type.strategy')} variant="outline" />
          </div>
          <div class="portfolio__meta">
            <h3 class="portfolio__name">{p.name}</h3>
            <p class="portfolio__desc">{p.subtitle}</p>
          </div>
        </article>
      );
    })}
    <div class="portfolio__spacer" aria-hidden="true"></div>
  </div>
</section>

<style>
  .portfolio {
    position: relative;
    padding-block: var(--space-24);
    background: #050505;
    overflow: hidden;
    border-top: 1px solid var(--color-border);
  }

  .portfolio__header {
    display: flex;
    align-items: flex-end;
    justify-content: space-between;
    gap: var(--space-8);
    margin-bottom: var(--space-16);
  }

  .portfolio__title {
    margin: 0 0 var(--space-2);
    font-family: var(--font-sans);
    font-size: var(--text-4xl);
    font-weight: 700;
    letter-spacing: -0.02em;
    text-transform: uppercase;
    color: var(--color-text);
    line-height: 1.05;
  }

  @media (max-width: 743px) {
    .portfolio__title {
      font-size: var(--text-2xl);
    }
  }

  .portfolio__subtitle {
    margin: 0;
    font-size: var(--text-lg);
    color: rgba(255, 255, 255, 0.5);
    max-width: 40ch;
  }

  .portfolio__nav {
    display: flex;
    gap: var(--space-3);
    flex-shrink: 0;
  }

  .portfolio__arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: var(--radius-full);
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: transparent;
    color: rgba(255, 255, 255, 0.6);
    transition: color var(--ease-default), border-color var(--ease-default);
  }

  .portfolio__arrow:hover {
    color: var(--color-text);
    border-color: var(--color-text);
  }

  .portfolio__track {
    display: flex;
    gap: var(--space-6);
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    padding-inline: max(var(--space-6), calc((100vw - var(--container)) / 2 + var(--space-8)));
    padding-bottom: var(--space-16);
    scroll-behavior: smooth;
    scrollbar-width: none;
  }

  .portfolio__track::-webkit-scrollbar {
    display: none;
  }

  .portfolio__card {
    position: relative;
    flex: 0 0 min(85vw, 600px);
    min-height: 540px;
    padding: var(--space-8);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background: rgba(10, 10, 10, 0.4);
    backdrop-filter: blur(60px) saturate(150%);
    -webkit-backdrop-filter: blur(60px) saturate(150%);
    box-shadow: inset 0 1px 1px rgba(255, 255, 255, 0.1), 0 10px 40px rgba(0, 0, 0, 0.5);
    scroll-snap-align: center;
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    overflow: hidden;
  }

  .portfolio__preview {
    position: relative;
    aspect-ratio: 16 / 10;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .portfolio__preview-img,
  .portfolio__preview-video {
    width: 92%;
    height: 92%;
    object-fit: cover;
    object-position: top;
    border-radius: var(--radius-md);
    border: 1px solid var(--color-border);
  }

  .portfolio__preview-video {
    position: absolute;
    inset: 0;
    margin: auto;
    opacity: 0;
    transition: opacity 600ms ease;
  }

  .portfolio__card:hover .portfolio__preview-video {
    opacity: 1;
  }

  .portfolio__preview-mob {
    position: absolute;
    right: 4%;
    bottom: 12%;
    width: 70px;
    border-radius: 10px;
    border: 1px solid var(--color-border);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.6);
  }

  .portfolio__tags {
    display: flex;
    gap: var(--space-2);
    justify-content: center;
    flex-wrap: wrap;
  }

  .portfolio__meta {
    display: flex;
    gap: var(--space-6);
    align-items: flex-start;
    margin-top: auto;
  }

  .portfolio__name {
    margin: 0;
    flex: 0 0 35%;
    font-size: var(--text-2xl);
    font-weight: 700;
    line-height: 1.05;
    letter-spacing: -0.01em;
    color: var(--color-text);
    text-align: center;
    text-wrap: balance;
  }

  .portfolio__desc {
    margin: 0;
    flex: 1;
    font-size: var(--text-sm);
    color: rgba(255, 255, 255, 0.6);
    line-height: 1.5;
    text-wrap: balance;
  }

  .portfolio__spacer {
    flex: 0 0 var(--space-6);
  }
</style>

<script>
  // Play/pause preview videos on hover
  const cards = document.querySelectorAll<HTMLElement>('.portfolio__card');
  cards.forEach((card) => {
    const video = card.querySelector<HTMLVideoElement>('.portfolio__preview-video');
    if (!video) return;
    card.addEventListener('mouseenter', () => {
      video.play().catch(() => {});
    });
    card.addEventListener('mouseleave', () => {
      video.pause();
      video.currentTime = 0;
    });
  });
</script>
```

- [ ] **Step 5.2: Update page imports**

In `src/pages/index.astro`, replace:
```
import Portfolio from '../components/Portfolio.astro';
```
with:
```
import Portfolio from '../components/sections/Portfolio.astro';
```

In `src/pages/ru/index.astro`, replace:
```
import Portfolio from '../../components/Portfolio.astro';
```
with:
```
import Portfolio from '../../components/sections/Portfolio.astro';
```

- [ ] **Step 5.3: Delete old Portfolio**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/Portfolio.astro
```

- [ ] **Step 5.4: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. In dev, Portfolio section matches `src/screens/cases.png` — horizontal carousel, prev/next arrows scroll smoothly, card preview videos play on hover.

- [ ] **Step 5.5: Commit**

```bash
git add src/components/sections/Portfolio.astro src/pages/index.astro src/pages/ru/index.astro
git add -u src/components/Portfolio.astro
git commit -m "$(cat <<'EOF'
feat(sections): rewrite Portfolio as simple carousel with Alpine

Replaces the magnetic-cursor / spotlight / liquid-glass / sibling-
dimming effects with a clean scroll-snap carousel controlled by
Alpine x-data. Preview videos still play on hover via a small
script. Matches src/screens/cases.png.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 6: Calculator — reactive pricing with Alpine x-data

**Files:**
- Create: `src/components/sections/Calculator.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`
- Delete: `src/components/Calculator.astro`

**Reference:** `src/screens/calculator.png`

- [ ] **Step 6.1: Create `src/components/sections/Calculator.astro`**

Create the file with these contents:

```astro
---
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
import SectionTitle from '../ui/SectionTitle.astro';
import Button from '../ui/Button.astro';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);

const categories = [
  { value: 'landing',   label: t('calc.cat.landing') },
  { value: 'ecommerce', label: t('calc.cat.ecommerce') },
  { value: 'saas',      label: t('calc.cat.saas') },
  { value: 'mobile',    label: t('calc.cat.mobile') },
];

const platforms = [
  { value: 'web',     label: t('calc.plat.web') },
  { value: 'ios',     label: t('calc.plat.ios') },
  { value: 'android', label: t('calc.plat.android') },
  { value: 'cross',   label: t('calc.plat.cross') },
];

const labels = {
  month: t('calc.month'),
  months: t('calc.months'),
  dev: t('calc.dev'),
  devs: t('calc.devs'),
};
---

<section id="calculator" class="calculator">
  <div class="calculator__orb calculator__orb--1" aria-hidden="true"></div>
  <div class="calculator__orb calculator__orb--2" aria-hidden="true"></div>

  <div class="ds-container calculator__container">
    <div class="reveal">
      <SectionTitle title={t('calc.title')} subtitle={t('calc.subtitle')} />
    </div>

    <div
      class="calculator__shell reveal"
      style="--reveal-delay: 150ms"
      x-data={`{
        category: 'landing',
        platform: 'web',
        timeline: 3,
        base: { landing: 2000, ecommerce: 8000, saas: 15000, mobile: 12000 },
        devsBase: { landing: 1, ecommerce: 2, saas: 3, mobile: 2 },
        standard: { landing: 2.5, ecommerce: 4, saas: 6.5, mobile: 4 },
        modifier: { web: 1.0, ios: 1.3, android: 1.25, cross: 1.4 },
        get price() {
          const factor = this.standard[this.category] / this.timeline;
          const raw = this.base[this.category] * this.modifier[this.platform] * factor;
          return Math.max(2000, Math.round(raw / 1000) * 1000);
        },
        get devs() {
          const factor = this.standard[this.category] / this.timeline;
          return Math.max(1, Math.ceil(this.devsBase[this.category] * factor * 0.8));
        },
        get priceFormatted() {
          return '$' + this.price.toLocaleString('en-US');
        },
        get timelineLabel() {
          return this.timeline + ' ' + (this.timeline === 1 ? '${labels.month}' : '${labels.months}');
        },
        get devsLabel() {
          return this.devs + ' ' + (this.devs === 1 ? '${labels.dev}' : '${labels.devs}');
        }
      }`}
    >
      <div class="calculator__inputs">
        <div class="calculator__group">
          <label class="calculator__label">{t('calc.category')}</label>
          <div class="calculator__pills">
            {categories.map((c) => (
              <button
                type="button"
                class="calculator__pill"
                :class={`{ 'is-active': category === '${c.value}' }`}
                @click={`category = '${c.value}'`}
              >
                {c.label}
              </button>
            ))}
          </div>
        </div>

        <div class="calculator__group">
          <label class="calculator__label">{t('calc.platform')}</label>
          <div class="calculator__pills">
            {platforms.map((p) => (
              <button
                type="button"
                class="calculator__pill"
                :class={`{ 'is-active': platform === '${p.value}' }`}
                @click={`platform = '${p.value}'`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        <div class="calculator__group">
          <div class="calculator__timeline-header">
            <label class="calculator__label">{t('calc.timeline')}</label>
            <span class="calculator__timeline-badge" x-text="timelineLabel"></span>
          </div>
          <input
            type="range"
            min="1"
            max="12"
            x-model.number="timeline"
            class="calculator__slider"
          />
          <div class="calculator__timeline-ticks">
            <span>1 {labels.month}</span>
            <span>12 {labels.months}</span>
          </div>
        </div>
      </div>

      <div class="calculator__results">
        <div class="calculator__result">
          <div class="calculator__label">{t('calc.estTotal')}</div>
          <div class="calculator__price" x-text="priceFormatted"></div>
          <div class="calculator__note">{t('calc.basedOn')}</div>
        </div>

        <div class="calculator__divider"></div>

        <div class="calculator__result">
          <div class="calculator__label">{t('calc.reqDevs')}</div>
          <div class="calculator__devs" x-text="devsLabel"></div>
        </div>

        <div class="calculator__cta">
          <Button variant="primary" icon="arrow-right" href="#contact">
            {t('calc.getQuote')}
          </Button>
        </div>
      </div>
    </div>
  </div>
</section>

<style>
  .calculator {
    position: relative;
    padding-block: var(--space-24);
    background: var(--color-bg);
    overflow: hidden;
  }

  .calculator__orb {
    position: absolute;
    border-radius: var(--radius-full);
    filter: blur(120px);
    mix-blend-mode: screen;
    pointer-events: none;
    opacity: 0.5;
  }

  .calculator__orb--1 {
    top: 15%;
    left: 15%;
    width: 400px;
    height: 400px;
    background: rgba(48, 84, 255, 0.4);
  }

  .calculator__orb--2 {
    bottom: 15%;
    right: 15%;
    width: 500px;
    height: 500px;
    background: rgba(180, 192, 255, 0.3);
  }

  .calculator__container {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: var(--space-16);
  }

  .calculator__shell {
    display: grid;
    grid-template-columns: 1fr;
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.02);
    backdrop-filter: blur(40px);
    -webkit-backdrop-filter: blur(40px);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
    overflow: hidden;
  }

  @media (min-width: 984px) {
    .calculator__shell {
      grid-template-columns: 1fr 460px;
    }
  }

  .calculator__inputs {
    padding: var(--space-12);
    display: flex;
    flex-direction: column;
    gap: var(--space-12);
  }

  .calculator__group {
    display: flex;
    flex-direction: column;
    gap: var(--space-4);
  }

  .calculator__label {
    font-family: var(--font-sans);
    font-size: var(--text-xs);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
    letter-spacing: 0.2em;
  }

  .calculator__pills {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-3);
  }

  .calculator__pill {
    padding-block: var(--space-3);
    padding-inline: var(--space-6);
    border-radius: var(--radius-full);
    border: 1px solid var(--color-border);
    background: rgba(255, 255, 255, 0.03);
    color: rgba(255, 255, 255, 0.6);
    font-size: var(--text-sm);
    font-weight: 500;
    transition:
      background var(--ease-default),
      color var(--ease-default),
      border-color var(--ease-default),
      box-shadow var(--ease-default);
  }

  .calculator__pill:hover {
    background: rgba(255, 255, 255, 0.1);
    color: var(--color-text);
  }

  .calculator__pill.is-active {
    background: var(--color-accent);
    border-color: rgba(48, 84, 255, 0.8);
    color: var(--color-text);
    box-shadow: 0 0 24px rgba(48, 84, 255, 0.5);
  }

  .calculator__timeline-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .calculator__timeline-badge {
    padding-block: var(--space-1);
    padding-inline: var(--space-3);
    border-radius: var(--radius-full);
    background: rgba(255, 255, 255, 0.1);
    font-size: var(--text-sm);
    font-weight: 600;
    color: var(--color-text);
  }

  .calculator__slider {
    -webkit-appearance: none;
    appearance: none;
    width: 100%;
    height: 4px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: var(--radius-full);
    outline: none;
  }

  .calculator__slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    background: var(--color-text);
    border: 2px solid var(--color-accent);
    box-shadow: 0 0 16px rgba(48, 84, 255, 0.8);
    cursor: pointer;
    transition: transform var(--ease-default);
  }

  .calculator__slider::-webkit-slider-thumb:hover {
    transform: scale(1.2);
  }

  .calculator__slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: var(--radius-full);
    background: var(--color-text);
    border: 2px solid var(--color-accent);
    box-shadow: 0 0 16px rgba(48, 84, 255, 0.8);
    cursor: pointer;
  }

  .calculator__timeline-ticks {
    display: flex;
    justify-content: space-between;
    font-size: var(--text-xs);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.4);
    text-transform: uppercase;
    letter-spacing: 0.1em;
  }

  .calculator__results {
    padding: var(--space-12);
    background: rgba(0, 0, 0, 0.4);
    border-top: 1px solid var(--color-border);
    display: flex;
    flex-direction: column;
    gap: var(--space-8);
    justify-content: center;
  }

  @media (min-width: 984px) {
    .calculator__results {
      border-top: none;
      border-left: 1px solid var(--color-border);
    }
  }

  .calculator__result {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .calculator__price {
    font-size: 64px;
    line-height: 1;
    font-weight: 700;
    letter-spacing: -0.03em;
    color: var(--color-text);
  }

  .calculator__note {
    font-size: var(--text-sm);
    color: rgba(255, 255, 255, 0.3);
  }

  .calculator__divider {
    height: 1px;
    background: var(--color-border);
  }

  .calculator__devs {
    font-size: var(--text-2xl);
    font-weight: 600;
    color: var(--color-text);
    letter-spacing: -0.01em;
  }

  .calculator__cta {
    margin-top: var(--space-4);
  }

  @media (prefers-reduced-motion: reduce) {
    .calculator__slider::-webkit-slider-thumb:hover {
      transform: none;
    }
  }
</style>
```

- [ ] **Step 6.2: Update page imports**

In `src/pages/index.astro`, replace:
```
import Calculator from '../components/Calculator.astro';
```
with:
```
import Calculator from '../components/sections/Calculator.astro';
```

In `src/pages/ru/index.astro`, replace:
```
import Calculator from '../../components/Calculator.astro';
```
with:
```
import Calculator from '../../components/sections/Calculator.astro';
```

- [ ] **Step 6.3: Delete old Calculator**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/Calculator.astro
```

- [ ] **Step 6.4: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. In dev, clicking category/platform pills updates the price live. Dragging the timeline slider updates both price and devs. Matches `src/screens/calculator.png`.

- [ ] **Step 6.5: Commit**

```bash
git add src/components/sections/Calculator.astro src/pages/index.astro src/pages/ru/index.astro
git add -u src/components/Calculator.astro
git commit -m "$(cat <<'EOF'
feat(sections): rewrite Calculator with Alpine x-data

Replaces the motion.js-driven calculator with an Alpine x-data
component. Pricing formula preserved from the old implementation
(base price * platform modifier * timeline factor). Uses design
tokens, scoped CSS, no animation library. Matches
src/screens/calculator.png.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 7: Footer — form with Alpine validation + giant wordmark

**Files:**
- Create: `src/components/sections/Footer.astro`
- Modify: `src/layouts/Layout.astro` (import path)
- Delete: `src/components/Footer.astro`

**Reference:** `src/screens/footer.png`

- [ ] **Step 7.1: Create `src/components/sections/Footer.astro`**

Create the file with these contents:

```astro
---
import { getLangFromUrl, useTranslations } from '../../i18n/utils';
import Button from '../ui/Button.astro';

const lang = getLangFromUrl(Astro.url);
const t = useTranslations(lang);
const thanksMessage = lang === 'ru'
  ? 'Заявка принята. Свяжемся с вами в течение 24 часов.'
  : 'Request received. We will contact you within 24 hours.';
---

<footer id="contact" class="site-footer">
  <div class="site-footer__inner">
    <div class="site-footer__grid">
      <div
        class="site-footer__form-wrap"
        x-data="{
          form: { project: '', name: '', contact: '' },
          errors: {},
          sent: false,
          validate() {
            this.errors = {};
            if (!this.form.project.trim()) this.errors.project = true;
            if (!this.form.name.trim()) this.errors.name = true;
            if (!this.form.contact.trim()) this.errors.contact = true;
            return Object.keys(this.errors).length === 0;
          },
          submit() {
            if (!this.validate()) return;
            this.sent = true;
          }
        }"
      >
        <h2 class="site-footer__title">{t('footer.title')}</h2>

        <form
          class="site-footer__form"
          @submit.prevent="submit"
          x-show="!sent"
        >
          <div class="site-footer__field" :class="{ 'has-error': errors.project }">
            <input
              type="text"
              name="project"
              class="site-footer__input"
              placeholder={t('footer.projName')}
              x-model="form.project"
            />
          </div>
          <div class="site-footer__field" :class="{ 'has-error': errors.name }">
            <input
              type="text"
              name="name"
              class="site-footer__input"
              placeholder={t('footer.yourName')}
              x-model="form.name"
            />
          </div>
          <div class="site-footer__field" :class="{ 'has-error': errors.contact }">
            <input
              type="text"
              name="contact"
              class="site-footer__input"
              placeholder={t('footer.contact')}
              x-model="form.contact"
            />
          </div>

          <div class="site-footer__submit">
            <Button variant="primary" icon="arrow-right" type="submit">
              {t('footer.send')}
            </Button>
          </div>
        </form>

        <p class="site-footer__success" x-show="sent" x-cloak x-transition.opacity>
          {thanksMessage}
        </p>
      </div>

      <div class="site-footer__links">
        <div class="site-footer__links-col">
          <h3 class="site-footer__links-title">{t('footer.social')}</h3>
          <a href="#">LinkedIn</a>
          <a href="#">Telegram</a>
          <a href="#">Whatsapp</a>
          <a href="#">Instagram</a>
          <a href="#">Youtube</a>
        </div>
        <div class="site-footer__links-col">
          <h3 class="site-footer__links-title">{t('footer.contactSection')}</h3>
          <a href="mailto:hello@af.vs">hello@af.vs</a>
          <a href="https://t.me/afvs_contact" target="_blank" rel="noopener">@afvs_contact</a>
        </div>
      </div>
    </div>

    <div class="site-footer__wordmark">
      <h2>AF.VS</h2>
    </div>

    <div class="site-footer__rule"></div>

    <div class="site-footer__meta">
      <p>© 2026 AF.VS. {t('footer.rights')}</p>
      <p>{t('footer.powered')}</p>
    </div>
  </div>
</footer>

<style>
  [x-cloak] { display: none !important; }

  .site-footer {
    position: relative;
    background: var(--color-bg-footer);
    padding-top: var(--space-24);
    padding-inline: var(--space-6);
    padding-bottom: var(--space-8);
    color: var(--color-text);
    font-family: var(--font-sans);
    overflow: hidden;
  }

  .site-footer__inner {
    max-width: var(--container-wide);
    margin-inline: auto;
  }

  .site-footer__grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: var(--space-16);
  }

  @media (min-width: 984px) {
    .site-footer__grid {
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-24);
    }
  }

  .site-footer__title {
    margin: 0 0 var(--space-8);
    font-size: var(--text-4xl);
    font-weight: 500;
    line-height: 1.1;
    letter-spacing: -0.02em;
    max-width: 14ch;
  }

  @media (max-width: 743px) {
    .site-footer__title {
      font-size: var(--text-2xl);
    }
  }

  .site-footer__form {
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
    max-width: 480px;
  }

  .site-footer__field {
    position: relative;
  }

  .site-footer__input {
    width: 100%;
    background: transparent;
    border: none;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
    color: var(--color-text);
    font: inherit;
    font-size: var(--text-lg);
    padding-block: var(--space-2);
    outline: none;
    transition: border-color var(--ease-default);
  }

  .site-footer__input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .site-footer__input:focus {
    border-bottom-color: var(--color-text);
  }

  .site-footer__field.has-error .site-footer__input {
    border-bottom-color: #ff5c5c;
  }

  .site-footer__submit {
    margin-top: var(--space-4);
  }

  .site-footer__success {
    font-size: var(--text-lg);
    color: var(--color-accent-light);
    max-width: 40ch;
  }

  .site-footer__links {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-12);
    padding-top: var(--space-2);
  }

  .site-footer__links-col {
    display: flex;
    flex-direction: column;
    gap: var(--space-3);
  }

  .site-footer__links-title {
    margin: 0 0 var(--space-2);
    font-size: 10px;
    font-weight: 700;
    letter-spacing: 0.2em;
    text-transform: uppercase;
    color: rgba(255, 255, 255, 0.4);
  }

  .site-footer__links-col a {
    font-size: var(--text-base);
    font-weight: 500;
    color: rgba(255, 255, 255, 0.8);
    transition: color var(--ease-default);
  }

  .site-footer__links-col a:hover {
    color: var(--color-text);
  }

  .site-footer__wordmark h2 {
    margin: var(--space-16) 0 0;
    font-size: clamp(5rem, 15vw, 16rem);
    font-weight: 700;
    line-height: 0.85;
    letter-spacing: -0.05em;
    color: var(--color-text);
    user-select: none;
  }

  .site-footer__rule {
    margin-top: var(--space-4);
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
  }

  .site-footer__meta {
    margin-top: var(--space-4);
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    color: rgba(255, 255, 255, 0.4);
    font-size: var(--text-xs);
  }

  @media (min-width: 744px) {
    .site-footer__meta {
      flex-direction: row;
      justify-content: space-between;
    }
  }
</style>
```

- [ ] **Step 7.2: Update `Layout.astro` Footer import**

In `src/layouts/Layout.astro`, replace:
```astro
import Footer from '../components/Footer.astro';
```
with:
```astro
import Footer from '../components/sections/Footer.astro';
```

- [ ] **Step 7.3: Delete old Footer**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/Footer.astro
```

- [ ] **Step 7.4: Verify build**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. In dev, footer matches `src/screens/footer.png`. Empty form submission highlights fields red. Valid submission shows success message. Giant AF.VS wordmark renders at the bottom.

- [ ] **Step 7.5: Commit**

```bash
git add src/components/sections/Footer.astro src/layouts/Layout.astro
git add -u src/components/Footer.astro
git commit -m "$(cat <<'EOF'
feat(sections): rewrite Footer with Alpine form validation

Form state + client-side validation + success state via Alpine
x-data. Giant AF.VS wordmark, two-column layout, social / contact
link lists. Scoped CSS + design tokens. No real submission yet -
that's a follow-up task. Matches src/screens/footer.png.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Task 8: Final cleanup — remove orphans, verify full build

**Files:**
- Delete: `src/components/Welcome.astro` (unused)
- Verify: no stale imports anywhere in `src/`

- [ ] **Step 8.1: Delete orphan Welcome.astro**

Run:
```bash
rm /Users/yuldashev/Xcode/Github/af.vs_web/src/components/Welcome.astro
```

- [ ] **Step 8.2: Grep for any leftover Tailwind class attributes in sections**

Run (via Grep tool, not bash):
```
Grep pattern: "class=\"[^\"]*\b(flex|grid|bg-black|bg-white|text-white|w-full|h-screen|absolute|relative)\b[^\"]*\""
  path: src/components/sections/
  path: src/layouts/
```

Expected: zero matches. If any match appears, it means a stray Tailwind utility class leaked in — remove it and switch to scoped CSS.

- [ ] **Step 8.3: Grep for any stale imports of the removed components**

Run (via Grep tool):
```
Grep pattern: "from ['\"](../|../../)components/(Hero|Services|Portfolio|Calculator|Footer|Welcome)"
  path: src/
```

Expected: zero matches.

Also:
```
Grep pattern: "from ['\"](../|../../)components/ui/header"
  path: src/
```

Expected: zero matches.

- [ ] **Step 8.4: Verify no Tailwind / motion / hls / lucide references remain**

Run (via Grep tool):
```
Grep pattern: "(tailwindcss|hls\\.js|import.*motion|lucide)"
  path: src/
  path: package.json
```

Expected: zero matches (aside from these docs files).

- [ ] **Step 8.5: Full build verification**

Run:
```bash
cd /Users/yuldashev/Xcode/Github/af.vs_web
npm run build
```

Expected: build succeeds. Run `npm run preview` and click through both `/` and `/ru/`:

- [ ] Hero video autoplays, title/subtitle/CTA animate in
- [ ] Header shrinks on scroll, mobile menu toggles on <744px
- [ ] Services bento grid shows 4 cards with photo backgrounds
- [ ] Portfolio carousel scrolls with arrow buttons, preview videos play on hover
- [ ] Calculator updates price/devs live when pills/slider change
- [ ] Footer form validates empty inputs and shows success on valid submission
- [ ] EN/RU language toggle works (loading `/` vs `/ru/`)

- [ ] **Step 8.6: Commit cleanup**

```bash
git add -u src/components/Welcome.astro
git commit -m "$(cat <<'EOF'
chore: remove orphan Welcome.astro component

Finalizes landing redesign migration. Welcome.astro was never
wired into any page. All sections now live under
components/sections/ and use scoped CSS + design tokens + Alpine.

Co-Authored-By: Claude Opus 4.6 (1M context) <noreply@anthropic.com>
EOF
)"
```

---

## Completion Criteria

- [ ] All 8 tasks committed to `feature` branch
- [ ] `npm run build` succeeds with no errors or warnings
- [ ] `src/components/sections/` contains 6 files: Header, Hero, Services, Portfolio, Calculator, Footer
- [ ] `src/components/` contains only `ui/` subdirectory + any non-section files
- [ ] `package.json` has no `tailwindcss`, `@tailwindcss/vite`, `motion`, `hls.js`, `lucide-react`
- [ ] `package.json` has `alpinejs` + `@types/alpinejs`
- [ ] `astro.config.mjs` has no plugins
- [ ] Visual match against `src/screens/*.png` (hero, services, cases, calculator, footer)
- [ ] Both `/` and `/ru/` render correctly
- [ ] `CLAUDE.md` says Astro 6.x
