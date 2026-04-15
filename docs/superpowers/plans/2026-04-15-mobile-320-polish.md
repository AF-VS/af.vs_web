# Mobile 320+ Adaptive Layout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix mobile rendering from 320px up — remove off-screen clipping, normalize Services chips to 2-per-row, and breathe air into sections so nothing feels cramped.

**Architecture:** Mobile-first CSS adjustments inside existing scoped `<style>` blocks; no component restructuring. Use `clamp()` + media queries (`max-width: 743px` for "mobile", extra `max-width: 360px` for tiny screens). Container queries remain the source of truth for Services adaptive visuals — mobile chip layout overrides via viewport media query (chips-per-row is a viewport-level concern, not card-size).

**Tech Stack:** Astro 5 + CSS Modules, tokens in `src/styles/tokens.css`, no Tailwind.

**Verification:** Playwright screenshots at 320 / 360 / 375 / 390 / 430 px. No horizontal scroll; all content fits viewport; chip grid is 2×2 on mobile; touch targets ≥44px.

**Audit findings (from playwright run at 320/360/375/390/430):**
- **CRITICAL**: `.brif-wizard { max-width: clamp(600px, 88vw, 1600px) }` forces 600px minimum — Brif section content is rendered off-screen at viewports < 600px (visible in `/tmp/m-320-brif-vis.png`).
- Services `card--build` at 320px wraps chips into **3 rows** ("product discovery" | "ui/ux design" / "mvp development" / "full-cycle product") — inconsistent with other cards (2-row).
- Hero `h1` locked at 36px across all mobile sizes (`clamp(36px, 4.2vw, 86px)` — floor wins). On 320px viewport with `max-width: 20ch`, feels cramped.
- All sections are `min-height: 100dvh` — short sections on tall phones (e.g. Cases, Brif step 5) leave large empty regions.
- No horizontal overflow at any viewport tested (good — `.hero { overflow-x: clip }` + body containment work).

---

### Task 1: Fix Brif wizard off-screen clipping on small viewports

**Files:**
- Modify: `src/components/form/BrifForm.astro`

**Problem:** `max-width: clamp(600px, 88vw, 1600px)` has a 600px floor. On 320–599px viewports `88vw` is smaller than 600, so `clamp` returns 600 → wizard extends beyond viewport, center-aligned parent clips left/right edges.

- [ ] **Step 1: Read current CSS block**

Open `src/components/form/BrifForm.astro` and locate `.brif-wizard` rule (lines ~283–293).

- [ ] **Step 2: Replace max-width with viewport-safe clamp**

Change:
```css
.brif-wizard {
  /* ... */
  max-width: clamp(600px, 88vw, 1600px);
  /* ... */
}
```
To:
```css
.brif-wizard {
  /* ... */
  width: 100%;
  max-width: min(100%, clamp(320px, 88vw, 1600px));
  /* ... */
}
```

**Rationale:** the floor is now 320px (covers smallest supported screen), `min(100%, …)` is a safety net so the wizard never exceeds the parent width even if clamp math changes.

- [ ] **Step 3: Verify via playwright at 320px**

Run /tmp playwright script that navigates to `#contact`, screenshots, and checks `scrollW === clientW`:

```bash
node /tmp/playwright-test-brif-fit.js
```

Expected: wizard fits within 320px viewport; `.brif-wizard.getBoundingClientRect().width <= 320`.

- [ ] **Step 4: Commit**

```bash
git add src/components/form/BrifForm.astro
git commit -m "fix(brif): remove 600px floor, wizard now fits viewports from 320px"
```

---

### Task 2: Services — chips 2-per-row grid on mobile

**Files:**
- Modify: `src/components/services/ServiceCard.astro`

**Problem:** Audit shows `card--build` at 320px wraps "product discovery | ui/ux design / mvp development / full-cycle product" into 3 rows; `card--growth` also inconsistent. User wants all Services chips displayed 2-per-row on mobile for consistency and predictable height.

- [ ] **Step 1: Update `.card__tags` to CSS grid on mobile**

In `src/components/services/ServiceCard.astro`, locate `.card__tags`:

```css
.card__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-tags-gap);
}
```

Add the mobile override at the end of the style block:

```css
@media (max-width: 743px) {
  .card__tags {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--spacing-tags-gap);
  }

  /* Chips span the single grid cell; keep horizontal overflow
     handled by ellipsis so labels never break the 2-col rhythm. */
  .card__tags :global(.chip) {
    justify-content: center;
    text-align: center;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
```

- [ ] **Step 2: Verify at 320/360/375/390px**

Run playwright script — each card's `chipsCount / chipsPerRow` mapping:
- 2 chips → 1 row (single cell filled)
- 3 chips → 2 rows (2 + 1)
- 4 chips → 2 rows (2 + 2)

Expected: `card--build` always reports 2 rows at mobile widths; no horizontal overflow inside cards.

- [ ] **Step 3: Visual check**

