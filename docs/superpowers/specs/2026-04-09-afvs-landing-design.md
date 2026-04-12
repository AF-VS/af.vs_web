# AF Venture Studio — Landing Implementation Spec

**Дата:** 2026-04-09
**Статус:** утверждён (ожидает пользовательского ревью)
**Figma:** https://www.figma.com/design/L3skuk3D54hgX93qX7EIjd/AF.VS---web?node-id=277-734
**fileKey:** `L3skuk3D54hgX93qX7EIjd`

## Цель

Реализовать маркетинговый лендинг AF Venture Studio 1:1 с Figma, задеплоить на Vercel, покрыть Playwright-тестами (e2e + visual). Стек зафиксирован в `CLAUDE.md` (Astro + TS strict + CSS Modules + токены через `:root`, без Tailwind, без CSS-in-JS). Полный визуальный справочник — в `DESIGN.md`.

## Границы (in scope)

- Одностраничный лендинг: Header → Hero → Services → Cases → Form → Footer.
- i18n: En (default, без префикса) и Ru (`/ru/*`) через нативный Astro routing.
- Контактная форма с клиент-валидацией и абстракцией `sendContact()` (канал доставки — отдельное решение после плана).
- Базовое SEO: meta, OpenGraph, `@astrojs/sitemap`, robots.txt.
- Vercel Analytics (`@vercel/analytics`).
- Playwright: smoke e2e + visual regression (desktop 1440 + mobile 375).
- Production deploy на Vercel.

## Вне границ (out of scope)

- Реальный backend для формы (Telegram/Resend/etc) — решается после плана, в спеке закладывается только абстракция.
- CMS или редактирование контента через админку.
- Blog, portfolio детали страниц (помимо карточек кейсов на главной).
- A/B-тестирование, feature flags.
- Нативная аналитика сторонних сервисов (GA4, Яндекс.Метрика).

## Архитектура

### Слои кода

```
src/
├── assets/              # Изображения из Figma (.png/.webp)
├── components/
│   ├── chrome/          # Header, Footer
│   ├── hero/            # Hero, Button
│   ├── services/        # Services, ServiceCard, Chip
│   ├── cases/           # Cases, CaseCard, CasesCarousel
│   ├── form/            # ContactForm
│   └── layout/          # Layout, GlowBackground
├── i18n/
│   ├── en.ts            # Плоский словарь
│   └── ru.ts            # Плоский словарь (плейсхолдеры до Фазы 7)
├── lib/
│   └── contact.ts       # sendContact() абстракция
├── pages/
│   ├── index.astro      # En (default)
│   └── ru/
│       └── index.astro  # Ru
└── styles/
    ├── tokens.css       # :root переменные из DESIGN.md
    └── global.css       # Reset, base typography
```

### Типы артефактов

