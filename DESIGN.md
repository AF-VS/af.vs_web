# AF Venture Studio — Design Reference

Справочник по макету из Figma. Используется как источник правды для визуала. Правится только при обновлении Figma-файла.

- **Figma:** https://www.figma.com/design/L3skuk3D54hgX93qX7EIjd/AF.VS---web?node-id=277-734
- **fileKey:** `L3skuk3D54hgX93qX7EIjd`
- **Canvas node:** `277:734`

## Структура страницы

Одностраничный лендинг, сверху вниз:

1. **Header** — лого `AF VENTURE STUDIO`, nav (`Services`, `Portfolio`, `Contact`), переключатель языка (`En`).
2. **Hero** — заголовок *«From idea to product, from product to growth»* (слова `product` и `growth` — акцентный `#91c6f2`), фон-гора, CTA-кнопка *Get started*.
3. **Services** — 4 карточки:
   - **Build** — *From idea to launch-ready product* — теги: `product discovery`, `ui/ux design`, `mvp development`, `full-cycle product`
   - **AI** — *Practical AI for real product use cases* — теги: `ai-powered features`, `integrations`
   - **Advisory** — *Strategic support for product decisions* — теги: `product strategy`, `delivery setup`
   - **Growth** — *From launch to long-term product growth* — теги: `expansion`, `upgrade`, `support`, `iteration`
4. **Cases** — заголовок *Our latest work*, карусель из 3 карточек с кнопками ←/→.
5. **Form** — контактная форма (1200×640 на десктопе).
6. **Footer** — `AF Venture studio` • `© 2026` • 5 социалок (`INSTAGRAM`, `TELEGRAM`, + 3).

## Figma node IDs

Используй при вызовах `get_design_context(nodeId, fileKey="L3skuk3D54hgX93qX7EIjd")`.

| Секция          | Node ID     |
| --------------- | ----------- |
| Design (canvas) | `277:734`   |
| Frame 1440      | `277:735`   |
| Frame 984       | `298:1519`  |
| Hero            | `285:1100`  |
| Services        | `285:949`   |
| Cases           | `285:1009`  |
| Form            | `285:1080`  |
| Footer          | `285:1099`  |

## Design tokens

Объявляются в `src/styles/tokens.css` через `:root`. Имена в коде — с дефисами (в Figma слэши).

### Colors

```css
:root {
  /* Surface */
  --surface-white: #f8f9fe;
  --surface-card:  #0a1626;   /* фон карточек */
  --surface-bg:    #060b14;   /* основной фон страницы (dark navy) */

  /* Primary */
  --primary-default: #158ef2; /* CTA, ссылки, active */
  --primary-accent:  #91c6f2; /* акцент в hero-заголовке */

  /* Text on dark */
  --text-primary:   #f8f9fe;
  --text-subtle:    rgba(255, 255, 255, 0.8);
  --text-secondary: rgba(255, 255, 255, 0.6);

  /* Borders */
  --border-card: rgba(255, 255, 255, 0.6);
}
```

### Typography

- **Display / H1** — `Space Grotesk` Bold 700
- **Всё остальное** — `Inter` (Regular 400, Medium 500, Semi Bold 600)

| Токен              | Семейство     | Вес | Размер         | line-height | letter-spacing | Пример                         |
| ------------------ | ------------- | --- | -------------- | ----------- | -------------- | ------------------------------ |
| `font-h1`          | Space Grotesk | 700 | 62px (desktop) | 1           | −2px           | Hero-заголовок                 |
| `font-h4`          | Inter         | 600 | 32px           | 1.3         | −1px           | Заголовки карточек услуг       |
| `font-h5`          | Inter         | 600 | 26px           | 1.2         | −1px           | Логотип в шапке                |
| `font-body`        | Inter         | 400 | 16px           | 1.5         | 0              | Параграфы, nav, подписи        |
| `font-body-strong` | Inter         | 600 | 16px           | 1.5         | 0              | Текст кнопок                   |
| `font-caption`     | Inter         | 500 | 14px           | 2           | 0              | Chip-теги в карточках услуг    |

Шрифты подключаются через `@fontsource/inter` + `@fontsource/space-grotesk`.

### Radii / spacing

| Переменная        | Значение             | Где используется                 |
| ----------------- | -------------------- | -------------------------------- |
| `--radius-card`   | `32px`               | service card, case card          |
| `--radius-pill`   | `999px`              | кнопки, chip-теги                |
| Card padding      | `24px`               | внутренний паддинг карточек      |
| Card border       | `2px solid var(--border-card)` | бордер карточек       |
| Container (1440)  | `1200px`             | боковые поля `120px`             |
| Container (984)   | `936px`              | боковые поля `24px`              |
| Header height     | `96px`               | десктоп                          |
| CTA Button        | `256×56`, pill       | Get started                      |

## Breakpoints

В Figma 4 колонки. Mobile-first CSS, ширины через `min-width`.

| Name    | Min width | Figma-фрейм          | Контейнер              |
| ------- | --------- | -------------------- | ---------------------- |
| desktop | ≥1248px   | `1248+` (1440 шир.)  | 1200px, паддинги 120px |
| laptop  | ≥984px    | `984+`               | 936px, паддинги 24px   |
| tablet  | ≥768px    | `768+`               | см. Figma              |
| mobile  | <768px    | `375`                | padding 16–24px        |

## Компоненты

- **`Header`** — лого + nav + language switcher
- **`Button`** — variant `primary`: белый фон `#f8f9fe`, синий текст `--primary-default`, pill 56px высотой
- **`Chip`** (в Figma — `cheap`) — бордер `--text-secondary`, pill, padding `4px 16px`, caption
- **`ServiceCard`** — dark bg, border, radius 32, изображение-аксессуар с blend-mode, заголовок h4, описание, список `Chip`
- **`CaseCard`** — 472×512 на десктопе
- **`CasesCarousel`** — 3 видимых карточки + стрелки ←/→ (56×56)
- **`ContactForm`**
- **`Footer`**
- **`GlowBackground`** — 5 размытых эллипсов `grow` (448px) + grid-фон страницы

### Visual effects

- Фон страницы: grid-паттерн + 5 синих `grow`-эллипсов с большим blur (ambient glow).
- Hero: изображение горы с маской-прямоугольником — нижняя часть «выезжает» из контейнера.
- `service_card` изображения: `mix-blend-lighten` (opacity 60%) или `mix-blend-screen` (opacity 80%), часть повернута (например `rotate(-170.43deg)` в AI-карточке).

## Копирайт

Все тексты на английском, источник правды — Figma.

- Brand: `AF VENTURE STUDIO`
- Tagline: `From idea to product, from product to growth`
- CTA: `Get started`
- Nav: `Services`, `Portfolio`, `Contact`
- Section title: `Our latest work`
- Footer copyright: `© 2026`
- Footer links: `INSTAGRAM`, `TELEGRAM` (+ ещё 3 — уточнить в Figma)
