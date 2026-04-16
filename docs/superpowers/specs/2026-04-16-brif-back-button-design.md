# Brif wizard — back button + non-interactive stepper

**Date**: 2026-04-16
**Scope**: `src/components/form/BrifForm.astro`, `src/components/form/wizard.ts`, `src/i18n/{en,ru,uz}.ts`

## Problem

The Brif form progress dots double as a status indicator **and** as a navigation control (click a completed dot to return to that step). Mixing both roles hurts clarity: users lose a predictable primary "go back" affordance, and screen readers mis-classify the dots as interactive controls. Status and navigation should be separated.

## Goal

1. Strip the navigation role from the stepper — dots become a pure status indicator.
2. Introduce an explicit **Back** button as the single, predictable way to move backward.
3. Back is **visible on steps 2–5**, hidden on step 1 (no prior step) and step 6 (success, form submitted).
4. Style: ghost (no background) with secondary text colour.

## Non-goals

- No changes to forward flow, validation, phone formatter, submit flow, or step-level animations.
- No changes to the `selections` model or data persistence between steps.
- No new ability to skip forward via dot click (it never existed — preserved as such).

## Design

### HTML / ARIA (`BrifForm.astro`)

- `.brif-progress` gains `role="progressbar"`, `aria-valuemin="1"`, `aria-valuemax="5"`, initial `aria-valuenow="1"`, initial `aria-valuetext="Step 1 of 5"`. `aria-valuenow` / `aria-valuetext` are updated from `updateUI()`.
- Dots keep `data-dot` so `updateUI()` can still toggle `active` / `completed` / `upcoming` classes, but have **no click handler** and **no `cursor: pointer`**.
- The single `.brif-btn` wrapper is replaced with a `.brif-actions` flex container holding:
  - `<button type="button" class="brif-btn-back" data-brif-back hidden><span>{dict.brif.back}</span></button>`
  - `<button type="button" class="brif-btn" data-brif-btn><span data-btn-text>{dict.brif.next}</span></button>`
- Back uses the native `hidden` HTML attribute (default-hidden on step 1); JS toggles it via `btnBack.hidden = !showBack`. Native `hidden` removes the element from the a11y tree and applies `display: none` — no custom CSS required for visibility.

### CSS (scoped `<style>` in `BrifForm.astro`)

**New `.brif-actions` container** — flex-row with `justify-content: space-between`. Takes over `margin-top: auto` and cross-axis alignment duties from `.brif-btn`. When Back is hidden on step 1, flex layout still pins Next to the right edge.

**`.brif-btn-back`**:

```css
.brif-btn-back {
  height: clamp(48px, 7vh, 56px);
  min-width: 44px;
  padding: 0 clamp(16px, 2vw, 24px);
  background: transparent;
  border: none;
  color: var(--text-dark-secondary);
  font-family: var(--font-body);
  font-size: var(--font-size-body);
  font-weight: 600;
  cursor: pointer;
  border-radius: var(--radius-pill);
  transition: color 0.2s ease, background 0.2s ease;
}
.brif-btn-back:hover { color: var(--text-dark-primary); }
.brif-btn-back:active { transform: scale(0.98); }
.brif-btn-back:focus-visible {
  outline: 2px solid var(--primary-default);
  outline-offset: 2px;
}
.brif-btn-back[hidden] { display: none; }
```

**Dots** — remove `cursor: pointer` from `.brif-dot.completed` (currently at `BrifForm.astro` ~line 443). Add `cursor: default` on `.brif-dot` to make the non-interactive status explicit.

**Cleanup**:

- Remove `align-self: flex-end` and `margin-top: auto` from `.brif-btn` — the parent `.brif-actions` owns layout now.
- Delete `.brif-btn--shifted` rule and its `wizard.ts` toggle — no longer needed because `.brif-actions` layout is identical across all steps.
- Mobile (`< 744px`): keep `.brif-actions` as row with `space-between`. Drop the existing mobile override that forced `.brif-btn { align-self: stretch; width: 100%; }` — Next remains fixed-width alongside Back (ghost is narrow, ~90 px; total fits a 320 px viewport).

### Logic (`wizard.ts`)

**Remove**: the dot-click handler block (currently ~lines 162–170). Dots are no longer navigation.

**Add reference**:

```ts
const btnBack = wizard.querySelector<HTMLButtonElement>('[data-brif-back]');
```

**Extend `updateUI()`** (after the existing "Update button" block):

