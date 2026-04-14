# Phase 5 — Accessibility & Polish

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Закрыть оставшиеся A11y-пробелы (мобильное меню как полноценный dialog, focus trap, возврат фокуса), защитить Services-скрипт от утечки listener'ов при SPA-навигации, расширить `Button` состояниями `loading`/`disabled`, добавить адаптивный `theme-color`.

**Architecture:**
1. Mobile menu получает `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, focus trap через `inert` на остальном body + фокус на первой ссылке при открытии, возврат фокуса на burger при закрытии, закрытие по Escape.
2. Services Bento-скрипт регистрирует listener'ы внутри инициализации, которая запускается на `astro:page-load` и cleanup'ится при следующем page-load (идеmотентность).
3. `Button.astro` получает пропсы `disabled` и `loading`, управляющие `aria-disabled`, `aria-busy`, классом `btn--loading` и блокировкой клика.
4. `theme-color` оставляется `#060b14` как единственный для dark-only сайта — это ок, но добавляется `color-scheme: dark` в `html` для согласованности системных элементов.

**Tech Stack:** Astro 5, vanilla TypeScript, native ARIA.

**Covered audit findings:** #22 (mobile menu dialog/focus trap), #26 (Services scroll listener + page-load lifecycle), #30 (theme-color / color-scheme), #31 (Button loading/disabled states).

**Prerequisites:** Phase 1–4 завершены (токены и Layout актуальны).

---

### Task 1: Mobile menu — полноценный dialog + focus trap

**Files:**
- Modify: `src/components/chrome/Header.astro`

- [ ] **Step 1: Разметка — aria-атрибуты**

В `src/components/chrome/Header.astro` обновить блок `<div class="mobile-menu" ...>`:

```astro
<div
  class="mobile-menu"
  id="mobile-menu"
  data-mobile-menu
  role="dialog"
  aria-modal="true"
  aria-labelledby="mobile-menu-title"
  aria-hidden="true"
  tabindex="-1"
>
  <h2 id="mobile-menu-title" class="sr-only">Navigation</h2>
  <div class="mobile-menu__content">
    ...
  </div>
</div>
```

- [ ] **Step 2: Добавить `.sr-only` в global.css (если ещё нет)**

Edit `src/styles/global.css` — если класс `.sr-only` не определён, добавить:

```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

(Проверить перед этим — в BrifForm есть ссылки на `sr-only`, возможно класс уже где-то определён. Если нет — добавить в global.css.)

- [ ] **Step 3: Переписать логику open/close**

В `<script>` блоке `Header.astro` заменить всю логику меню на версию с фокус-менеджментом:

```ts
const header = document.querySelector('[data-header]') as HTMLElement;
const burger = document.querySelector('[data-burger]') as HTMLButtonElement;
const menu = document.querySelector('[data-mobile-menu]') as HTMLElement;
const mobileLinks = document.querySelectorAll<HTMLAnchorElement>('[data-mobile-link]');

let open = false;
let lastFocused: HTMLElement | null = null;

function onScroll() {
  header.classList.toggle('header--scrolled', window.scrollY > 10);
}

function getFocusable(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])'
    )
  );
}

function openMenu() {
  open = true;
  lastFocused = document.activeElement as HTMLElement;
  header.classList.add('header--open');
  burger.setAttribute('aria-expanded', 'true');
  menu.classList.add('mobile-menu--open');
  menu.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  // inert everything except header
  document.querySelectorAll<HTMLElement>('body > *:not(header)').forEach((el) => {
    el.setAttribute('inert', '');
  });

  const first = getFocusable(menu)[0];
  first?.focus();
}

function closeMenu() {
  if (!open) return;
  open = false;
  header.classList.remove('header--open');
  burger.setAttribute('aria-expanded', 'false');
  menu.classList.remove('mobile-menu--open');
  menu.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';

  document.querySelectorAll<HTMLElement>('body > *:not(header)').forEach((el) => {
    el.removeAttribute('inert');
  });

  lastFocused?.focus();
  lastFocused = null;
}

function toggleMenu() {
  if (open) closeMenu(); else openMenu();
}

