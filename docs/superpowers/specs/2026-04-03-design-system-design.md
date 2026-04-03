# Design System — AF.VS Web

**Date:** 2026-04-03
**Scope:** Design tokens + reusable UI components. Existing page-level components (`Hero`, `Services`, etc.) are not touched.

---

## 1. Goals

- Centralize all design decisions (colors, spacing, typography, radii) into CSS custom properties in `global.css`
- Create a reusable UI component kit in `src/components/ui/` using native CSS + scoped `<style>` blocks
- Follow the project stack: Astro, Alpine.js, native CSS only — no Tailwind, no external libraries

---

## 2. Design Tokens (`src/styles/global.css`)

### Colors
```css
--color-bg: #0a0a0a;
--color-bg-footer: #0a0400;
--color-surface: #0a0f24;
--color-surface-2: #161616;
--color-border: rgba(255,255,255,0.08);
--color-border-hover: rgba(48,84,255,0.4);
--color-text: #ffffff;
--color-text-muted: rgba(255,255,255,0.6);
--color-text-dim: rgba(255,255,255,0.4);
--color-accent: #3054ff;
--color-accent-hover: #2040e0;
--color-accent-light: #b4c0ff;
```

### Typography
- Fonts: `Instrument Sans` (primary), `Instrument Serif` (accents)
- Minimum font size: **12px**

```css
--font-sans: 'Instrument Sans', sans-serif;
--font-serif: 'Instrument Serif', serif;
--font-mono: monospace;

--text-xs: 0.75rem;      /* 12px — minimum */
--text-sm: 0.875rem;     /* 14px */
--text-base: 1rem;       /* 16px */
--text-lg: 1.25rem;      /* 20px */
--text-xl: 1.5rem;       /* 24px */
--text-2xl: 2rem;        /* 32px */
--text-4xl: 3.5rem;      /* 56px */
--text-hero: clamp(3rem, 8vw, 6rem);
```

### Spacing — 8px grid, starts at 2px
```css
--space-px2: 0.125rem;   /* 2px  */
--space-1: 0.25rem;      /* 4px  */
--space-2: 0.5rem;       /* 8px  — 1 unit */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px — 2 units */
--space-6: 1.5rem;       /* 24px — 3 units */
--space-8: 2rem;         /* 32px — 4 units */
--space-10: 2.5rem;      /* 40px — 5 units */
--space-12: 3rem;        /* 48px — 6 units */
--space-16: 4rem;        /* 64px — 8 units */
--space-20: 5rem;        /* 80px — 10 units */
--space-24: 6rem;        /* 96px — 12 units */
```

### Border Radius
```css
--radius-sm: 0.5rem;     /* 8px  */
--radius-md: 1rem;       /* 16px */
--radius-lg: 2rem;       /* 32px */
--radius-full: 9999px;
```

### Layout
```css
--container: 1200px;
--container-wide: 1400px;
```

### Effects
```css
--glow-accent: 0 0 20px rgba(48,84,255,0.3);
--glow-white: 0 0 20px rgba(255,255,255,0.3);
```

### Transitions
```css
--ease-default: 300ms ease;
--ease-slow: 500ms ease;
--ease-enter: 1000ms ease-out;
```

---

## 3. Responsive Breakpoints

Mobile-first. Base styles = 320px. Media queries at:

| Token name | Value | Description |
|---|---|---|
| `--bp-xs` | 320px | small mobile (base, no query) |
| `--bp-sm` | 464px | mobile |
| `--bp-md` | 744px | tablet |
| `--bp-lg` | 984px | tablet landscape |
| `--bp-xl` | 1248px | desktop |

CSS custom properties cannot be used inside `@media`, so breakpoints are documented as comments and used directly as `min-width` values.

### Container utility class
```css
.container {
  width: 100%;
  max-width: var(--container);
  margin-inline: auto;
  padding-inline: var(--space-4);     /* 16px — mobile */
}
@media (min-width: 744px)  { .container { padding-inline: var(--space-6); } }
@media (min-width: 1248px) { .container { padding-inline: var(--space-8); } }
```

