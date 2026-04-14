# Starfield Overlay Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a subtle, site-wide twinkling-star canvas overlay with light parallax on scroll, integrated into the existing `GlowBackground` component.

**Architecture:** New zero-prop Astro component `Starfield.astro` containing a `<canvas>` + client-side TypeScript module. Canvas draws ~40–90 tiny white stars with per-star twinkle phase and reads `window.scrollY` each RAF tick for parallax. Mounted inside `GlowBackground.astro` between the grid layer and the orb layer via internal z-index. Respects `prefers-reduced-motion` (single static frame, no RAF).

**Tech Stack:** Astro 5, TypeScript strict, HTML `<canvas>` 2D, `requestAnimationFrame`, Page Visibility API.

**Spec reference:** `docs/superpowers/specs/2026-04-14-starfield-overlay-design.md`

**Verification strategy:** No unit-test framework is configured in this project (only Playwright for e2e). This plan uses `astro check` + `astro build` for type/build correctness and a Playwright smoke script to assert the canvas mounts on `/`. Visual tuning is a manual browser check at the end.

---

## Task 1: Create `Starfield.astro` skeleton — canvas markup + static styles

**Files:**
- Create: `src/components/layout/Starfield.astro`

- [ ] **Step 1: Create the file with canvas element and scoped style**

File: `src/components/layout/Starfield.astro`

```astro
---
// Subtle twinkling starfield overlay with light parallax on scroll.
// Zero props. Tuning constants live inside the client script below.
---

<canvas class="starfield" aria-hidden="true"></canvas>

<style>
  .starfield {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    display: block;
  }
</style>

<script>
  // Client script added in subsequent tasks.
</script>
```

- [ ] **Step 2: Verify the file parses**

Run: `npx astro check` from `/Users/yuldashev/Xcode/Github/af.vs_web`
Expected: `0 errors, 0 warnings` (or at least no new errors introduced by `Starfield.astro`).

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Starfield.astro
git commit -m "feat(starfield): scaffold component with canvas markup"
```

---

## Task 2: Add tuning constants, Star type, and init + resize logic

**Files:**
- Modify: `src/components/layout/Starfield.astro` (replace `<script>` body)

- [ ] **Step 1: Replace the `<script>` block in `Starfield.astro` with the following**

```astro
<script>
  interface Star {
    x: number;
    yVirtual: number;
    r: number;
    baseAlpha: number;
    twinkleSpeed: number;
    twinklePhase: number;
  }

  const STAR_COUNT_BASE = 70;
  const STAR_COUNT_MIN = 40;
  const STAR_COUNT_MAX = 90;
  const STAR_RADIUS_MIN = 0.5;
  const STAR_RADIUS_MAX = 1.5;
  const ALPHA_MIN = 0.15;
  const ALPHA_MAX = 0.45;
  const TWINKLE_SPEED_MIN = 0.3;
  const TWINKLE_SPEED_MAX = 1.0;
  const PARALLAX_FACTOR = 0.15;
  const PARALLAX_RANGE = 1.3;
  const RESIZE_THROTTLE_MS = 200;
  const REFERENCE_VW = 1440;

  const canvas = document.querySelector<HTMLCanvasElement>('canvas.starfield');
  if (canvas) {
    const ctx = canvas.getContext('2d');
    if (ctx) {
      let cssWidth = 0;
      let cssHeight = 0;
      let stars: Star[] = [];

      const rand = (min: number, max: number) => min + Math.random() * (max - min);

      const makeStar = (): Star => ({
        x: Math.random() * cssWidth,
        yVirtual: Math.random() * (cssHeight * PARALLAX_RANGE),
        r: rand(STAR_RADIUS_MIN, STAR_RADIUS_MAX),
        baseAlpha: rand(ALPHA_MIN, ALPHA_MAX),
        twinkleSpeed: rand(TWINKLE_SPEED_MIN, TWINKLE_SPEED_MAX),
        twinklePhase: Math.random() * Math.PI * 2,
      });

      const computeCount = (): number => {
        const scaled = Math.round(STAR_COUNT_BASE * (cssWidth / REFERENCE_VW));
        return Math.max(STAR_COUNT_MIN, Math.min(STAR_COUNT_MAX, scaled));
      };

      const resize = () => {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        cssWidth = window.innerWidth;
        cssHeight = window.innerHeight;
        canvas.width = Math.floor(cssWidth * dpr);
        canvas.height = Math.floor(cssHeight * dpr);
        canvas.style.width = `${cssWidth}px`;
        canvas.style.height = `${cssHeight}px`;
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.scale(dpr, dpr);
        const count = computeCount();
        stars = Array.from({ length: count }, makeStar);
      };

      let resizeTimer: number | undefined;
      const onResize = () => {
        if (resizeTimer !== undefined) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(resize, RESIZE_THROTTLE_MS);
      };
      window.addEventListener('resize', onResize);
      resize();
    }
  }
