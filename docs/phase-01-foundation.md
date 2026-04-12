# Phase 1: Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Поднять пустой Astro-проект с TS strict, Vercel-адаптером, токенами, шрифтами, i18n-роутингом и базовым `Layout + GlowBackground`, чтобы `npm run dev` показывал тёмный фон со свечением и grid-паттерном.

**Depends on:** ничто (первая фаза).

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Architecture:** Manual scaffold (а не `npm create astro`) — `package.json`, `tsconfig.json`, `astro.config.mjs` создаются вручную, затем `npm install`. Это детерминированно и не зависит от интерактивных CLI-промптов Astro. Токены — через `:root` в `tokens.css`, шрифты — через `@fontsource/*`, i18n — через native Astro routing (`prefixDefaultLocale: false`).

**Tech Stack:** Astro 5, TypeScript strict, `@astrojs/vercel`, `@fontsource/inter`, `@fontsource/space-grotesk`.

---

## File Structure

- Create: `package.json`
- Create: `tsconfig.json`
- Create: `astro.config.mjs`
- Create: `.gitignore`
- Create: `src/env.d.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/global.css`
- Create: `src/components/layout/Layout.astro`
- Create: `src/components/layout/GlowBackground.astro`
- Create: `src/i18n/en.ts`
- Create: `src/i18n/ru.ts`
- Create: `src/pages/index.astro`
- Create: `src/pages/ru/index.astro`

## Tasks

### Task 1.1: Создать `package.json`

**Files:**
- Create: `package.json`

- [ ] **Step 1: Написать файл**

```json
{
  "name": "afvs-vercel",
  "type": "module",
  "version": "0.0.1",
  "private": true,
  "scripts": {
    "dev": "astro dev",
    "start": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "astro": "astro",
    "check": "astro check"
  },
  "dependencies": {
    "astro": "^5.0.0",
    "@astrojs/vercel": "^8.0.0",
    "@fontsource/inter": "^5.0.0",
    "@fontsource/space-grotesk": "^5.0.0"
  },
  "devDependencies": {
    "typescript": "^5.0.0",
    "@astrojs/check": "^0.9.0"
  }
}
```

- [ ] **Step 2: Установить зависимости**

Run: `npm install`
Expected: установка без ошибок, появляется `node_modules/` и `package-lock.json`.

### Task 1.2: Создать `tsconfig.json`

**Files:**
- Create: `tsconfig.json`

- [ ] **Step 1: Написать файл**

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true,
    "allowJs": false,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": ["src/**/*", ".astro/types.d.ts"],
  "exclude": ["dist", "node_modules"]
}
```

- [ ] **Step 2: Проверить TS**

Run: `npx astro check`
Expected: «0 errors, 0 warnings, 0 hints» (может сказать «No files found» — это ок, `src/` пока пустой).

### Task 1.3: Создать `astro.config.mjs`

**Files:**
- Create: `astro.config.mjs`

- [ ] **Step 1: Написать файл**

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
```

### Task 1.4: Создать `.gitignore`

**Files:**
- Create: `.gitignore`

- [ ] **Step 1: Написать файл**

```
# build output
dist/
.vercel/
.astro/

# dependencies
node_modules/

# logs
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*

# environment variables
.env
.env.production
.env.local

# macOS
.DS_Store

# editors
.vscode/
.idea/
```

### Task 1.5: Создать `src/env.d.ts`

**Files:**
- Create: `src/env.d.ts`

- [ ] **Step 1: Написать файл**

```ts
/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />
```

### Task 1.6: Создать `src/styles/tokens.css` с полным набором переменных из DESIGN.md

**Files:**
- Create: `src/styles/tokens.css`

- [ ] **Step 1: Написать файл**

```css
:root {
  /* ── Surface ───────────────────────────────── */
  --surface-white: #f8f9fe;
  --surface-card:  #0a1626;
  --surface-bg:    #060b14;

  /* ── Primary ───────────────────────────────── */
  --primary-default: #158ef2;
  --primary-accent:  #91c6f2;

  /* ── Text on dark ──────────────────────────── */
  --text-primary:   #f8f9fe;
  --text-subtle:    rgba(255, 255, 255, 0.8);
  --text-secondary: rgba(255, 255, 255, 0.6);

  /* ── Borders ───────────────────────────────── */
  --border-card: rgba(255, 255, 255, 0.6);

  /* ── Typography families ───────────────────── */
  --font-display: 'Space Grotesk', system-ui, -apple-system, sans-serif;
  --font-body:    'Inter', system-ui, -apple-system, sans-serif;

  /* ── Font sizes ────────────────────────────── */
  --font-size-h1:      62px;
  --font-size-h4:      32px;
  --font-size-h5:      26px;
  --font-size-body:    16px;
  --font-size-caption: 14px;

  /* ── Line heights ──────────────────────────── */
  --line-height-h1:      1;
  --line-height-h4:      1.3;
  --line-height-h5:      1.2;
  --line-height-body:    1.5;
  --line-height-caption: 2;

  /* ── Letter spacing ────────────────────────── */
  --letter-spacing-h1: -2px;
  --letter-spacing-h4: -1px;
  --letter-spacing-h5: -1px;

  /* ── Radii ─────────────────────────────────── */
  --radius-card: 32px;
  --radius-pill: 999px;

  /* ── Card ──────────────────────────────────── */
  --card-padding: 24px;
  --card-border-width: 2px;

  /* ── Container (mobile → desktop) ──────────── */
  --container-max-desktop: 1200px;
  --container-max-laptop:  936px;
  --container-padding-desktop: 120px;
  --container-padding-laptop:  24px;
  --container-padding-mobile:  16px;

  /* ── Header ────────────────────────────────── */
  --header-height: 96px;

  /* ── CTA Button ────────────────────────────── */
  --cta-width:  256px;
  --cta-height: 56px;
}
```

