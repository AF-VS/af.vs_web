# Responsive Scaling Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the site scale proportionally from 320px phones to 4K monitors (2560px+), with safe-area padding and adaptive content.

**Architecture:** Replace all hardcoded px values with `clamp()` in design tokens. Update container system with 6 breakpoints. Add `.section-viewport` utility. Each component adopts token-based sizing instead of local hardcodes.

**Tech Stack:** Astro, CSS custom properties, `clamp()`, CSS Grid, no Tailwind.

---

## File Map

| Action | File | Responsibility |
|--------|------|----------------|
| Modify | `src/styles/tokens.css` | All design tokens — fonts, spacing, container, radius |
| Modify | `src/styles/global.css` | Container breakpoints, `.section-viewport` utility |
| Modify | `src/components/chrome/Header.astro` | Header layout, padding, burger sizing |
| Modify | `src/components/hero/Hero.astro` | Hero section viewport, title, CTA position |
| Modify | `src/components/services/Services.astro` | Services grid, gaps, padding |
| Modify | `src/components/services/ServiceCard.astro` | Card padding, body gap |
| Modify | `src/components/cases/CasesCarousel.astro` | Carousel viewport, header, arrows, track padding |
| Modify | `src/components/cases/CaseCard.astro` | Card width, photo height, padding, radius |
| Modify | `src/components/form/BrefForm.astro` | Form section viewport, wizard max sizes, mobile |
| Modify | `src/components/chrome/Footer.astro` | Footer padding, social button sizes, brand font |
| Modify | `src/components/ui/Button.astro` | Button padding-inline |
| Modify | `src/components/layout/GlowBackground.astro` | Grid size, orb size, blur |
| Modify | `src/components/services/Chip.astro` | Chip padding |

---

### Task 1: Update design tokens

**Files:**
- Modify: `src/styles/tokens.css:1-80`

- [ ] **Step 1: Replace container tokens with clamp-based values**

In `src/styles/tokens.css`, replace lines 67-79:

```css
  /* ── Container (mobile → desktop) ──────────── */
  --container-max-desktop: 1200px;
  --container-max-laptop:  936px;
  --container-padding-desktop: 120px;
  --container-padding-laptop:  24px;
  --container-padding-mobile:  16px;

  /* ── Header ────────────────────────────────── */
  --header-height: 96px;

  /* ── CTA Button ────────────────────────────── */
  --cta-width:  256px;
  --cta-height: 56px;
```

With:

```css
  /* ── Container ─────────────────────────────── */
  --container-padding: clamp(16px, 5vw, 200px);

  /* ── Spacing ───────────────────────────────── */
  --spacing-section: clamp(24px, 3.2vw, 64px);
  --spacing-card:    clamp(16px, 2.2vw, 40px);
  --spacing-grid:    clamp(16px, 2.5vw, 48px);

  /* ── Header ────────────────────────────────── */
  --header-height: clamp(64px, 6.5vw, 120px);

  /* ── CTA Button ────────────────────────────── */
  --cta-width:  clamp(200px, 17vw, 320px);
  --cta-height: clamp(44px, 3.8vw, 68px);
```

- [ ] **Step 2: Replace font-size tokens with clamp values**

In `src/styles/tokens.css`, replace lines 37-43:

```css
  /* ── Font sizes ────────────────────────────── */
  --font-size-h1:      62px;
  --font-size-h2:      48px;
  --font-size-h4:      32px;
  --font-size-h5:      26px;
  --font-size-body:    16px;
  --font-size-caption: 14px;
```

With:

```css
  /* ── Font sizes ────────────────────────────── */
  --font-size-h1:      clamp(36px, 4.2vw, 86px);
  --font-size-h2:      clamp(28px, 3.2vw, 66px);
  --font-size-h4:      clamp(22px, 2.2vw, 44px);
  --font-size-h5:      clamp(18px, 1.8vw, 36px);
  --font-size-body:    clamp(14px, 1.1vw, 20px);
  --font-size-caption: clamp(12px, 0.95vw, 18px);
```

- [ ] **Step 3: Replace radius-card with clamp**

In `src/styles/tokens.css`, replace line 60:

```css
  --radius-card: 32px;
```

With:

```css
  --radius-card: clamp(16px, 2.2vw, 40px);
```

- [ ] **Step 4: Verify build passes**

