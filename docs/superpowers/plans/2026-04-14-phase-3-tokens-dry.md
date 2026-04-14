# Phase 3 — Design Tokens & DRY

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Устранить нарушения CLAUDE.md (хардкод цветов в компонентах), убрать копипасту трёх `index.astro` страниц, унифицировать типы `tags`, привязать медиа кейсов к i18n-словарю и разбить 1000-строчный BrifForm на читаемые куски.

**Architecture:**
1. Расширить `tokens.css` новыми переменными для glass-поверхностей, border-градиентов и RGB-триплетов primary-цвета.
2. Заменить все hex/rgba-литералы в компонентах на `var(--token)` или `rgba(var(--rgb), α)`.
3. Вынести общее тело страниц в `src/components/pages/Landing.astro` и передавать туда `dict` + `locale`.
4. Сделать `tags` единым типом `readonly string[]` везде.
5. Перенести поля `image` и `video` каждого кейса в соответствующий dict.
6. BrifForm.astro разбить на: `BrifForm.astro` (разметка + стили), `src/components/form/wizard.ts` (логика).

**Tech Stack:** Astro 5, CSS custom properties, TypeScript.

**Covered audit findings:** #7 (hardcoded colors), #15 (three duplicate pages), #16 (tags type mismatch), #17 (cases media linked by index), #19 (BrifForm size).

**Prerequisites:** Phase 2 завершена (чтобы рефакторинг не конфликтовал с работой по API).

---

### Task 1: Расширить `tokens.css` семантическими переменными

**Files:**
- Modify: `src/styles/tokens.css`

- [ ] **Step 1: Добавить токены в `:root`**

Edit `src/styles/tokens.css` — в конец блока `:root { ... }` (перед закрывающей `}`) добавить:

```css
  /* ── RGB triplets (для rgba() с α из кода) ── */
  --surface-bg-rgb:    6, 11, 20;
  --surface-card-rgb:  10, 22, 38;
  --primary-default-rgb: 21, 142, 242;
  --primary-accent-rgb:  145, 198, 242;
  --white-rgb: 255, 255, 255;

  /* ── Glass surfaces ───────────────────────── */
  --surface-card-glass:    rgba(var(--surface-card-rgb), 0.55);
  --surface-header-glass:  rgba(var(--surface-bg-rgb), 0.6);
  --surface-overlay-glass: rgba(var(--surface-bg-rgb), 0.95);

  /* ── Glass borders (top-lit gradient) ────── */
  --border-glass-top:    rgba(var(--white-rgb), 0.14);
  --border-glass-bottom: rgba(var(--white-rgb), 0.03);
  --border-glass-hover-top:    rgba(var(--white-rgb), 0.28);
  --border-glass-hover-bottom: rgba(var(--white-rgb), 0.06);
  --border-subtle: rgba(var(--white-rgb), 0.1);
  --border-grid:   rgba(var(--white-rgb), 0.04);

  /* ── Interactive surfaces ─────────────────── */
  --surface-chip:       rgba(var(--white-rgb), 0.04);
  --surface-chip-hover: rgba(var(--white-rgb), 0.08);
  --surface-social:       rgba(var(--white-rgb), 0.1);
  --surface-social-hover: rgba(var(--white-rgb), 0.2);
  --surface-lang-hover:   rgba(var(--white-rgb), 0.05);
  --border-chip:       rgba(var(--white-rgb), 0.15);
  --border-chip-hover: rgba(var(--white-rgb), 0.3);

  /* ── Scrollbar ────────────────────────────── */
  --scrollbar-thumb:       rgba(var(--primary-accent-rgb), 0.3);
  --scrollbar-thumb-hover: rgba(var(--primary-accent-rgb), 0.55);

  /* ── Semantic ─────────────────────────────── */
  --text-danger: #d32f2f;

  /* ── Shadows ──────────────────────────────── */
  --shadow-header: 0 8px 32px rgba(0, 0, 0, 0.2);
  --glow-primary-soft:  rgba(var(--primary-default-rgb), 0.25);
  --glow-primary-mid:   rgba(var(--primary-default-rgb), 0.15);
  --glow-primary-faint: rgba(var(--primary-default-rgb), 0.08);
```