function onKey(e: KeyboardEvent) {
  if (!open) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    closeMenu();
    return;
  }
  if (e.key === 'Tab') {
    // Focus trap
    const focusables = getFocusable(menu);
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  }
}

window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

burger.addEventListener('click', toggleMenu);
mobileLinks.forEach((link) => link.addEventListener('click', closeMenu));
document.addEventListener('keydown', onKey);

// Lang dropdown (unchanged)
const langDropdown = document.querySelector('[data-lang-dropdown]');
if (langDropdown) {
  const trigger = langDropdown.querySelector('.lang-trigger') as HTMLButtonElement;
  const langMenu = langDropdown.querySelector('.lang-menu') as HTMLElement;

  trigger.addEventListener('click', () => {
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', String(!expanded));
    langMenu.classList.toggle('lang-menu--open');
  });

  document.addEventListener('click', (e) => {
    if (!langDropdown.contains(e.target as Node)) {
      trigger.setAttribute('aria-expanded', 'false');
      langMenu.classList.remove('lang-menu--open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      trigger.setAttribute('aria-expanded', 'false');
      langMenu.classList.remove('lang-menu--open');
    }
  });
}
```

- [ ] **Step 4: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, успех.

- [ ] **Step 5: Dev ручной a11y-smoke**

Run: `npm run dev`.

Проверить на мобильной ширине (DevTools → iPhone):
1. Фокус на burger с клавиатуры (Tab).
2. Enter → меню открывается, фокус уходит на первую ссылку в меню.
3. Tab циклически по ссылкам и языкам меню, не «выпадает» наружу.
4. Escape → меню закрывается, фокус возвращается на burger.
5. При открытом меню: попытка Tab сквозь body должна быть невозможна (inert).

- [ ] **Step 6: Commit**

```bash
git add src/components/chrome/Header.astro src/styles/global.css
git commit -m "a11y(header): mobile menu as dialog with focus trap + return focus on close"
```

---

### Task 2: Services — идемпотентная инициализация scroll/hover

**Files:**
- Modify: `src/components/services/Services.astro`

- [ ] **Step 1: Обернуть IIFE в именованную функцию с cleanup**

В `<script>` секции `Services.astro` заменить весь блок `(() => { ... })();` на:

```ts
let cleanup: (() => void) | null = null;

function initBento() {
  // Cleanup previous instance (for Astro page transitions)
  cleanup?.();
  cleanup = null;

  const section = document.querySelector<HTMLElement>('[data-bento-section]');
  if (!section) return;

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const hasHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  if (reduceMotion || !hasHover) return;

  const cards = Array.from(section.querySelectorAll<HTMLElement>('[data-glow-card]'));
  if (!cards.length) return;

  const SPOTLIGHT_RADIUS = 320;
  const PROXIMITY = SPOTLIGHT_RADIUS * 0.5;
  const FADE_DISTANCE = SPOTLIGHT_RADIUS * 0.75;
  const GLOW_COLOR = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary-default-rgb').trim() || '21, 142, 242';

  const spotlight = document.createElement('div');
  spotlight.className = 'bento-spotlight';
  spotlight.style.cssText = `
    position: fixed;
    width: 800px;
    height: 800px;
    border-radius: 50%;
    pointer-events: none;
    background: radial-gradient(circle,
      rgba(${GLOW_COLOR}, 0.14) 0%,
      rgba(${GLOW_COLOR}, 0.08) 15%,
      rgba(${GLOW_COLOR}, 0.04) 25%,
      rgba(${GLOW_COLOR}, 0.02) 40%,
      transparent 70%);
    z-index: 1;
    opacity: 0;
    left: 0;
    top: 0;
    transform: translate3d(-50%, -50%, 0);
    mix-blend-mode: screen;
    will-change: transform, opacity;
    transition: opacity 0.35s ease;
  `;
  document.body.appendChild(spotlight);

  let mx = 0;
  let my = 0;
  let rafId = 0;
  let mouseActive = false;
  let sectionVisible = false;
  let dirty = false;

  const resetAll = () => {
    spotlight.style.opacity = '0';
    for (const c of cards) c.style.setProperty('--glow-intensity', '0');
    dirty = false;
  };

  const frame = () => {
    rafId = 0;
    if (!mouseActive || !sectionVisible) {
      if (dirty) resetAll();
      return;
    }
    const sr = section.getBoundingClientRect();
    const inside = mx >= sr.left && mx <= sr.right && my >= sr.top && my <= sr.bottom;
    if (!inside) {
      if (dirty) resetAll();
      return;
    }
    dirty = true;

    let minDistance = Infinity;
    for (const card of cards) {
      const r = card.getBoundingClientRect();
      const rx = ((mx - r.left) / r.width) * 100;
      const ry = ((my - r.top) / r.height) * 100;
      const cx = r.left + r.width / 2;
      const cy = r.top + r.height / 2;
      const dist = Math.max(0, Math.hypot(mx - cx, my - cy) - Math.max(r.width, r.height) / 2);
      if (dist < minDistance) minDistance = dist;

      let intensity = 0;
      if (dist <= PROXIMITY) intensity = 1;
      else if (dist <= FADE_DISTANCE) {
        intensity = (FADE_DISTANCE - dist) / (FADE_DISTANCE - PROXIMITY);
      }

      card.style.setProperty('--glow-x', `${rx}%`);
      card.style.setProperty('--glow-y', `${ry}%`);
      card.style.setProperty('--glow-intensity', intensity.toFixed(3));
      card.style.setProperty('--glow-radius', `${SPOTLIGHT_RADIUS}px`);
    }

    spotlight.style.transform = `translate3d(${mx}px, ${my}px, 0) translate(-50%, -50%)`;
    const opacity =
      minDistance <= PROXIMITY
        ? 0.85
        : minDistance <= FADE_DISTANCE
          ? ((FADE_DISTANCE - minDistance) / (FADE_DISTANCE - PROXIMITY)) * 0.85
          : 0;
    spotlight.style.opacity = opacity.toFixed(3);
  };

  const schedule = () => {
    if (!rafId) rafId = requestAnimationFrame(frame);
  };

  const onMove = (e: MouseEvent) => {
    mx = e.clientX;
    my = e.clientY;
    mouseActive = true;
    schedule();
  };

  const onLeave = () => {
    mouseActive = false;
    if (dirty) resetAll();
  };

  const onScroll = () => {
    if (mouseActive && sectionVisible) schedule();
  };

  const io = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) sectionVisible = entry.isIntersecting;
      if (!sectionVisible && dirty) resetAll();
    },
    { rootMargin: '10% 0px' },
  );
  io.observe(section);

  document.addEventListener('mousemove', onMove, { passive: true });
  document.addEventListener('mouseleave', onLeave);
  window.addEventListener('scroll', onScroll, { passive: true });

  cleanup = () => {
    io.disconnect();
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseleave', onLeave);
    window.removeEventListener('scroll', onScroll);
    if (rafId) cancelAnimationFrame(rafId);
    spotlight.remove();
  };
}