- [ ] **Step 2: Проверить hex-диcциплину**

Run: `grep -rEn '#[0-9a-fA-F]{3,8}' src/ --include='*.css' --include='*.astro' --include='*.ts' | grep -v 'src/styles/tokens.css' | grep -v 'rgba(' || echo 'OK: hex only in tokens.css'`
Expected: `OK: hex only in tokens.css`

### Task 1.7: Создать `src/styles/global.css` с reset и импортами шрифтов

**Files:**
- Create: `src/styles/global.css`

- [ ] **Step 1: Написать файл**

```css
/* Font imports — only weights we actually use */
@import '@fontsource/inter/400.css';
@import '@fontsource/inter/500.css';
@import '@fontsource/inter/600.css';
@import '@fontsource/space-grotesk/700.css';

/* Minimal reset */
*,
*::before,
*::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

html {
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-size-adjust: 100%;
}

body {
  min-height: 100vh;
  background-color: var(--surface-bg);
  color: var(--text-primary);
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  line-height: var(--line-height-body);
  font-weight: 400;
}

img,
picture,
svg,
video {
  display: block;
  max-width: 100%;
}

a {
  color: inherit;
  text-decoration: none;
}

button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  cursor: pointer;
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--font-display);
  font-weight: 700;
}
```

### Task 1.8: Создать `src/components/layout/GlowBackground.astro`

**Files:**
- Create: `src/components/layout/GlowBackground.astro`

- [ ] **Step 1: Написать файл**

```astro
---
// CSS-only ambient glow: grid pattern + 5 blurred radial eclipses.
// No canvas, no JS. Lives behind all page content.
---

<div class="glow" aria-hidden="true">
  <div class="grid"></div>
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="orb orb-4"></div>
  <div class="orb orb-5"></div>
</div>

<style>
  .glow {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  .orb {
    position: absolute;
    width: 448px;
    height: 448px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--primary-default) 0%, transparent 70%);
    opacity: 0.35;
    filter: blur(120px);
  }

  .orb-1 { top: 5%;  left: 10%;  }
  .orb-2 { top: 25%; right: 15%; }
  .orb-3 { top: 55%; left: 35%;  }
  .orb-4 { top: 75%; right: 5%;  }
  .orb-5 { top: 90%; left: 20%;  }
</style>
```

### Task 1.9: Создать `src/components/layout/Layout.astro`

**Files:**
- Create: `src/components/layout/Layout.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import '../../styles/tokens.css';
import '../../styles/global.css';
import GlowBackground from './GlowBackground.astro';

interface Props {
  title: string;
  description?: string;
  lang?: 'en' | 'ru';
}

const { title, description = '', lang = 'en' } = Astro.props;
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <title>{title}</title>
  </head>
  <body>
    <GlowBackground />
    <slot />
  </body>
</html>
```

### Task 1.10: Создать `src/i18n/en.ts`

**Files:**
- Create: `src/i18n/en.ts`

- [ ] **Step 1: Написать файл**

```ts
// Source of truth for EN copy is DESIGN.md → Figma.

export const en = {
  nav: {
    services: 'Services',
    portfolio: 'Portfolio',
    contact: 'Contact',
  },
  lang: {
    toggle: 'En',
    other: 'Ru',
  },
  hero: {
    title: 'From idea to product, from product to growth',
    cta: 'Get started',
  },
  services: {
    build: {
      title: 'Build',
      description: 'From idea to launch-ready product',
      tags: ['product discovery', 'ui/ux design', 'mvp development', 'full-cycle product'],
    },
    ai: {
      title: 'AI',
      description: 'Practical AI for real product use cases',
      tags: ['ai-powered features', 'integrations'],
    },
    advisory: {
      title: 'Advisory',
      description: 'Strategic support for product decisions',
      tags: ['product strategy', 'delivery setup'],
    },
    growth: {
      title: 'Growth',
      description: 'From launch to long-term product growth',
      tags: ['expansion', 'upgrade', 'support', 'iteration'],
    },
  },
  cases: {
    title: 'Our latest work',
  },
  form: {
    title: 'Get in touch',
    name: 'Name',
    email: 'Email',
    message: 'Message',
    submit: 'Send',
    errorUnconfigured: 'Form delivery not configured yet.',
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    social: {
      instagram: 'INSTAGRAM',
      telegram: 'TELEGRAM',
    },
  },
} as const;

export type Dict = typeof en;
```