- [ ] **Step 2: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(tokens): add semantic glass/border/glow tokens + RGB triplets"
```

---

### Task 2: Заменить хардкод в `Header.astro`, `Footer.astro`, `global.css`

**Files:**
- Modify: `src/components/chrome/Header.astro`
- Modify: `src/components/chrome/Footer.astro`
- Modify: `src/styles/global.css`

- [ ] **Step 1: Header**

Edit `src/components/chrome/Header.astro`:

Заменить в `<style>`:
- `background-color: rgba(6, 11, 20, 0.6);` → `background-color: var(--surface-header-glass);`
- `border: 1px solid rgba(255, 255, 255, 0.1);` → `border: 1px solid var(--border-subtle);`
- `box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);` → `box-shadow: var(--shadow-header);`
- `background: rgba(6, 11, 20, 0.95);` (в `.lang-menu`) → `background: var(--surface-overlay-glass);`
- `border: 1px solid rgba(255, 255, 255, 0.1);` (в `.lang-menu`) → `border: 1px solid var(--border-subtle);`
- `background: rgba(255, 255, 255, 0.05);` (в `.lang-option:hover`) → `background: var(--surface-lang-hover);`
- `background-color: rgba(6, 11, 20, 0.95);` (в `.mobile-menu`) → `background-color: var(--surface-overlay-glass);`

- [ ] **Step 2: Footer**

Edit `src/components/chrome/Footer.astro`:

- `border-top: 1px solid rgba(255, 255, 255, 0.1);` → `border-top: 1px solid var(--border-subtle);`
- `background: rgba(255, 255, 255, 0.1);` (`.social-btn`) → `background: var(--surface-social);`
- `background: rgba(255, 255, 255, 0.2);` (`.social-btn:hover`) → `background: var(--surface-social-hover);`

- [ ] **Step 3: global.css**

Edit `src/styles/global.css`:

- `scrollbar-color: rgba(145, 198, 242, 0.3) transparent;` → `scrollbar-color: var(--scrollbar-thumb) transparent;`
- `background-color: rgba(145, 198, 242, 0.3);` (в `html::-webkit-scrollbar-thumb`) → `background-color: var(--scrollbar-thumb);`
- `background-color: rgba(145, 198, 242, 0.55);` (в `:hover`) → `background-color: var(--scrollbar-thumb-hover);`

- [ ] **Step 4: Build проверка**

Run: `npm run build`
Expected: успех.

- [ ] **Step 5: Dev-проверка визуала**

Run: `npm run dev`, открыть страницу — убедиться, что header/footer/scrollbar визуально идентичны.

- [ ] **Step 6: Commit**

```bash
git add src/components/chrome src/styles/global.css
git commit -m "refactor(tokens): replace hardcoded colors in chrome + global scrollbar"
```

---

### Task 3: Заменить хардкод в `ServiceCard.astro`, `CaseCard.astro`, `Chip.astro`, `CasesCarousel.astro`

**Files:**
- Modify: `src/components/services/ServiceCard.astro`
- Modify: `src/components/services/Chip.astro`
- Modify: `src/components/cases/CaseCard.astro`

- [ ] **Step 1: ServiceCard**

Edit `src/components/services/ServiceCard.astro`:

- `background: rgba(10, 22, 38, 0.55);` → `background: var(--surface-card-glass);`
- `--glow-color: 21, 142, 242;` → `--glow-color: var(--primary-default-rgb);`
- В gradient border:
  - `rgba(255, 255, 255, 0.14) 0%,` → `var(--border-glass-top) 0%,`
  - `rgba(255, 255, 255, 0.03) 100%` → `var(--border-glass-bottom) 100%`

- [ ] **Step 2: Chip**

Edit `src/components/services/Chip.astro`:

- `border: 1px solid rgba(255, 255, 255, 0.15);` → `border: 1px solid var(--border-chip);`
- `background: rgba(255, 255, 255, 0.04);` → `background: var(--surface-chip);`
- `border-color: rgba(255, 255, 255, 0.3);` → `border-color: var(--border-chip-hover);`
- `background: rgba(255, 255, 255, 0.08);` → `background: var(--surface-chip-hover);`

- [ ] **Step 3: CaseCard**

Edit `src/components/cases/CaseCard.astro`:

- `background: rgba(10, 22, 38, 0.55);` → `background: var(--surface-card-glass);`
- Gradient border — аналогично Task 3 Step 1.
- В `.case:hover`:
  - `0 0 48px rgba(21, 142, 242, 0.15),` → `0 0 48px var(--glow-primary-mid),`
  - `0 0 96px rgba(21, 142, 242, 0.08);` → `0 0 96px var(--glow-primary-faint);`
- Hover gradient border:
  - `rgba(255, 255, 255, 0.28) 0%,` → `var(--border-glass-hover-top) 0%,`
  - `rgba(255, 255, 255, 0.06) 100%` → `var(--border-glass-hover-bottom) 100%`

- [ ] **Step 4: Build и визуал**

Run: `npm run build && npm run dev` (в отдельном окне), открыть страницу — убедиться, что карточки визуально одинаковы.

- [ ] **Step 5: Commit**

```bash
git add src/components/services src/components/cases
git commit -m "refactor(tokens): replace hardcoded colors in service/case cards + chip"
```

---

### Task 4: Заменить хардкод в `GlowBackground.astro`, `Layout.astro`, `Starfield.astro`

**Files:**
- Modify: `src/components/layout/GlowBackground.astro`
- Modify: `src/components/layout/Layout.astro`
- Modify: `src/components/layout/Starfield.astro`

- [ ] **Step 1: GlowBackground**

Edit `src/components/layout/GlowBackground.astro`:

- `linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),` → `linear-gradient(to right, var(--border-grid) 1px, transparent 1px),`
- `linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);` → `linear-gradient(to bottom, var(--border-grid) 1px, transparent 1px);`

Orb background уже использует `var(--primary-default)` — не трогаем.

- [ ] **Step 2: Layout (theme-color — оставляем литерал)**

`<meta name="theme-color" content="#060b14" />` — литерал допустим (HTML meta не видит CSS var). Комментировать не нужно, но для читаемости можно продублировать значение из токена. Оставить как есть.

- [ ] **Step 3: Services — JS-литерал primary**

Edit `src/components/services/Services.astro`:

Заменить в inline скрипте:
```ts
const GLOW_COLOR = '21, 142, 242'; // --primary-default
```
на чтение из CSS-переменной:
```ts
const GLOW_COLOR = getComputedStyle(document.documentElement)
  .getPropertyValue('--primary-default-rgb').trim() || '21, 142, 242';
