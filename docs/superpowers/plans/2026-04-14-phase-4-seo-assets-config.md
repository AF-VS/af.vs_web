# Phase 4 — SEO, i18n Metadata, Assets & Build Config

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Привести SEO / i18n-метаданные к продовому уровню, сжать тяжёлые ассеты, зафиксировать версию Node, подчистить оставшиеся devDependencies и конфиги сборки.

**Architecture:**
1. Layout.astro получает `hreflang`-линки и `og:image` из нового статического ассета.
2. `@astrojs/sitemap` конфигурируется для i18n (генерирует `alternate`-блоки).
3. `robots.txt` получает `Disallow: /api/`.
4. Favicon-стек расширяется до `apple-touch-icon.png` + `site.webmanifest`.
5. `astro.config.mjs` фиксирует `output: 'server'` (явно, т.к. API route требует SSR).
6. `package.json` получает `engines.node`, удаляются `lenis` и `drizzle-kit` (если не нужны — но Drizzle решение было принято в Phase 2: keep → drizzle-kit остаётся).
7. CI workflow обновляется под Node 22.
8. Тяжёлые ассеты (`bg.png` 4.2 MB, `mountain.jpg` 1.8 MB, `case-1.png` 1.4 MB) пережимаются в ≤500 KB через squoosh-cli (или вручную) перед коммитом.
9. Lenis заменяется на нативный `scrollIntoView({ behavior: 'smooth' })`.
10. `tsconfig.json` `include` расширяется на корневые конфиг-файлы для LSP.

**Tech Stack:** Astro 5, `@astrojs/sitemap`, TypeScript, Node 22, squoosh-cli (ad-hoc).

**Covered audit findings:** #9 (hreflang), #10 (og:image + JSON-LD), #11 (Node version), #12 (robots.txt), #13 (explicit output mode), #14 (remaining devDeps), #20 (heavy assets), #27 (Lenis removal), #28 (tsconfig include), #29 (favicon stack).

**Prerequisites:** Phase 1–3 завершены (так как Landing-компонент и общий `Layout` уже экстрактнуты, метаданные удобно вносить централизованно).

---

### Task 1: Добавить og:image в public/ и в Layout

**Files:**
- Add asset: `public/og-image.png` (1200×630)
- Modify: `src/components/layout/Layout.astro`

- [ ] **Step 1: Создать/положить og-image.png**

Попросить пользователя предоставить `og-image.png` 1200×630 (бренд + tagline). Если нет — временно использовать `public/favicon.svg` или скриншот hero.

Если генерация через инструмент недоступна, временная заглушка: скопировать `src/assets/hero/bg.png` и сжать:

```bash
# При наличии squoosh-cli:
npx @squoosh/cli --resize '{"enabled":true,"width":1200,"height":630,"method":"catmullRom"}' \
  --webp '{"quality":85}' -d public src/assets/hero/bg.png
mv public/bg.webp public/og-image.webp
```

Либо пользователь кладёт PNG 1200×630 вручную в `public/og-image.png`.

Если в моменте билда нет ассета — не блокировать этот Task, задокументировать как TODO в комментарии. **Но**: предпочтительный вариант — положить реальный файл. Если пользователь передаёт его, `og:image` ссылается на `/og-image.png`.

- [ ] **Step 2: Обновить Layout.astro — пропсы**

Edit `src/components/layout/Layout.astro` — пропсы и head:

