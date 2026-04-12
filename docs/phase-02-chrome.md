# Phase 2: Chrome (Header + Footer + Container) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Реализовать `Header` (лого, nav, language switcher) и `Footer` (copyright, соц-ссылки), ввести container helper и брейкпоинты, применить chrome на обеих локалях (`/` и `/ru/`).

**Depends on:** [`phase-01-foundation.md`](./phase-01-foundation.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Figma nodes:**
- Canvas: `277:734`
- Frame 1440 (desktop): `277:735`
- Frame 984 (laptop): `298:1519`
- Footer: `285:1099`

**Architecture:** `Header` и `Footer` — scoped `<style>` внутри `.astro`, получают активную локаль как prop. Container реализуется классом `.container` с CSS-переменными, а не отдельным компонентом (паттерн переиспользуется во всех секциях). Language switcher — простая ссылка, не JS-компонент: `/` ↔ `/ru/` вычисляется на сервере.

**Tech Stack:** Astro, CSS Modules не нужны (стилей немного).

---

## File Structure

- Create: `src/lib/paths.ts` — helper для построения URL переключения языка
- Create: `src/components/chrome/Header.astro`
- Create: `src/components/chrome/Footer.astro`
- Modify: `src/styles/global.css` — добавить `.container` и breakpoint-переменные
- Modify: `src/pages/index.astro` — включить Header/Footer
- Modify: `src/pages/ru/index.astro` — включить Header/Footer

## Tasks

### Task 2.1: Инвокнуть `ui-ux-pro-max` для Header и Footer

- [ ] **Step 1: Получить гайдлайны**

Инвокни skill `ui-ux-pro-max:ui-ux-pro-max` с контекстом: «marketing landing header with logo, nav, language switcher, and footer with brand + social links on a dark navy background». Забери рекомендации по:
- hover/focus/active состояниям навигации
- minimum tap target (48×48)
- контрасту текста на `--surface-bg`
- a11y (`nav` landmark, `aria-current`, `role="contentinfo"`)
- focus-visible стилям

Сохрани ключевые решения в голове — они должны быть видны в коде ниже.

### Task 2.2: Получить дизайн-контекст из Figma

- [ ] **Step 1: get_design_context**

Run (MCP tool): `get_design_context(nodeId="277:735", fileKey="L3skuk3D54hgX93qX7EIjd")`
Expected: получен React+Tailwind как референс. Использовать ТОЛЬКО визуально — транслировать в `.astro` + scoped CSS, все значения через токены.

- [ ] **Step 2: get_design_context для Footer отдельно**

Run (MCP tool): `get_design_context(nodeId="285:1099", fileKey="L3skuk3D54hgX93qX7EIjd")`

- [ ] **Step 3: Скачать при необходимости иконки соц-сетей**

Если Figma возвращает asset URL для иконок соц-сетей — скачать в `src/assets/icons/` (wget или через Read/Write). Если соц-ссылки текстовые (как в DESIGN.md: «INSTAGRAM», «TELEGRAM» заглавными) — иконки не нужны.

### Task 2.3: Добавить `.container` и breakpoint-переменные в `global.css`

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Добавить в конец файла**

```css
/* ── Container ───────────────────────────────── */
.container {
  width: 100%;
  max-width: var(--container-max-laptop);
  margin-inline: auto;
  padding-inline: var(--container-padding-mobile);
}

@media (min-width: 768px) {
  .container {
    padding-inline: var(--container-padding-laptop);
  }
}

@media (min-width: 1248px) {
  .container {
    max-width: var(--container-max-desktop);
    padding-inline: var(--container-padding-desktop);
  }
}

/* ── Focus-visible ───────────────────────────── */
:where(a, button, input, textarea):focus-visible {
  outline: 2px solid var(--primary-accent);
  outline-offset: 4px;
  border-radius: 4px;
}
```

### Task 2.4: Создать `src/lib/paths.ts`

**Files:**
- Create: `src/lib/paths.ts`

- [ ] **Step 1: Написать файл**

```ts
export type Locale = 'en' | 'ru';

/**
 * Build the URL for the opposite locale, preserving the current path.
 * `/`       + switch to ru → `/ru/`
 * `/ru/`    + switch to en → `/`
 */
export function switchLocaleUrl(currentPath: string, targetLocale: Locale): string {
  const withoutTrailing = currentPath.replace(/\/$/, '') || '/';
  if (targetLocale === 'ru') {
    if (withoutTrailing.startsWith('/ru')) return withoutTrailing + '/';
    return '/ru' + (withoutTrailing === '/' ? '/' : withoutTrailing + '/');
  }
  // targetLocale === 'en'
  const stripped = withoutTrailing.replace(/^\/ru/, '') || '/';
  return stripped.endsWith('/') ? stripped : stripped + '/';
}
```

### Task 2.5: Создать `src/components/chrome/Header.astro`

**Files:**
- Create: `src/components/chrome/Header.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import type { Dict } from '../../i18n/en';
import { switchLocaleUrl, type Locale } from '../../lib/paths';

interface Props {
  dict: Dict;
  locale: Locale;
}

const { dict, locale } = Astro.props;
const otherLocale: Locale = locale === 'en' ? 'ru' : 'en';
const switchHref = switchLocaleUrl(Astro.url.pathname, otherLocale);
---

<header class="header">
  <div class="container header__inner">
    <a class="brand" href={locale === 'en' ? '/' : '/ru/'} aria-label="AF Venture Studio — home">
      AF VENTURE STUDIO
    </a>

    <nav class="nav" aria-label="Primary">
      <a href="#services">{dict.nav.services}</a>
      <a href="#cases">{dict.nav.portfolio}</a>
      <a href="#contact">{dict.nav.contact}</a>
    </nav>

    <a class="lang" href={switchHref} aria-label={`Switch language to ${otherLocale.toUpperCase()}`}>
      {dict.lang.toggle}
    </a>
  </div>
</header>

<style>
  .header {
    height: var(--header-height);
    display: flex;
    align-items: center;
  }

  .header__inner {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 24px;
  }

  .brand {
    font-family: var(--font-body);
    font-size: var(--font-size-h5);
    font-weight: 600;
    line-height: var(--line-height-h5);
    letter-spacing: var(--letter-spacing-h5);
    color: var(--text-primary);
  }

  .nav {
    display: none;
    gap: 32px;
  }

  .nav a {
    color: var(--text-subtle);
    font-size: var(--font-size-body);
    line-height: var(--line-height-body);
    padding: 12px 0;
    transition: color 0.15s ease;
  }

  .nav a:hover { color: var(--text-primary); }

  .lang {
    color: var(--text-subtle);
    font-size: var(--font-size-body);
    padding: 12px 16px;
    min-height: 48px;
    display: inline-flex;
    align-items: center;
    transition: color 0.15s ease;
  }

  .lang:hover { color: var(--text-primary); }

  @media (min-width: 768px) {
    .nav { display: flex; }
  }
</style>
```

### Task 2.6: Создать `src/components/chrome/Footer.astro`

**Files:**
- Create: `src/components/chrome/Footer.astro`

- [ ] **Step 1: Написать файл**

```astro
---
import type { Dict } from '../../i18n/en';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;

// Social links. DESIGN.md: 5 items total; 2 known (INSTAGRAM, TELEGRAM),
// remaining 3 — добавь href когда они появятся в Figma.
const socials: Array<{ label: string; href: string }> = [
  { label: dict.footer.social.instagram, href: '#' },
  { label: dict.footer.social.telegram,  href: '#' },
];
---

<footer class="footer" role="contentinfo">
  <div class="container footer__inner">
    <span class="brand">{dict.footer.brand}</span>
    <span class="copyright">{dict.footer.copyright}</span>
    <ul class="socials">
      {socials.map(({ label, href }) => (
        <li><a href={href} rel="noopener noreferrer" target="_blank">{label}</a></li>
      ))}
    </ul>
  </div>
</footer>

<style>
  .footer {
    padding-block: 48px;
    margin-top: 96px;
  }

  .footer__inner {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    gap: 16px 32px;
    color: var(--text-subtle);
    font-size: var(--font-size-body);
  }

  .brand { color: var(--text-primary); }

  .socials {
    display: flex;
    flex-wrap: wrap;
    gap: 16px 24px;
    list-style: none;
  }

  .socials a {
    color: var(--text-subtle);
    letter-spacing: 0.05em;
    transition: color 0.15s ease;
    padding-block: 8px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  .socials a:hover { color: var(--text-primary); }
</style>
```

### Task 2.7: Подключить Header/Footer в `src/pages/index.astro`

**Files:**
- Modify: `src/pages/index.astro`

- [ ] **Step 1: Переписать файл**

```astro
---
import Layout from '../components/layout/Layout.astro';
import Header from '../components/chrome/Header.astro';
import Footer from '../components/chrome/Footer.astro';
import { en } from '../i18n/en';
---

<Layout title="AF Venture Studio" description={en.hero.title} lang="en">
  <Header dict={en} locale="en" />
  <main>
    <!-- Hero / Services / Cases / Form in later phases -->
  </main>
  <Footer dict={en} />
</Layout>
```

### Task 2.8: Подключить Header/Footer в `src/pages/ru/index.astro`

**Files:**
- Modify: `src/pages/ru/index.astro`

- [ ] **Step 1: Переписать файл**

```astro
---
import Layout from '../../components/layout/Layout.astro';
import Header from '../../components/chrome/Header.astro';
import Footer from '../../components/chrome/Footer.astro';
import { ru } from '../../i18n/ru';
---

<Layout title="AF Venture Studio" description={ru.hero.title} lang="ru">
  <Header dict={ru} locale="ru" />
  <main>
    <!-- Hero / Services / Cases / Form in later phases -->
  </main>
  <Footer dict={ru} />
</Layout>
```

### Task 2.9: Проверка сборки и визуала

- [ ] **Step 1: Type-check**

Run: `npx astro check`
Expected: 0 errors.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: без warnings.

- [ ] **Step 3: Dev-сервер (визуальная проверка)**

Run: `npm run dev`
- Открой `/`: header сверху (AF VENTURE STUDIO + nav + En), footer внизу.
- Кликни по `En` — должно перекинуть на `/ru/`.
- На `/ru/` nav-тексты = `'TBD RU'`, footer brand = `AF Venture studio`.
- Кликни по `Ru` — возврат на `/`.
- Mobile (DevTools < 768px): nav скрыт, brand + lang switcher видны.

- [ ] **Step 4: Сравнение с Figma**

Run (MCP): `get_screenshot(nodeId="277:735", fileKey="L3skuk3D54hgX93qX7EIjd")`
Сравни header и footer с локальной сборкой. Паритет ≥ 95% — если нет, зафикси в этой же задаче.

### Task 2.10: Коммит Фазы 2

- [ ] **Step 1: Stage и commit**

```bash
git add src/lib/paths.ts \
        src/components/chrome/Header.astro \
        src/components/chrome/Footer.astro \
        src/styles/global.css \
        src/pages/index.astro src/pages/ru/index.astro
git commit -m "feat(phase-2): chrome — header, footer, container, language switcher"
```

## Acceptance (run before marking phase complete)

- [ ] `npx astro check` — 0 errors
- [ ] `npm run build` — без warnings
- [ ] `/` рендерит Header с `Services/Portfolio/Contact` и Footer (визуально)
- [ ] `/ru/` рендерит Header с `TBD RU`-текстами (визуально)
- [ ] Переключатель языка работает в обе стороны
- [ ] Keyboard focus виден на всех интерактивных элементах (проверка Tab)
- [ ] Figma-паритет ≥ 95% для header/footer
- [ ] Grep hex вне `tokens.css` = 0
- [ ] Коммит Фазы 2 создан

## Next

→ [`phase-03-hero.md`](./phase-03-hero.md)