```

- [ ] **Step 4: Button — JS-литерал primary**

Edit `src/components/ui/Button.astro` в `<style>`:
- `--glow-rgb: 21, 142, 242;` → `--glow-rgb: var(--primary-default-rgb);`

(Для mask-composite и border-box CSS var подтянется корректно.)

- [ ] **Step 5: Build + визуал**

Run: `npm run build && npm run dev`
Проверить: свечение при наведении на сервис-карточки, свечение кнопки, стартовый glow-intro. Без регрессий.

- [ ] **Step 6: Commit**

```bash
git add src/components
git commit -m "refactor(tokens): replace hardcoded primary RGB in glow background + JS controllers"
```

---

### Task 5: Заменить хардкод в `BrifForm.astro` (цвета)

**Files:**
- Modify: `src/components/form/BrifForm.astro`

- [ ] **Step 1: Заменить glass + borders**

В `<style>` внутри `src/components/form/BrifForm.astro`:

- `background: rgba(10, 22, 38, 0.55);` → `background: var(--surface-card-glass);`
- Все вхождения `rgba(255, 255, 255, 0.14) 0%` → `var(--border-glass-top) 0%`
- Все вхождения `rgba(255, 255, 255, 0.03) 100%` → `var(--border-glass-bottom) 100%`
- `color: #d32f2f;` → `color: var(--text-danger);`

- [ ] **Step 2: Поиск остаточных литералов**

Run:
```bash
grep -nE "#[0-9a-fA-F]{3,8}|rgba\(" src/components/form/BrifForm.astro | grep -v "var(--" | grep -v "^---" | head -20
```
Ожидается: минимум вхождений (возможно остались `#fff 0 0` в mask-composite — это специальный паттерн для CSS mask, не цвет бренда, оставить).