```astro
---
import '../../styles/tokens.css';
import '../../styles/global.css';
import GlowBackground from './GlowBackground.astro';
import { locales, type Locale } from '../../lib/paths';

interface Props {
  title: string;
  description?: string;
  lang?: Locale;
  ogImage?: string;
}

const { title, description = '', lang = 'en', ogImage = '/og-image.png' } = Astro.props;
const canonicalURL = new URL(Astro.url.pathname, Astro.site ?? 'https://afvs.studio');
const ogImageURL = new URL(ogImage, Astro.site ?? 'https://afvs.studio').href;

// Strip any existing locale prefix to build alternate links
const pathWithoutLocale = (() => {
  const p = Astro.url.pathname;
  for (const loc of locales) {
    if (loc === 'en') continue;
    if (p === `/${loc}` || p === `/${loc}/`) return '/';
    if (p.startsWith(`/${loc}/`)) return p.slice(loc.length + 1);
  }
  return p;
})();

function altHref(loc: Locale): string {
  if (loc === 'en') return new URL(pathWithoutLocale, Astro.site ?? 'https://afvs.studio').href;
  const base = pathWithoutLocale === '/' ? `/${loc}/` : `/${loc}${pathWithoutLocale}`;
  return new URL(base, Astro.site ?? 'https://afvs.studio').href;
}
---

<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="description" content={description} />
    <meta name="theme-color" content="#060b14" />
    <title>{title}</title>

    <link rel="canonical" href={canonicalURL.href} />

    {locales.map((loc) => (
      <link rel="alternate" hreflang={loc === 'uz' ? 'uz' : loc} href={altHref(loc)} />
    ))}
    <link rel="alternate" hreflang="x-default" href={altHref('en')} />

    <!-- Favicon stack -->
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
    <link rel="manifest" href="/site.webmanifest" />

    <!-- Open Graph -->
    <meta property="og:type" content="website" />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    <meta property="og:url" content={canonicalURL.href} />
    <meta property="og:locale" content={lang} />
    <meta property="og:image" content={ogImageURL} />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content={title} />
    <meta name="twitter:description" content={description} />
    <meta name="twitter:image" content={ogImageURL} />

    <!-- JSON-LD Organization -->
    <script type="application/ld+json" set:html={JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'AF Venture Studio',
      url: 'https://afvs.studio',
      logo: new URL('/favicon.svg', Astro.site ?? 'https://afvs.studio').href,
      sameAs: [
        'https://linkedin.com',
        'https://instagram.com',
        'https://t.me',
      ],
    })} />
  </head>
  <body>
    <GlowBackground />
    <slot />

    <script>
      import { initSmoothScroll } from '../../lib/smoothScroll';
      initSmoothScroll();
    </script>

    <script>
      // Reveal-on-scroll via Web Animations API.
      // Config via data-animate-direction (up|down|left|right), -distance, -delay, -duration.
      // Auto-stagger: ancestor with [data-animate-stagger="<ms>"] spaces children's delays.
      (() => {
        const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const targets = Array.from(
          document.querySelectorAll<HTMLElement>('[data-animate]'),
        );
        if (!targets.length) return;

        if (reduce) {
          targets.forEach((el) => el.classList.add('is-revealed'));
          return;
        }

        document.querySelectorAll<HTMLElement>('[data-animate-stagger]').forEach((parent) => {
          const step = Number(parent.dataset.animateStagger) || 0;
          if (!step) return;
          const base = Number(parent.dataset.animateStaggerBase) || 0;
          const kids = parent.querySelectorAll<HTMLElement>('[data-animate]');
          kids.forEach((kid, i) => {
            if (kid.dataset.animateDelay === undefined) {
              kid.dataset.animateDelay = String(base + i * step);
            }
          });
        });

        const INITIAL_STEP = 140;
        let initialIdx = 0;
        const vw = window.innerWidth;
        const vh = window.innerHeight;
        targets.forEach((el) => {
          if (el.dataset.animateDelay !== undefined) return;
          const r = el.getBoundingClientRect();
          const visible = r.top < vh && r.bottom > 0 && r.left < vw && r.right > 0;
          if (!visible) return;
          el.dataset.animateDelay = String(initialIdx * INITIAL_STEP);
          initialIdx += 1;
        });

        const reveal = (el: HTMLElement) => {
          if (el.dataset.animated === '1') return;
          el.dataset.animated = '1';

          const dir = el.dataset.animateDirection ?? 'up';
          const dist = el.dataset.animateDistance ?? '40px';
          const duration = Number(el.dataset.animateDuration) || 1000;
          const delay = Number(el.dataset.animateDelay) || 0;

          const tx = dir === 'left' ? dist : dir === 'right' ? `-${dist}` : '0';
          const ty = dir === 'up' ? dist : dir === 'down' ? `-${dist}` : '0';

          const anim = el.animate(
            [
              { opacity: 0, transform: `translate3d(${tx}, ${ty}, 0)` },
              { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            ],
            {
              duration,
              delay,
              easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
              fill: 'both',
            },
          );

          anim.addEventListener('finish', () => {
            el.classList.add('is-revealed');
            el.style.opacity = '1';
            el.style.transform = 'none';
            anim.cancel();
          });
        };

        const io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) {
              if (entry.isIntersecting) {
                reveal(entry.target as HTMLElement);
                io.unobserve(entry.target);
              }
            }
          },
          { rootMargin: '0px 0px -10% 0px', threshold: 0.12 },
        );

        targets.forEach((el) => io.observe(el));
      })();
    </script>
  </body>
</html>
```

