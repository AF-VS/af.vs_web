# i18n: Russian + Uzbek Localization

## Summary

Add full Russian and Uzbek (Latin script) translations to the AF Venture Studio landing page. Replace the current language toggle with a dropdown supporting three locales.

## Current State

- Astro native i18n routing: EN (default, `/`), RU (`/ru/`)
- Dictionary files: `src/i18n/en.ts` (complete), `src/i18n/ru.ts` (TBD placeholders)
- `Dict` type exported from `en.ts`, all components receive `dict` prop
- `src/lib/paths.ts` — `switchLocaleUrl()` handles two locales only
- Language switcher: simple toggle link in Header (desktop + mobile) and Footer
- `Locale` type: `'en' | 'ru'`

## Design

### 1. Astro Config

Add `'uz'` to locales array in `astro.config.mjs`:

```js
i18n: {
  defaultLocale: 'en',
  locales: ['en', 'ru', 'uz'],
  routing: { prefixDefaultLocale: false },
}
```

Routes: `/` (EN), `/ru/` (RU), `/uz/` (UZ).

### 2. Dictionary Files

**`src/i18n/ru.ts`** — Replace all "TBD RU" with Russian translations of EN content.

**`src/i18n/uz.ts`** (new) — Uzbek translations in Latin script. Same `Dict` type. Import type from `en.ts`.

Translation notes:
- Brand names (Memolink, Pandev metrics, Neva marketplace, AF Venture Studio) stay in English
- Technical terms (MVP, UI/UX, SaaS, FinTech, EdTech) stay in English
- `phone` field stays `'+998'` across all locales
- `footer.social` labels stay in English (LinkedIn, Instagram, etc.)
- `footer.copyright` stays `'© 2026'`
- `footer.brand` stays `'AF Venture studio'`

### 3. Locale Type & Path Utility

**`src/lib/paths.ts`:**
- Update `Locale` type: `'en' | 'ru' | 'uz'`
- Rewrite `switchLocaleUrl()` to be generic — strip any known locale prefix, then prepend target locale prefix (or none for `'en'`)
- Add `locales` array constant and `localeLabels` map for use by the language switcher

```ts
export type Locale = 'en' | 'ru' | 'uz';
export const locales: Locale[] = ['en', 'ru', 'uz'];
export const localeLabels: Record<Locale, string> = { en: 'En', ru: 'Ru', uz: "O'z" };
```

### 4. Page: `src/pages/uz/index.astro`

Copy of `ru/index.astro` with `uz` dict and `lang="uz"`.

### 5. Layout

Update `Layout.astro` — extend `lang` prop type to accept `'uz'`.

### 6. Language Switcher — Dropdown

Replace the toggle link in Header and Footer with a dropdown.

**`lang` key in Dict:** Replace `toggle`/`other` with a single `current` label (e.g. `'En'`, `'Ru'`, `'O\'z'`). Actually, since labels are locale-constant, move them to `localeLabels` in `paths.ts` and remove `lang` from Dict entirely.

**Header (desktop):**
- Button showing current locale label (e.g. "En")
- On click: toggle a small dropdown below with links to other two locales
- Click outside or Escape closes it
- Minimal JS (attach to existing `<script>` block in Header)

**Header (mobile):**
- In `mobile-menu__bottom`, show all three locales as inline links; current one visually distinct (e.g. opacity or underline)

**Footer:**
- Footer currently has no language switcher — no change needed

**Dropdown CSS:**
- Position: absolute, below the trigger button
- Background: `rgba(6, 11, 20, 0.95)`, `backdrop-filter: blur(20px)`
- Border: `1px solid rgba(255,255,255,0.1)`
- Border-radius: `12px`
- Each item: padding `8px 16px`, hover state same as nav links
- Consistent with existing header glass style

### 7. `Dict` Type Change

Remove `lang` key from `Dict` (and from all three dict files). The locale label is now derived from `localeLabels` in `paths.ts`, not from the dictionary.

### 8. Hero Title Accent Words

`Hero.astro` currently highlights "product" and "growth" in the English title. Russian and Uzbek titles should also have accent words. Add an optional `accentWords` field to `hero` in `Dict`:

```ts
hero: {
  title: string;
  cta: string;
  accentWords?: string[];
}
```

- EN: `['product', 'growth']`
- RU/UZ: define appropriate accent words for each translation

### 9. Footer Brand Link

Update `Footer.astro` brand link `href` to handle `'uz'` locale (currently only checks `'en'` vs `'ru'`). Use a locale-to-home-path map or ternary.

### 10. Header Brand Link

Same as footer — update `href` logic to support three locales.

## Out of Scope

- Form submission backend (`sendContact()` remains a stub)
- SEO meta tags per locale (can be added later)
- Locale detection / auto-redirect
- Additional pages beyond index
