# Starfield Overlay — Design Spec

**Date:** 2026-04-14
**Status:** Approved
**Scope:** Site-wide ambient overlay with subtle twinkling stars and light parallax.

## Goal

Add a minimal, barely-perceptible cosmic-star overlay across every page of the AF Venture Studio landing site. Stars reinforce the existing dark-cosmic aesthetic (deep navy `--surface-bg: #060b14` + blurred primary orbs) without competing with foreground content.

## User-approved decisions

| # | Decision | Choice |
|---|----------|--------|
| 1 | Density & character | ~60–80 uniform tiny (1–2px) stars, low opacity (0.15–0.45), soft twinkle |
| 2 | Scroll behaviour | Light parallax — stars drift slowly on scroll for a depth cue |
| 3 | Layering | Inside existing `GlowBackground` container, between `.grid` and the `.orb` layer — orbs may softly wash out stars they overlap |
| 4 | Implementation technique | Runtime JS + `<canvas>` |
| 5 | Star colour | Pure white (`rgba(255, 255, 255, α)`) with varying α only |

## Non-goals

- No mouse parallax.
- No shooting stars, constellation lines, or particle interactions.
- No per-star colour palette — pure white only.
- No configuration API exposed to parent components.

## Architecture

### File layout

```
src/components/layout/
  GlowBackground.astro     # MODIFIED — inserts <Starfield /> between .grid and .orb-1
  Starfield.astro          # NEW — self-contained <canvas> + client script
```

`Starfield.astro` is zero-prop, fully autonomous. All tuning happens via constants inside the file. `GlowBackground.astro` composes `grid → Starfield → orbs`.

### Z-order inside `.glow` wrapper

`.glow` itself stays at `z-index: -1` (behind all page content). Internal stacking:

1. `.grid` — `z-index: 0` (implicit, document order)
2. `<Starfield>` canvas — `z-index: 1` (over grid)
3. `.orb-*` — `z-index: 2` (over stars, so orbs visually "wash out" stars they cover)

All three remain below any page content because their parent `.glow` is `z-index: -1`.

## Canvas rendering

### Setup

- `<canvas>` element: `position: absolute; inset: 0; width: 100%; height: 100%; pointer-events: none;`
- DPR-aware backing store:
  - `canvas.width = cssWidth * devicePixelRatio`
  - `canvas.height = cssHeight * devicePixelRatio`
  - `ctx.scale(dpr, dpr)` once per resize
- Canvas sizes to `window.innerWidth × window.innerHeight` (viewport). Parallax is achieved by offsetting star Y in the draw step, not by making the canvas taller.

### Density

```
STAR_COUNT_BASE = 70       // at 1440px viewport
count = clamp(round(70 * (vw / 1440)), 40, 90)
```

Recomputed on resize (throttled 200ms) → star array is rebuilt.

### Star model

```ts
interface Star {
  x: number;            // 0..vw (CSS px)
  yVirtual: number;     // 0..(vh * PARALLAX_RANGE) — virtual Y in parallax space
  r: number;            // 0.5..1.5 (CSS px)
  baseAlpha: number;    // 0.15..0.45
  twinkleSpeed: number; // 0.3..1.0 (Hz-like — multiplied by elapsed seconds)
  twinklePhase: number; // 0..2π — desynchronises stars
}
```

- `r`: `0.5 + Math.random()` → range [0.5, 1.5]
- `baseAlpha`: `0.15 + Math.random() * 0.30` → range [0.15, 0.45]
- `twinkleSpeed`: `0.3 + Math.random() * 0.7`
- `twinklePhase`: `Math.random() * Math.PI * 2`

### Twinkle formula

Per frame, with elapsed time `t` (seconds):

```
alpha = star.baseAlpha * (0.6 + 0.4 * sin(t * star.twinkleSpeed * 2π + star.twinklePhase))
```

- Range: `baseAlpha * [0.2, 1.0]` — never fully disappears, never brighter than baseline.
- No full fade-to-zero — keeps the field coherent.

### Parallax

- Constant: `PARALLAX_FACTOR = 0.15`, `PARALLAX_RANGE = 1.3` (star Y virtual extent in units of vh).
- On each frame, read `window.scrollY` (no scroll event listener — polled in RAF, compatible with Lenis smooth scroll).
- Effective draw Y:
  ```
  drawY = (star.yVirtual - scrollY * PARALLAX_FACTOR) mod (vh * PARALLAX_RANGE)
  ```
  Modulo ensures stars that scroll off one edge reappear on the other — seamless endless field on long pages.

### Draw loop

```
function frame(timestamp) {
  if (!isRunning) return;
  const t = (timestamp - startTime) / 1000;
  ctx.clearRect(0, 0, cssWidth, cssHeight);
  for (const star of stars) {
    const alpha = computeTwinkleAlpha(star, t);
    const y = computeParallaxY(star, scrollY);
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
    ctx.beginPath();
    ctx.arc(star.x, y, star.r, 0, Math.PI * 2);
    ctx.fill();
  }
  rafId = requestAnimationFrame(frame);
}
```

- Single `clearRect` per frame, no alpha trails.
- No shadow/blur — keeps stars crisp at 1px. Soft look comes from sub-pixel radius + low alpha.

## Accessibility & performance

| Concern | Handling |
|---------|----------|
| `prefers-reduced-motion: reduce` | Draw single static frame with `baseAlpha` (no twinkle, no parallax). RAF never starts. |
| Tab hidden | `document.visibilitychange` → pause/resume RAF. |
| Resize | Throttled 200ms: recompute DPR, canvas size, star count, rebuild `stars` array. |
| Lenis smooth scroll conflict | Parallax reads `window.scrollY` in RAF (no scroll listener); Lenis updates `scrollY` natively, so parallax tracks smooth scroll without extra wiring. |
| Cleanup | Module-scope IIFE; Astro re-executes on navigation. Visibility + resize listeners registered; no explicit removeEventListener needed for full-page SSR (Astro reloads document). |

## Tunable constants (inside `Starfield.astro`)

```ts
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
const PARALLAX_RANGE = 1.3;     // * vh
const RESIZE_THROTTLE_MS = 200;
```

## Testing

- **Visual:** manual check in browser at mobile (375), tablet (768), desktop (1440), ultra-wide (1920). Stars must be barely visible — if they demand attention, reduce `ALPHA_MAX`.
- **Motion preference:** toggle OS "Reduce motion" — confirm static render.
- **Scroll:** long-scroll ru/uz/en pages — confirm parallax is subtle and no gaps appear as stars wrap.
- **Performance:** DevTools Performance recording during scroll — RAF frames should stay <2ms CPU on mid-tier laptop.

## Risks / open items

- On extreme ultra-wide (>2560px) star density may look sparse — `STAR_COUNT_MAX = 90` can be lifted later if needed.
- If `GlowBackground` is ever refactored away, `Starfield` would need a new mount point; it's coupled only by composition, not code.