**Важно:** два `<script>`-блока (smoothScroll init + reveal-on-scroll) скопированы из текущего `Layout.astro:47-147` без изменений. Убедиться, что никаких тонких правок мы не потеряли — при расхождении копировать дословно из текущего файла.

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 4: Build**

Run: `npm run build`
Expected: успех. В `dist/client/index.html` должны появиться `<link rel="alternate" hreflang>` и `<meta property="og:image">`.

- [ ] **Step 5: Commit**

```bash
git add src/components/layout/Layout.astro public/og-image.png 2>/dev/null || git add src/components/layout/Layout.astro
git commit -m "feat(seo): add hreflang alternates, og:image, JSON-LD Organization, extended favicon stack"
```

---

### Task 2: Настроить `@astrojs/sitemap` с i18n

**Files:**
- Modify: `astro.config.mjs`

- [ ] **Step 1: Передать i18n в sitemap()**

Edit `astro.config.mjs`:

```js
import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://afvs.studio',
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

- [ ] **Step 2: Build и проверка sitemap**

Run: `npm run build`
Проверить: `dist/client/sitemap-0.xml` содержит `<xhtml:link rel="alternate" hreflang="...">` для каждой локали.

Run: `cat dist/client/sitemap-0.xml | head -30`
Expected: видны `<url>` блоки с alternate-линками.

- [ ] **Step 3: Commit**

```bash
git add astro.config.mjs
git commit -m "feat(sitemap): enable i18n alternate links + explicit server output mode"
```

---

### Task 3: Обновить `robots.txt`

**Files:**
- Modify: `public/robots.txt`

- [ ] **Step 1: Переписать robots.txt**

Overwrite `public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /api/

Sitemap: https://afvs.studio/sitemap-index.xml
```

- [ ] **Step 2: Verify**

Run: `cat public/robots.txt`

- [ ] **Step 3: Commit**

```bash
git add public/robots.txt
git commit -m "chore(seo): disallow /api/ in robots.txt"
```

---

### Task 4: Дополнить favicon-стек

**Files:**
- Add asset: `public/apple-touch-icon.png` (180×180)
- Add asset: `public/site.webmanifest`

- [ ] **Step 1: Создать site.webmanifest**

Создать `public/site.webmanifest`:

```json
{
  "name": "AF Venture Studio",
  "short_name": "AFVS",
  "icons": [
    { "src": "/favicon.svg", "sizes": "any", "type": "image/svg+xml" },
    { "src": "/apple-touch-icon.png", "sizes": "180x180", "type": "image/png" }
  ],
  "theme_color": "#060b14",
  "background_color": "#060b14",
  "display": "standalone",
  "start_url": "/"
}
```

- [ ] **Step 2: apple-touch-icon.png**

Попросить пользователя положить `public/apple-touch-icon.png` 180×180.

Если генерация недоступна — временно скопировать favicon.svg в PNG (через что угодно доступное) или пометить как TODO и закоммитить site.webmanifest отдельно.

- [ ] **Step 3: Build проверка**

Run: `npm run build`
Expected: успех. Layout уже ссылается на эти файлы (Task 1) — 404 на апл-иконку некритичен, но лучше положить.

- [ ] **Step 4: Commit**

```bash
git add public/site.webmanifest public/apple-touch-icon.png 2>/dev/null || git add public/site.webmanifest
git commit -m "feat(favicon): add site.webmanifest + apple-touch-icon placeholder"
```

---

### Task 5: Зафиксировать Node версию

**Files:**
- Modify: `package.json`
- Modify: `.github/workflows/deploy.yml`

- [ ] **Step 1: Добавить engines в package.json**

Edit `package.json` — после поля `"private": true` добавить:

```json
"engines": {
  "node": ">=22 <23"
},
```

- [ ] **Step 2: Обновить Node в CI**

Edit `.github/workflows/deploy.yml` — заменить:
```yaml
node-version: 20
```
на
```yaml
node-version: 22
```

- [ ] **Step 3: Commit**

```bash
git add package.json .github/workflows/deploy.yml
git commit -m "chore(node): pin Node 22 for engines + CI"
```

---

### Task 6: Удалить Lenis и перейти на нативный smooth scroll

**Files:**
- Modify: `src/lib/smoothScroll.ts`
- Modify: `src/components/layout/Layout.astro`
- Modify: `package.json`

- [ ] **Step 1: Переписать smoothScroll.ts под нативный API**

Overwrite `src/lib/smoothScroll.ts`:

```ts
// Native smooth-scroll: `html { scroll-behavior: smooth }` + programmatic scrollIntoView.
// Respects prefers-reduced-motion.

