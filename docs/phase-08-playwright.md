# Phase 8: E2E & Visual Regression (Playwright) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Покрыть лендинг Playwright-тестами: smoke e2e по всем секциям обеих локалей + visual regression baseline для desktop (1440×900) и mobile (375×812).

**Depends on:** [`phase-07-polish-deploy.md`](./phase-07-polish-deploy.md)

**Spec:** [`superpowers/specs/2026-04-09-afvs-landing-design.md`](./superpowers/specs/2026-04-09-afvs-landing-design.md)

**Architecture:** Playwright гоняется против `astro dev` (через `webServer` в конфиге, Playwright сам поднимает и глушит). Тесты в `e2e/`. Смоуки и визуалы — два отдельных файла. Visual screenshots хранятся в `e2e/__screenshots__/` (gitignore кроме baseline). Черновые скрипты сначала пишутся через `playwright-skill:playwright-skill` в `/tmp`, стабильные версии переносятся в `e2e/`.

**Tech Stack:** `@playwright/test`, Astro dev server.

**Out of scope:** GitHub Actions CI — вне этого плана.

---

## File Structure

- Modify: `package.json` — добавить `@playwright/test`, скрипты
- Create: `playwright.config.ts`
- Create: `e2e/smoke.spec.ts`
- Create: `e2e/visual.spec.ts`
- Create: `e2e/fixtures.ts` (viewport preset)
- Modify: `.gitignore` — добавить playwright артефакты

## Tasks

### Task 8.1: Инвокнуть `playwright-skill` для bootstrap

- [ ] **Step 1: Инвокнуть skill**

Инвокни `playwright-skill:playwright-skill` с контекстом: «Astro static landing on localhost:4321 with / and /ru/ routes. Need smoke tests for each section and visual regression for desktop + mobile viewports». Забери:
- правильную форму `playwright.config.ts` с `webServer`
- паттерн для visual snapshots
- рекомендации по `animations: 'disabled'` при скриншотах

### Task 8.2: Установить Playwright

- [ ] **Step 1: Установка**

Run: `npm i -D @playwright/test && npx playwright install chromium`
Expected: browser chromium скачан, `@playwright/test` в devDependencies.

- [ ] **Step 2: Добавить скрипты в `package.json`**

В секцию `scripts` добавь:

```json
"test:e2e":        "playwright test",
"test:e2e:update": "playwright test --update-snapshots",
"test:e2e:ui":     "playwright test --ui"
```

### Task 8.3: Создать `playwright.config.ts`

**Files:**
- Create: `playwright.config.ts`

- [ ] **Step 1: Написать файл**

```ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: [['list']],

  use: {
    baseURL: 'http://localhost:4321',
    trace: 'retain-on-failure',
  },

  projects: [
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 13'],
        viewport: { width: 375, height: 812 },
      },
    },
  ],

  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:4321',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },

  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.02,
      animations: 'disabled',
    },
  },
});
```

### Task 8.4: Создать `e2e/smoke.spec.ts`

**Files:**
- Create: `e2e/smoke.spec.ts`

- [ ] **Step 1: Написать файл**

```ts
import { test, expect } from '@playwright/test';

test.describe('Landing smoke — EN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('renders hero with heading and CTA', async ({ page }) => {
    await expect(page.getByRole('heading', { level: 1 })).toContainText('From idea to');
    await expect(page.getByRole('link', { name: 'Get started' })).toBeVisible();
  });

  test('renders 4 service cards', async ({ page }) => {
    const services = page.locator('#services article');
    await expect(services).toHaveCount(4);
    await expect(services.nth(0)).toContainText('Build');
    await expect(services.nth(1)).toContainText('AI');
    await expect(services.nth(2)).toContainText('Advisory');
    await expect(services.nth(3)).toContainText('Growth');
  });

  test('cases carousel advances with next button', async ({ page }) => {
    const track = page.locator('#cases [data-track]');
    const next = page.locator('#cases [data-dir="next"]');
    const initialScroll = await track.evaluate((el) => (el as HTMLElement).scrollLeft);
    await next.click();
    await page.waitForTimeout(500);
    const afterScroll = await track.evaluate((el) => (el as HTMLElement).scrollLeft);
    expect(afterScroll).toBeGreaterThan(initialScroll);
  });

  test('contact form: empty submit blocked by validation', async ({ page }) => {
    await page.goto('/#contact');
    const form = page.locator('[data-contact-form]');
    const submit = form.getByRole('button', { name: 'Send' });
    await submit.click();
    // Native validity API: the name field should be the first invalid.
    const firstInvalid = await form.locator('input:invalid, textarea:invalid').first();
    await expect(firstInvalid).toBeVisible();
  });

  test('contact form: valid submit shows unconfigured message', async ({ page }) => {
    await page.goto('/#contact');
    const form = page.locator('[data-contact-form]');
    await form.getByLabel('Name').fill('Test User');
    await form.getByLabel('Email').fill('test@example.com');
    await form.getByLabel('Message').fill('Hello from e2e test.');
    await form.getByRole('button', { name: 'Send' }).click();

    await expect(form.locator('[data-form-status]')).toHaveText(/not configured/i, { timeout: 5000 });
  });

  test('language switcher navigates to /ru/', async ({ page }) => {
    await page.getByRole('link', { name: /switch language/i }).click();
    await expect(page).toHaveURL(/\/ru\/?/);
  });
});

test.describe('Landing smoke — RU', () => {
  test('ru page renders', async ({ page }) => {
    await page.goto('/ru/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/от идеи/i);
  });

  test('ru → en via language switcher', async ({ page }) => {
    await page.goto('/ru/');
    await page.getByRole('link', { name: /switch language/i }).click();
    await expect(page).toHaveURL('http://localhost:4321/');
  });
});
```