Run: `npm run build`
Expected: Build succeeds with no CSS errors.

- [ ] **Step 5: Commit**

```bash
git add src/styles/tokens.css
git commit -m "feat(tokens): replace fixed px with clamp() for responsive scaling"
```

---

### Task 2: Update global container and add section-viewport utility

**Files:**
- Modify: `src/styles/global.css:58-77`

- [ ] **Step 1: Replace container CSS with new breakpoint system**

In `src/styles/global.css`, replace lines 58-77:

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
```

With:

```css
/* ── Container ───────────────────────────────── */
.container {
  width: 100%;
  margin-inline: auto;
  padding-inline: var(--container-padding);
}

@media (min-width: 744px)  { .container { max-width: 700px; } }
@media (min-width: 984px)  { .container { max-width: 936px; } }
@media (min-width: 1248px) { .container { max-width: 1200px; } }
@media (min-width: 1920px) { .container { max-width: 1600px; } }
@media (min-width: 2560px) { .container { max-width: 2200px; } }

/* ── Section viewport ────────────────────────── */
.section-viewport {
  min-height: 100dvh;
}

@media (max-width: 743px) {
  .section-viewport {
    min-height: auto;
  }
}
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "feat(layout): add 6-breakpoint container system and section-viewport utility"
```

---

### Task 3: Update Header

**Files:**
- Modify: `src/components/chrome/Header.astro:161-465`

- [ ] **Step 1: Replace header__inner padding with single token**

In `Header.astro`, replace the `.header__inner` rule and its two media queries (lines 182-203):

```css
  .header__inner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 24px;
    height: var(--header-height);
    max-width: 1200px;
    margin-inline: auto;
    padding-inline: var(--container-padding-mobile);
  }

  @media (min-width: 768px) {
    .header__inner {
      padding-inline: var(--container-padding-laptop);
    }
  }

  @media (min-width: 1248px) {
    .header__inner {
      padding-inline: var(--container-padding-desktop);
    }
  }
```

With:

```css
  .header__inner {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    gap: 24px;
    height: var(--header-height);
    max-width: 2200px;
    margin-inline: auto;
    padding-inline: var(--container-padding);
  }
```

- [ ] **Step 2: Update burger size to use clamp**

In `Header.astro`, replace the `.burger` width/height (lines 318-327):

```css
  .burger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 44px;
    height: 44px;
    border-radius: 12px;
    color: var(--text-primary);
    transition: opacity 0.2s ease;
  }
```

With:

```css
  .burger {
    display: flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 3vw, 52px);
    height: clamp(36px, 3vw, 52px);
    border-radius: 12px;
    color: var(--text-primary);
    transition: opacity 0.2s ease;
  }
```

- [ ] **Step 3: Update mobile menu content padding**

In `Header.astro`, replace `padding` in `.mobile-menu__content` (line 382):

```css
    padding: 32px var(--container-padding-mobile);
```

With:

```css
    padding: 32px var(--container-padding);