- **`.astro`** — компоненты и страницы.
- **Стили компонентов** — по умолчанию scoped `<style>` внутри `.astro` (Astro scope'ит автоматически). `*.module.css` — только если стили крупные (>80 строк) или переиспользуются между несколькими компонентами.
- **`tokens.css`** — единственный источник цветов/шрифтов/радиусов/отступов. Импортируется один раз в `Layout.astro`.

## Сквозные решения

### 1. i18n

Astro native routing. `en` — default локаль без префикса, `ru` — `/ru/*`.

```
src/pages/index.astro       → /         (en)
src/pages/ru/index.astro    → /ru/      (ru)
```

Словари — плоские TS-объекты с ключами по секциям:

```ts
// src/i18n/en.ts
export const en = {
  nav: { services: 'Services', portfolio: 'Portfolio', contact: 'Contact' },
  hero: { title: 'From idea to product, from product to growth', cta: 'Get started' },
  // ...
} as const;
```

Тексты из `DESIGN.md` — source of truth для `en`. `ru` — плейсхолдеры `'TBD RU'` в Фазе 1, перевод в Фазе 7.

Language switcher в `Header`: берёт текущий путь, переключает префикс. На `/` → `/ru/`; на `/ru/` → `/`.

### 2. Форма

`src/lib/contact.ts`:

```ts
export interface ContactPayload {
  name: string;
  email: string;
  message: string;
}

export async function sendContact(payload: ContactPayload): Promise<void> {
  // TODO: wire provider (Telegram/Resend). Decision deferred after plan.
  console.log('[sendContact] payload', payload);
  throw new Error('sendContact: provider not configured');
}
```

`ContactForm` вызывает `sendContact`, ловит ошибку, показывает состояние «отправка не настроена» — это ожидаемое поведение в рамках этого плана.

### 3. GlowBackground

CSS-only. Grid-паттерн через `background-image: linear-gradient`, 5 glow-эллипсов через `radial-gradient` или `::before`/`::after` + `filter: blur(...)`. Никакого `<canvas>`, никакого JS. Живёт в `Layout.astro`, применяется ко всему `<body>`.

### 4. Использование `ui-ux-pro-max` skill

**Обязательное требование для всех UI-фаз (2–6).** Перед версткой каждого компонента разработчик **обязан** инвокнуть `ui-ux-pro-max:ui-ux-pro-max` для получения UX-гайдлайнов по:

- состояниям (default, hover, focus, active, disabled, loading)
- доступности (контраст, ARIA, клавиатурная навигация)
- визуальной иерархии и типографике
- микроинтеракциям

Это явная строка чек-листа в каждой фазе: **«Invoke `ui-ux-pro-max` для секции X перед версткой»**. Пропускать нельзя.

### 5. Figma workflow (для каждой секции)

1. Найти node ID в таблице `DESIGN.md`.
2. `get_design_context(nodeId, fileKey="L3skuk3D54hgX93qX7EIjd")` — вернувшийся React+Tailwind используется **только как визуальный референс**. Транслируется в `.astro` + CSS Modules, все значения — через токены из `tokens.css`.
3. Ассеты, приходящие через `figma.com/api/mcp/asset/...` — скачиваются в `src/assets/` (ссылки живут 7 дней).
4. `get_screenshot(nodeId)` — сравнение перед коммитом.

## Фазы

| # | Фаза | Файл | Ключевой выход |
|---|---|---|---|
| 1 | Foundation | `docs/phase-01-foundation.md` | Astro+TS+Vercel adapter, tokens, шрифты, i18n routing, Layout+GlowBackground, dev-сборка живёт |
| 2 | Chrome | `docs/phase-02-chrome.md` | `Header` (лого/nav/lang switch), `Footer`, container/breakpoints, `/` и `/ru/` пустые с chrome |
| 3 | Hero | `docs/phase-03-hero.md` | `Button` primary, `Hero.astro` с заголовком + акцентом, hero-mountain asset, CTA |
| 4 | Services | `docs/phase-04-services.md` | `Chip`, `ServiceCard` (blend-mode accessory), 4 карточки в `Services.astro` |
| 5 | Cases | `docs/phase-05-cases.md` | `CaseCard`, `CasesCarousel` (scroll-snap + стрелки, минимум JS), `Cases.astro` |
| 6 | Form | `docs/phase-06-form.md` | `ContactForm`, клиент-валидация, интеграция с `sendContact()` |
| 7 | Polish & Deploy | `docs/phase-07-polish-deploy.md` | Responsive аудит, SEO meta/OG/sitemap/robots, Vercel Analytics, Lighthouse, production deploy |
| 8 | E2E & Visual (Playwright) | `docs/phase-08-playwright.md` | Playwright smoke e2e + visual baseline для desktop/mobile, CI-integration |

Порядок строго последовательный: фаза N блокирует фазу N+1.

### Фаза 1 — Foundation

- `npm create astro@latest` → strict TS preset, no integrations.
- `npm i @astrojs/vercel @fontsource/inter @fontsource/space-grotesk`.
- `astro.config.mjs`: vercel adapter, i18n config (`defaultLocale: 'en'`, `locales: ['en', 'ru']`, `routing: { prefixDefaultLocale: false }`).
- `src/styles/tokens.css` — перенос всех значений из DESIGN.md (colors, typography, radii, spacing).
- `src/styles/global.css` — reset + `body` с `var(--surface-bg)` + импорты шрифтов: `@fontsource/inter/400.css`, `/500.css`, `/600.css`, `@fontsource/space-grotesk/700.css`.
- `src/components/layout/Layout.astro` — HTML shell + импорт `tokens.css` и `global.css` + `GlowBackground`.
- `src/components/layout/GlowBackground.astro` — CSS-only grid + 5 glow эллипсов.
- `src/i18n/en.ts`, `src/i18n/ru.ts` — базовые словари с секциями `nav`, `hero`, `services`, `cases`, `form`, `footer` (ru — `'TBD RU'`).
- `src/pages/index.astro`, `src/pages/ru/index.astro` — заглушки с Layout.
- Acceptance: `npm run dev` показывает тёмный фон с glow и grid, `npm run build` без warnings, TS strict зелёный.

### Фаза 2 — Chrome

- `src/components/chrome/Header.astro` — лого `AF VENTURE STUDIO`, nav (`Services/Portfolio/Contact`), language switcher.
- `src/components/chrome/Footer.astro` — copyright + 5 соц-ссылок (INSTAGRAM, TELEGRAM + 3 placeholder — уточнить в Figma в начале фазы).
- Container helper через CSS-переменные `--container-max`, `--container-padding`.
- Breakpoints: mobile (<768), tablet (≥768), laptop (≥984), desktop (≥1248) — через `min-width` media queries.
- Chrome применён к `/` и `/ru/`.
- Acceptance: header/footer совпадают со скриншотами nodes 277:735 (desktop) и 298:1519 (laptop 984) в Figma.

### Фаза 3 — Hero

- `src/components/hero/Button.astro` — primary variant: белый фон `--surface-white`, текст `--primary-default`, pill 256×56.
- `src/components/hero/Hero.astro` — заголовок (Space Grotesk 62px, `product` и `growth` → `--primary-accent`), CTA, фон-гора с маской.
- Скачать hero-mountain asset из Figma в `src/assets/`.
- Acceptance: визуальный паритет ≥ 95% с `get_screenshot(285:1100)` на 1440.

### Фаза 4 — Services

- `src/components/services/Chip.astro` — pill, caption, border `--text-secondary`, padding 4/16.
- `src/components/services/ServiceCard.astro` — dark card, border 2px, radius 32, image accessory с `mix-blend-lighten`/`mix-blend-screen`, заголовок h4, описание, `Chip[]`.
- `src/components/services/Services.astro` — 4 карточки: Build, AI, Advisory, Growth (контент в словарях).
- Скачать картинки 4 карточек из Figma.
- Acceptance: визуальный паритет ≥ 95% с `get_screenshot(285:949)`.

### Фаза 5 — Cases

- `src/components/cases/CaseCard.astro` — 472×512 desktop.
- `src/components/cases/CasesCarousel.astro` — scroll-snap контейнер + кнопки ←/→ (56×56). JS только для кликов по стрелкам (`scrollBy`). Без библиотек.
- `src/components/cases/Cases.astro` — заголовок «Our latest work» + 3 карточки.
- Скачать case-ассеты.
- Acceptance: карусель работает стрелками и свайпом, визуальный паритет ≥ 95% с `get_screenshot(285:1009)`.

### Фаза 6 — Form

- `src/components/form/ContactForm.astro` — поля name/email/message, pill-инпуты, CTA.
- Клиент-валидация (native HTML5 + кастомные сообщения).
- Обработчик сабмита вызывает `sendContact()` (абстракция из `src/lib/contact.ts`), ловит ошибку → показывает «отправка не настроена».
- Acceptance: форма валидирует required/email/min-length, визуальный паритет ≥ 95% с `get_screenshot(285:1080)`.

### Фаза 7 — Polish & Deploy

- Responsive аудит по 4 брейкпоинтам, фиксы.
- Hover/focus/active состояния на всех интерактивных элементах.
- SEO: `<title>`, `<meta description>`, OG tags, Twitter card, `@astrojs/sitemap`, `robots.txt`, JSON-LD Organization.
- `@vercel/analytics` подключён.
- Перевод всех `ru`-словарей с `'TBD RU'` на реальный русский.
- Lighthouse локально: Performance/Accessibility/Best Practices/SEO ≥ 90.
- Production deploy на Vercel.
- Acceptance: production URL живёт, Lighthouse ≥ 90 по всем метрикам.

### Фаза 8 — E2E & Visual (Playwright)

- `npm i -D @playwright/test`, `npx playwright install`.
- `playwright.config.ts` — запуск против `astro dev` (webServer config).
- Скрипты пишутся через `playwright-skill:playwright-skill` (стабильные версии переносятся из `/tmp` в `e2e/`).
- Smoke e2e (`e2e/smoke.spec.ts`):
  - `/` грузится, hero виден, CTA кликабельна.
  - Services: 4 карточки.
  - Cases: стрелки работают, после `→` видна следующая карточка.
  - Form: required-валидация блокирует пустой submit, валидный submit вызывает ожидаемую ошибку абстракции.
  - i18n: `/ru/` грузится, language switcher переключает.
- Visual regression (`e2e/visual.spec.ts`):
  - `page.screenshot()` baseline для каждой секции на desktop (1440×900) и mobile (375×812).
  - Diff threshold ≤ 0.2.
- Acceptance: `npx playwright test` зелёный локально. GitHub Actions / CI-интеграция — вне scope этого плана (можно добавить отдельным шагом после).

## Acceptance-паттерн (для каждой фазы)

Каждая фаза завершается одинаковым блоком:

- **Visual:** `get_screenshot(<nodeId>)` vs сборка — паритет ≥ 95%.
- **Build:** `npm run build` без warnings, TS strict зелёный.
- **Tokens discipline:** grep hex-цветов вне `src/styles/tokens.css` = 0.
- **No Tailwind/CSS-in-JS:** импорты/зависимости отсутствуют.
- **Commit:** рабочий коммит с описательным сообщением.

## Риски и как их ловим

| Риск | Митигация |
|---|---|
| Ассеты Figma истекают через 7 дней | Качаем в `src/assets/` в той же фазе, где получаем node |
| Визуальный паритет проваливается | `get_screenshot` в конце каждой фазы, правим до ≥ 95% до закрытия фазы |
| Хардкод hex вне tokens | Grep-проверка в acceptance каждой фазы |
| Отсрочка бэкенда формы заблокирует сдачу | Абстракция `sendContact()` с явной ошибкой — допустимое production-поведение для этого плана |
| Playwright visual baseline нестабилен на CI | Запуск через dev-сервер с фиксированным viewport, `animations: 'disabled'` в snapshot options |

## Ссылки

- `CLAUDE.md` — стек и конвенции (source of truth по инфраструктуре).
- `DESIGN.md` — Figma node IDs, токены, копирайт, компоненты (source of truth по визуалу).
- `docs/README.md` — индекс фаз.
- `docs/phase-01-foundation.md` … `docs/phase-08-playwright.md` — детальные фазовые чек-листы.