initBento();
document.addEventListener('astro:page-load', initBento);
document.addEventListener('astro:before-swap', () => cleanup?.());
```

- [ ] **Step 2: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, успех.

- [ ] **Step 3: Dev smoke — проверить spotlight**

Run: `npm run dev`, hover над Services-карточками — спот-глоу работает без регрессий.

- [ ] **Step 4: Commit**

```bash
git add src/components/services/Services.astro
git commit -m "fix(services): idempotent init with cleanup for astro:page-load lifecycle"
```

---

### Task 3: Расширить `Button.astro` — loading / disabled

**Files:**
- Modify: `src/components/ui/Button.astro`
- Modify: `src/components/form/BrifForm.astro` (опционально — использовать новый пропс)

- [ ] **Step 1: Добавить пропсы disabled и loading**

Edit `src/components/ui/Button.astro`:

```astro
---
interface Props {
  href?: string;
  type?: 'button' | 'submit' | 'reset';
  variant?: 'primary';
  glow?: boolean;
  disabled?: boolean;
  loading?: boolean;
  class?: string;
}

const {
  href,
  type = 'button',
  variant = 'primary',
  glow = false,
  disabled = false,
  loading = false,
  class: className = '',
} = Astro.props;

const isInactive = disabled || loading;
const Tag = href && !isInactive ? 'a' : 'button';
const tagProps = href && !isInactive
  ? { href }
  : { type, disabled: isInactive || undefined };