- [ ] **Step 3: Build и визуал**

Run: `npm run build && npm run dev`, открыть форму, перепройти шаги 1→5→6, убедиться в идентичности.

- [ ] **Step 4: Commit**

```bash
git add src/components/form/BrifForm.astro
git commit -m "refactor(tokens): replace hardcoded colors in BrifForm"
```

---

### Task 6: Единый тип `tags` и привязка кейсовых медиа к dict

**Files:**
- Modify: `src/i18n/en.ts`
- Modify: `src/i18n/ru.ts`
- Modify: `src/i18n/uz.ts`
- Modify: `src/components/cases/Cases.astro`
- Modify: `src/components/cases/CaseCard.astro`
- Modify: `src/components/services/ServiceCard.astro`

- [ ] **Step 1: Добавить в en.ts media-поля**

Edit `src/i18n/en.ts` — в каждом `cases.items[*]` добавить поля `image` (строка-имя ассета) и `video?` (строка-URL). Так как ассеты импортируются в Astro, мы будем хранить **ключ**, а в Cases.astro — резолвить через map. Упростим: храним URL для video и ключ для image.

Обновлённый `cases.items[0]` в `en.ts`:

```ts
items: [
  {
    title: 'Memolink',
    description: 'Connecting users through an interactive social networking app',
    tags: ['web & mob', 'ui/ux design', 'growth support'],
    image: 'case-1',
    video: '/cases/memolink.mp4',
  },
],
```

И тип `Dict` автоматически обновится.

- [ ] **Step 2: Синхронно обновить ru.ts и uz.ts**

В обоих файлах в каждом `cases.items[0]` добавить те же поля:

```ts
image: 'case-1',
video: '/cases/memolink.mp4',
```

- [ ] **Step 3: Тип tags — единый**

В `src/components/cases/CaseCard.astro` изменить:

```ts
tags: string[];
```
на
```ts
tags: readonly string[];
```

В `src/components/services/ServiceCard.astro`:
```ts
tags: ReadonlyArray<string>;
```
оставить, но заменить для единообразия:
```ts
tags: readonly string[];
```

- [ ] **Step 4: Cases.astro — резолвить image по ключу**

Edit `src/components/cases/Cases.astro`:

```astro
---
import type { Dict } from '../../i18n/en';
import CaseCard from './CaseCard.astro';
import CasesCarousel from './CasesCarousel.astro';
import case1 from '../../assets/cases/case-1.png';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;

const imageMap: Record<string, ImageMetadata> = {
  'case-1': case1,
};
---

<CasesCarousel title={dict.cases.title}>
  {dict.cases.items.map((item) => {
    const img = imageMap[item.image];
    if (!img) return null;
    return (
      <CaseCard
        title={item.title}
        description={item.description}
        tags={item.tags}
        image={img}
        video={item.video}
      />
    );
  })}
</CasesCarousel>
```

- [ ] **Step 5: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, успех.

- [ ] **Step 6: Commit**

```bash
git add src/i18n src/components/cases src/components/services
git commit -m "refactor: unify tags type as readonly string[] + bind cases media to dict"
```

---

### Task 7: Объединить три `index.astro` в один Landing-компонент

**Files:**
- Create: `src/components/pages/Landing.astro`
- Modify: `src/pages/index.astro`
- Modify: `src/pages/ru/index.astro`
- Modify: `src/pages/uz/index.astro`

- [ ] **Step 1: Создать Landing.astro**

Создать `src/components/pages/Landing.astro`:

```astro
---
import Layout from '../layout/Layout.astro';
import Header from '../chrome/Header.astro';
import Hero from '../hero/Hero.astro';
import Services from '../services/Services.astro';
import Cases from '../cases/Cases.astro';
import BrifForm from '../form/BrifForm.astro';
import Footer from '../chrome/Footer.astro';
import type { Dict } from '../../i18n/en';
import type { Locale } from '../../lib/paths';

interface Props {
  dict: Dict;
  locale: Locale;
}

const { dict, locale } = Astro.props;
---

<Layout title="AF Venture Studio" description={dict.hero.title} lang={locale}>
  <Header dict={dict} locale={locale} />
  <main>
    <Hero dict={dict} />
    <Services dict={dict} />
    <Cases dict={dict} />
    <BrifForm dict={dict} />
  </main>
  <Footer dict={dict} locale={locale} />
</Layout>
```