```

- [ ] **Step 4: Update desktop breakpoint from 768px to 744px**

In `Header.astro`, replace the desktop breakpoint (line 448):

```css
  @media (min-width: 768px) {
```

With:

```css
  @media (min-width: 744px) {
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/chrome/Header.astro
git commit -m "feat(header): use clamp tokens, remove multi-breakpoint padding"
```

---

### Task 4: Update Hero

**Files:**
- Modify: `src/components/hero/Hero.astro`

- [ ] **Step 1: Add section-viewport class to hero markup**

In `Hero.astro`, replace line 14:

```html
<section class="hero">
```

With:

```html
<section class="hero section-viewport">
```

- [ ] **Step 2: Update hero styles**

In `Hero.astro`, replace the entire `<style>` block (lines 51-107):

```css
  .hero {
    position: relative;
    min-height: 100vh;
    min-height: 100dvh;
    margin-top: calc(-1 * var(--header-height));
    padding-top: calc(var(--header-height) + 64px);
    padding-bottom: 0;
    overflow: hidden;
  }

  .hero__inner {
    position: relative;
    z-index: 2;
  }

  .hero__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: clamp(40px, 6vw, var(--font-size-h1));
    line-height: var(--line-height-h1);
    letter-spacing: var(--letter-spacing-h1);
    color: var(--text-primary);
    max-width: 20ch;
    text-align: center;
    margin-inline: auto;
  }

  .hero__cta {
    position: absolute;
    bottom: 48px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }

  .accent { color: var(--primary-accent); }

  .hero__mountain {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: none;
    height: auto;
    z-index: 1;
    pointer-events: none;
    user-select: none;
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }

  @media (min-width: 1248px) {
    .hero { padding-top: calc(var(--header-height) + 96px); }
  }
```

With:

```css
  .hero {
    position: relative;
    margin-top: calc(-1 * var(--header-height));
    padding-top: calc(var(--header-height) + var(--spacing-section));
    padding-bottom: 0;
    overflow: hidden;
  }

  .hero__inner {
    position: relative;
    z-index: 2;
  }

  .hero__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--font-size-h1);
    line-height: var(--line-height-h1);
    letter-spacing: var(--letter-spacing-h1);
    color: var(--text-primary);
    max-width: 20ch;
    text-align: center;
    margin-inline: auto;
  }

  .hero__cta {
    position: absolute;
    bottom: clamp(32px, 4vh, 64px);
    left: 50%;
    transform: translateX(-50%);
    z-index: 2;
  }

  .accent { color: var(--primary-accent); }

  .hero__mountain {
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 80%;
    max-width: none;
    height: auto;
    z-index: 1;
    pointer-events: none;
    user-select: none;
    mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
    -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  }
```

Key changes: removed `min-height` (handled by `.section-viewport`), `font-size` uses token directly (already has clamp), padding uses `--spacing-section`, CTA bottom uses `clamp()`, removed desktop-only media query (token handles scaling).

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/Hero.astro
git commit -m "feat(hero): adopt section-viewport and clamp-based tokens"
```

---

### Task 5: Update Services + ServiceCard

**Files:**
- Modify: `src/components/services/Services.astro:54-141`
- Modify: `src/components/services/ServiceCard.astro:32-157`

- [ ] **Step 1: Add section-viewport class to Services markup**

In `Services.astro`, replace line 18:

```html
<section id="services" class="services">
```

With:

```html
<section id="services" class="services section-viewport">
```

- [ ] **Step 2: Update Services styles**

In `Services.astro`, replace the entire `<style>` block (lines 54-141):

```css
  .services {
    height: 100dvh;
    padding: 48px 0;
    box-sizing: border-box;
  }

  /* ── Grid ─────────────────────────────────────── */
  .grid {
    display: grid;
    gap: 24px;
    grid-template-columns: 1fr;
    height: 100%;
    padding-inline: var(--container-padding-mobile);
  }

  /* ── Card image positioning ───────────────────── */
  .grid :global(.card--build) {
    --img-right: -5%;
    --img-top: 50%;
    --img-width: 55%;
    --img-translate: 0 -50%;
    --img-mask: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, black 55%);
  }

  .grid :global(.card--ai) {
    --img-left: 50%;
    --img-top: 40%;
    --img-width: 75%;
    --img-translate: -50% -50%;
    --img-rotate: -170.43deg;
  }

  .grid :global(.card--advisory) {
    --img-left: 50%;
    --img-top: 40%;
    --img-width: 80%;
    --img-translate: -50% -50%;
  }

  .grid :global(.card--growth) {
    --img-left: 50%;
    --img-top: 42%;
    --img-width: 85%;
    --img-translate: -50% -50%;
  }

  /* ── Tablet (2 columns) ──────────────────────── */
  @media (min-width: 768px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 32px;
      padding-inline: var(--container-padding-laptop);
    }

    .grid :global(.card--build) {
      grid-column: 1 / -1;
    }
  }

  /* ── Desktop (asymmetric 3 columns) ──────────── */
  @media (min-width: 1248px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
      gap: 48px;
      padding-inline: var(--container-padding-desktop);
    }

    .grid :global(.card--build) {
      grid-column: 1 / 3;
    }

    .grid :global(.card--growth) {
      grid-column: 3;
      grid-row: 1 / 3;
    }

    .grid :global(.card--ai) {
      grid-column: 1;
      grid-row: 2;
    }

    .grid :global(.card--advisory) {
      grid-column: 2;
      grid-row: 2;
    }
  }
```

With:

