# Phase 4: Services Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Имплементировать секцию Services — 4 dark-карточки (Build, AI, Advisory, Growth) с заголовком h4, описанием, списком `Chip`-тегов и image-accessory с blend-mode.

**Depends on:** [`phase-03-hero.md`](./phase-03-hero.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Figma nodes:**
- Services section: `285:949`

**Architecture:** `Chip` — маленький reusable компонент (pill + caption). `ServiceCard` — принимает `title`, `description`, `tags`, `image`. `Services` — секция, импортирует 4 картинки и мапит словарь `en.services`. Картинки приходят через `astro:assets` (`Image`), применяется `mix-blend-mode` CSS-свойство.

**Tech Stack:** Astro, `astro:assets`.

---

## File Structure

- Create: `src/components/services/Chip.astro`
- Create: `src/components/services/ServiceCard.astro`
- Create: `src/components/services/Services.astro`
- Create: `src/assets/services/build.png` (и 3 аналогичные: `ai.png`, `advisory.png`, `growth.png`)
- Modify: `src/pages/index.astro` — добавить `<Services>`
- Modify: `src/pages/ru/index.astro` — добавить `<Services>`

## Tasks

### Task 4.1: Инвокнуть `ui-ux-pro-max` для Services

- [ ] **Step 1: Получить гайдлайны**

Инвокни `ui-ux-pro-max:ui-ux-pro-max` с контекстом: «4 service cards on a dark navy background, each with a title (h4 32px Inter), description, chip tag list, and a blend-mode image accessory. Cards have 2px borders, 32px radius, 24px padding». Забери рекомендации по:
- hover/focus состояниям карточки (если карточка интерактивна — считать ли её button/link)
- контрасту границы карточки vs фона
- line-height и margin между элементами карточки
- layout (grid на desktop vs stack на mobile)
- keyboard navigation (если карточка ссылка — focus-visible)

### Task 4.2: Получить дизайн и скачать картинки

- [ ] **Step 1: get_design_context**

Run (MCP): `get_design_context(nodeId="285:949", fileKey="L3skuk3D54hgX93qX7EIjd")`
Expected: React+Tailwind референс + 4 asset URLs (по одному на карточку).

- [ ] **Step 2: Скачать 4 картинки**

Для каждой карточки — скачай asset в `src/assets/services/<slug>.png`:
- Build → `src/assets/services/build.png`
- AI → `src/assets/services/ai.png` (в Figma повернут `rotate(-170.43deg)` — оригинал без поворота, поворот делаем CSS-ом)
- Advisory → `src/assets/services/advisory.png`
- Growth → `src/assets/services/growth.png`

Если Figma URL не работает — используй `get_screenshot` на каждом child-node карточки и сохрани картинки вручную.

- [ ] **Step 3: get_screenshot секции**

Run (MCP): `get_screenshot(nodeId="285:949", fileKey="L3skuk3D54hgX93qX7EIjd")`

### Task 4.3: Создать `src/components/services/Chip.astro`

**Files:**
- Create: `src/components/services/Chip.astro`

- [ ] **Step 1: Написать файл**

```astro
---
interface Props {
  label: string;
}
const { label } = Astro.props;
---

<span class="chip">{label}</span>

<style>
  .chip {
    display: inline-flex;
    align-items: center;
    padding: 4px 16px;
    border: 1px solid var(--text-secondary);
    border-radius: var(--radius-pill);
    font-family: var(--font-body);
    font-size: var(--font-size-caption);
    font-weight: 500;
    line-height: var(--line-height-caption);
    color: var(--text-subtle);
    white-space: nowrap;
  }
</style>
```

### Task 4.4: Создать `src/components/services/ServiceCard.astro`

**Files:**
- Create: `src/components/services/ServiceCard.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import { Image, type ImageMetadata } from 'astro:assets';
import Chip from './Chip.astro';

interface Props {
  title: string;
  description: string;
  tags: ReadonlyArray<string>;
  image: ImageMetadata;
  imageBlend?: 'lighten' | 'screen';
  imageRotate?: number; // degrees
}

const { title, description, tags, image, imageBlend = 'lighten', imageRotate = 0 } = Astro.props;
const style = `--blend:${imageBlend === 'lighten' ? 'lighten' : 'screen'};--rot:${imageRotate}deg;--opacity:${imageBlend === 'lighten' ? 0.6 : 0.8};`;
---

<article class="card" style={style}>
  <Image src={image} alt="" class="card__image" widths={[320, 480, 640]} sizes="(min-width: 768px) 320px, 100vw" />

  <div class="card__body">
    <h3 class="card__title">{title}</h3>
    <p class="card__desc">{description}</p>
    <ul class="card__tags">
      {tags.map((tag) => <li><Chip label={tag} /></li>)}
    </ul>
  </div>
</article>

<style>
  .card {
    position: relative;
    background-color: var(--surface-card);
    border: var(--card-border-width) solid var(--border-card);
    border-radius: var(--radius-card);
    padding: var(--card-padding);
    overflow: hidden;
    display: flex;
    flex-direction: column;
    gap: 16px;
    min-height: 320px;
  }

  .card__image {
    position: absolute;
    inset: auto 0 0 0;
    width: 100%;
    height: auto;
    mix-blend-mode: var(--blend);
    opacity: var(--opacity);
    transform: rotate(var(--rot));
    pointer-events: none;
    z-index: 0;
  }

  .card__body {
    position: relative;
    z-index: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .card__title {
    font-family: var(--font-body);
    font-weight: 600;
    font-size: var(--font-size-h4);
    line-height: var(--line-height-h4);
    letter-spacing: var(--letter-spacing-h4);
    color: var(--text-primary);
  }

  .card__desc {
    color: var(--text-subtle);
    max-width: 30ch;
  }

  .card__tags {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    list-style: none;
    margin-top: auto;
  }
</style>
```

### Task 4.5: Создать `src/components/services/Services.astro`

**Files:**
- Create: `src/components/services/Services.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import type { Dict } from '../../i18n/en';
import ServiceCard from './ServiceCard.astro';
import buildImg    from '../../assets/services/build.png';
import aiImg       from '../../assets/services/ai.png';
import advisoryImg from '../../assets/services/advisory.png';
import growthImg   from '../../assets/services/growth.png';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;
const s = dict.services;
---

<section id="services" class="services">
  <div class="container">
    <div class="services__grid">
      <ServiceCard title={s.build.title}    description={s.build.description}    tags={s.build.tags}    image={buildImg}    imageBlend="lighten" />
      <ServiceCard title={s.ai.title}       description={s.ai.description}       tags={s.ai.tags}       image={aiImg}       imageBlend="screen"  imageRotate={-170.43} />
      <ServiceCard title={s.advisory.title} description={s.advisory.description} tags={s.advisory.tags} image={advisoryImg} imageBlend="lighten" />
      <ServiceCard title={s.growth.title}   description={s.growth.description}   tags={s.growth.tags}   image={growthImg}   imageBlend="screen"  />
    </div>
  </div>
</section>

<style>
  .services {
    padding-block: 96px;
  }

  .services__grid {
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr;
  }

  @media (min-width: 768px) {
    .services__grid {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  @media (min-width: 1248px) {
    .services__grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }
</style>
```

### Task 4.6: Подключить Services к страницам

**Files:**
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`

- [ ] **Step 1: Добавить `<Services>` в `index.astro` после `<Hero>`**

```astro
<main>
  <Hero dict={en} />
  <Services dict={en} />
</main>
```

(добавить также `import Services from '../components/services/Services.astro';` в frontmatter)

- [ ] **Step 2: Добавить `<Services>` в `ru/index.astro` после `<Hero>`**

Аналогично — `import Services from '../../components/services/Services.astro';` + компонент.

### Task 4.7: Проверка сборки и визуала

- [ ] **Step 1: Type-check + build**

Run: `npx astro check && npm run build`
Expected: 0 errors, без warnings.

- [ ] **Step 2: Dev-сервер**

Run: `npm run dev`
- `/`: 4 карточки, блёклые картинки с blend-mode, AI-карточка с перевёрнутым изображением.
- Mobile (<768px): карточки в столбик.
- Tablet (768–1247px): карточки 2×2.
- Desktop (≥1248px): карточки 1×4.

- [ ] **Step 3: Figma-паритет**

Run (MCP): `get_screenshot(nodeId="285:949", fileKey="L3skuk3D54hgX93qX7EIjd")`
Паритет ≥ 95% на 1440.

### Task 4.8: Коммит Фазы 4

- [ ] **Step 1: Stage и commit**

```bash
git add src/components/services/ \
        src/assets/services/ \
        src/pages/index.astro src/pages/ru/index.astro
git commit -m "feat(phase-4): services — 4 cards with blend-mode images and chip tags"
```

## Acceptance (run before marking phase complete)

- [ ] `npx astro check` — 0 errors
- [ ] `npm run build` — без warnings
- [ ] 4 карточки рендерятся на `/` (визуально)
- [ ] Grid адаптивен (1 → 2 → 4 колонки на mobile/tablet/desktop)
- [ ] AI-карточка повёрнута согласно Figma
- [ ] Figma-паритет ≥ 95% с `get_screenshot(285:949)`
- [ ] Grep hex вне `tokens.css` = 0
- [ ] Коммит Фазы 4 создан

## Next

→ [`phase-05-cases.md`](./phase-05-cases.md)