---

<Tag
  class:list={[
    'btn',
    `btn--${variant}`,
    glow && 'btn--glow',
    loading && 'btn--loading',
    className,
  ]}
  data-glow-button={glow && !isInactive ? '' : undefined}
  aria-disabled={isInactive ? 'true' : undefined}
  aria-busy={loading ? 'true' : undefined}
  {...tagProps}
>
  <span class="btn__label"><slot /></span>
  {glow && !isInactive && <span class="btn__glow" aria-hidden="true" />}
  {loading && <span class="btn__spinner" aria-hidden="true" />}
</Tag>
```

- [ ] **Step 2: Добавить стили для loading/disabled**

В `<style>` блок `Button.astro` добавить (после existing `.btn--primary:active`):

```css
  .btn[aria-disabled='true'],
  .btn[disabled] {
    opacity: 0.55;
    cursor: not-allowed;
    pointer-events: none;
  }

  .btn--loading .btn__label {
    visibility: hidden;
  }

  .btn__spinner {
    position: absolute;
    width: 1.25em;
    height: 1.25em;
    border: 2px solid rgba(var(--surface-bg-rgb), 0.2);
    border-top-color: var(--surface-bg);
    border-radius: 50%;
    animation: btn-spin 0.7s linear infinite;
  }

  @keyframes btn-spin {
    to { transform: rotate(360deg); }
  }
```

И в главный `.btn`:
```css
    position: relative;
```
(добавить, если ещё нет — без этого `.btn__spinner` не позиционируется абсолютно).

- [ ] **Step 3: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, успех.

- [ ] **Step 4: Dev smoke — мини-демо**

Временно (необязательно коммитить) вставить в `Hero.astro`:
```astro
<Button loading>Loading...</Button>
<Button disabled>Disabled</Button>
```
Убедиться, что состояния работают. После проверки — вернуть.

- [ ] **Step 5: Commit**

```bash
git add src/components/ui/Button.astro
git commit -m "feat(button): add disabled + loading states with aria attributes"
```

---

### Task 4: Добавить `color-scheme: dark` в html

Минимальное полирование: сообщить браузеру о dark-only природе сайта → системные элементы (scrollbar native, form controls) следуют теме.

**Files:**
- Modify: `src/styles/global.css`

- [ ] **Step 1: Добавить color-scheme в html**

Edit `src/styles/global.css` — в `html { ... }` добавить:

```css
  color-scheme: dark;
```

- [ ] **Step 2: Build проверка**

Run: `npm run build`
Expected: успех.

- [ ] **Step 3: Commit**

```bash
git add src/styles/global.css
git commit -m "chore(ui): declare color-scheme: dark for system consistency"
```

---

### Task 5: Финальная верификация фазы

- [ ] **Step 1: Typecheck + build**

Run: `npm run check && npm run build`
Expected: `0 errors, 0 warnings`, успех.

- [ ] **Step 2: Мануальный a11y-чеклист (DevTools → Lighthouse Accessibility)**

Run: `npm run dev`, открыть `/`.

В Chrome DevTools: Lighthouse → Accessibility audit.
Ожидается: оценка Accessibility ≥ 95. Частые ожидаемые «passed» чеки:
- Mobile dialog has accessible name ✅
- Escape closes dialog ✅
- Focus returns to trigger ✅
- Button has accessible name ✅

Если что-то Lighthouse помечает red — исправить и запушить фикс отдельным коммитом.

- [ ] **Step 3: Keyboard-only smoke**

Ручное прохождение:
- Tab-навигация по всему хедеру → основной контент → форма → футер без «потерь» фокуса.
- Escape во всех открытых оверлеях закрывает их корректно.
- Send в форме с `loading`-состоянием визуально и атрибутно корректен.

---

## Coverage check

| Audit # | Task | Status |
|---------|------|--------|
| #22 (mobile menu a11y) | Task 1 | ✅ |
| #26 (Services scroll + page-load) | Task 2 | ✅ |
| #30 (theme-color / color-scheme) | Task 4 | ✅ |
| #31 (Button loading/disabled) | Task 3 | ✅ |
