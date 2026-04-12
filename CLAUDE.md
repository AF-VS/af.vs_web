# AF Venture Studio — Web

Маркетинговый лендинг студии AF Venture Studio. Деплой на Vercel.

- **Полный справочник по макету (токены, секции, node IDs, копирайт):** [`DESIGN.md`](./DESIGN.md)
- **Figma:** https://www.figma.com/design/L3skuk3D54hgX93qX7EIjd/AF.VS---web?node-id=277-734

## Стек

- **Astro** (static-first, минимум JS)
- **TypeScript** strict
- **CSS Modules** (`*.module.css`) + токены в `src/styles/tokens.css` через `:root`
- **`@fontsource/inter`** + **`@fontsource/space-grotesk`** для шрифтов
- **`astro:assets`** для изображений
- **`@astrojs/vercel`** как адаптер деплоя
- **Без Tailwind. Без CSS-in-JS.**

## Конвенции

- Единственный источник цветов/шрифтов/радиусов — CSS-переменные из `src/styles/tokens.css`. Хардкодить hex в компонентах запрещено.
- Компоненты — `.astro` файлы, стили через scoped `<style>` или `*.module.css` рядом с компонентом.
- TypeScript strict, `any` запрещён, `interface` для props.
- Mobile-first CSS. Брейкпоинты через `min-width`, значения — из `DESIGN.md`.
- Именование: `PascalCase` для компонентов и файлов компонентов.
- Изображения из Figma (`figma.com/api/mcp/asset/...`) живут 7 дней → скачивать в `src/assets/`.
- Все видимые тексты — из `DESIGN.md` (source of truth — Figma).

## Figma MCP workflow

Перед написанием новой секции / компонента:

1. Найди node ID секции в таблице `DESIGN.md`.
2. Получи контекст: `get_design_context(nodeId, fileKey="L3skuk3D54hgX93qX7EIjd")`.
3. Вернувшийся React+Tailwind-код используй **только как визуальный референс**. Транслируй в `.astro` + CSS Modules, применяя токены из `tokens.css`.
4. Сверяйся со скриншотом через `get_screenshot` перед коммитом.

## Важное

- **Figma — single source of truth** для визуала. Нашёл расхождение дизайна с требованиями — сначала спроси пользователя, не правь молча.
- Проект greenfield. Перед генерацией кода проверь текущее состояние `src/`.
- Любые отклонения от стека (Astro / CSS Modules / без Tailwind) — только после явного подтверждения пользователя.
