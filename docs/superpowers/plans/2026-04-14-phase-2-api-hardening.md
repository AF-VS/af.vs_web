# Phase 2 — API Hardening & Data Layer

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Сделать `/api/contact` безопасным, устойчивым и предсказуемым: антибот-защита, внешний rate-limit, унификация env, строгая валидация, корректные типы, безопасный XSS-паттерн.

**Architecture:**
1. Окончательное решение: **оставить Drizzle + Turso** (в проекте уже есть зависимости и конфиг). Переиспользовать `src/db/` и `src/lib/telegram.ts` как библиотечные модули, а `pages/api/contact.ts` перевести на них.
2. Rate-limit вынести в Upstash Redis (единственный ресурс через Vercel Marketplace — см. Step 1 Task 1).
3. Антибот: honeypot-поле + проверка времени заполнения + опциональный Vercel BotID.
4. XSS в Hero заменить на токенизацию в TS-слое.

**Tech Stack:** Astro APIRoute, Drizzle ORM, libsql, Upstash Redis (через `@upstash/redis` + `@upstash/ratelimit`), Zod для валидации.

**Covered audit findings:** #2 (rate-limit), #3 (antibot), #4 (process.env / import.meta.env), #6 (Hero XSS), #8 (stack drift / Drizzle), #21 (Drizzle migrations), #23 (loose validation).

**Note on #24 (created_at type):** изначально план предлагал миграцию `text` → `integer('created_at', { mode: 'timestamp_ms' })`. Однако Turso уже содержит продовые данные в `submissions` с ISO-строками. SQLite не умеет явного `ALTER COLUMN TYPE`, безопасная миграция потребовала бы drop-recreate-copy цикла с риском потери данных. Для лендинг-формы с десятками строк это избыточно — ISO-текст сортируется лексикографически и индексируется корректно. **Решение: оставляем `created_at` как `text('created_at').notNull()`.** Пункт #24 закрывается как «осознанно не изменяется из-за существующих данных».

**Prerequisites:** Phase 1 завершена (удалены дубликаты модулей `src/db/*` и `src/lib/telegram.ts`).

---

### Task 1: Воссоздать `src/db/` и `src/lib/telegram.ts` в каноничном виде

Phase 1 удалила старые файлы из-за дублирования. Восстанавливаем их как единственный источник правды, но сразу с правильной типизацией и `import.meta.env`.

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `src/lib/telegram.ts`

- [ ] **Step 1: Schema (keep text createdAt — matches existing Turso data)**

Создать `src/db/schema.ts`:

```ts
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const submissions = sqliteTable('submissions', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  productType: text('product_type').notNull(),
  readinessStage: text('readiness_stage').notNull(),
  platform: text('platform').notNull(),
  industry: text('industry').notNull(),
  name: text('name').notNull(),
  projectName: text('project_name'),
  email: text('email').notNull(),
  phone: text('phone'),
  createdAt: text('created_at').notNull(),
});

export type Submission = typeof submissions.$inferInsert;
```

Схема идентична той, что инлайнится в текущем `pages/api/contact.ts`. Это гарантирует совместимость с существующими данными в Turso.

- [ ] **Step 2: DB client с lazy init и `import.meta.env`**

Создать `src/db/client.ts`:

```ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

type Db = ReturnType<typeof drizzle<typeof schema>>;
let cached: Db | null = null;

export function getDb(): Db {
  if (cached) return cached;
  const url = import.meta.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured');
  const turso = createClient({ url, authToken: import.meta.env.TURSO_AUTH_TOKEN });
  cached = drizzle(turso, { schema });
  return cached;
}
```

- [ ] **Step 3: Telegram helper с `import.meta.env`**

Создать `src/lib/telegram.ts`:

```ts
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export interface SubmissionPayload {
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
}

export function formatSubmissionMessage(data: SubmissionPayload): string {
  return [
    `<b>Новая заявка</b>`,
    ``,
    `<b>Тип:</b> ${escapeHtml(data.productType)}`,
    `<b>Стадия:</b> ${escapeHtml(data.readinessStage)}`,
    `<b>Платформа:</b> ${escapeHtml(data.platform)}`,
    `<b>Индустрия:</b> ${escapeHtml(data.industry)}`,
    ``,
    `<b>Имя:</b> ${escapeHtml(data.name)}`,
    `<b>Проект:</b> ${escapeHtml(data.projectName || '—')}`,
    `<b>Email:</b> ${escapeHtml(data.email)}`,
    `<b>Тел:</b> ${escapeHtml(data.phone || '—')}`,
  ].join('\n');
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, parse_mode: 'HTML', text }),
  });

  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { description?: string };
    console.error('[telegram] sendMessage failed:', body.description);
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add src/db src/lib/telegram.ts
git commit -m "feat(server): canonical db client + telegram helper with import.meta.env"
```

---

### Task 2: Добавить Zod и описать схему валидации

Заменить самописный `validate()` на zod-схему со строгими ограничениями.

**Files:**
- Modify: `package.json`
- Create: `src/lib/contactSchema.ts`

- [ ] **Step 1: Установить zod**

Run: `npm install zod@^3`

- [ ] **Step 2: Создать схему**

Создать `src/lib/contactSchema.ts`:

```ts
import { z } from 'zod';

const PRODUCT_TYPES = ['MVP', 'Complex solution', 'Enterprise software', 'Audit & Refactoring',
  'Сложное решение', 'Корпоративное ПО', 'Аудит и рефакторинг',
  'Murakkab yechim', 'Korporativ dastur', 'Audit va refaktoring'] as const;

export const contactSchema = z.object({
  productType: z.string().min(1).max(80),
  readinessStage: z.string().min(1).max(80),
  platform: z.string().min(1).max(80),
  industry: z.string().min(1).max(80),
  name: z.string().trim().min(1).max(120),
  projectName: z.string().trim().max(120).optional().default(''),
  email: z.string().trim().email().max(254),
  phone: z.string().trim().max(32).optional().default(''),
  // Antibot fields — см. Task 4
  website: z.string().max(0).optional().default(''),
  startedAt: z.number().int().positive(),
});

export type ContactInput = z.infer<typeof contactSchema>;
```

Комментарий: `PRODUCT_TYPES` оставлен как справочный массив. Строгая enum-валидация не используется, т.к. значения — из i18n (EN/RU/UZ) и контроль должен быть по длине + known-list сверху. При необходимости можно ужесточить позже.

- [ ] **Step 3: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json src/lib/contactSchema.ts
git commit -m "feat(server): add zod-based contact validation schema"
```

---

### Task 3: Подключить Upstash Redis для rate-limit

Vercel Marketplace: Upstash → Redis. Env vars поступят автоматически. Но пока их нет — код должен gracefully fail-open (с логом) на локалке.

**Files:**
- Modify: `package.json`
- Create: `src/lib/rateLimit.ts`

- [ ] **Step 1: Установить пакеты**

Run: `npm install @upstash/redis @upstash/ratelimit`

- [ ] **Step 2: Реализовать rateLimit helper**

Создать `src/lib/rateLimit.ts`:

```ts
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

let limiter: Ratelimit | null = null;

function getLimiter(): Ratelimit | null {
  if (limiter) return limiter;
  const url = import.meta.env.UPSTASH_REDIS_REST_URL;
  const token = import.meta.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  const redis = new Redis({ url, token });
  limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'),
    analytics: false,
    prefix: 'afvs:contact',
  });
  return limiter;
}