```css
  .services {
    padding: var(--spacing-section) 0;
    box-sizing: border-box;
  }

  /* ── Grid ─────────────────────────────────────── */
  .grid {
    display: grid;
    gap: var(--spacing-grid);
    grid-template-columns: 1fr;
    height: 100%;
    padding-inline: var(--container-padding);
  }

  /* ── Card image positioning ───────────────────── */
  .grid :global(.card--build) {
    --img-right: -5%;
    --img-top: 50%;
    --img-width: 55%;
    --img-translate: 0 -50%;
    --img-mask: linear-gradient(to right, transparent 0%, rgba(0,0,0,0.4) 25%, black 55%);
  }

  .grid :global(.card--ai) {
    --img-left: 50%;
    --img-top: 40%;
    --img-width: 75%;
    --img-translate: -50% -50%;
    --img-rotate: -170.43deg;
  }

  .grid :global(.card--advisory) {
    --img-left: 50%;
    --img-top: 40%;
    --img-width: 80%;
    --img-translate: -50% -50%;
  }

  .grid :global(.card--growth) {
    --img-left: 50%;
    --img-top: 42%;
    --img-width: 85%;
    --img-translate: -50% -50%;
  }

  /* ── Tablet (2 columns) ──────────────────────── */
  @media (min-width: 744px) {
    .grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .grid :global(.card--build) {
      grid-column: 1 / -1;
    }
  }

  /* ── Desktop (asymmetric 3 columns) ──────────── */
  @media (min-width: 1248px) {
    .grid {
      grid-template-columns: repeat(3, 1fr);
      grid-template-rows: 1fr 1fr;
    }

    .grid :global(.card--build) {
      grid-column: 1 / 3;
    }

    .grid :global(.card--growth) {
      grid-column: 3;
      grid-row: 1 / 3;
    }

    .grid :global(.card--ai) {
      grid-column: 1;
      grid-row: 2;
    }

    .grid :global(.card--advisory) {
      grid-column: 2;
      grid-row: 2;
    }
  }
```

Key changes: `height: 100dvh` removed (handled by `.section-viewport`), gap uses `--spacing-grid`, padding uses `--container-padding`, removed gap/padding overrides from media queries (tokens handle scaling).

- [ ] **Step 3: Update ServiceCard padding**

In `ServiceCard.astro`, replace the `.card` padding (line 43):

```css
    padding: 32px;
```

With:

```css
    padding: var(--spacing-card);
```

- [ ] **Step 4: Update ServiceCard body gap**

In `ServiceCard.astro`, replace the `.card__body` gap (line 122):

```css
    gap: 24px;
```

With:

```css
    gap: var(--spacing-card);
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/services/Services.astro src/components/services/ServiceCard.astro
git commit -m "feat(services): adopt responsive tokens for grid, padding, and gaps"
```

---

### Task 6: Update CasesCarousel + CaseCard

**Files:**
- Modify: `src/components/cases/CasesCarousel.astro:31-138`
- Modify: `src/components/cases/CaseCard.astro:48-177`

- [ ] **Step 1: Add section-viewport class to Cases markup**

In `CasesCarousel.astro`, replace line 9:

```html
<section id="cases" class="cases">
```

With:

```html
<section id="cases" class="cases section-viewport">
```

- [ ] **Step 2: Update CasesCarousel styles**

In `CasesCarousel.astro`, replace the entire `<style>` block (lines 31-138):

```css
  .cases {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: clip;
  }

  .cases__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: var(--container-max-desktop);
    margin-inline: auto;
    padding-inline: var(--container-padding-mobile);
    margin-bottom: 48px;
  }

  @media (min-width: 768px) {
    .cases__header {
      padding-inline: var(--container-padding-laptop);
    }
  }

  @media (min-width: 1248px) {
    .cases__header {
      padding-inline: 0;
    }
  }

  .cases__heading {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--font-size-h4);
    line-height: var(--line-height-h2);
    letter-spacing: var(--letter-spacing-h2);
    color: var(--text-primary);
  }

  @media (min-width: 768px) {
    .cases__heading {
      font-size: var(--font-size-h2);
    }
  }

  .cases__nav {
    display: flex;
    gap: 16px;
  }

  @media (min-width: 768px) {
    .cases__nav {
      gap: 48px;
    }
  }

  .cases__arrow {
    width: 48px;
    height: 48px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 12px;
    transition: opacity 0.15s ease;
  }

  .cases__arrow[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cases__track {
    display: flex;
    gap: 48px;
    overflow-x: auto;
    overflow-y: visible;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    padding-left: calc(var(--container-padding-mobile) - 24px);
    padding-right: var(--container-padding-mobile);
    padding-block: 48px;
    margin-block: -48px;
  }

  .cases__track::-webkit-scrollbar {
    display: none;
  }

  @media (min-width: 768px) {
    .cases__track {
      padding-left: calc(var(--container-padding-laptop) - 24px);
      padding-right: var(--container-padding-laptop);
    }
  }

  @media (min-width: 1248px) {
    .cases__track {
      padding-left: calc((100% - var(--container-max-desktop)) / 2 - 24px);
      padding-right: 48px;
    }
  }
```