- [ ] **Step 2: Переписать `src/pages/index.astro`**

```astro
---
import Landing from '../components/pages/Landing.astro';
import { en } from '../i18n/en';
---

<Landing dict={en} locale="en" />
```

- [ ] **Step 3: Переписать `src/pages/ru/index.astro`**

```astro
---
import Landing from '../../components/pages/Landing.astro';
import { ru } from '../../i18n/ru';
---

<Landing dict={ru} locale="ru" />
```

- [ ] **Step 4: Переписать `src/pages/uz/index.astro`**

```astro
---
import Landing from '../../components/pages/Landing.astro';
import { uz } from '../../i18n/uz';
---

<Landing dict={uz} locale="uz" />
```

- [ ] **Step 5: Build проверка**

Run: `npm run build`
Expected: три prerender'а (`/`, `/ru/`, `/uz/`).

- [ ] **Step 6: Commit**

```bash
git add src/components/pages src/pages
git commit -m "refactor(pages): extract shared Landing component from 3 index pages"
```

---

### Task 8: Разбить BrifForm — вынести скрипт

**Files:**
- Create: `src/components/form/wizard.ts`
- Modify: `src/components/form/BrifForm.astro`

- [ ] **Step 1: Создать wizard.ts с чистой функцией инициализации**

Создать `src/components/form/wizard.ts`:

