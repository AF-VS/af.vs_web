# Footer Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the footer with a two-row layout (brand + social links top, divider, copyright + nav links bottom), matching the reference image layout while using Figma design tokens.

**Architecture:** Rewrite the existing `Footer.astro` component with a richer two-row layout. Update i18n dictionary with new footer keys. All social links rendered as circular icon buttons using inline SVGs; nav links as text. No new dependencies needed.

**Tech Stack:** Astro, TypeScript strict, scoped `<style>`, CSS custom properties from `tokens.css`

**Figma divergence:** The Figma footer (node `285:1099`) is a single-row text-only layout. This redesign follows the user's reference image instead (two-row + icon buttons). The Figma tokens (colors, fonts, spacing) are still used.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/i18n/en.ts` | Modify | Add footer nav links + social link labels/hrefs |
| `src/components/chrome/Footer.astro` | Rewrite | Two-row footer with social icons, divider, nav links |

No new files needed. No new npm dependencies.

---

### Task 1: Update i18n dictionary

**Files:**
- Modify: `src/i18n/en.ts:101-108` (footer section)

- [ ] **Step 1: Add footer nav links and social links to `en.ts`**

Replace the existing `footer` object in `src/i18n/en.ts`:

```typescript
footer: {
  brand: 'AF Venture studio',
  copyright: '© 2026',
  nav: [
    { label: 'Services', href: '#services' },
    { label: 'Cases', href: '#cases' },
    { label: 'Bref', href: '#contact' },
  ],
  social: [
    { label: 'LinkedIn', href: 'https://linkedin.com' },
    { label: 'Instagram', href: 'https://instagram.com' },
    { label: 'Telegram', href: 'https://t.me' },
    { label: 'Mail', href: 'mailto:hello@afvs.studio' },
    { label: 'Clutch', href: 'https://clutch.co' },
  ],
},
```

> **Note:** The `social` field changes from an object with named keys (`{ instagram: '...', telegram: '...' }`) to an array of `{ label, href }` objects. This is a **breaking change** for the `Dict` type — `Footer.astro` is the only consumer, and it gets rewritten in Task 2, so this is safe.

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx astro check 2>&1 | head -30`

Expected: Type errors in `Footer.astro` (it still references old `dict.footer.social.instagram`). This is expected — Task 2 fixes it.

- [ ] **Step 3: Commit**

```bash
git add src/i18n/en.ts
git commit -m "feat(footer): update i18n with nav links and social links array"
```

---

### Task 2: Rewrite Footer component

**Files:**
- Rewrite: `src/components/chrome/Footer.astro`

- [ ] **Step 1: Write the new `Footer.astro`**

Replace the entire file with:

```astro
---
import type { Dict } from '../../i18n/en';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;
---

<footer class="footer" role="contentinfo">
  <div class="container footer__inner">
    <!-- Row 1: brand + social icons -->
    <div class="top">
      <a class="brand" href="/" aria-label="AF Venture Studio — home">
        {dict.footer.brand}
      </a>
      <ul class="socials">
        {dict.footer.social.map(({ label, href }) => (
          <li>
            <a
              class="social-btn"
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
            >
              <span class="social-icon" data-icon={label.toLowerCase()} />
            </a>
          </li>
        ))}
      </ul>
    </div>

    <!-- Divider -->
    <hr class="divider" />

    <!-- Row 2: copyright + nav links -->
    <div class="bottom">
      <span class="copyright">{dict.footer.copyright}</span>
      <nav class="nav-links" aria-label="Footer">
        {dict.footer.nav.map(({ label, href }) => (
          <a href={href}>{label}</a>
        ))}
      </nav>
    </div>
  </div>
</footer>