Open `/tmp/m-320-services.png`, `/tmp/m-375-services.png`, `/tmp/m-390-services.png`. All cards should show chips in a clean 2×2 (or 1×2) grid.

- [ ] **Step 4: Commit**

```bash
git add src/components/services/ServiceCard.astro
git commit -m "feat(services): chips use 2-col grid on mobile for consistent card height"
```

---

### Task 3: Hero — reduce title crowding on sub-360 viewports

**Files:**
- Modify: `src/components/hero/Hero.astro`

**Problem:** `--font-size-h1: clamp(36px, 4.2vw, 86px)` — on mobile the 36px floor is heavy against `max-width: 20ch` + 16px container padding. On 320px the title visually touches safe-area edges.

- [ ] **Step 1: Lower h1 font floor on very small viewports**

In `src/components/hero/Hero.astro`, add to the style block after `.hero__title` (do not modify global `--font-size-h1` token — this is hero-specific):

```css
@media (max-width: 360px) {
  .hero__title {
    font-size: 30px;
    letter-spacing: -1.2px;
  }
}
```

- [ ] **Step 2: Increase title breathing room on mobile**

Inside the same component, update `.hero` padding-top clamp is already OK (`calc(var(--header-height) + clamp(24px, 3vh, 48px))`). Add title margin adjustment for mobile:

```css
@media (max-width: 743px) {
  .hero__title {
    max-width: 18ch;
  }
}
```

**Rationale:** tightening to 18ch forces fewer long lines without reducing font-size on normal mobile (360–430).

- [ ] **Step 3: Verify visually at 320/360/390**

Screenshot hero section at each breakpoint; title should:
- Fit within viewport with visible ≥16px margin on each side
- Wrap on natural word boundaries
- Not clip the mountain image below

- [ ] **Step 4: Commit**

```bash
git add src/components/hero/Hero.astro
git commit -m "style(hero): reduce title font-size to 30px under 360px for breathing room"
```

---

### Task 4: Container padding — more air on small viewports

**Files:**
- Modify: `src/styles/tokens.css`

**Problem:** `--container-padding: clamp(16px, 5vw, 200px)` resolves to 16px at 320 viewport — flat edge-to-edge feel. Bump to 20px on small screens without affecting large-screen scale.

- [ ] **Step 1: Adjust `--container-padding` token**

In `src/styles/tokens.css`:

```css
/* was: --container-padding: clamp(16px, 5vw, 200px); */
--container-padding: clamp(20px, 5vw, 200px);
```

At 400vw the 5vw = 20px matches floor; at 320 `5vw = 16`, now floor wins at 20 → slight breathing room.

- [ ] **Step 2: Visual regression check**

At 320px check:
- Hero title doesn't hit viewport edges
- Services cards have 20px gutters
- Cases carousel cards centered correctly
- Nothing overflows horizontally

- [ ] **Step 3: Commit**

```bash
git add src/styles/tokens.css
git commit -m "style(tokens): bump --container-padding floor 16→20px for mobile air"
```

---

### Task 5: Services section — tighter vertical rhythm on mobile

**Files:**
- Modify: `src/components/services/Services.astro`

**Problem:** `section-viewport` forces `min-height: 100dvh`. Services section with 4 stacked cards + gap already fills ~1400px on mobile; adding 100dvh min-height just adds tail padding. Also grid gap feels tight.

- [ ] **Step 1: Allow services to size to content on mobile**

In `src/components/services/Services.astro`, add within the `<style>` block:

```css
@media (max-width: 743px) {
  /* Services content is naturally tall on mobile (4 stacked cards);
     release the 100dvh floor so empty tail space doesn't appear. */
  .services {
    min-height: auto;
  }

  .grid {
    gap: clamp(16px, 4vw, 24px);
  }
}
```

- [ ] **Step 2: Verify scroll rhythm**

Scroll through the page on 375px — Services section should transition into Cases without a long dead zone.

- [ ] **Step 3: Commit**

```bash
git add src/components/services/Services.astro
git commit -m "style(services): release 100dvh min-height on mobile, tighten grid gap"
```

---

### Task 6: Brif section — mobile padding + wizard inner spacing

**Files:**
- Modify: `src/components/form/BrifForm.astro`

**Problem:** On mobile, wizard stacks vertically (left panel over right). Left panel has `padding: clamp(20px, 5vw, 40px)` = 20 at 400vw — feels tight. Right panel has `padding: var(--spacing-card)` = 16 at mobile — also tight. Progressive indicator dots sit flush.

- [ ] **Step 1: Add mobile breathing room**

In `src/components/form/BrifForm.astro`, locate the `@media (max-width: 743px)` block and extend:

```css
@media (max-width: 743px) {
  /* existing rules kept */

  .brif-left {
    padding: clamp(24px, 6vw, 40px);
  }

  .brif-right {
    padding: clamp(20px, 5vw, 32px);
  }

  .brif-progress {
    margin-bottom: 4px;
  }
}
```

- [ ] **Step 2: Verify step 5 still fits at 320**