```ts
import { sendContact } from '../../lib/contact';

export function initBrifWizard(): void {
  const wizard = document.querySelector<HTMLDivElement>('[data-wizard]');
  if (!wizard) return;

  const startedAt = Date.now();
  let currentStep = 1;
  let previousStep = 1;
  const totalSteps = 6;
  const selections: Record<string, string> = {};

  const progressFill = wizard.querySelector<HTMLDivElement>('[data-progress-fill]');
  const btn = wizard.querySelector<HTMLButtonElement>('[data-brif-btn]');
  const btnText = wizard.querySelector<HTMLSpanElement>('[data-btn-text]');
  const dots = wizard.querySelectorAll<HTMLDivElement>('[data-dot]');
  const steps = wizard.querySelectorAll<HTMLDivElement>('[data-step]');

  const fillPercents = [20, 42.7, 66.6, 87.3, 100];
  const ANIM_CLASSES = [
    'is-entering-fwd', 'is-entering-back', 'is-leaving-fwd', 'is-leaving-back',
  ];
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function updateUI(): void {
    const dir = currentStep > previousStep ? 1 : currentStep < previousStep ? -1 : 0;

    steps.forEach((s) => {
      const stepNum = parseInt(s.dataset.step || '0', 10);
      ANIM_CLASSES.forEach((c) => s.classList.remove(c));
      if (stepNum === currentStep) {
        s.classList.add('is-active');
        if (dir !== 0 && !prefersReducedMotion) {
          s.classList.add(dir > 0 ? 'is-entering-fwd' : 'is-entering-back');
        }
      } else if (stepNum === previousStep && previousStep !== currentStep && !prefersReducedMotion) {
        s.classList.remove('is-active');
        s.classList.add(dir > 0 ? 'is-leaving-fwd' : 'is-leaving-back');
      } else {
        s.classList.remove('is-active');
      }
    });

    if (dir !== 0 && !prefersReducedMotion) {
      const entering = wizard.querySelector<HTMLDivElement>(
        '.brif-step.is-entering-fwd, .brif-step.is-entering-back'
      );
      if (entering) {
        entering.addEventListener('animationend', () => {
          steps.forEach((s) => ANIM_CLASSES.forEach((c) => s.classList.remove(c)));
        }, { once: true });
      }
    }

    previousStep = currentStep;

    const progressEl = wizard.querySelector<HTMLDivElement>('.brif-progress');
    if (progressEl) progressEl.style.display = currentStep === 6 ? 'none' : '';
    if (progressFill) {
      const idx = Math.min(currentStep - 1, fillPercents.length - 1);
      progressFill.style.width = `${fillPercents[idx]}%`;
    }

    dots.forEach((dot) => {
      const dotNum = parseInt(dot.dataset.dot || '0', 10);
      dot.classList.remove('active', 'completed', 'upcoming');
      if (dotNum < currentStep) dot.classList.add('completed');
      else if (dotNum === currentStep) dot.classList.add('active');
      else dot.classList.add('upcoming');
    });

    if (btn && btnText) {
      if (currentStep === 6) btn.style.display = 'none';
      else {
        btn.style.display = '';
        const labelNext = wizard.dataset.labelNext || 'Next';
        const labelSend = wizard.dataset.labelSend || 'Send';
        btnText.textContent = currentStep === 5 ? labelSend : labelNext;
      }
      btn.classList.toggle('brif-btn--shifted', currentStep === 4);
    }
  }

  function validateStep(): boolean {
    if (currentStep >= 1 && currentStep <= 4) {
      const stepNames = ['productType', 'readiness', 'platform', 'industry'];
      const name = stepNames[currentStep - 1];
      return !!selections[name];
    }
    if (currentStep === 5) {
      const nameInput = wizard.querySelector<HTMLInputElement>('input[name="name"]');
      const emailInput = wizard.querySelector<HTMLInputElement>('input[name="email"]');
      return !!(nameInput?.value.trim() && emailInput?.value.trim());
    }
    return true;
  }

  wizard.addEventListener('click', (e) => {
    const target = e.target as HTMLElement;
    const option = target.closest<HTMLButtonElement>('.brif-option');
    if (option) {
      const name = option.dataset.name || '';
      option.parentElement?.querySelectorAll('.brif-option').forEach((s) => s.classList.remove('selected'));
      option.classList.add('selected');
      const otherInput = option.querySelector<HTMLInputElement>('[data-other-input]');
      if (otherInput) {
        otherInput.focus();
        selections[name] = otherInput.value.trim() || 'Other';
      } else {
        selections[name] = option.dataset.value || '';
      }
      return;
    }

    const dot = target.closest<HTMLDivElement>('[data-dot]');
    if (dot) {
      const dotStep = parseInt(dot.dataset.dot || '0', 10);
      if (dotStep < currentStep && dotStep >= 1) {
        currentStep = dotStep;
        updateUI();
      }
      return;
    }

    if (target.closest('[data-brif-btn]')) {
      if (!validateStep()) {
        btn?.classList.add('brif-btn--shake');
        setTimeout(() => btn?.classList.remove('brif-btn--shake'), 400);
        return;
      }

      if (currentStep === 5) {
        const nameVal = wizard.querySelector<HTMLInputElement>('input[name="name"]')?.value.trim() || '';
        const projectVal = wizard.querySelector<HTMLInputElement>('input[name="projectName"]')?.value.trim() || '';
        const emailVal = wizard.querySelector<HTMLInputElement>('input[name="email"]')?.value.trim() || '';
        const phoneVal = wizard.querySelector<HTMLInputElement>('input[name="phone"]')?.value.trim() || '';
        const honeypot = wizard.querySelector<HTMLInputElement>('input[name="website"]')?.value || '';

        btn?.classList.add('brif-btn--loading');
        sendContact({
          productType: selections['productType'] || '',
          readinessStage: selections['readiness'] || '',
          platform: selections['platform'] || '',
          industry: selections['industry'] || '',
          name: nameVal,
          projectName: projectVal,
          email: emailVal,
          phone: phoneVal,
          website: honeypot,
          startedAt,
        })
          .then(() => { currentStep = 6; updateUI(); })
          .catch((err) => {
            const errorEl = wizard.querySelector<HTMLParagraphElement>('[data-brif-error]');
            if (errorEl) errorEl.textContent = err instanceof Error ? err.message : 'Something went wrong. Please try again.';
          })
          .finally(() => btn?.classList.remove('brif-btn--loading'));
        return;
      }

      if (currentStep < totalSteps) {
        currentStep++;
        updateUI();
      }
    }
  });

  wizard.addEventListener('input', (e) => {
    const input = e.target as HTMLInputElement;
    if (!input.matches('[data-other-input]')) return;
    const option = input.closest<HTMLButtonElement>('.brif-option');
    if (option) {
      const name = option.dataset.name || '';
      selections[name] = input.value.trim() || 'Other';
    }
  });

  wizard.querySelectorAll<HTMLInputElement>('[data-other-input]').forEach((inp) => {
    inp.addEventListener('click', (e) => e.stopPropagation());
  });

  // Phone formatting
  const PREFIX = '+998 ';
  const phoneInput = wizard.querySelector<HTMLInputElement>('[data-phone]');

  function formatPhone(raw: string): string {
    const digits = raw.replace(/\D/g, '').slice(3);
    let result = PREFIX;
    if (digits.length > 0) result += digits.slice(0, 2);
    if (digits.length > 2) result += ' ' + digits.slice(2, 5);
    if (digits.length > 5) result += '-' + digits.slice(5, 7);
    if (digits.length > 7) result += '-' + digits.slice(7, 9);
    return result;
  }

  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const pos = phoneInput.selectionStart ?? 0;
      const before = phoneInput.value.length;
      phoneInput.value = formatPhone(phoneInput.value);
      const after = phoneInput.value.length;
      const newPos = Math.max(PREFIX.length, pos + (after - before));
      phoneInput.setSelectionRange(newPos, newPos);
    });
    phoneInput.addEventListener('keydown', (e) => {
      const pos = phoneInput.selectionStart ?? 0;
      if (pos <= PREFIX.length && (e.key === 'Backspace' || e.key === 'Delete')) {
        if (phoneInput.selectionEnd === phoneInput.selectionStart && e.key === 'Backspace') {
          e.preventDefault();
        }
      }
    });
    phoneInput.addEventListener('focus', () => {
      if (!phoneInput.value) phoneInput.value = PREFIX;
      const len = phoneInput.value.length;
      phoneInput.setSelectionRange(len, len);
    });
  }

  updateUI();
}
```