With:

```css
  .cases {
    display: flex;
    flex-direction: column;
    justify-content: center;
    overflow: clip;
  }

  .cases__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    max-width: 2200px;
    margin-inline: auto;
    padding-inline: var(--container-padding);
    margin-bottom: var(--spacing-section);
  }

  .cases__heading {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: var(--font-size-h4);
    line-height: var(--line-height-h2);
    letter-spacing: var(--letter-spacing-h2);
    color: var(--text-primary);
  }

  @media (min-width: 744px) {
    .cases__heading {
      font-size: var(--font-size-h2);
    }
  }

  .cases__nav {
    display: flex;
    gap: var(--spacing-grid);
  }

  .cases__arrow {
    width: clamp(36px, 3.2vw, 60px);
    height: clamp(36px, 3.2vw, 60px);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: none;
    border: none;
    color: var(--text-primary);
    cursor: pointer;
    padding: 8px;
    transition: opacity 0.15s ease;
  }

  .cases__arrow[disabled] {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .cases__track {
    display: flex;
    gap: var(--spacing-grid);
    overflow-x: auto;
    overflow-y: visible;
    scroll-snap-type: x mandatory;
    scroll-behavior: smooth;
    scrollbar-width: none;
    padding-left: var(--container-padding);
    padding-right: var(--container-padding);
    padding-block: var(--spacing-section);
    margin-block: calc(-1 * var(--spacing-section));
  }

  .cases__track::-webkit-scrollbar {
    display: none;
  }
```

Key changes: removed `min-height: 100vh` (handled by `.section-viewport`), all padding/gap uses tokens, removed 3 media queries for padding, arrows use `clamp()`, header max-width raised to 2200px.

- [ ] **Step 3: Update CaseCard sizing**

In `CaseCard.astro`, replace the `.case` rule (lines 49-65):

```css
  .case {
    flex: 0 0 auto;
    width: min(85vw, 560px);
    border-radius: var(--radius-card);
    overflow: hidden;
    background: rgba(10, 22, 38, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: none;
    display: flex;
    flex-direction: column;
    gap: 24px;
    padding: var(--card-padding);
    scroll-snap-align: start;
    position: relative;
    transition: box-shadow 0.4s ease;
  }
```

With:

```css
  .case {
    flex: 0 0 auto;
    width: min(85vw, clamp(400px, 38vw, 720px));
    border-radius: var(--radius-card);
    overflow: hidden;
    background: rgba(10, 22, 38, 0.55);
    backdrop-filter: blur(24px);
    -webkit-backdrop-filter: blur(24px);
    border: none;
    display: flex;
    flex-direction: column;
    gap: var(--spacing-card);
    padding: var(--spacing-card);
    scroll-snap-align: start;
    position: relative;
    transition: box-shadow 0.4s ease;
  }
```

- [ ] **Step 4: Update CaseCard photo height and radius**

In `CaseCard.astro`, replace the `.case__photo` rule (lines 106-111):

```css
  .case__photo {
    position: relative;
    height: 380px;
    overflow: hidden;
    border-radius: 22px;
  }
```

With:

```css
  .case__photo {
    position: relative;
    height: clamp(240px, 26vw, 480px);
    overflow: hidden;
    border-radius: var(--radius-card);
  }
```

- [ ] **Step 5: Update CaseCard meta gap**

In `CaseCard.astro`, replace the `.case__meta` gap (line 156):

```css
    gap: 32px;
```

With:

```css
    gap: var(--spacing-card);
```