After stepping through wizard (pick option, tap Next × 4), at 320×568 all 4 contact inputs + Send button must be visible within scroll — no clipping inside `.brif-steps`.

Run playwright:
```bash
node /tmp/playwright-test-brif-step5-mobile.js
```

Expected: `phone.getBoundingClientRect().bottom <= stepsWrap.getBoundingClientRect().bottom`.

- [ ] **Step 3: Commit**

```bash
git add src/components/form/BrifForm.astro
git commit -m "style(brif): mobile-friendly panel padding and progress spacing"
```

---

### Task 7: Final verification — full responsive sweep

**Files:** (verification only, no edits)

- [ ] **Step 1: Write comprehensive playwright test**

Save to `/tmp/playwright-mobile-final.js`:

```javascript
const { chromium } = require('playwright');
const TARGET_URL = 'http://localhost:4321';
const viewports = [
  { name: '320', w: 320, h: 568 },
  { name: '360', w: 360, h: 800 },
  { name: '375', w: 375, h: 812 },
  { name: '390', w: 390, h: 844 },
  { name: '430', w: 430, h: 932 },
];

(async () => {
  const browser = await chromium.launch({ headless: true });
  const report = [];
  for (const vp of viewports) {
    const ctx = await browser.newContext({ viewport: { width: vp.w, height: vp.h } });
    const page = await ctx.newPage();
    await page.goto(TARGET_URL, { waitUntil: 'networkidle' });

    // Horizontal overflow
    const hOverflow = await page.evaluate(() => {
      const d = document.documentElement;
      return { scroll: d.scrollWidth, client: d.clientWidth };
    });
    const hasHScroll = hOverflow.scroll > hOverflow.client;

    // Chip rows per services card
    const chipRows = await page.evaluate(() => {
      const cards = Array.from(document.querySelectorAll('[data-glow-card]'));
      return cards.map(c => {
        const chips = Array.from(c.querySelectorAll('.chip'));
        const tops = new Set(chips.map(e => Math.round(e.getBoundingClientRect().top)));
        const cls = Array.from(c.classList).filter(x => x.startsWith('card--')).join('');
        return { cls, chips: chips.length, rows: tops.size };
      });
    });

    // Brif wizard fit
    await page.evaluate(() => document.getElementById('contact').scrollIntoView({block:'start'}));
    await page.waitForTimeout(400);
    const wizardFits = await page.evaluate(() => {
      const w = document.querySelector('.brif-wizard');
      const r = w?.getBoundingClientRect();
      return { width: r?.width, viewport: window.innerWidth, fits: r?.width <= window.innerWidth + 1 };
    });

    report.push({ vp: vp.name, hasHScroll, chipRows, wizardFits });
    await ctx.close();
  }
  console.log(JSON.stringify(report, null, 2));
  await browser.close();
})();
```

- [ ] **Step 2: Run and assert expectations**

Run:
```bash
cd /Users/yuldashev/.claude/plugins/cache/playwright-skill/playwright-skill/4.1.0/skills/playwright-skill && node run.js /tmp/playwright-mobile-final.js
```

Pass criteria:
- All 5 viewports: `hasHScroll === false`
- All Services cards: `chips ≤ 2 → rows = 1`, `chips 3–4 → rows = 2`
- All viewports: `wizardFits === true`

- [ ] **Step 3: Visual screenshots**

At each viewport, screenshot `#services`, `#cases`, `#contact`, and full page; place in `/tmp/final-mobile-<vp>-<section>.png`. Review visually for:
- no content clipping
- chip grid is 2×2
- sections don't feel prematurely tall
- breathing room around titles and CTAs
- touch targets ≥44px (already enforced by `clamp` floor in inputs/options/buttons)

- [ ] **Step 4: Final commit and summary**

Only commit if all assertions pass. If nothing changed in sources during verification, simply summarize results.

---

## Summary of mobile improvements

| Area | Before | After |
|------|--------|-------|
| Brif wizard (<600px) | 600px wide, content clipped | Fits viewport from 320px |
| Services chips (mobile) | Flex-wrap 1–3 rows, inconsistent | CSS grid 2-col, predictable 1 or 2 rows |
| Hero title (320px) | 36px bumping edges | 30px with tighter ch-width |
| Container padding (<400px) | 16px edges | 20px edges |
| Services vertical rhythm (mobile) | 100dvh tail dead space | Auto height, natural flow |
| Brif panel padding (mobile) | 16px tight | 20–32px breathing room |

## Self-review checklist

- [x] Every task has exact file paths.
- [x] Every code-change step shows the full replacement.
- [x] Verification via playwright is explicit with expected assertions.
- [x] No TBD / TODO placeholders.
- [x] Task dependencies are linear; each task is commit-ready in isolation.
- [x] Mobile-first principles: touch targets, line length, no horizontal scroll, breathing room.
- [x] User's explicit requirement (Services chips 2-per-row on mobile) addressed in Task 2.
- [x] Critical bug (Brif wizard overflow) flagged as Task 1.
