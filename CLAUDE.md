# AF Venture Studio — Web

Маркетинговый лендинг студии AF Venture Studio. Деплой на Vercel.

- **Полный справочник по макету (токены, секции, node IDs, копирайт):** [`DESIGN.md`](./DESIGN.md)
- **Figma:** https://www.figma.com/design/L3skuk3D54hgX93qX7EIjd/AF.VS---web?node-id=277-734

## Стек

- **Astro 5**, `output: 'server'`, адаптер `@astrojs/vercel`. Node 22. Клиентский JS — минимум.
- **TypeScript** strict
- **CSS Modules** (`*.module.css`) + токены в `src/styles/tokens.css` через `:root`
- **`@fontsource/inter`** + **`@fontsource/space-grotesk`** для шрифтов
- **`astro:assets`** для изображений
- **i18n:** `en` (дефолт, без префикса), `ru`, `uz`. Словари — `src/i18n/{en,ru,uz}.ts`. Конфиг — `astro.config.mjs`, sitemap через `@astrojs/sitemap`.
- **Контактная форма** (`src/pages/api/contact.ts`): Zod (`contactSchema.ts`) → Upstash rate-limit (`rateLimit.ts`) → Drizzle + libSQL (`src/db/`) → Telegram (`telegram.ts`).
- **Без Tailwind. Без CSS-in-JS. Без React.**

## Команды

```bash
npm run dev            # astro dev
npm run check          # astro check (типы)
npm run build          # сборка под Vercel
npm run db:generate    # drizzle-kit generate
npm run db:migrate     # drizzle-kit migrate
```

## Переменные окружения

`.env.local` (prod — в Vercel):
- `TURSO_DATABASE_URL`, `TURSO_AUTH_TOKEN` — libSQL
- `UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN` — rate-limit
- `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID` — уведомления
- `SITE_URL` — переопределение canonical origin (по умолчанию берётся из `astro.config.mjs`)

## Конвенции

- Единственный источник цветов/шрифтов/радиусов — CSS-переменные из `src/styles/tokens.css`. Хардкодить hex в компонентах запрещено.
- Компоненты — `.astro` файлы, стили через scoped `<style>` или `*.module.css` рядом с компонентом.
- TypeScript strict, `any` запрещён, `interface` для props.
- Mobile-first CSS. Брейкпоинты через `min-width`, значения — из `DESIGN.md`.
- Именование: `PascalCase` для компонентов и файлов компонентов.
- Метаданные страниц (`<title>`, meta description, OG, Twitter) строятся через `src/lib/seoMeta.ts` из `dict.seo.*`. Хардкодить `<title>` или `<meta>` в шаблонах запрещено — добавляй ключи в `src/i18n/{en,ru,uz}.ts` и расширяй `buildHomeMeta` / соседние builder'ы.
- JSON-LD структурированные данные генерируются только через хелперы в `src/lib/schema.ts` (`organizationSchema`, `websiteSchema`, и т.д.). Инлайнить `<script type="application/ld+json">` с сырыми литералами в компонентах — нельзя. Кросс-ссылки — через `@id`-фрагменты.
- Канонический origin задаётся один раз в `astro.config.mjs` (поле `site`). В `.astro`-шаблонах использовать `Astro.site!`, в серверных роутах (`src/pages/api/*.ts`) — `SITE_URL` из `src/lib/site.ts`. Не хардкодить `https://afvs.dev` в строках.
- Изображения из Figma (`figma.com/api/mcp/asset/...`) живут 7 дней → скачивать в `src/assets/`.
- Все видимые тексты — из `DESIGN.md` (source of truth — Figma).

## Git & GitHub

### Branching — GitHub Flow

- **`main`** — production. Деплоится на Vercel автоматически.
- Для любой работы — создавать **feature-ветку** от `main`.
- Имя ветки: `type/short-description` — например `feat/contact-v2`, `fix/og-image`, `chore/deps-update`.
- Прямые push в `main` запрещены branch protection. Весь код попадает через **Pull Request**.
- PR мержится **только squash merge** (настроено на уровне репо). Ветка удаляется автоматически.

### Коммиты — Conventional Commits

Формат строго enforced через **commitlint + Husky** (`.husky/commit-msg`).

```
type(scope): описание на английском, lowercase, без точки в конце
```

Допустимые типы: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `chore`, `ci`, `a11y`.

Примеры:
```
feat(seo): add JSON-LD BreadcrumbList schema
fix(form): prevent double submit on slow connections
chore(deps): bump astro to 5.2
a11y(nav): add skip-to-content link
refactor(tokens): extract spacing scale to custom properties
ci: add typecheck job before deploy
```

Правила:
- Максимум 100 символов в заголовке.
- `scope` — опциональный, но рекомендуется для контекста.
- Body (через пустую строку) — для объяснения "зачем", если не очевидно из заголовка.
- **Не добавлять** `Co-Authored-By`, AI-теги или любые автоматические подписи. Коммиты — персональные.

### CI / CD

Workflow `.github/workflows/deploy.yml` содержит два job:

1. **`check`** (Typecheck & Build) — `npm run check` + `npm run build`. Обязательный status check для merge в `main`.
2. **`deploy`** — деплой на Vercel. Запускается только после успешного `check`. На PR оставляет комментарий с preview URL.

### Pull Request

1. Создать feature-ветку: `git checkout -b feat/my-feature`.
2. Коммитить атомарно — одна логическая единица = один коммит.
3. Запушить: `git push -u origin feat/my-feature`.
4. Создать PR в `main`. В описании:
   - **Summary** — что и зачем (1–3 bullet points).
   - **Test plan** — как проверить.
5. Дождаться прохождения `Typecheck & Build`.
6. Squash merge. Заголовок PR = итоговый коммит в `main`, поэтому он тоже должен следовать Conventional Commits.

### Релизы

- Теги — semver: `vX.Y.Z`.
- Создавать через `gh release create vX.Y.Z --generate-notes` или с кастомными notes.
- `feat` → minor bump, `fix` → patch bump, breaking change → major bump.

## Figma MCP workflow

Перед написанием новой секции / компонента:

1. Найди node ID секции в таблице `DESIGN.md`.
2. Получи контекст: `get_design_context(nodeId, fileKey="L3skuk3D54hgX93qX7EIjd")`.
3. Вернувшийся React+Tailwind-код используй **только как визуальный референс**. Транслируй в `.astro` + CSS Modules, применяя токены из `tokens.css`.
4. Сверяйся со скриншотом через `get_screenshot` перед коммитом.

## Важное

- **Figma — single source of truth** для визуала. Нашёл расхождение дизайна с требованиями — сначала спроси пользователя, не правь молча.
- Перед генерацией кода проверяй текущее состояние `src/` — проект уже не greenfield.
- Канонический домен — **`afvs.dev`**. Превью-домены `*.vercel.app` должны отдавать `noindex`.
- Любые отклонения от стека (Astro / CSS Modules / server-mode / без Tailwind / без React) — только после явного подтверждения пользователя.