export async function checkRateLimit(ip: string): Promise<{ success: boolean; retryAfter?: number }> {
  const rl = getLimiter();
  if (!rl) {
    console.warn('[rate-limit] Upstash not configured, fail-open');
    return { success: true };
  }
  const { success, reset } = await rl.limit(ip);
  return { success, retryAfter: success ? undefined : Math.ceil((reset - Date.now()) / 1000) };
}
```

- [ ] **Step 3: Задокументировать env vars в README-комментарии**

Добавить в начало `src/lib/rateLimit.ts` короткий комментарий:
```ts
// Requires UPSTASH_REDIS_REST_URL and UPSTASH_REDIS_REST_TOKEN.
// Install via: Vercel Marketplace → Upstash → Redis (auto-populates env).
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/lib/rateLimit.ts
git commit -m "feat(server): Upstash Redis rate-limit with fail-open fallback"
```

---

### Task 4: Honeypot + time-trap антибот-защита в форме

Добавить в BrifForm скрытое поле `website` (боты заполняют все inputs) и собрать `startedAt` (ms) — если форму отправили быстрее 3 секунд, это бот.

**Files:**
- Modify: `src/components/form/BrifForm.astro`
- Modify: `src/lib/contact.ts`

- [ ] **Step 1: Добавить honeypot input в разметку**

Edit в `src/components/form/BrifForm.astro`, внутри Right Panel, перед `<div class="brif-steps">`:

```astro
<!-- Antibot: honeypot + start time -->
<input
  type="text"
  name="website"
  class="brif-honeypot"
  tabindex="-1"
  autocomplete="off"
  aria-hidden="true"
/>
```

И добавить в `<style>`:

```css
.brif-honeypot {
  position: absolute;
  left: -9999px;
  top: -9999px;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
```

- [ ] **Step 2: Замерить startedAt в скрипте**

В `src/components/form/BrifForm.astro` в `initBrifWizard()` в начале функции:

```ts
const startedAt = Date.now();
```

И в блоке отправки (currentStep === 5), передавать новые поля:

```ts
const honeypot = wizard.querySelector<HTMLInputElement>('input[name="website"]')?.value || '';

sendContact({
  productType: selections['productType'] || '',
  readinessStage: selections['readiness'] || '',
  platform: selections['platform'] || '',
  industry: selections['industry'] || '',
  name: nameVal,
  projectName: projectVal,
  email: emailVal,
  phone: phoneVal,
  website: honeypot,
  startedAt,
})
```

- [ ] **Step 3: Обновить тип BrifPayload в lib/contact.ts**

Edit `src/lib/contact.ts`:

```ts
export interface BrifPayload {
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
  website: string;
  startedAt: number;
}

export async function sendContact(payload: BrifPayload): Promise<void> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error((body as { error?: string }).error || `HTTP ${res.status}`);
  }
}
```

- [ ] **Step 4: Typecheck**

Run: `npm run check`
Expected: `0 errors`.

- [ ] **Step 5: Commit**

```bash
git add src/components/form/BrifForm.astro src/lib/contact.ts
git commit -m "feat(form): add honeypot + startedAt antibot fields"
```

---

### Task 5: Переписать `pages/api/contact.ts` поверх библиотечных модулей

Использовать `getDb`, `sendTelegramMessage`, `formatSubmissionMessage`, `contactSchema`, `checkRateLimit`. Проверить honeypot и time-trap.

**Files:**
- Modify: `src/pages/api/contact.ts` (полная перезапись)

- [ ] **Step 1: Переписать роут**

Overwrite `src/pages/api/contact.ts`:

```ts
import type { APIRoute } from 'astro';
import { getDb } from '../../db/client';
import { submissions } from '../../db/schema';
import { contactSchema } from '../../lib/contactSchema';
import { checkRateLimit } from '../../lib/rateLimit';
import { sendTelegramMessage, formatSubmissionMessage } from '../../lib/telegram';

export const prerender = false;

const ALLOWED_ORIGINS = new Set([
  'https://afvs.studio',
  'https://www.afvs.studio',
]);

const MIN_FILL_TIME_MS = 3000;

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  return ALLOWED_ORIGINS.has(origin);
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