</script>
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: `0 errors` introduced by this file.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Starfield.astro
git commit -m "feat(starfield): init canvas sizing and star generation"
```

---

## Task 3: Add draw loop with twinkle + parallax + reduced-motion + visibility

**Files:**
- Modify: `src/components/layout/Starfield.astro` (extend `<script>`)

- [ ] **Step 1: Append the following inside the `if (ctx) { ... }` block, after the `resize();` call, before the closing braces**

Place this immediately after the line `resize();` from Task 2:

```ts
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      const drawFrame = (t: number, scrollY: number) => {
        ctx.clearRect(0, 0, cssWidth, cssHeight);
        const range = cssHeight * PARALLAX_RANGE;
        for (const star of stars) {
          const twinkle = 0.6 + 0.4 * Math.sin(t * star.twinkleSpeed * Math.PI * 2 + star.twinklePhase);
          const alpha = star.baseAlpha * twinkle;
          let y = star.yVirtual - scrollY * PARALLAX_FACTOR;
          y = ((y % range) + range) % range;
          y -= (range - cssHeight) / 2;
          ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.beginPath();
          ctx.arc(star.x, y, star.r, 0, Math.PI * 2);
          ctx.fill();
        }
      };

      if (prefersReducedMotion) {
        const drawStatic = () => {
          ctx.clearRect(0, 0, cssWidth, cssHeight);
          for (const star of stars) {
            ctx.fillStyle = `rgba(255, 255, 255, ${star.baseAlpha})`;
            ctx.beginPath();
            ctx.arc(star.x, star.yVirtual % cssHeight, star.r, 0, Math.PI * 2);
            ctx.fill();
          }
        };
        drawStatic();
        window.addEventListener('resize', () => {
          window.setTimeout(drawStatic, RESIZE_THROTTLE_MS + 10);
        });
      } else {
        let rafId = 0;
        let running = true;
        const startTime = performance.now();

        const loop = (now: number) => {
          if (!running) return;
          const tSec = (now - startTime) / 1000;
          drawFrame(tSec, window.scrollY || window.pageYOffset || 0);
          rafId = requestAnimationFrame(loop);
        };
        rafId = requestAnimationFrame(loop);

        document.addEventListener('visibilitychange', () => {
          if (document.hidden) {
            running = false;
            cancelAnimationFrame(rafId);
          } else if (!running) {
            running = true;
            rafId = requestAnimationFrame(loop);
          }
        });
      }
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: `0 errors` introduced.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Starfield.astro
git commit -m "feat(starfield): twinkle loop with parallax, reduced-motion, visibility"
```

---

## Task 4: Mount `Starfield` inside `GlowBackground`

**Files:**
- Modify: `src/components/layout/GlowBackground.astro`

- [ ] **Step 1: Add import and element, set internal z-index**

Replace the entire contents of `src/components/layout/GlowBackground.astro` with:

```astro
---
// CSS ambient glow: grid pattern + canvas starfield + 5 blurred radial eclipses.
// Starfield lives between grid and orbs so orbs softly wash stars they overlap.
import Starfield from './Starfield.astro';
---

<div class="glow" aria-hidden="true">
  <div class="grid"></div>
  <Starfield />
  <div class="orb orb-1"></div>
  <div class="orb orb-2"></div>
  <div class="orb orb-3"></div>
  <div class="orb orb-4"></div>
  <div class="orb orb-5"></div>
</div>

