# Audit Remediation Plans — Index (2026-04-14)

Пять последовательных планов, покрывающих все 32 недочёта из аудита от 2026-04-14.

## Порядок выполнения

1. **[Phase 1 — Cleanup](./2026-04-14-phase-1-cleanup.md)** — удаление мёртвого кода и дубликатов, базовая гигиена репо.
2. **[Phase 2 — API Hardening](./2026-04-14-phase-2-api-hardening.md)** — безопасность `/api/contact`, антибот, внешний rate-limit, корректная схема БД, XSS-паттерн в Hero.
3. **[Phase 3 — Tokens & DRY](./2026-04-14-phase-3-tokens-dry.md)** — токенизация хардкод-цветов, унификация трёх страниц, типы `tags`, `image`/`video` в dict, декомпозиция BrifForm.
4. **[Phase 4 — SEO, Assets & Config](./2026-04-14-phase-4-seo-assets-config.md)** — hreflang, og:image, JSON-LD, robots.txt, favicon-стек, Node-пин, Lenis → native scroll, пережатие тяжёлых картинок.
5. **[Phase 5 — A11y & Polish](./2026-04-14-phase-5-a11y-polish.md)** — mobile menu как dialog с focus trap, idempotent init Services-скрипта, Button loading/disabled, `color-scheme: dark`.

Каждая фаза самодостаточна: можно остановиться на любом этапе, `main` остаётся работоспособным.

## Матрица покрытия 32 недочётов

| # | Недочёт | Приоритет | Фаза | Task |
|---|---------|-----------|------|------|
| 1 | Дублирование серверного кода + мёртвые модули | 🔴 | 1 | 1 |
| 2 | In-memory rate-limit не работает в serverless | 🔴 | 2 | 3, 5 |
| 3 | Форма без антибот-защиты | 🔴 | 2 | 4, 5 |
| 4 | `process.env` vs `import.meta.env` рассинхрон | 🔴 | 2 | 1, 3, 5 |
| 5 | `tsconfig.server.json` — мёртвый файл | 🔴 | 1 | 2 |
| 6 | XSS-риск в Hero (`set:html` + split/join) | 🔴 | 2 | 7 |
| 7 | Хардкод цветов в 12 файлах (39 вхождений) | 🟠 | 3 | 1, 2, 3, 4, 5 |
| 8 | Рассинхрон со стеком (Drizzle заявлен удалён, фактически есть) | 🟠 | 2 | 1, 6 |
| 9 | Нет hreflang для мультиязычного сайта | 🟠 | 4 | 1, 2 |
| 10 | Нет og:image и JSON-LD | 🟠 | 4 | 1 |
| 11 | Node.js mismatch (24 лок / 20 CI / 22 Vercel) | 🟠 | 4 | 5 |
| 12 | `robots.txt` разрешает `/api/` | 🟠 | 4 | 3 |
| 13 | `output: 'static'` + `prerender=false` неявный server | 🟠 | 4 | 2 |
| 14 | Раздутые devDependencies | 🟠 | 1, 4 | 1/7, 4/6 |
| 15 | Три почти идентичные `index.astro` | 🟡 | 3 | 7 |
| 16 | Несогласованность типов `tags` | 🟡 | 3 | 6 |
| 17 | `images[]` ↔ `dict.cases.items[]` по индексу | 🟡 | 3 | 6 |
| 18 | Неиспользуемый `AnimatedContent` + `picture.jpeg` | 🟡 | 1 | 3, 4 |
| 19 | `BrifForm.astro` 1000+ строк | 🟡 | 3 | 8 |
| 20 | Тяжёлые исходники ассетов (bg 4.2M, mountain 1.8M, case-1 1.4M) | 🟡 | 4 | 7 |
| 21 | Drizzle без миграций | 🟡 | 2 | 6 |
| 22 | Mobile menu без dialog/focus-trap | 🟡 | 5 | 1 |
| 23 | Слабая валидация на сервере (`MAX_FIELD_LEN=500`) | 🟡 | 2 | 2, 5 |
| 24 | `created_at` как `text`, а не integer timestamp | 🟡 | 2 | 1, 5 |
| 25 | Дубликат `.vercel` в `.gitignore` | 🟡 | 1 | 5 |
| 26 | Services scroll listener без `astro:page-load` | 🟢 | 5 | 2 |
| 27 | Lenis (~12 KB gzip) только ради smooth scroll | 🟢 | 4 | 6 |
| 28 | `tsconfig.json` include scope | 🟢 | 4 | 8 |
| 29 | Favicon-стек неполный (apple-touch-icon, manifest) | 🟢 | 4 | 1, 4 |
| 30 | `theme-color` / `color-scheme` | 🟢 | 5 | 4 |
| 31 | `Button` без `loading`/`disabled`/`aria-busy` | 🟢 | 5 | 3 |
| 32 | `.DS_Store` файлы в рабочем дереве | 🟢 | 1 | 6 |

## Итого

- 🔴 Критические (6 шт.) — полностью в Phase 1–2.
- 🟠 Высокие (8 шт.) — распределены по Phase 1, 2, 3, 4.
- 🟡 Средние (11 шт.) — Phase 1, 2, 3, 4, 5.
- 🟢 Низкие (7 шт.) — Phase 4, 5.

**32 из 32 недочётов покрыты планами.**

## Формат

Все планы следуют правилам skill'а `superpowers:writing-plans`:
- `docs/superpowers/plans/YYYY-MM-DD-*.md`
- Bite-sized steps (2–5 минут каждый)
- Точные пути файлов, полный код в каждом шаге
- Точные команды и ожидаемый вывод
- TDD-стиль, частые коммиты
- Self-contained: исполнитель может не иметь контекста разговора

## Запуск

Рекомендуемый путь — `superpowers:subagent-driven-development`: fresh subagent per task, two-stage review. Альтернатива — `superpowers:executing-plans`: batch execution с чекпойнтами в той же сессии.