export function initSmoothScroll(): void {
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('click', (event) => {
    const anchor = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href^="#"]');
    if (!anchor) return;

    const hash = anchor.getAttribute('href');
    if (!hash || hash === '#') return;

    const target = document.querySelector(hash);
    if (!target) return;

    event.preventDefault();
    (target as HTMLElement).scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
    history.pushState(null, '', hash);
  });

  if (location.hash) {
    const target = document.querySelector(location.hash);
    if (target) {
      (target as HTMLElement).scrollIntoView({ behavior: 'auto', block: 'start' });
    }
  }
}
```

- [ ] **Step 2: Добавить scroll-behavior в global.css**

Edit `src/styles/global.css` — в блок `html { ... }` добавить:

```css
  scroll-behavior: smooth;
```

И ниже (после block `html`):
```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```

- [ ] **Step 3: Удалить пакет lenis**

Run: `npm uninstall lenis`

- [ ] **Step 4: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, успех.

- [ ] **Step 5: Dev smoke — проверить клик по nav-ссылкам**

Run: `npm run dev`, кликнуть на «Services» в хедере — убедиться, что skcroll плавный.

- [ ] **Step 6: Commit**

```bash
git add src/lib/smoothScroll.ts src/styles/global.css package.json package-lock.json
git commit -m "refactor(scroll): drop lenis, use native scrollIntoView + CSS scroll-behavior"
```

---

### Task 7: Сжать тяжёлые ассеты

Цель: `bg.png` 4.2 MB → ≤500 KB, `mountain.jpg` 1.8 MB → ≤400 KB, `case-1.png` 1.4 MB → ≤400 KB. Astro сам генерирует webp-варианты на билде, но исходник тоже нужно ужать.

**Files:**
- Modify: `src/assets/hero/bg.png`
- Modify: `src/assets/brif/mountain.jpg`
- Modify: `src/assets/cases/case-1.png`

- [ ] **Step 1: Установить squoosh-cli временно или использовать sharp**

Вариант A (через npx, без установки):
```bash
# Для bg.png (PNG-фото → WebP или сильный MozJPEG):
# Сначала резайз до max-ширины 1920 + конвертация в JPG с qualityq=80
npx @squoosh/cli --mozjpeg '{"quality":80}' --resize '{"enabled":true,"width":1920,"method":"catmullRom"}' -d /tmp/optimized src/assets/hero/bg.png
```

Если `@squoosh/cli` недоступен (архивирован), использовать `sharp-cli`:
```bash
npx sharp-cli -i src/assets/hero/bg.png -o /tmp/bg.jpg --width 1920 --format jpeg --quality 80
```

**Если оба инструмента недоступны** — попросить пользователя пережать вручную через squoosh.app и положить файлы обратно.

- [ ] **Step 2: bg.png → bg.jpg (или bg.webp)**

PNG для фото горы не оправдан. Пережать в JPEG:

```bash
# После успешной компрессии — заменить исходник:
# (пример, путь /tmp/bg.jpg после Step 1)
ls -lh /tmp/bg.jpg  # убедиться, что <500 KB
mv /tmp/bg.jpg src/assets/hero/bg.jpg
rm src/assets/hero/bg.png
```

И обновить импорт в `src/components/hero/Hero.astro`:

```ts
import bgImg from '../../assets/hero/bg.jpg';
```

- [ ] **Step 3: mountain.jpg — ресайз + перекодирование**

```bash
npx @squoosh/cli --mozjpeg '{"quality":78}' --resize '{"enabled":true,"width":1200,"method":"catmullRom"}' -d /tmp/optimized src/assets/brif/mountain.jpg
mv /tmp/optimized/mountain.jpg src/assets/brif/mountain.jpg
ls -lh src/assets/brif/mountain.jpg  # <400 KB ожидается
```

- [ ] **Step 4: case-1.png → case-1.jpg**

```bash
npx @squoosh/cli --mozjpeg '{"quality":80}' --resize '{"enabled":true,"width":1280,"method":"catmullRom"}' -d /tmp/optimized src/assets/cases/case-1.png
mv /tmp/optimized/case-1.jpg src/assets/cases/case-1.jpg
rm src/assets/cases/case-1.png
```

Обновить импорт в `src/components/cases/Cases.astro`:
```ts
import case1 from '../../assets/cases/case-1.jpg';
```

- [ ] **Step 5: Build + визуал**

Run: `npm run build && npm run dev`, открыть страницу — убедиться, что изображения выглядят без артефактов.

- [ ] **Step 6: Commit**

```bash
git add src/assets src/components/hero/Hero.astro src/components/cases/Cases.astro
git commit -m "perf(assets): compress bg/mountain/case-1 (saves ~6 MB in repo)"
```

---

### Task 8: Расширить `tsconfig.json` include

**Files:**
- Modify: `tsconfig.json`

- [ ] **Step 1: Добавить корневые конфиги в include**

Edit `tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "compilerOptions": {
    "strictNullChecks": true,
    "allowJs": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true
  },
  "include": [
    "src/**/*",
    ".astro/types.d.ts",
    "astro.config.mjs",
    "drizzle.config.ts"
  ],
  "exclude": ["dist", "node_modules"]
}
```

Комментарий: `allowJs: true` разрешает проверку `.mjs` конфига; не обязательно, но улучшает LSP.

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add tsconfig.json
git commit -m "chore(ts): include root configs for LSP coverage"
```