export const OPTIONS: APIRoute = ({ request }) => {
  const origin = request.headers.get('origin') ?? undefined;
  if (isOriginAllowed(origin)) {
    return new Response(null, { status: 204, headers: corsHeaders(origin!) });
  }
  return new Response(null, { status: 204 });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get('origin') ?? undefined;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (isOriginAllowed(origin)) headers['Access-Control-Allow-Origin'] = origin!;

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || clientAddress
    || 'unknown';

  const rl = await checkRateLimit(ip);
  if (!rl.success) {
    return new Response(
      JSON.stringify({ error: 'Too many requests' }),
      { status: 429, headers: { ...headers, 'Retry-After': String(rl.retryAfter ?? 60) } }
    );
  }

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const parsed = contactSchema.safeParse(raw);
  if (!parsed.success) {
    return new Response(JSON.stringify({ error: 'Validation failed' }), { status: 400, headers });
  }

  const data = parsed.data;

  // Antibot: honeypot — если не пусто, бот
  if (data.website) {
    // Возвращаем 200 чтобы не палить логику боту
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  // Antibot: time-trap — слишком быстрая отправка
  const elapsed = Date.now() - data.startedAt;
  if (elapsed < MIN_FILL_TIME_MS) {
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  try {
    const db = getDb();
    await db.insert(submissions).values({
      productType: data.productType,
      readinessStage: data.readinessStage,
      platform: data.platform,
      industry: data.industry,
      name: data.name,
      projectName: data.projectName || null,
      email: data.email,
      phone: data.phone || null,
      createdAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error('[api/contact] DB insert failed:', err);
    return new Response(JSON.stringify({ error: 'Database error' }), { status: 500, headers });
  }

  try {
    await sendTelegramMessage(formatSubmissionMessage({
      productType: data.productType,
      readinessStage: data.readinessStage,
      platform: data.platform,
      industry: data.industry,
      name: data.name,
      projectName: data.projectName || '',
      email: data.email,
      phone: data.phone || '',
    }));
  } catch (err) {
    console.warn('[api/contact] Telegram failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
```

- [ ] **Step 2: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, успешный build.

- [ ] **Step 3: Commit**

```bash
git add src/pages/api/contact.ts
git commit -m "refactor(api): use shared db/lib modules + zod validation + honeypot + time-trap"
```

---

### Task 6: Drizzle миграции (baseline для существующей БД)

Подключить drizzle-kit migrations для воспроизводимой схемы. **Важно:** Turso уже содержит таблицу `submissions` с продовыми данными. Схема из Task 1 идентична существующей, поэтому:
- Сгенерировать initial migration (чтобы иметь её в репо для будущих изменений).
- **Не применять** `db:migrate` — таблица уже есть.
- Пометить initial migration как применённую в `__drizzle_migrations` (если будет запускаться `db:migrate` в будущем, Drizzle поймёт что 0000 уже «активна»).

**Files:**
- Generate: `drizzle/0000_*.sql` + `drizzle/meta/*` (через drizzle-kit)
- Modify: `package.json` (добавить script `db:generate`, `db:migrate`)
- Create: `drizzle/README.md` (документация baseline'а)

- [ ] **Step 1: Добавить скрипты в package.json**

В `package.json` в `scripts` добавить:

```json
"db:generate": "drizzle-kit generate",
"db:migrate": "drizzle-kit migrate"
```

- [ ] **Step 2: Сгенерировать миграцию**

Run: `npm run db:generate`
Expected: создастся папка `drizzle/` с `0000_<name>.sql` и `meta/_journal.json`.

- [ ] **Step 3: НЕ запускать db:migrate**

Таблица `submissions` уже существует в Turso с продовыми данными. Применение initial-migration приведёт к `CREATE TABLE` ошибке или (что хуже) пересозданию таблицы с потерей данных.

Если в будущем понадобится впервые применить `db:migrate` к Turso — сначала вручную вставить запись в служебную таблицу drizzle, чтобы зафиксировать, что миграция 0000 считается применённой:

```sql
-- Выполнить один раз через Turso shell:
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY,
  hash TEXT NOT NULL,
  created_at INTEGER
);
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('<hash из drizzle/meta/_journal.json>', <unix_ms>);
```

Этот шаг задокументирован в `drizzle/README.md` (Step 4) — делать **только если** реально появляется необходимость.

- [ ] **Step 4: Создать `drizzle/README.md`**

```markdown
# Drizzle Migrations

## Baseline

Migration `0000_*.sql` — baseline, отражающий схему существующей продовой таблицы `submissions` в Turso. **Не применяйте её к уже существующей БД** — таблица уже создана. Файл нужен:

1. Для воспроизводимого первичного развёртывания в новое окружение.
2. Как отправная точка для будущих `drizzle-kit generate` (diff от неё).

## Воркфлоу будущих изменений схемы

1. Меняем `src/db/schema.ts`.
2. `npm run db:generate` — создастся `drizzle/0001_*.sql`.
3. Ревьюим SQL.
4. Применяем в staging / prod (через `npm run db:migrate` или Turso shell).

## Принудительная синхронизация baseline с prod Turso (только один раз)

Если Drizzle впервые применяется к Turso, нужно вручную пометить 0000 как применённую:

\`\`\`sql
CREATE TABLE IF NOT EXISTS __drizzle_migrations (
  id INTEGER PRIMARY KEY,
  hash TEXT NOT NULL,
  created_at INTEGER
);
INSERT INTO __drizzle_migrations (hash, created_at)
VALUES ('<hash из drizzle/meta/_journal.json>', <unix_ms>);
\`\`\`
```

- [ ] **Step 5: Убедиться, что .gitignore не игнорирует drizzle/**

Run: `git check-ignore drizzle/ || echo "OK"`
Expected: `OK`.

- [ ] **Step 6: Commit миграции**

```bash
git add drizzle package.json package-lock.json
git commit -m "chore(db): add drizzle-kit scripts + baseline migration for existing table"
```

---

### Task 7: Исправить XSS-паттерн в Hero

Заменить `set:html` + `split/join` на чистый токенизированный рендеринг через `Fragment` или `<span>`.

**Files:**
- Modify: `src/components/hero/Hero.astro`
- Create: `src/lib/highlightAccents.ts`

- [ ] **Step 1: Создать helper для токенизации**

Создать `src/lib/highlightAccents.ts`:

```ts
export type AccentToken = { text: string; accent: boolean };

// Разбивает title на токены, выделяя вхождения accentWords.
// Безопасно: никакого HTML не производит, возвращает структуру для рендера.
// Также распознаёт литеральный маркер "<br>" как отдельный токен переноса строки.
export function tokenizeTitle(title: string, accentWords: readonly string[]): AccentToken[] {
  if (accentWords.length === 0) return splitByBr(title).map((t) => ({ text: t, accent: false }));

  // Build regex: escape each word, join with |, case-sensitive by default.
  const escaped = accentWords.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const re = new RegExp(`(${escaped.join('|')})`, 'g');

  const tokens: AccentToken[] = [];
  for (const part of splitByBr(title)) {
    if (part === '\n') {
      tokens.push({ text: '\n', accent: false });
      continue;
    }
    let last = 0;
    let match: RegExpExecArray | null;
    while ((match = re.exec(part)) !== null) {
      if (match.index > last) tokens.push({ text: part.slice(last, match.index), accent: false });
      tokens.push({ text: match[0], accent: true });
      last = match.index + match[0].length;
    }
    if (last < part.length) tokens.push({ text: part.slice(last), accent: false });
    re.lastIndex = 0;
  }
  return tokens;
}

function splitByBr(s: string): string[] {
  const parts = s.split('<br>');
  const out: string[] = [];
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) out.push('\n');
    out.push(parts[i]);
  }
  return out;
}
```

- [ ] **Step 2: Изменить Hero.astro**

Edit `src/components/hero/Hero.astro` — заменить весь `<h1>` блок (строки 18-30) на:

```astro
---
import { Image } from 'astro:assets';
import type { Dict } from '../../i18n/en';
import Button from '../ui/Button.astro';
import bgImg from '../../assets/hero/bg.png';
import { tokenizeTitle } from '../../lib/highlightAccents';

interface Props {
  dict: Dict;
}

const { dict } = Astro.props;
const tokens = tokenizeTitle(dict.hero.title, dict.hero.accentWords ?? []);
---

<section class="hero section-viewport">
  <div class="container hero__inner">
    <h1 class="hero__title" data-animate data-animate-duration="1100">
      {tokens.map((t) => (
        t.text === '\n'
          ? <br />
          : t.accent
            ? <span class="accent">{t.text}</span>
            : <Fragment>{t.text}</Fragment>
      ))}
    </h1>
  </div>
  ...
```

Остальная часть файла без изменений.

- [ ] **Step 3: Typecheck и build**

Run: `npm run check && npm run build`
Expected: `0 errors`, build проходит.

- [ ] **Step 4: Визуальная проверка в dev**

Run: `npm run dev`
Открыть `http://localhost:4321/` и убедиться, что заголовок рендерится идентично: две строки, `idea`/`product`/`growth` — акцентные.

- [ ] **Step 5: Commit**

```bash
git add src/components/hero/Hero.astro src/lib/highlightAccents.ts
git commit -m "fix(hero): replace set:html accent injection with safe tokenized render"
```

---

### Task 8: Финальная верификация фазы

- [ ] **Step 1: Typecheck**

Run: `npm run check`
Expected: `0 errors, 0 warnings`.

- [ ] **Step 2: Build**

Run: `npm run build`
Expected: успех.

- [ ] **Step 3: Smoke-проверка POST на /api/contact (локально)**

Запустить dev: `npm run dev` (в отдельном окне), в другом терминале:

```bash
curl -sSX POST http://localhost:4321/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"productType":"MVP","readinessStage":"Just an idea","platform":"Website","industry":"SaaS","name":"Test","projectName":"","email":"test@test.com","phone":"","website":"","startedAt":1}'
```
Expected (startedAt=1 слишком стар, но honeypot пуст и elapsed > MIN → зависит): если Upstash не настроен и TURSO_* не настроены → `{"error":"Database error"}` с 500 — это ок для smoke. Если настроены — `{"ok":true}`.

Главный smoke-критерий: нет 500 Internal Server Error на уровне невалидного JSON или типов. Ответ 400 на bad payload / 500 на DB — валидно.

- [ ] **Step 4: Smoke-проверка honeypot**

```bash
curl -sSX POST http://localhost:4321/api/contact \
  -H 'Content-Type: application/json' \
  -d '{"productType":"MVP","readinessStage":"Just an idea","platform":"Website","industry":"SaaS","name":"Bot","projectName":"","email":"bot@bot.com","phone":"","website":"http://spam.com","startedAt":1}'
```
Expected: `{"ok":true}` (возвращаем 200 чтобы не палить ловушку), при этом **в БД ничего не должно записаться**.

---

## Coverage check

| Audit # | Task | Status |
|---------|------|--------|
| #2 (in-memory rate-limit) | Task 3, 5 | ✅ |
| #3 (no antibot) | Task 4, 5 | ✅ |
| #4 (process.env / import.meta.env) | Tasks 1, 3, 5 | ✅ |
| #6 (XSS in Hero) | Task 7 | ✅ |
| #8 (stack drift — Drizzle) | Task 1, 6 | ✅ |
| #21 (Drizzle migrations) | Task 6 | ✅ |
| #23 (loose validation) | Tasks 2, 5 | ✅ |
| #24 (created_at type) | — | ⚠️ Осознанно оставлен text: существующие данные в Turso |