- [ ] **Step 6: Update carousel script step calculation**

In `CasesCarousel.astro`, replace the step function (lines 150-153):

```javascript
      const step = () => {
        const card = track.firstElementChild as HTMLElement | null;
        return card ? card.offsetWidth + 48 : 520;
      };
```

With:

```javascript
      const step = () => {
        const card = track.firstElementChild as HTMLElement | null;
        if (!card) return 520;
        const gap = parseFloat(getComputedStyle(track).gap) || 48;
        return card.offsetWidth + gap;
      };
```

- [ ] **Step 7: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/cases/CasesCarousel.astro src/components/cases/CaseCard.astro
git commit -m "feat(cases): responsive carousel with clamp-based card/arrow sizing"
```

---

### Task 7: Update BrefForm

**Files:**
- Modify: `src/components/form/BrefForm.astro`

- [ ] **Step 1: Add section-viewport class to BrefForm markup**

In `BrefForm.astro`, replace line 29:

```html
<section id="contact" class="bref-section">
```

With:

```html
<section id="contact" class="bref-section section-viewport">
```

- [ ] **Step 2: Update bref-section styles**

In `BrefForm.astro`, replace lines 468-475:

```css
  .bref-section {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 48px;
  }
```

With:

```css
  .bref-section {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: var(--spacing-section);
  }
```

- [ ] **Step 3: Update wizard card max dimensions**

In `BrefForm.astro`, replace lines 478-488:

```css
  .bref-wizard {
    position: relative;
    display: flex;
    width: 100%;
    max-width: 1200px;
    height: 100%;
    max-height: 720px;
    min-height: 520px;
    border-radius: var(--radius-card);
    overflow: hidden;
  }
```

With:

```css
  .bref-wizard {
    position: relative;
    display: flex;
    width: 100%;
    max-width: 1600px;
    height: 100%;
    max-height: clamp(520px, 60vh, 900px);
    min-height: 520px;
    border-radius: var(--radius-card);
    overflow: hidden;
  }
```

- [ ] **Step 4: Update bref-title clamp to use token**

In `BrefForm.astro`, replace line 533:

```css
    font-size: clamp(24px, 2.2vw, var(--font-size-h4));
```

With:

```css
    font-size: var(--font-size-h4);