- [ ] **Step 2: Заменить inline `<script>` в BrifForm.astro**

Edit `src/components/form/BrifForm.astro` — заменить весь блок `<script>...</script>` (строки ~245-531) на:

```astro
<script>
  import { initBrifWizard } from './wizard';
  initBrifWizard();
  document.addEventListener('astro:page-load', initBrifWizard);
</script>
```

- [ ] **Step 3: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build проходит.

- [ ] **Step 4: Dev smoke — пройти все шаги визарда**

Run: `npm run dev`, открыть `/`, скроллить к форме, пройти 5 шагов (выбрать опции, заполнить поля), отправить. Без регрессии.

- [ ] **Step 5: Commit**

```bash
git add src/components/form
git commit -m "refactor(form): extract BrifForm wizard logic to wizard.ts"
```

---

### Task 9: Финальная верификация фазы

- [ ] **Step 1: Убедиться, что в компонентах нет оставшихся hex/rgba вне токенов**

Run:
```bash
grep -nE "#[0-9a-fA-F]{6}|rgba\(" src/components/ --include="*.astro" | grep -vE "var\(--|#fff 0 0" | head -30
```
Ожидаемо: короткий список с оставшимися `#fff 0 0` в mask-composite патернах (это CSS-маска, а не бренд-цвет — OK). Другие вхождения должны быть обнулены.

Если найдены посторонние литералы — исправить и закоммитить отдельно.

- [ ] **Step 2: Typecheck и build**

Run: `npm run check && npm run build`
Expected: зелёный.

- [ ] **Step 3: Финальный ручной smoke**

Run: `npm run dev`, открыть `/`, `/ru/`, `/uz/`, пройти весь путь: hover на карточки (glow), заголовок Hero с акцентами, смена языка, скролл, форма.

---

## Coverage check

| Audit # | Task | Status |
|---------|------|--------|
| #7 (hardcoded colors) | Tasks 1–5 | ✅ |
| #15 (3 duplicate pages) | Task 7 | ✅ |
| #16 (tags type mismatch) | Task 6 Step 3 | ✅ |
| #17 (cases media by index) | Task 6 Steps 1, 2, 4 | ✅ |
| #19 (BrifForm too long) | Task 8 | ✅ |
