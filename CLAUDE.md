# Project Stack

## Framework
- **Astro 6.x** — SSG by default; use Astro Islands for interactive components

## Language
- **TypeScript** everywhere — no plain JS files

## UI Components
- Hand-written Astro components, no external component library
- Components live in `src/components/ui/`
- Build from scratch using native CSS

## Interactivity
- **Alpine.js** — scroll effects, navigation state, toggling, simple client-side logic
- Use `x-data`, `x-show`, `x-on`, `@scroll.window` directives
- Avoid `<script>` blocks for things Alpine can handle

## Animations
- **Intersection Observer API** + CSS animations — no library needed
- Define `@keyframes` in scoped `<style>` or `global.css`
- Add/remove classes via Alpine.js or vanilla Intersection Observer
- Do NOT use "Astro Reveal" — it does not exist as a real package

## Styling
- **Native CSS only** — no Tailwind, no CSS-in-JS, no utility frameworks
- Scoped `<style>` blocks in `.astro` files for component styles
- `src/styles/global.css` for design tokens and base reset
- CSS custom properties for the design system:
  ```css
  :root {
    /* Colors */
    --color-bg: #0a0a0a;
    --color-surface: #161616;
    --color-border: rgba(255,255,255,0.1);
    --color-text: #ffffff;
    --color-text-muted: rgba(255,255,255,0.5);
    --color-accent: #ffffff;

    /* Typography */
    --font-sans: 'Instrument Sans', sans-serif;
    --font-serif: 'Instrument Serif', serif;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.25rem;
    --font-size-xl: 1.5rem;
    --font-size-2xl: 2rem;
    --font-size-4xl: 3.5rem;

    /* Spacing */
    --space-1: 0.25rem;
    --space-2: 0.5rem;
    --space-4: 1rem;
    --space-6: 1.5rem;
    --space-8: 2rem;
    --space-12: 3rem;
    --space-16: 4rem;
    --space-24: 6rem;

    /* Layout */
    --container-max: 1200px;
    --radius-sm: 0.5rem;
    --radius-md: 1rem;
    --radius-full: 9999px;
  }
  ```

## Fonts
- Instrument Sans (primary)
- Instrument Serif (accents)
- Loaded via Google Fonts in `Layout.astro`

## Icons
- **iconoir** — SVG icons, use inline or as Astro components
- Install: `npm install iconoir` or copy SVG inline

## Forms
- **Astro Actions** (built into Astro 6) — type-safe server functions, no ORM needed
- For MVP: Astro Actions + fetch to external service (Formspree, Basin, Resend)
- Drizzle ORM + Neon only if persistent storage becomes a real requirement

## i18n
- Custom solution in `src/i18n/` — `ui.ts` (dictionaries) + `utils.ts` (helpers)
- Supported languages: `en` (default), `ru`
- Routes: `/` (EN), `/ru/` (RU)

## Project Structure
```
src/
  components/
    ui/           ← hand-written reusable UI components
  layouts/
    Layout.astro
  pages/
    index.astro
    ru/index.astro
  i18n/
    ui.ts
    utils.ts
  styles/
    global.css    ← CSS custom properties, base reset, @keyframes
```

## Key Rules
- No Tailwind — ever
- No React/Vue/Svelte — Astro components + Alpine.js only
- No external component libraries (bejamas/ui requires Tailwind — skip it)
- Keep SSG as default; add `output: 'server'` only when Astro Actions need it
- Scoped `<style>` in `.astro` files preferred over global CSS
- Use CSS custom properties (tokens) — never hardcode colors or spacing
