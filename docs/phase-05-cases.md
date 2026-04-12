# Phase 5: Cases Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать секцию Cases — заголовок «Our latest work», горизонтальная карусель из 3 карточек (472×512 на desktop) с кнопками ←/→. Карусель — scroll-snap + минимум JS (только обработчики стрелок).

**Depends on:** [`phase-04-services.md`](./phase-04-services.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Figma nodes:**
- Cases section: `285:1009`

**Architecture:** `CaseCard` — dark card с изображением на 100% ширины + заголовок/описание снизу. `CasesCarousel` — flex-контейнер с `overflow-x: auto`, `scroll-snap-type: x mandatory`, CSS-скрытый скроллбар. Стрелки — `<button>` элементы с `client:load`? Нет — обычный `<script>`-блок в `.astro` с `scrollBy()`. Никаких фреймворков.

**Tech Stack:** Astro, vanilla DOM, `astro:assets`.

---

## File Structure

- Create: `src/components/cases/CaseCard.astro`
- Create: `src/components/cases/CasesCarousel.astro`
- Create: `src/components/cases/Cases.astro`
- Create: `src/assets/cases/case-1.png`, `case-2.png`, `case-3.png`
- Create: `src/i18n/en.ts` — добавить `cases.items: [{title, tagline, image}...]`
- Modify: `src/i18n/ru.ts` — добавить те же ключи с плейсхолдерами
- Modify: `src/pages/index.astro` — добавить `<Cases>`
- Modify: `src/pages/ru/index.astro` — добавить `<Cases>`

## Tasks

### Task 5.1: Инвокнуть `ui-ux-pro-max` для Carousel

- [ ] **Step 1: Получить гайдлайны**

Инвокни `ui-ux-pro-max:ui-ux-pro-max` с контекстом: «horizontal carousel of 3 case cards (472×512 on desktop), with prev/next buttons, on a dark background. Needs to be keyboard-accessible and support touch-swipe on mobile». Забери рекомендации по:
- a11y: `role="region"`, `aria-label`, `aria-live="polite"` для smooth updates
- disabled state стрелок когда достигнут край
- focus-visible на стрелках и карточках
- keyboard navigation (стрелки ←/→ на клавиатуре должны скроллить)
- touch targets стрелок ≥ 48×48 (у нас 56×56 — ok)

### Task 5.2: Получить дизайн и скачать картинки

- [ ] **Step 1: get_design_context**

Run (MCP): `get_design_context(nodeId="285:1009", fileKey="L3skuk3D54hgX93qX7EIjd")`

- [ ] **Step 2: Скачать 3 картинки кейсов**

В `src/assets/cases/case-1.png`, `case-2.png`, `case-3.png`.

- [ ] **Step 3: get_screenshot**

Run (MCP): `get_screenshot(nodeId="285:1009", fileKey="L3skuk3D54hgX93qX7EIjd")`

### Task 5.3: Добавить `cases.items` в словари

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ru.ts`

- [ ] **Step 1: В `en.ts` изменить объект `cases`**

```ts
cases: {
  title: 'Our latest work',
  items: [
    { title: 'Case One',   tagline: 'Short description of the first case.' },
    { title: 'Case Two',   tagline: 'Short description of the second case.' },
    { title: 'Case Three', tagline: 'Short description of the third case.' },
  ],
},
```

**Note:** если в Figma конкретные названия кейсов известны — заменить «Case One/Two/Three» на реальные. Если нет — оставить как placeholder, отметить в Фазе 7 как уточнение контента.

- [ ] **Step 2: В `ru.ts` добавить те же ключи**

```ts
cases: {
  title: 'TBD RU',
  items: [
    { title: 'TBD RU', tagline: 'TBD RU' },
    { title: 'TBD RU', tagline: 'TBD RU' },
    { title: 'TBD RU', tagline: 'TBD RU' },
  ],
},
```

- [ ] **Step 3: Проверить типы**

Run: `npx astro check`
Expected: 0 errors. Если упало — значит `Dict`-тип не включает `items`, и `ru.ts` как `Dict` ругается. Поскольку `ru: Dict = ...`, добавление поля в `en` обновит тип автоматически.

### Task 5.4: Создать `src/components/cases/CaseCard.astro`

**Files:**
- Create: `src/components/cases/CaseCard.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import { Image, type ImageMetadata } from 'astro:assets';

interface Props {
  title: string;
  tagline: string;
  image: ImageMetadata;
}

const { title, tagline, image } = Astro.props;
---

<article class="case">
  <Image src={image} alt="" class="case__image" widths={[320, 472, 640]} sizes="(min-width: 1248px) 472px, 80vw" />
  <div class="case__body">
    <h3 class="case__title">{title}</h3>
    <p class="case__tagline">{tagline}</p>
  </div>
</article>

<style>
  .case {
    flex: 0 0 auto;
    width: 80vw;
    max-width: 472px;
    height: 512px;
    border-radius: var(--radius-card);
    overflow: hidden;
    background-color: var(--surface-card);
    border: var(--card-border-width) solid var(--border-card);
    display: flex;
    flex-direction: column;
    scroll-snap-align: start;
  }

  .case__image {
    width: 100%;
    height: 60%;
    object-fit: cover;
  }

  .case__body {
    padding: var(--card-padding);
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .case__title {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: var(--font-size-h4);
    line-height: var(--line-height-h4);
    letter-spacing: var(--letter-spacing-h4);
    color: var(--text-primary);
  }

  .case__tagline { color: var(--text-subtle); }
</style>
```

### Task 5.5: Создать `src/components/cases/CasesCarousel.astro`

**Files:**
- Create: `src/components/cases/CasesCarousel.astro`

- [ ] **Step 1: Написать файл**

```astro
---
// Минимум JS: только клики по стрелкам → scrollBy.
---

<div class="carousel" role="region" aria-label="Cases carousel">
  <div class="carousel__track" data-track>
    <slot />
  </div>

  <div class="carousel__controls" aria-hidden="false">
    <button type="button" class="arrow" data-dir="prev" aria-label="Previous case">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
    <button type="button" class="arrow" data-dir="next" aria-label="Next case">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M9 6l6 6-6 6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
    </button>
  </div>
</div>

<style>
  .carousel { position: relative; }

  .carousel__track {
    display: flex;
    gap: 24px;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    padding-block: 8px;
  }

  .carousel__track::-webkit-scrollbar { display: none; }

  .carousel__controls {
    display: flex;
    gap: 16px;
    margin-top: 32px;
    justify-content: flex-end;
  }

  .arrow {
    width: 56px;
    height: 56px;
    border-radius: var(--radius-pill);
    border: 1px solid var(--text-secondary);
    color: var(--text-primary);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.15s ease, border-color 0.15s ease, opacity 0.15s ease;
  }

  .arrow:hover {
    border-color: var(--text-primary);
    background-color: rgba(255, 255, 255, 0.04);
  }

  .arrow[disabled] {
    opacity: 0.4;
    cursor: not-allowed;
  }
</style>

<script>
  function initCarousels() {
    const carousels = document.querySelectorAll<HTMLElement>('.carousel');
    carousels.forEach((carousel) => {
      const track = carousel.querySelector<HTMLElement>('[data-track]');
      if (!track) return;
      const prev = carousel.querySelector<HTMLButtonElement>('[data-dir="prev"]');
      const next = carousel.querySelector<HTMLButtonElement>('[data-dir="next"]');
      if (!prev || !next) return;

      const step = () => {
        const firstCard = track.firstElementChild as HTMLElement | null;
        if (!firstCard) return 480;
        return firstCard.offsetWidth + 24; // card + gap
      };

      const updateDisabled = () => {
        const maxScroll = track.scrollWidth - track.clientWidth;
        prev.toggleAttribute('disabled', track.scrollLeft <= 0);
        next.toggleAttribute('disabled', track.scrollLeft >= maxScroll - 1);
      };

      prev.addEventListener('click', () => track.scrollBy({ left: -step(), behavior: 'smooth' }));
      next.addEventListener('click', () => track.scrollBy({ left:  step(), behavior: 'smooth' }));
      track.addEventListener('scroll', updateDisabled, { passive: true });
      updateDisabled();
    });
  }

  document.addEventListener('astro:page-load', initCarousels);
  initCarousels();
</script>
```

### Task 5.6: Создать `src/components/cases/Cases.astro`

**Files:**
- Create: `src/components/cases/Cases.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import type { Dict } from '../../i18n/en';
import CaseCard      from './CaseCard.astro';
import CasesCarousel from './CasesCarousel.astro';
import case1 from '../../assets/cases/case-1.png';
import case2 from '../../assets/cases/case-2.png';
import case3 from '../../assets/cases/case-3.png';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;
const images = [case1, case2, case3];
---

<section id="cases" class="cases">
  <div class="container">
    <h2 class="cases__title">{dict.cases.title}</h2>
    <CasesCarousel>
      {dict.cases.items.map((item, i) => (
        <CaseCard title={item.title} tagline={item.tagline} image={images[i]} />
      ))}
    </CasesCarousel>
  </div>
</section>

<style>
  .cases {
    padding-block: 96px;
  }

  .cases__title {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: var(--font-size-h4);
    line-height: var(--line-height-h4);
    letter-spacing: var(--letter-spacing-h4);
    color: var(--text-primary);
    margin-bottom: 48px;
  }
</style>
```

### Task 5.7: Подключить Cases к страницам

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`

- [ ] **Step 1: Импорт + компонент в `index.astro` после `<Services>`**

```astro
import Cases from '../components/cases/Cases.astro';
// ...
<Services dict={en} />
<Cases dict={en} />
```

- [ ] **Step 2: Аналогично в `ru/index.astro`**

### Task 5.8: Проверка сборки и визуала

- [ ] **Step 1: Type-check + build**

Run: `npx astro check && npm run build`
Expected: 0 errors.

- [ ] **Step 2: Dev-сервер**

Run: `npm run dev`
- `/`: видна секция Cases с заголовком, 3 карточки, стрелки справа.
- Клик по `→` — карусель скроллит на одну карточку.
- По достижении края `→` становится disabled (приглушённая).
- Touch-swipe работает на мобилке (DevTools touch emulation).

- [ ] **Step 3: Figma-паритет**

Run (MCP): `get_screenshot(nodeId="285:1009", fileKey="L3skuk3D54hgX93qX7EIjd")`
Паритет ≥ 95% на 1440.

### Task 5.9: Коммит Фазы 5

- [ ] **Step 1: Stage и commit**

```bash
git add src/components/cases/ \
        src/assets/cases/ \
        src/i18n/en.ts src/i18n/ru.ts \
        src/pages/index.astro src/pages/ru/index.astro
git commit -m "feat(phase-5): cases — carousel with 3 cards, scroll-snap, arrow controls"
```

## Acceptance (run before marking phase complete)

- [ ] `npx astro check` — 0 errors
- [ ] `npm run build` — без warnings
- [ ] 3 кейса видны на `/`
- [ ] Стрелки работают, disabled-состояние на границах
- [ ] Touch-swipe работает (ручная проверка в DevTools)
- [ ] Figma-паритет ≥ 95% с `get_screenshot(285:1009)`
- [ ] Grep hex вне `tokens.css` = 0
- [ ] Коммит Фазы 5 создан

## Next

→ [`phase-06-form.md`](./phase-06-form.md)