<style>
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
    z-index: 0;
    background-image:
      linear-gradient(to right, rgba(255, 255, 255, 0.04) 1px, transparent 1px),
      linear-gradient(to bottom, rgba(255, 255, 255, 0.04) 1px, transparent 1px);
    background-size: clamp(40px, 5.5vw, 100px) clamp(40px, 5.5vw, 100px);
  }

  .glow :global(canvas.starfield) {
    position: absolute;
    inset: 0;
    z-index: 1;
  }

  .orb {
    position: absolute;
    z-index: 2;
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
</style>
```

- [ ] **Step 2: Type-check**

Run: `npx astro check`
Expected: `0 errors`.

- [ ] **Step 3: Build to verify no runtime errors**

Run: `npm run build`
Expected: Build completes without errors. Look for `dist/` output generated cleanly.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/GlowBackground.astro
git commit -m "feat(glow): mount starfield between grid and orbs"
```

---

## Task 5: Playwright smoke test — canvas mounts on home

**Files:**
- Create: `tests/starfield.spec.ts`

- [ ] **Step 1: Check if `tests/` dir already has Playwright config**

Run: `ls tests 2>/dev/null; ls playwright.config.* 2>/dev/null`
Expected: Either existing config or empty — note what you find.

- [ ] **Step 2: If no playwright.config exists, create minimal one**

Only perform this step if no `playwright.config.ts` / `.js` exists at repo root.

File: `playwright.config.ts`

```ts
import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests',
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
```

- [ ] **Step 3: Create the smoke spec**

File: `tests/starfield.spec.ts`

```ts
import { test, expect } from 'playwright/test';

test('starfield canvas mounts on home page', async ({ page }) => {
  await page.goto('/');
  const canvas = page.locator('canvas.starfield');
  await expect(canvas).toHaveCount(1);
  const box = await canvas.boundingBox();
  expect(box?.width).toBeGreaterThan(0);
  expect(box?.height).toBeGreaterThan(0);
});

test('starfield canvas draws pixels (non-empty imageData)', async ({ page }) => {
  await page.goto('/');
  // Wait one animation frame for at least one paint.
  await page.waitForTimeout(100);
  const hasPixels = await page.evaluate(() => {
    const c = document.querySelector<HTMLCanvasElement>('canvas.starfield');
    if (!c) return false;
    const ctx = c.getContext('2d');
    if (!ctx) return false;
    const d = ctx.getImageData(0, 0, c.width, c.height).data;
    for (let i = 3; i < d.length; i += 4) if (d[i] !== 0) return true;
    return false;
  });
  expect(hasPixels).toBe(true);
});
```

- [ ] **Step 4: Run the tests**

Run: `npx playwright test tests/starfield.spec.ts --reporter=line`
Expected: `2 passed`. If `webServer` fails, first verify `npm run dev` starts cleanly on its own, then re-run.

- [ ] **Step 5: Commit**

```bash
git add tests/starfield.spec.ts playwright.config.ts 2>/dev/null || git add tests/starfield.spec.ts
git commit -m "test(starfield): playwright smoke for canvas mount and paint"
```

---

## Task 6: Manual visual verification

- [ ] **Step 1: Start dev server**

Run: `npm run dev`
Expected: Server at `http://localhost:4321`.

- [ ] **Step 2: Visually verify in browser at 3 sizes**

Open `http://localhost:4321/` in a browser and check:

- **Desktop (≥1440px):** Stars visible but must NOT demand attention. If they do, lower `ALPHA_MAX` to `0.35` in `Starfield.astro`.
- **Tablet (~768px):** Fewer stars, still subtle.
- **Mobile (~375px):** Density scales down, parallax still feels present.
- **Scroll test:** Scroll slowly — stars should drift upward noticeably slower than content, and wrap without visible seams.
- **Orb overlap:** Where blue orbs sit, stars should be washed out (orbs are above the canvas).

- [ ] **Step 3: Verify reduced-motion**

In macOS: System Settings → Accessibility → Display → Reduce Motion: ON. Reload page.
Expected: Stars visible but static — no twinkle, no parallax.
Turn it back OFF when done.

- [ ] **Step 4: Verify tab-hidden pause**

Open DevTools → Performance → start recording → switch to another tab for 3s → return → stop.
Expected: While tab is hidden, no RAF frames recorded for the starfield.

- [ ] **Step 5: Check ru and uz pages**

Visit `/ru` and `/uz`. Canvas must be present (same `GlowBackground`).

- [ ] **Step 6: No commit needed — this is verification only.**

If anything needs tuning, edit constants in `Starfield.astro` and commit that as a separate `tune(starfield): ...` change.

---

## Self-Review Notes

**Spec coverage check:**

| Spec requirement | Task |
|---|---|
| New `Starfield.astro` component | Task 1 |
| DPR-aware canvas sizing | Task 2 (`resize()`) |
| Star model + generation | Task 2 (`makeStar`) |
| Density formula with clamp | Task 2 (`computeCount`) |
| Twinkle formula | Task 3 (`drawFrame`) |
| Parallax via scrollY polled in RAF | Task 3 (`drawFrame` + `loop`) |
| `prefers-reduced-motion` static render | Task 3 (branch) |
| Page Visibility pause/resume | Task 3 (visibilitychange handler) |
| Throttled resize 200ms | Task 2 (`onResize`) |
| Mount between grid and orbs | Task 4 (order + z-index) |
| Orbs visually wash out stars | Task 4 (orb `z-index: 2`, canvas `z-index: 1`) |
| Works on en/ru/uz | Task 6 (all use same `Layout` → `GlowBackground`) |

**Notes:**
- Parallax wrap centers the virtual range (`y -= (range - cssHeight) / 2`) so at `scrollY = 0` stars fill the viewport instead of sitting below it.
- `devicePixelRatio` is capped at 2 to avoid ultra-expensive backing stores on 3×/4× mobile screens.
- Playwright config creation is conditional on Task 5 Step 2 — avoids clobbering a config the user may add later.
