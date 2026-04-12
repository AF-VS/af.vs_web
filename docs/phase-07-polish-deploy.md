# Phase 7: Polish & Deploy Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Довести лендинг до production-качества: responsive-аудит по всем брейкпоинтам, hover/focus-состояния, базовое SEO (title/description/OG/sitemap/robots/JSON-LD), Vercel Analytics, русский перевод, Lighthouse ≥ 90, production deploy на Vercel.

**Depends on:** [`phase-06-form.md`](./phase-06-form.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Architecture:** `SEO` — маленький компонент, который принимает props и рендерит meta/OG/JSON-LD; подключается в `Layout.astro`. Sitemap — через `@astrojs/sitemap`. Vercel Analytics — через `@vercel/analytics`, подключается одним `<script>` в Layout. Русский перевод — замена всех `'TBD RU'` на реальные строки из DESIGN.md (en) + ручной перевод.

**Tech Stack:** Astro, `@astrojs/sitemap`, `@vercel/analytics`.

---

## File Structure

- Modify: `package.json` — добавить `@astrojs/sitemap` и `@vercel/analytics`
- Modify: `astro.config.mjs` — integrations: sitemap, site URL
- Create: `src/components/seo/SEO.astro`
- Create: `public/robots.txt`
- Create: `public/og-image.png` (скачать/сгенерировать OG-картинку)
- Modify: `src/components/layout/Layout.astro` — подключить `SEO`, Vercel Analytics
- Modify: `src/i18n/ru.ts` — заменить все `'TBD RU'` на русские тексты
- Modify: `src/components/hero/Hero.astro` — поддержка accent-слов для `ru` (обновить `isEnglishTitle` → data-driven)

## Tasks

### Task 7.1: Responsive audit (без изменений кода, только проверка)

- [ ] **Step 1: Запустить dev-сервер и пройти по брейкпоинтам**

Run: `npm run dev`

В DevTools Device Mode проверь:
- 375px (mobile): всё читаемо, карточки в столбик, карусель свайпом, форма одной колонкой
- 768px (tablet): services 2×2, form 2 колонки
- 984px (laptop): container 936px
- 1248px+ (desktop): services 1×4, container 1200px

Список найденных проблем → фикс в коде → повторная проверка. В этой таске допустимо делать быстрые правки в `*.astro` / `global.css`.

- [ ] **Step 2: Коммит фиксов (если были)**

```bash
git add -p
git commit -m "fix(phase-7): responsive audit corrections"
```

### Task 7.2: Hover/focus/active аудит

- [ ] **Step 1: Tab-walk**

Запусти dev-сервер, нажми Tab много раз и проверь, что на каждом интерактивном элементе виден focus ring (`:focus-visible` из `global.css`). Где ring не видно или сливается — поправь стили компонента.

Элементы для проверки: лого в Header, 3 nav-ссылки, переключатель языка, CTA Get started, 2 стрелки карусели, все поля формы, submit-кнопка, footer-ссылки.

- [ ] **Step 2: Hover walk**

Наведи мышь на все интерактивные элементы. Каждый должен иметь визуальный hover. Если чего-то нет — добавь.

- [ ] **Step 3: Коммит**

```bash
git add -p
git commit -m "fix(phase-7): interactive states for header/footer/carousel/form"
```

### Task 7.3: Установить `@astrojs/sitemap` и `@vercel/analytics`

- [ ] **Step 1: Установка**

Run: `npm i @astrojs/sitemap @vercel/analytics`
Expected: `package.json` обновлён.

### Task 7.4: Обновить `astro.config.mjs`

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Добавить sitemap integration и site URL**

```js
import { defineConfig } from 'astro/config';
import vercel  from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://afvs.studio', // заменить на реальный production-домен перед коммитом Task 7.13, если afvs.studio не используется
  adapter: vercel(),
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru'],
    routing: { prefixDefaultLocale: false },
  },
});
```

**Note:** если реальный домен ещё не выбран, использовать Vercel-preview URL и заменить позже. Но сайт обязательно должен быть задан для sitemap.

### Task 7.5: Создать `public/robots.txt`

**Files:**
- Create: `public/robots.txt`

- [ ] **Step 1: Написать файл**

```
User-agent: *
Allow: /

Sitemap: https://afvs.studio/sitemap-index.xml
```

(замени домен на реальный в момент деплоя)

### Task 7.6: Создать `src/components/seo/SEO.astro`

**Files:**
- Create: `src/components/seo/SEO.astro`

- [ ] **Step 1: Написать файл**

```astro
---
interface Props {
  title: string;
  description: string;
  lang: 'en' | 'ru';
  canonical: string;
  ogImage?: string;
}

const { title, description, lang, canonical, ogImage = '/og-image.png' } = Astro.props;

const orgJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'AF Venture Studio',
  url: canonical,
  sameAs: [
    'https://instagram.com/afvs',
    'https://t.me/afvs',
  ],
};
---

<title>{title}</title>
<meta name="description" content={description} />
<link rel="canonical" href={canonical} />

<!-- OpenGraph -->
<meta property="og:type"        content="website" />
<meta property="og:title"       content={title} />
<meta property="og:description" content={description} />
<meta property="og:url"         content={canonical} />
<meta property="og:image"       content={ogImage} />
<meta property="og:locale"      content={lang === 'ru' ? 'ru_RU' : 'en_US'} />

<!-- Twitter -->
<meta name="twitter:card"        content="summary_large_image" />
<meta name="twitter:title"       content={title} />
<meta name="twitter:description" content={description} />
<meta name="twitter:image"       content={ogImage} />

<!-- JSON-LD -->
<script type="application/ld+json" set:html={JSON.stringify(orgJsonLd)}></script>
```

### Task 7.7: Скачать OG-картинку

- [ ] **Step 1: Добавить `public/og-image.png`**

Получи превью главной страницы из Figma (`get_screenshot(nodeId="277:735")`) или из готовой сборки (скриншот `/`) в размере 1200×630. Сохрани в `public/og-image.png`.

Если Figma не даёт 1200×630 напрямую — используй hero-скриншот и обрежь. Главное: jpg или png, ≤ 500kb.

### Task 7.8: Интегрировать `SEO` и Vercel Analytics в `Layout.astro`

**Files:**
- Modify: `src/components/layout/Layout.astro`

- [ ] **Step 1: Обновить Layout**

```astro
---
import '../../styles/tokens.css';
import '../../styles/global.css';
import GlowBackground from './GlowBackground.astro';
import SEO from '../seo/SEO.astro';

interface Props {
  title: string;
  description?: string;
  lang?: 'en' | 'ru';
}

const { title, description = '', lang = 'en' } = Astro.props;
const canonical = new URL(Astro.url.pathname, Astro.site ?? 'https://afvs.studio').toString();
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <SEO title={title} description={description} lang={lang} canonical={canonical} />
  </head>
  <body>
    <GlowBackground />
    <slot />

    <script>
      import { inject } from '@vercel/analytics';
      inject();
    </script>
  </body>
</html>
```

- [ ] **Step 2: Добавить `public/favicon.svg`**

Если favicon ещё не скачан — экспортируй из Figma (node canvas `277:734`) или создай простую SVG с буквами `AF`. Сохрани в `public/favicon.svg`.

### Task 7.9: Перевести `src/i18n/ru.ts`

**Files:**
- Modify: `src/i18n/ru.ts`

- [ ] **Step 1: Заменить все `'TBD RU'` на русские тексты**

```ts
import type { Dict } from './en';

export const ru: Dict = {
  nav: {
    services: 'Услуги',
    portfolio: 'Портфолио',
    contact: 'Контакты',
  },
  lang: {
    toggle: 'Ru',
    other: 'En',
  },
  hero: {
    title: 'От идеи к продукту, от продукта к росту',
    cta: 'Начать',
  },
  services: {
    build: {
      title: 'Build',
      description: 'От идеи до готового к запуску продукта',
      tags: ['product discovery', 'ui/ux дизайн', 'mvp разработка', 'полный цикл'],
    },
    ai: {
      title: 'AI',
      description: 'Практичный AI для реальных продуктовых задач',
      tags: ['ai-фичи', 'интеграции'],
    },
    advisory: {
      title: 'Advisory',
      description: 'Стратегическая поддержка продуктовых решений',
      tags: ['продуктовая стратегия', 'настройка процессов'],
    },
    growth: {
      title: 'Growth',
      description: 'От запуска к устойчивому росту продукта',
      tags: ['экспансия', 'апгрейд', 'поддержка', 'итерации'],
    },
  },
  cases: {
    title: 'Наши последние работы',
    items: [
      { title: 'Кейс один',   tagline: 'Короткое описание первого кейса.' },
      { title: 'Кейс два',    tagline: 'Короткое описание второго кейса.' },
      { title: 'Кейс три',    tagline: 'Короткое описание третьего кейса.' },
    ],
  },
  form: {
    title: 'Связаться с нами',
    name: 'Имя',
    email: 'Email',
    message: 'Сообщение',
    submit: 'Отправить',
    errorUnconfigured: 'Отправка формы пока не настроена.',
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

### Task 7.10: Обновить Hero для поддержки акцентов на `ru`

**Files:**
- Modify: `src/components/hero/Hero.astro`

- [ ] **Step 1: Data-driven акценты**

Вместо хардкод-проверки `isEnglishTitle` — вынеси структуру заголовка в словари:

```ts
// src/i18n/en.ts — расширить hero:
hero: {
  title: 'From idea to product, from product to growth',
  titleParts: [
    { text: 'From idea to ' },
    { text: 'product', accent: true },
    { text: ', from product to ' },
    { text: 'growth', accent: true },
  ],
  cta: 'Get started',
},
```

И аналогично в `ru.ts`:

```ts
hero: {
  title: 'От идеи к продукту, от продукта к росту',
  titleParts: [
    { text: 'От идеи к ' },
    { text: 'продукту', accent: true },
    { text: ', от продукта к ' },
    { text: 'росту', accent: true },
  ],
  cta: 'Начать',
},
```

Обнови тип `Dict` (через `as const` автоматически) и `Hero.astro`:

```astro
<h1 class="hero__title">
  {dict.hero.titleParts.map((part) => (
    part.accent
      ? <span class="accent">{part.text}</span>
      : <>{part.text}</>
  ))}
</h1>
```

Убери `isEnglishTitle` из файла.

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: 0 errors.

### Task 7.11: Lighthouse аудит

- [ ] **Step 1: Production build + preview**

Run: `npm run build && npm run preview`

Открой `http://localhost:4321/` в Chrome.

- [ ] **Step 2: Lighthouse (DevTools → Lighthouse → Analyze page load)**

Цели (на desktop profile):
- Performance ≥ 90
- Accessibility ≥ 90
- Best Practices ≥ 90
- SEO ≥ 90

Если что-то ниже — исправь (обычно: lazy-loading картинок, `width/height` на `<img>`, alt-тексты, meta-теги). Повтори запуск, пока все метрики ≥ 90. Зафиксируй фиксы в отдельных коммитах.

- [ ] **Step 3: Повторить для `/ru/`**

Lighthouse на `/ru/` — те же пороги.

### Task 7.12: Production deploy на Vercel

- [ ] **Step 1: Установить Vercel CLI (если нет)**

Run: `npm i -g vercel` (или использовать существующий login)

- [ ] **Step 2: Linked project**

Run: `vercel link`
Ответь на вопросы CLI — привяжи к существующему или создай новый проект в персональном scope.

- [ ] **Step 3: Deploy preview**

Run: `vercel`
Expected: preview URL вида `https://afvs-vercel-<hash>.vercel.app`.

Открой URL — визуально всё должно работать.

- [ ] **Step 4: Deploy production**

Run: `vercel --prod`
Expected: production URL. Если домен `afvs.studio` настроен — сайт доступен там.

- [ ] **Step 5: Обновить `site` и `robots.txt` если production-домен отличается**

Если production URL не `afvs.studio` — замени его в `astro.config.mjs` (`site`) и в `public/robots.txt` (`Sitemap:`). Пересобери и редеплой.

### Task 7.13: Коммит Фазы 7

- [ ] **Step 1: Stage и commit финальные изменения**

```bash
git add package.json package-lock.json astro.config.mjs \
        public/robots.txt public/og-image.png public/favicon.svg \
        src/components/seo/SEO.astro \
        src/components/layout/Layout.astro \
        src/components/hero/Hero.astro \
        src/i18n/en.ts src/i18n/ru.ts
git commit -m "feat(phase-7): polish — seo, sitemap, analytics, ru translation, deploy"
```

## Acceptance (run before marking phase complete)

- [ ] Responsive OK на 375 / 768 / 984 / 1248+
- [ ] Focus-visible на всех интерактивных элементах
- [ ] SEO meta / OG / JSON-LD / sitemap / robots.txt в `dist/`
- [ ] Vercel Analytics подключен (Layout содержит `inject()`)
- [ ] Русские тексты везде вместо `'TBD RU'`
- [ ] Lighthouse ≥ 90 на `/` и `/ru/`
- [ ] Production URL живёт
- [ ] Grep hex вне `tokens.css` = 0
- [ ] Коммиты Фазы 7 созданы

## Next

→ [`phase-08-playwright.md`](./phase-08-playwright.md)