```

The token `--font-size-h4` is now `clamp(22px, 2.2vw, 44px)`, so the local clamp is redundant.

- [ ] **Step 5: Update tablet media query breakpoint**

In `BrefForm.astro`, replace line 959:

```css
  @media (max-width: 1247px) {
    .bref-section { padding: 32px 24px; }
```

With:

```css
  @media (max-width: 1247px) {
    .bref-section { padding: var(--spacing-card); }
```

- [ ] **Step 6: Update mobile media query**

In `BrefForm.astro`, replace lines 965-969:

```css
  @media (max-width: 767px) {
    .bref-section {
      height: auto;
      min-height: 100vh;
      padding: 24px 16px;
    }
```

With:

```css
  @media (max-width: 743px) {
    .bref-section {
      padding: var(--container-padding);
    }
```

Also replace line 984 (`.bref-right` padding):

```css
      padding: 24px;
```

With:

```css
      padding: var(--spacing-card);
```

And replace the mobile `.bref-step-title` override (line 1002):

```css
    .bref-step-title { font-size: 24px; }
```

Remove this line entirely — the token `--font-size-h4` now handles scaling automatically via `clamp()`.

- [ ] **Step 7: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 8: Commit**

```bash
git add src/components/form/BrefForm.astro
git commit -m "feat(bref): adopt viewport utility and responsive token sizing"
```

---

### Task 8: Update Footer

**Files:**
- Modify: `src/components/chrome/Footer.astro:83-197`

- [ ] **Step 1: Update footer padding and margin**

In `Footer.astro`, replace lines 84-90:

```css
  .footer {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding-block: 48px;
    margin-top: 96px;
    background: var(--surface-card);
  }
```

With:

```css
  .footer {
    width: 100vw;
    margin-left: calc(50% - 50vw);
    padding-block: var(--spacing-section);
    margin-top: calc(var(--spacing-section) * 1.5);
    background: var(--surface-card);
  }
```

- [ ] **Step 2: Update social button sizes**

In `Footer.astro`, replace the `.social-btn` sizing (lines 129-134):

```css
  .social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
```

With:

```css
  .social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: clamp(36px, 3vw, 52px);
    height: clamp(36px, 3vw, 52px);
```

- [ ] **Step 3: Update footer brand font-size**

In `Footer.astro`, replace line 116:

```css
    font-size: 20px;
```

With:

```css
    font-size: var(--font-size-body);
```

- [ ] **Step 4: Update desktop breakpoint from 768px to 744px**

In `Footer.astro`, replace both `@media (min-width: 768px)` occurrences (lines 106 and 162):

```css
  @media (min-width: 768px) {
```

With (both occurrences):

```css
  @media (min-width: 744px) {
```

- [ ] **Step 5: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/components/chrome/Footer.astro
git commit -m "feat(footer): use responsive tokens for spacing and sizing"
```

---

### Task 9: Update Button + Chip

**Files:**
- Modify: `src/components/ui/Button.astro:18-49`
- Modify: `src/components/services/Chip.astro:11-32`

- [ ] **Step 1: Update Button padding-inline**

In `Button.astro`, replace line 25:

```css
    padding-inline: 32px;
```

With:

```css
    padding-inline: clamp(20px, 2.2vw, 40px);
```

- [ ] **Step 2: Update Chip padding**

In `Chip.astro`, replace line 15:

```css
    padding: 4px 16px;
```

With:

```css
    padding: 4px clamp(10px, 1.1vw, 20px);
```

- [ ] **Step 3: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/ui/Button.astro src/components/services/Chip.astro
git commit -m "feat(ui): responsive padding for Button and Chip"
```

---

### Task 10: Update GlowBackground

**Files:**
- Modify: `src/components/layout/GlowBackground.astro:15-48`

- [ ] **Step 1: Update grid and orb sizes**

In `GlowBackground.astro`, replace the entire `<style>` block (lines 15-48):

```css
  .glow {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: 80px 80px;
  }

  .orb {
    position: absolute;
    width: 448px;
    height: 448px;
    border-radius: 50%;
    background: radial-gradient(circle, var(--primary-default) 0%, transparent 70%);
    opacity: 0.35;
    filter: blur(120px);
  }

  .orb-1 { top: 5%;  left: 10%;  }
  .orb-2 { top: 25%; right: 15%; }
  .orb-3 { top: 55%; left: 35%;  }
  .orb-4 { top: 75%; right: 5%;  }
  .orb-5 { top: 90%; left: 20%;  }
```

With:

```css
  .glow {
    position: fixed;
    inset: 0;
    z-index: -1;
    overflow: hidden;
    pointer-events: none;
  }

  .grid {
    position: absolute;
    inset: 0;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: clamp(40px, 5.5vw, 100px) clamp(40px, 5.5vw, 100px);
  }

  .orb {
    position: absolute;
    width: clamp(200px, 30vw, 600px);
    height: clamp(200px, 30vw, 600px);
    border-radius: 50%;
    background: radial-gradient(circle, var(--primary-default) 0%, transparent 70%);
    opacity: 0.35;
    filter: blur(clamp(60px, 8vw, 160px));
  }

  .orb-1 { top: 5%;  left: 10%;  }
  .orb-2 { top: 25%; right: 15%; }
  .orb-3 { top: 55%; left: 35%;  }
  .orb-4 { top: 75%; right: 5%;  }
  .orb-5 { top: 90%; left: 20%;  }
```

- [ ] **Step 2: Verify build passes**

Run: `npm run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/GlowBackground.astro
git commit -m "feat(glow): scale grid and orb sizes with viewport"
```

---

### Task 11: Final verification

- [ ] **Step 1: Full build**

Run: `npm run build`
Expected: Build succeeds with zero warnings related to CSS.

- [ ] **Step 2: Dev server visual check**

Run: `npm run dev`

Visually verify at these widths (browser DevTools responsive mode):
- 320px (small phone)
- 744px (tablet)
- 984px (laptop)
- 1248px (desktop)
- 1920px (2K)
- 2560px (4K)

Check: safe-area padding present on all sizes, text scales smoothly, sections fill viewport on desktop+ and flow naturally on mobile, no horizontal overflow.

- [ ] **Step 3: Final commit if any fixes needed**

```bash
git add -A
git commit -m "fix(responsive): address visual issues from verification"
```
