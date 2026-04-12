# AF Venture Studio — Implementation Plan

Имплементация маркетингового лендинга. Full spec: [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md).

## Фазы

| # | Фаза | Файл | Что даёт |
|---|---|---|---|
| 1 | Foundation | [`phase-01-foundation.md`](./phase-01-foundation.md) | Astro + TS + Vercel adapter, токены, шрифты, i18n routing, Layout + GlowBackground |
| 2 | Chrome | [`phase-02-chrome.md`](./phase-02-chrome.md) | Header, Footer, container, breakpoints |
| 3 | Hero | [`phase-03-hero.md`](./phase-03-hero.md) | Button, Hero с заголовком и CTA |
| 4 | Services | [`phase-04-services.md`](./phase-04-services.md) | Chip, ServiceCard, 4 карточки |
| 5 | Cases | [`phase-05-cases.md`](./phase-05-cases.md) | CaseCard, CasesCarousel, 3 кейса |
| 6 | Form | [`phase-06-form.md`](./phase-06-form.md) | ContactForm + валидация + sendContact() абстракция |
| 7 | Polish & Deploy | [`phase-07-polish-deploy.md`](./phase-07-polish-deploy.md) | Responsive, SEO, Analytics, Lighthouse, production deploy |
| 8 | E2E & Visual | [`phase-08-playwright.md`](./phase-08-playwright.md) | Playwright smoke + visual regression |

## Правила для всех фаз

- Стек: Astro + TS strict + CSS Modules / scoped `<style>`. Без Tailwind, без CSS-in-JS.
- Цвета/шрифты/радиусы — только из `src/styles/tokens.css`.
- Тексты `en` — из `DESIGN.md`, тексты `ru` — плейсхолдеры до Фазы 7.
- **Перед версткой каждого UI-компонента (Фазы 2–6) обязательно инвокнуть `ui-ux-pro-max:ui-ux-pro-max`.**
- Перед коммитом фазы — `get_screenshot(nodeId)` сравнение с Figma.
- Ассеты Figma → `src/assets/` в той же фазе (ссылки живут 7 дней).