<style>
  .footer {
    padding-block: 48px;
    margin-top: 96px;
  }

  .footer__inner {
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  /* ── Row 1: brand + socials ── */
  .top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .brand {
    font-family: var(--font-display);
    font-size: 20px;
    font-weight: 700;
    letter-spacing: 1.4px;
    text-transform: uppercase;
    color: var(--text-primary);
  }

  .socials {
    display: flex;
    gap: 12px;
    list-style: none;
  }

  .social-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.1);
    color: var(--text-subtle);
    transition: background 0.15s ease, color 0.15s ease;
  }

  .social-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    color: var(--text-primary);
  }

  /* Icon placeholder — replaced by inline SVGs in the markup via a
     <style> + background-image approach or by injecting SVG directly.
     See Step 2 for the SVG injection approach. */

  /* ── Divider ── */
  .divider {
    border: none;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    margin-block: 24px;
  }

  /* ── Row 2: copyright + nav ── */
  .bottom {
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;
  }

  .copyright {
    font-size: var(--font-size-caption);
    color: var(--text-secondary);
    letter-spacing: 1.4px;
    text-transform: uppercase;
  }

  .nav-links {
    display: flex;
    gap: 24px;
  }

  .nav-links a {
    font-size: var(--font-size-caption);
    color: var(--text-secondary);
    letter-spacing: 0.05em;
    text-transform: uppercase;
    transition: color 0.15s ease;
    padding-block: 8px;
    min-height: 44px;
    display: inline-flex;
    align-items: center;
  }

  .nav-links a:hover {
    color: var(--text-primary);
  }

  /* ── Mobile ── */
  @media (max-width: 767px) {
    .top {
      flex-direction: column;
      align-items: flex-start;
    }
    .bottom {
      flex-direction: column;
      align-items: flex-start;
    }
  }
</style>
```

> **Note on social icons:** The `<span class="social-icon" data-icon="...">` is a placeholder. Step 2 replaces it with actual inline SVGs.

- [ ] **Step 2: Add inline SVG icons for each social link**

Replace the `<span class="social-icon" .../>` placeholder with actual inline SVGs in the `.map()`. Update the markup inside the `<ul class="socials">` to:

```astro
{dict.footer.social.map(({ label, href }) => (
  <li>
    <a
      class="social-btn"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
    >
      {label === 'LinkedIn' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/>
          <rect width="4" height="12" x="2" y="9"/>
          <circle cx="4" cy="4" r="2"/>
        </svg>
      )}
      {label === 'Instagram' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      )}
      {label === 'Telegram' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="m22 2-7 20-4-9-9-4Z"/>
          <path d="M22 2 11 13"/>
        </svg>
      )}
      {label === 'Mail' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <rect width="20" height="16" x="2" y="4" rx="2"/>
          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
        </svg>
      )}
      {label === 'Clutch' && (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z"/>
        </svg>
      )}
    </a>
  </li>
))}
```

> These SVGs are standard Lucide-style icons (stroke-based), except Clutch which uses a simple filled circle placeholder. The icons match the reference image's style — thin stroke, 18px inside a 40px circle button.

- [ ] **Step 3: Verify build**

Run: `npx astro check 2>&1 | head -30`
Expected: No errors.

Run: `npx astro build 2>&1 | tail -10`
Expected: Build succeeds.

- [ ] **Step 4: Commit**

```bash
git add src/components/chrome/Footer.astro
git commit -m "feat(footer): redesign with two-row layout, social icons, nav links"
```

---

### Task 3: Visual verification

- [ ] **Step 1: Start dev server and verify**

Run: `npx astro dev`

Open `http://localhost:4321` and scroll to footer. Verify:
- [ ] Brand "AF Venture studio" is top-left, Space Grotesk Bold 20px uppercase
- [ ] 5 social icon buttons are top-right in circular buttons
- [ ] Horizontal divider separates rows
- [ ] "© 2026" is bottom-left, caption size, text-secondary color
- [ ] "Services", "Cases", "Bref" links are bottom-right, caption size, uppercase
- [ ] Hover states work (buttons brighten, links turn white)
- [ ] Mobile view stacks vertically

- [ ] **Step 2: Compare with Figma screenshot**

Check that colors and typography match Figma tokens:
- Brand: `--text-primary` (#f8f9fe)
- Links/copyright: `--text-secondary` (rgba 255,255,255,0.6)
- Background: inherits `--surface-bg` (#060b14)
- Font: Inter for links, Space Grotesk for brand

---

## Open questions for the user

1. **Social link URLs** — placeholder URLs used (`https://linkedin.com`, etc.). Replace with actual company profile URLs when available.
2. **Mail address** — used `hello@afvs.studio` as placeholder. Confirm the correct email.
3. **Clutch icon** — no standard Lucide icon for clutch.co. A simple circle placeholder is used. Consider replacing with the actual Clutch logo SVG if available.
4. **Figma divergence** — this layout departs from the Figma footer design (single-row text links). If the Figma design should be updated to match, coordinate with the designer.
