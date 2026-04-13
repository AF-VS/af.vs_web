# Responsive Scaling Design

Адаптивность сайта AF Venture Studio для экранов от 320px до 4K (2560px+).

## Решения

- **Стратегия масштабирования:** Гибрид — контейнер расширяется до разумного предела, контент масштабируется пропорционально через `clamp()`
- **Шрифты:** `clamp()` на уровне токенов в `tokens.css`
- **Safe-area:** `clamp(16px, 5vw, 200px)` — единый padding для всех breakpoints
- **Секции 100vh:** `min-height: 100dvh` на desktop/tablet, `auto` на mobile (< 744px)

## Breakpoints

| Имя | min-width | Контейнер max-width |
|-----|-----------|---------------------|
| mobile | 320px+ | 100% - safe-area |
| tablet | 744px+ | 700px |
| laptop | 984px+ | 936px |
| desktop | 1248px+ | 1200px |
| 2k | 1920px+ | 1600px |
| 4k | 2560px+ | 2200px |

## Изменения в tokens.css

### Container & Layout

```css
--container-padding: clamp(16px, 5vw, 200px);
--header-height: clamp(64px, 6.5vw, 120px);
--cta-width: clamp(200px, 17vw, 320px);
--cta-height: clamp(44px, 3.8vw, 68px);
```

Убрать: `--container-max-desktop`, `--container-max-laptop`, `--container-padding-desktop`, `--container-padding-laptop`, `--container-padding-mobile`.

### Typography

| Токен | Было | Станет |
|-------|------|--------|
| `--font-size-h1` | `62px` | `clamp(36px, 4.2vw, 86px)` |
| `--font-size-h2` | `48px` | `clamp(28px, 3.2vw, 66px)` |
| `--font-size-h4` | `32px` | `clamp(22px, 2.2vw, 44px)` |
| `--font-size-h5` | `26px` | `clamp(18px, 1.8vw, 36px)` |
| `--font-size-body` | `16px` | `clamp(14px, 1.1vw, 20px)` |
| `--font-size-caption` | `14px` | `clamp(12px, 0.95vw, 18px)` |

### Spacing

Новые токены:

```css
--spacing-section: clamp(24px, 3.2vw, 64px);
--spacing-card: clamp(16px, 2.2vw, 40px);
--spacing-grid: clamp(16px, 2.5vw, 48px);
```

### Radius

```css
--radius-card: clamp(16px, 2.2vw, 40px);  /* было 32px */
```

## Изменения в global.css

### Container

```css
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
```

### Section viewport utility

```css
.section-viewport {
  min-height: 100dvh;
}

@media (max-width: 743px) {
  .section-viewport {
    min-height: auto;
  }
}
```

## Изменения по компонентам

### Header.astro
- `max-width: 1200px` из `.header__inner` -> убрать, использовать container-систему
- `padding-inline` (3 media-query) -> единый `var(--container-padding)`
- Burger `44x44` -> `clamp(36px, 3vw, 52px)`
- Breakpoint показа desktop-nav: 744px

### Hero.astro
- `min-height: 100vh/100dvh` -> класс `.section-viewport`
- `font-size: clamp(40px, 6vw, 62px)` -> `var(--font-size-h1)` (токен уже с clamp)
- `padding-top: calc(var(--header-height) + 64px)` -> `calc(var(--header-height) + var(--spacing-section))`
- CTA `bottom: 48px` -> `clamp(32px, 4vh, 64px)`

### Services.astro
- `height: 100dvh` -> класс `.section-viewport`
- Grid gap `24/32/48px` -> `var(--spacing-grid)`
- `padding-inline` (3 media-query) -> `var(--container-padding)`
- Card padding `32px` -> `var(--spacing-card)`

### ServiceCard.astro
- `padding: 32px` -> `var(--spacing-card)`
- `border-radius` — уже токен, подхватит clamp автоматически
- Шрифты через токены — автоматически

### CasesCarousel.astro
- `min-height: 100vh` -> класс `.section-viewport`
- Header max-width -> container-система
- Arrow `48x48` -> `clamp(36px, 3.2vw, 60px)`
- Gap `48px` -> `var(--spacing-grid)`
- Padding-left/right расчёты -> `var(--container-padding)`

### CaseCard.astro
- `width: min(85vw, 560px)` -> `min(85vw, clamp(400px, 38vw, 720px))`
- Photo `height: 380px` -> `clamp(240px, 26vw, 480px)`
- `padding: 24px` -> `var(--spacing-card)`
- `border-radius: 22px` -> `var(--radius-card)`

### BrefForm.astro
- `height: 100vh` -> класс `.section-viewport`
- `max-width: 1200px` -> container max-width система
- `max-height: 720px` -> `clamp(520px, 60vh, 900px)`
- Существующие clamp() — оставить/адаптировать

### Footer.astro
- `width: 100vw` + negative margin — оставить (full-bleed)
- Padding -> `var(--container-padding)`
- Social buttons `40x40` -> `clamp(36px, 3vw, 52px)`
- Шрифты — автоматически через токены

### Button.astro
- `min-width` / `height` через токены — подхватит clamp
- `padding-inline: 32px` -> `clamp(20px, 2.2vw, 40px)`

### GlowBackground.astro
- Grid `background-size: 80px` -> `clamp(40px, 5.5vw, 100px)`
- Orbs `448x448` -> `clamp(200px, 30vw, 600px)`
- `blur(120px)` -> `blur(clamp(60px, 8vw, 160px))`

## Принципы реализации

1. **Токены — единственный источник значений.** Хардкод px в компонентах запрещён.
2. **`clamp()` вместо media-query** для размеров, шрифтов и spacing где возможно.
3. **Media-query только для layout-изменений** (grid columns, flex-direction, show/hide элементов).
4. **Mobile-first CSS.** Base styles = mobile, расширяем через `min-width`.
5. **`100dvh` вместо `100vh`** для учёта адресной строки браузера.

## Файлы для изменения (в порядке приоритета)

1. `src/styles/tokens.css`
2. `src/styles/global.css`
3. `src/components/chrome/Header.astro`
4. `src/components/hero/Hero.astro`
5. `src/components/services/Services.astro`
6. `src/components/services/ServiceCard.astro`
7. `src/components/cases/CasesCarousel.astro`
8. `src/components/cases/CaseCard.astro`
9. `src/components/form/BrefForm.astro`
10. `src/components/chrome/Footer.astro`
11. `src/components/ui/Button.astro`
12. `src/components/layout/GlowBackground.astro`