---

## 4. UI Components (`src/components/ui/`)

All components: Astro files with scoped `<style>` blocks, native CSS only, no Tailwind.

### 4.1 `Button.astro`
Pill-shaped CTA with a colored icon circle on the right.

**Props:**
```ts
interface Props {
  variant?: 'primary' | 'ghost';   // default: 'primary'
  href?: string;                    // renders <a> if provided, else <button>
  type?: 'submit' | 'button';      // default: 'button'
  icon?: 'arrow-down' | 'arrow-right' | 'none';  // default: 'arrow-right'
}
```

**Behavior:**
- `primary`: white pill background, dark text, blue icon circle
- `ghost`: transparent, white border, white text
- Hover: icon circle grows, subtle glow
- Renders `<a>` when `href` is set, `<button>` otherwise

---

### 4.2 `SectionTitle.astro`
Heading + optional subtitle. Consistent section header pattern.

**Props:**
```ts
interface Props {
  title: string;
  subtitle?: string;
  align?: 'center' | 'left';   // default: 'center'
}
```

**Behavior:**
- Title: gradient text (white → `--color-accent-light`), `--text-4xl`, `font-weight: 600`
- Subtitle: `--color-text-muted`, `--text-lg`
- `align` controls `text-align` and `align-items` of the flex container

---

### 4.3 `Card.astro`
Base card with border, background, hover effects. Accepts content via `<slot>`.

**Props:**
```ts
interface Props {
  variant?: 'default' | 'bento';   // default: 'default'
  hover?: boolean;                  // default: true
  class?: string;                   // passthrough for grid placement
}
```

**Behavior:**
- `default`: rounded card, `--color-surface` bg, `--color-border` border
- `bento`: same + ambient glow in bottom-right corner on hover, lift effect (`translateY(-4px)`)
- Hover state: border color → `--color-border-hover`, box-shadow → `--glow-accent`
- Gloss overlay (white gradient, top-left) fades in on hover

---

### 4.4 `Input.astro`
Underline-only text input. Used in contact forms.

**Props:**
```ts
interface Props {
  name: string;
  placeholder: string;
  type?: string;       // default: 'text'
  required?: boolean;  // default: false
}
```

**Behavior:**
- Background: transparent
- Border: bottom only, `--color-border`
- Focus: bottom border → `--color-text` (white)
- Placeholder: `--color-text-dim`
- Text: `--text-lg`, `--color-text`
- Transition: `--ease-default`

---

### 4.5 `Badge.astro`
Small monospace label. Used for service numbering (`01`, `02`...).

**Props:**
```ts
interface Props {
  label: string;
}
```

**Behavior:**
- Font: `--font-mono`, `--text-xs` (12px)
- Color: `--color-accent`, `opacity: 0.6`
- Letter-spacing: `0.15em`
- Inline, no background

---

### 4.6 `Tag.astro`
Small pill label for categorizing content (portfolio type, etc.).

**Props:**
```ts
interface Props {
  label: string;
  variant?: 'default' | 'outline';   // default: 'default'
}
```

**Behavior:**
- `default`: subtle `--color-surface` bg, `--color-text-dim` text
- `outline`: transparent bg, `--color-border` border, `--color-text-muted` text
- Size: `--text-xs`, `--space-1` vertical / `--space-3` horizontal padding
- Radius: `--radius-full`

---

## 5. File Structure After Implementation

```
src/
  components/
    ui/
      header.astro       ← exists, untouched
      Button.astro       ← new
      SectionTitle.astro ← new
      Card.astro         ← new
      Input.astro        ← new
      Badge.astro        ← new
      Tag.astro          ← new
  styles/
    global.css           ← replaced: full token system + container utility
```

---

## 6. Out of Scope

- Migrating existing page components (`Hero`, `Services`, `Portfolio`, `Calculator`, `Footer`) — separate task
- Alpine.js interactivity patterns — handled per-component as needed
- Dark/light mode toggle — single dark theme only