---

### Task 9: Финальная проверка фазы

- [ ] **Step 1: Build + typecheck**

Run: `npm run check && npm run build`
Expected: `0 errors, 0 warnings`, успешный build.

- [ ] **Step 2: Проверить финальные HTML-артефакты**

Run:
```bash
grep -c "hreflang" dist/client/index.html
grep -c "og:image" dist/client/index.html
grep -c "application/ld+json" dist/client/index.html
```
Expected: все три > 0.

- [ ] **Step 3: Проверить sitemap**

Run: `ls dist/client/sitemap-*.xml`
Expected: оба файла (index + sitemap-0) присутствуют.

- [ ] **Step 4: Убедиться, что размер build не вырос**

Run: `du -sh dist/`
Ожидаемо: меньше, чем до Phase 4 (благодаря Task 7).

---

## Coverage check

| Audit # | Task | Status |
|---------|------|--------|
| #9 (hreflang) | Tasks 1, 2 | ✅ |
| #10 (og:image + JSON-LD) | Task 1 | ✅ |
| #11 (Node version) | Task 5 | ✅ |
| #12 (robots.txt) | Task 3 | ✅ |
| #13 (explicit output mode) | Task 2 | ✅ |
| #14 rest (drizzle-kit / lenis) | Task 6 | ✅ (drizzle-kit сохранён по решению Phase 2) |
| #20 (heavy assets) | Task 7 | ✅ |
| #27 (Lenis removal) | Task 6 | ✅ |
| #28 (tsconfig include) | Task 8 | ✅ |
| #29 (favicon stack) | Tasks 1, 4 | ✅ |