### Task 8.5: Создать `e2e/visual.spec.ts`

**Files:**
- Create: `e2e/visual.spec.ts`

- [ ] **Step 1: Написать файл**

```ts
import { test, expect } from '@playwright/test';

const sections: Array<{ name: string; selector: string }> = [
  { name: 'hero',     selector: 'main > section:nth-of-type(1)' },
  { name: 'services', selector: '#services' },
  { name: 'cases',    selector: '#cases' },
  { name: 'form',     selector: '#contact' },
];

test.describe('Visual regression — EN', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    // Wait for fonts so that typography doesn't diff.
    await page.evaluate(() => document.fonts.ready);
  });

  for (const { name, selector } of sections) {
    test(`${name} section snapshot`, async ({ page }) => {
      const el = page.locator(selector).first();
      await el.scrollIntoViewIfNeeded();
      await expect(el).toHaveScreenshot(`${name}.png`);
    });
  }

  test('full page snapshot', async ({ page }) => {
    await expect(page).toHaveScreenshot('full-page.png', { fullPage: true });
  });
});
```

### Task 8.6: Обновить `.gitignore` для playwright артефактов

**Files:**
- Modify: `.gitignore`

- [ ] **Step 1: Добавить в конец**

```
# playwright
/test-results/
/playwright-report/
/playwright/.cache/
```

**Baseline screenshots (`e2e/smoke.spec.ts-snapshots/`, `e2e/visual.spec.ts-snapshots/`) — НЕ игнорировать, они должны быть в репо.**

### Task 8.7: Первый запуск — генерация baseline

- [ ] **Step 1: Запустить с `--update-snapshots`**

Run: `npm run test:e2e:update`
Expected: Playwright поднимает `astro dev`, бежит smoke + visual, генерирует baseline PNG-ки.

- [ ] **Step 2: Просмотреть что сгенерировалось**

Run: `ls -la e2e/visual.spec.ts-snapshots/ 2>/dev/null || ls -la e2e/__screenshots__/ 2>/dev/null`
Expected: файлы типа `hero-desktop-chromium.png`, `full-page-mobile-chromium.png`, итд.

Визуально проверь несколько PNG-ок — они должны соответствовать живой сборке.

### Task 8.8: Повторный прогон без обновления

- [ ] **Step 1: Обычный запуск**

Run: `npm run test:e2e`
Expected: все тесты зелёные (smoke + visual compared against baseline).

Если visual diff падает > 2% — это значит baseline был нестабилен. Решения:
1. Убедиться что все анимации/переходы заморожены (`animations: 'disabled'` в config — уже задано).
2. Убедиться что шрифты подгружаются до скриншота (`document.fonts.ready` — уже есть).
3. Регенерировать baseline если изменения легитимные.

### Task 8.9: Коммит Фазы 8

- [ ] **Step 1: Stage и commit**

```bash
git add package.json package-lock.json playwright.config.ts \
        e2e/ .gitignore
git commit -m "test(phase-8): playwright — smoke + visual regression e2e"
```

**Важно:** snapshot-PNG-ки тоже должны попасть в коммит (они лежат в `e2e/*.spec.ts-snapshots/`).

## Acceptance (run before marking phase complete)

- [ ] `npm run test:e2e` — все тесты зелёные (smoke + visual) локально
- [ ] Тесты прогоняются на обоих projects (desktop 1440×900 и mobile 375×812)
- [ ] Baseline screenshots закоммичены в репо
- [ ] `npx astro check && npm run build` всё ещё зелёные
- [ ] Коммит Фазы 8 создан

## Done!

Лендинг имплементирован, задеплоен и покрыт E2E + visual regression. Дальнейшие шаги (вне этого плана):

- Решение по каналу доставки формы (Telegram / Resend / другое) + wiring в `src/lib/contact.ts`
- GitHub Actions для автоматического прогона Playwright на PR
- Реальные кейсы (замена placeholder-ов в `cases.items`)
- Дополнительные социальные ссылки в `Footer` (уточнить в Figma)