```ts
if (btnBack) {
  const showBack = currentStep >= 2 && currentStep <= 5;
  btnBack.hidden = !showBack;
}

const progressEl = wizard!.querySelector<HTMLDivElement>('.brif-progress');
if (progressEl) {
  progressEl.style.display = currentStep === 6 ? 'none' : '';
  const step = Math.min(currentStep, 5);
  progressEl.setAttribute('aria-valuenow', String(step));
  progressEl.setAttribute('aria-valuetext', `Step ${step} of 5`);
}
```

(The existing `progressEl.style.display` assignment is merged into this block; the earlier duplicate is removed.)

**Remove** the `brif-btn--shifted` toggle for step 4:

```ts
// DELETE — no longer needed
if (currentStep === 4) {
  btn.classList.add('brif-btn--shifted');
} else {
  btn.classList.remove('brif-btn--shifted');
}
```

**Add Back handler** inside the delegated `wizard.addEventListener('click', …)`, placed before the `[data-brif-btn]` branch:

```ts
if (target.closest('[data-brif-back]')) {
  if (currentStep > 1) {
    currentStep--;
    updateUI();
  }
  return;
}
```

No validation on back — step decrement is unconditional (but guarded by `currentStep > 1` for defence in depth; the button is already `hidden` on step 1). Previously selected options survive in `selections` map; contact-form input values persist in the DOM across re-renders (steps share the DOM; `.is-active` only controls visibility).

The existing `dir < 0` animation path (`is-entering-back` / `is-leaving-back`) already handles the reverse transition — no animation changes required.

### i18n

Add a `back` key to `src/i18n/en.ts` next to `next` / `send`:

```ts
next: 'Next',
back: 'Back',
send: 'Send',
```

Translations:

- `src/i18n/ru.ts` → `back: 'Назад'`
- `src/i18n/uz.ts` → `back: 'Orqaga'`

`Dict` type is inferred from `en.ts`, so adding the key there propagates the type constraint. `ru.ts` and `uz.ts` must add the key or `npm run check` fails.

The template reads `{dict.brif.back}` directly — no `data-label-back` attribute needed (text does not change between steps).

### Accessibility summary

- Progress indicator: `role="progressbar"` + `aria-valuenow` / `aria-valuetext` updated on each step change.
- Dots: non-interactive (no click handler, `cursor: default`). Status role is carried by the parent `progressbar`; individual dots need no extra ARIA.
- Back button: native `<button type="button">` with visible text label (no icon-only version). Ships with `:focus-visible` outline for keyboard users.
- Tab order: Back → Next (left-to-right matches visual order). On step 1, Back has `hidden` so it is removed from the tab sequence.
- Reduced motion: uses the existing `.brif-step` keyframes which already check `prefers-reduced-motion: reduce`.

## Files touched

| File | Nature of change |
| --- | --- |
| `src/i18n/en.ts` | add `back: 'Back'` |
| `src/i18n/ru.ts` | add `back: 'Назад'` |
| `src/i18n/uz.ts` | add `back: 'Orqaga'` |
| `src/components/form/BrifForm.astro` | progressbar ARIA; `.brif-actions` wrapper; new `.brif-btn-back` + styles; cleanup of `.brif-btn` layout props, `.brif-btn--shifted`, `.brif-dot.completed { cursor: pointer }`, mobile Next full-width override |
| `src/components/form/wizard.ts` | delete dot-click; add `btnBack` ref; add Back handler; toggle `btnBack.hidden`; update `aria-valuenow` / `aria-valuetext`; delete `brif-btn--shifted` toggle |

## Verification

1. `npm run check` — catches missing `back` keys in `ru.ts` / `uz.ts` and any type drift.
2. `npm run dev` + manual run-through: 1 → 2 → 3 → 4 → 5, then Back from each of 2–5 confirming selections are preserved and animation plays in reverse direction.
3. Screen-reader smoke test: VoiceOver announces the progressbar with the current step, dots are not reachable as buttons, Back is reachable via Tab and announced.
4. Mobile viewport (375 × 812): Back + Next fit on one row on every step 2–5 without wrapping.
5. Locale check: EN / RU / UZ — all three render the Back label correctly.

## Out of scope (future)

- Keyboard shortcut (e.g. `Esc` = Back) — not part of this spec.
- Auto-save of contact form draft — unchanged; wizard loses state on full page reload as it always has.
- Swipe-left-to-go-back on mobile — not in scope.
