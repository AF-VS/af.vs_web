# Phase 3: Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Имплементировать Hero-секцию: большой заголовок (`Space Grotesk 62px`, слова `product` и `growth` подсвечены `--primary-accent`), CTA-кнопка `Get started`, фон-гора с маской (нижняя часть «вытекает» из контейнера).

**Depends on:** [`phase-02-chrome.md`](./phase-02-chrome.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Figma nodes:**
- Hero: `285:1100`

**Architecture:** `Button` — переиспользуемый primary-variant (используется также в ContactForm). `Hero` — scoped стили внутри `.astro`. Подсветка слов `product`/`growth` реализуется через `<span class="accent">` в разметке (не через regex или innerHTML). Hero-mountain качается в `src/assets/hero/` и подключается через `astro:assets` (`<Image>`) для оптимизации.

**Tech Stack:** Astro, `astro:assets`.

---

## File Structure

- Create: `src/components/ui/Button.astro` — универсальная кнопка-ссылка с variant `primary`
- Create: `src/assets/hero/mountain.png` (или `.webp`) — качается из Figma
- Create: `src/components/hero/Hero.astro`
- Modify: `src/pages/index.astro` — добавить `<Hero>`
- Modify: `src/pages/ru/index.astro` — добавить `<Hero>`
- Modify: `src/i18n/en.ts` — добавить `heroAccents: ['product', 'growth']` если заголовок нужно рендерить программно; в нашем случае — оставить как есть, мы разметим вручную в компоненте

## Tasks

### Task 3.1: Инвокнуть `ui-ux-pro-max` для Hero + Button

- [ ] **Step 1: Получить гайдлайны**

Инвокни `ui-ux-pro-max:ui-ux-pro-max` с контекстом: «hero section with large display heading (62px Space Grotesk), primary CTA button (pill 256×56), against a dark navy background with a mountain image anchored to the bottom». Забери рекомендации по:
- CTA button: hover (lift / brightness), active (pressed), focus-visible, disabled
- button минимальная tap-зона ≥ 48×48 (у нас 256×56 — ok)
- typography rhythm между заголовком и кнопкой
- контраст `--primary-default` на `--surface-white` ≥ 4.5:1 (проверить: `#158ef2` на `#f8f9fe` = 3.1:1 — **не соответствует AA!**)
- если контраст не AA — решение: либо сделать текст кнопки `--surface-bg` (dark navy) на белой заливке, либо затемнить `--primary-default`. Зафиксируй решение и примени.

### Task 3.2: Получить дизайн из Figma и скачать гору

- [ ] **Step 1: get_design_context**

Run (MCP): `get_design_context(nodeId="285:1100", fileKey="L3skuk3D54hgX93qX7EIjd")`
Expected: React+Tailwind референс + ссылка на asset mountain (`figma.com/api/mcp/asset/...`).

- [ ] **Step 2: Скачать ассет**

Если возвращён URL картинки — скачай в `src/assets/hero/mountain.png` (или `.webp`, зависит от формата в Figma). Если URL недоступен — используй `get_screenshot(285:1100)` и скачай вручную из Figma Web UI в тот же путь.

- [ ] **Step 3: get_screenshot для сравнения**

Run (MCP): `get_screenshot(nodeId="285:1100", fileKey="L3skuk3D54hgX93qX7EIjd")`
Сохрани (ментально) референс — понадобится в Task 3.6.

### Task 3.3: Создать `src/components/ui/Button.astro`

**Files:**
- Create: `src/components/ui/Button.astro`

- [ ] **Step 1: Написать файл**

```astro
---
interface Props {
  href?: string;
  type?: 'button' | 'submit';
  variant?: 'primary';
  class?: string;
}

const { href, type = 'button', variant = 'primary', class: className = '' } = Astro.props;
const Tag = href ? 'a' : 'button';
const tagProps = href ? { href } : { type };
---

<Tag class:list={['btn', `btn--${variant}`, className]} {...tagProps}>
  <slot />
</Tag>

<style>
  .btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    min-width: var(--cta-width);
    height: var(--cta-height);
    padding-inline: 32px;
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: var(--font-size-body);
    font-weight: 600;
    line-height: var(--line-height-body);
    text-decoration: none;
    cursor: pointer;
    transition: transform 0.15s ease, background-color 0.15s ease, box-shadow 0.15s ease;
  }

  .btn--primary {
    background-color: var(--surface-white);
    color: var(--surface-bg); /* dark on light — достаточный контраст */
  }

  .btn--primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(21, 142, 242, 0.25);
  }

  .btn--primary:active {
    transform: translateY(0);
  }
</style>
```

**Note:** Если `ui-ux-pro-max` в Task 3.1 подтвердил, что `--primary-default` на `--surface-white` OK — замени `color: var(--surface-bg)` на `color: var(--primary-default)`. В спеке это допустимый вариант, но only if contrast passes.

### Task 3.4: Создать `src/components/hero/Hero.astro`

**Files:**
- Create: `src/components/hero/Hero.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import { Image } from 'astro:assets';
import type { Dict } from '../../i18n/en';
import Button from '../ui/Button.astro';
import mountain from '../../assets/hero/mountain.png';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;

// Accent words: renderable as structured children instead of regex.
// EN title: "From idea to product, from product to growth"
// Для ru используем простой рендер без акцентов (пока плейсхолдер).
const isEnglishTitle = dict.hero.title === 'From idea to product, from product to growth';
---

<section class="hero">
  <div class="container hero__inner">
    <h1 class="hero__title">
      {isEnglishTitle ? (
        <>From idea to <span class="accent">product</span>, from product to <span class="accent">growth</span></>
      ) : (
        dict.hero.title
      )}
    </h1>
    <div class="hero__cta">
      <Button href="#contact">{dict.hero.cta}</Button>
    </div>
  </div>

  <Image
    src={mountain}
    alt=""
    class="hero__mountain"
    loading="eager"
    widths={[768, 1248, 1920]}
    sizes="100vw"
  />
</section>

<style>
  .hero {
    position: relative;
    padding-top: 64px;
    padding-bottom: 0;
    overflow: hidden;
  }

  .hero__inner {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: 48px;
    padding-bottom: 200px;
  }

  .hero__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(40px, 6vw, var(--font-size-h1));
    line-height: var(--line-height-h1);
    letter-spacing: var(--letter-spacing-h1);
    color: var(--text-primary);
    max-width: 20ch;
  }

  .accent { color: var(--primary-accent); }

  .hero__cta { margin-top: 8px; }

  .hero__mountain {
    position: absolute;
    bottom: -60px;
    left: 50%;
    transform: translateX(-50%);
    width: 120%;
    max-width: none;
    height: auto;
    z-index: 1;
    pointer-events: none;
    user-select: none;
    -webkit-mask-image: linear-gradient(to bottom, #000 85%, transparent 100%);
            mask-image: linear-gradient(to bottom, #000 85%, transparent 100%);
  }

  @media (min-width: 1248px) {
    .hero { padding-top: 96px; }
    .hero__inner { padding-bottom: 280px; }
  }
</style>
```

**Note:** Если разметка заголовка должна быть одинаковой для `ru` — когда в Фазе 7 добавишь русский перевод с акцентами, вынеси акцентные слова в `en.ts`/`ru.ts` как массив токенов (`[{text, accent}]`). Пока `isEnglishTitle`-проверка достаточна.

### Task 3.5: Подключить Hero к страницам

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`

- [ ] **Step 1: Добавить `<Hero>` в `src/pages/index.astro`**

```astro
---
import Layout from '../components/layout/Layout.astro';
import Header from '../components/chrome/Header.astro';
import Hero from '../components/hero/Hero.astro';
import Footer from '../components/chrome/Footer.astro';
import { en } from '../i18n/en';
---

<Layout title="AF Venture Studio" description={en.hero.title} lang="en">
  <Header dict={en} locale="en" />
  <main>
    <Hero dict={en} />
  </main>
  <Footer dict={en} />
</Layout>
```

- [ ] **Step 2: Добавить `<Hero>` в `src/pages/ru/index.astro`**

```astro
---
import Layout from '../../components/layout/Layout.astro';
import Header from '../../components/chrome/Header.astro';
import Hero from '../../components/hero/Hero.astro';
import Footer from '../../components/chrome/Footer.astro';
import { ru } from '../../i18n/ru';
---

<Layout title="AF Venture Studio" description={ru.hero.title} lang="ru">
  <Header dict={ru} locale="ru" />
  <main>
    <Hero dict={ru} />
  </main>
  <Footer dict={ru} />
</Layout>
```

### Task 3.6: Проверка сборки и визуал

- [ ] **Step 1: Type-check + build**

Run: `npx astro check && npm run build`
Expected: 0 errors, без warnings, `dist/` собран.

- [ ] **Step 2: Dev-сервер**

Run: `npm run dev`
- `/`: виден заголовок с акцентами на `product` и `growth`, CTA `Get started`, гора снизу, маска сглаживает низ.
- `/ru/`: заголовок `TBD RU` без акцентов (ожидаемо).

- [ ] **Step 3: Figma-паритет**

Run (MCP): `get_screenshot(nodeId="285:1100", fileKey="L3skuk3D54hgX93qX7EIjd")`
Сравни локаль `en` на 1440×800. Паритет ≥ 95% — если нет, подкрути padding/font-size/позицию горы и повтори.

### Task 3.7: Коммит Фазы 3

- [ ] **Step 1: Stage и commit**

```bash
git add src/components/ui/Button.astro \
        src/components/hero/Hero.astro \
        src/assets/hero/ \
        src/pages/index.astro src/pages/ru/index.astro
git commit -m "feat(phase-3): hero — title with accents, primary button, mountain image"
```

## Acceptance (run before marking phase complete)

- [ ] `npx astro check` — 0 errors
- [ ] `npm run build` — без warnings
- [ ] Hero виден на `/`, гора на фоне, CTA кликабельна и ведёт на `#contact`
- [ ] `/ru/` показывает плейсхолдерный заголовок без падений
- [ ] Button hover/focus визуально сработали (ручная проверка мышью и Tab)
- [ ] Figma-паритет ≥ 95% с `get_screenshot(285:1100)`
- [ ] Grep hex вне `tokens.css` = 0 (исключение: mask-image linear-gradient может содержать `#000` — это не токен-цвет, а маска, можно оставить)
- [ ] Коммит Фазы 3 создан

## Next

→ [`phase-04-services.md`](./phase-04-services.md)