### Task 1.11: Создать `src/i18n/ru.ts` с плейсхолдерами

**Files:**
- Create: `src/i18n/ru.ts`

- [ ] **Step 1: Написать файл**

```ts
import type { Dict } from './en';

// Ru — плейсхолдеры до Фазы 7. Структура должна строго совпадать с en.

export const ru: Dict = {
  nav: {
    services: 'TBD RU',
    portfolio: 'TBD RU',
    contact: 'TBD RU',
  },
  lang: {
    toggle: 'Ru',
    other: 'En',
  },
  hero: {
    title: 'TBD RU',
    cta: 'TBD RU',
  },
  services: {
    build: {
      title: 'TBD RU',
      description: 'TBD RU',
      tags: ['TBD RU'],
    },
    ai: {
      title: 'TBD RU',
      description: 'TBD RU',
      tags: ['TBD RU'],
    },
    advisory: {
      title: 'TBD RU',
      description: 'TBD RU',
      tags: ['TBD RU'],
    },
    growth: {
      title: 'TBD RU',
      description: 'TBD RU',
      tags: ['TBD RU'],
    },
  },
  cases: {
    title: 'TBD RU',
  },
  form: {
    title: 'TBD RU',
    name: 'TBD RU',
    email: 'TBD RU',
    message: 'TBD RU',
    submit: 'TBD RU',
    errorUnconfigured: 'TBD RU',
  },
  footer: {
    brand: 'AF Venture studio',
    copyright: '© 2026',
    social: {
      instagram: 'INSTAGRAM',
      telegram: 'TELEGRAM',
    },
  },
};
```

- [ ] **Step 2: Проверить что структуры совпадают**

Run: `npx astro check`
Expected: 0 errors. Если `ru.ts` расходится со структурой `Dict`, TS упадёт.

### Task 1.12: Создать `src/pages/index.astro` (en, default)

**Files:**
- Create: `src/pages/index.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import Layout from '../components/layout/Layout.astro';
import { en } from '../i18n/en';
---

<Layout title="AF Venture Studio" description={en.hero.title} lang="en">
  <main>
    <!-- Sections will be filled in later phases -->
  </main>
</Layout>
```

### Task 1.13: Создать `src/pages/ru/index.astro`

**Files:**
- Create: `src/pages/ru/index.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import Layout from '../../components/layout/Layout.astro';
import { ru } from '../../i18n/ru';
---

<Layout title="AF Venture Studio" description={ru.hero.title} lang="ru">
  <main>
    <!-- Sections will be filled in later phases -->
  </main>
</Layout>
```

### Task 1.14: Проверка сборки

- [ ] **Step 1: Type-check**

Run: `npx astro check`
Expected: `0 errors, 0 warnings, 0 hints`.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: успешный билд, `dist/` создан, в нём `index.html` и `ru/index.html`.

- [ ] **Step 3: Dev-сервер (ручная визуальная проверка)**

Run: `npm run dev`
Expected: сервер на `http://localhost:4321/`, страница тёмная (`--surface-bg` = `#060b14`), видны мягкие синие пятна и лёгкая grid-сетка. На `/ru/` то же самое.

Останови сервер (Ctrl+C).

### Task 1.15: Коммит Фазы 1

- [ ] **Step 1: Stage и commit**

```bash
git add package.json package-lock.json tsconfig.json astro.config.mjs .gitignore \
        src/env.d.ts \
        src/styles/tokens.css src/styles/global.css \
        src/components/layout/Layout.astro src/components/layout/GlowBackground.astro \
        src/i18n/en.ts src/i18n/ru.ts \
        src/pages/index.astro src/pages/ru/index.astro
git commit -m "feat(phase-1): foundation — astro, tokens, fonts, i18n, glow layout"
```

Expected: один новый коммит, чистый `git status` (кроме `CLAUDE.md`, `DESIGN.md`, `.claude/`, `node_modules/` — untracked/ignored).

## Acceptance (run before marking phase complete)

- [ ] `npx astro check` — 0 errors
- [ ] `npm run build` — без warnings
- [ ] `npm run dev` + открытие `/` и `/ru/` — обе страницы рендерят тёмный фон с glow (ручная проверка)
- [ ] Grep-проверка hex: `grep -rEn '#[0-9a-fA-F]{3,8}' src/ --include='*.css' --include='*.astro' --include='*.ts' | grep -v 'src/styles/tokens.css'` — пусто
- [ ] Нет зависимостей от Tailwind / styled-components / emotion в `package.json`
- [ ] Коммит Фазы 1 создан

## Next

→ [`phase-02-chrome.md`](./phase-02-chrome.md)
