# Telegram + SQL Submissions Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire BrefForm submissions to a Turso database and Telegram bot notification via a Vercel serverless function.

**Architecture:** Standalone serverless function at `api/contact.ts` (Vercel convention). Astro remains `output: 'static'`. The function validates input, inserts into Turso via Drizzle, and fires a Telegram notification.

**Tech Stack:** TypeScript, `@libsql/client`, `drizzle-orm`, `drizzle-kit`, Vercel serverless functions, Telegram Bot API.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `api/contact.ts` | Create | Vercel serverless handler: validate → DB insert → Telegram notify |
| `src/db/schema.ts` | Create | Drizzle schema for `submissions` table |
| `src/db/client.ts` | Create | Turso client factory (reads env vars) |
| `src/lib/telegram.ts` | Create | `sendTelegramMessage(text)` helper |
| `src/lib/contact.ts` | Modify | Replace stub with `fetch('/api/contact')` |
| `drizzle.config.ts` | Create | Drizzle Kit config for migrations |
| `.env.example` | Create | Document required env vars |
| `tsconfig.server.json` | Create | TS config for `api/` (Node types) |

---

### Task 1: Install dependencies

- [ ] **Step 1: Install production deps**

```bash
npm install @libsql/client drizzle-orm
```

- [ ] **Step 2: Install dev deps**

```bash
npm install -D drizzle-kit
```

- [ ] **Step 3: Verify installation**

```bash
node -e "require('@libsql/client'); require('drizzle-orm'); console.log('ok')"
```

Expected: `ok`

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add @libsql/client, drizzle-orm, drizzle-kit"
```

---

### Task 2: Database schema & client

**Files:**
- Create: `src/db/schema.ts`
- Create: `src/db/client.ts`
- Create: `drizzle.config.ts`
- Create: `.env.example`

- [ ] **Step 1: Create Drizzle schema**

Create `src/db/schema.ts`:

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
```

- [ ] **Step 2: Create Turso client**

Create `src/db/client.ts`:

```ts
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import * as schema from './schema';

const turso = createClient({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN,
});

export const db = drizzle(turso, { schema });
```

- [ ] **Step 3: Create Drizzle config**

Create `drizzle.config.ts`:

```ts
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'turso',
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

- [ ] **Step 4: Create .env.example**

Create `.env.example`:

```
TURSO_DATABASE_URL=libsql://your-db-name.turso.io
TURSO_AUTH_TOKEN=your-auth-token
TELEGRAM_BOT_TOKEN=123456:ABC-DEF
TELEGRAM_CHAT_ID=-1001234567890
```

- [ ] **Step 5: Add `.env` to `.gitignore`**

Append to `.gitignore`:

```
.env
.env.local
```

- [ ] **Step 6: Commit**

```bash
git add src/db/schema.ts src/db/client.ts drizzle.config.ts .env.example .gitignore
git commit -m "feat(db): add Drizzle schema and Turso client"
```

---

### Task 3: Telegram helper

**Files:**
- Create: `src/lib/telegram.ts`

- [ ] **Step 1: Create Telegram helper**

Create `src/lib/telegram.ts`:

```ts
interface TelegramResult {
  ok: boolean;
  description?: string;
}

export async function sendTelegramMessage(text: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      parse_mode: 'HTML',
      text,
    }),
  });

  if (!res.ok) {
    const body: TelegramResult = await res.json();
    console.error('[telegram] sendMessage failed:', body.description);
  }
}

export function formatSubmissionMessage(data: {
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
}): string {
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

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/telegram.ts
git commit -m "feat(telegram): add sendTelegramMessage helper"
```

---

### Task 4: Serverless API endpoint

**Files:**
- Create: `api/contact.ts`
- Create: `tsconfig.server.json`

- [ ] **Step 1: Create server tsconfig**

Create `tsconfig.server.json` (extends base, adds Node types for `api/`):

```json
{
  "extends": "./tsconfig.json",
  "compilerOptions": {
    "module": "ESNext",
    "moduleResolution": "bundler",
    "types": ["node"],
    "outDir": "./dist-api",
    "noEmit": true
  },
  "include": ["api/**/*", "src/db/**/*", "src/lib/telegram.ts"]
}
```

- [ ] **Step 2: Create the serverless function**

Create `api/contact.ts`:

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { db } from '../src/db/client';
import { submissions } from '../src/db/schema';
import { sendTelegramMessage, formatSubmissionMessage } from '../src/lib/telegram';

interface ContactBody {
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(body: unknown): { ok: true; data: ContactBody } | { ok: false; error: string } {
  const b = body as Record<string, unknown>;

  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const email = typeof b.email === 'string' ? b.email.trim() : '';

  if (!name) return { ok: false, error: 'name is required' };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'valid email is required' };

  return {
    ok: true,
    data: {
      productType: String(b.productType || ''),
      readinessStage: String(b.readinessStage || ''),
      platform: String(b.platform || ''),
      industry: String(b.industry || ''),
      name,
      projectName: String(b.projectName || ''),
      email,
      phone: String(b.phone || ''),
    },
  };
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = validate(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
  }

  const { data } = result;

  try {
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
    return res.status(500).json({ error: 'Database error' });
  }

  // Telegram — fire and forget
  try {
    const message = formatSubmissionMessage(data);
    await sendTelegramMessage(message);
  } catch (err) {
    console.warn('[api/contact] Telegram failed:', err);
  }

  return res.status(200).json({ ok: true });
}
```

- [ ] **Step 3: Install @vercel/node types**

```bash
npm install -D @vercel/node
```

- [ ] **Step 4: Commit**

```bash
git add api/contact.ts tsconfig.server.json package.json package-lock.json
git commit -m "feat(api): add /api/contact serverless function"
```

---

### Task 5: Update frontend `sendContact()`

**Files:**
- Modify: `src/lib/contact.ts`

- [ ] **Step 1: Replace stub with fetch call**

Replace the entire content of `src/lib/contact.ts`:

```ts
export interface BrefPayload {
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
}

export async function sendContact(payload: BrefPayload): Promise<void> {
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

- [ ] **Step 2: Commit**

```bash
git add src/lib/contact.ts
git commit -m "feat(contact): wire sendContact to /api/contact endpoint"
```

---

### Task 6: Run migration & verify

- [ ] **Step 1: Generate migration**

```bash
npx drizzle-kit generate
```

Expected: creates `drizzle/0000_*.sql` with CREATE TABLE statement.

- [ ] **Step 2: Push schema to Turso**

```bash
npx drizzle-kit push
```

Expected: table `submissions` created in Turso database.

- [ ] **Step 3: Verify locally with `vercel dev`**

```bash
npx vercel dev
```

Then in another terminal:

```bash
curl -X POST http://localhost:3000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"productType":"MVP","readinessStage":"Idea","platform":"Web","industry":"FinTech","name":"Test","projectName":"TestApp","email":"test@test.com","phone":"+998 90 123-45-67"}'
```

Expected: `{"ok":true}` and a message appears in the Telegram group.

- [ ] **Step 4: Commit migration files**

```bash
git add drizzle/
git commit -m "chore(db): add initial migration"
```

---

### Task 7: Deploy & set env vars

- [ ] **Step 1: Set environment variables in Vercel**

Via Vercel dashboard or CLI:

```bash
vercel env add TURSO_DATABASE_URL
vercel env add TURSO_AUTH_TOKEN
vercel env add TELEGRAM_BOT_TOKEN
vercel env add TELEGRAM_CHAT_ID
```

- [ ] **Step 2: Deploy**

```bash
vercel --prod
```

Or push to branch and let Vercel auto-deploy.

- [ ] **Step 3: Test production endpoint**

```bash
curl -X POST https://your-domain.vercel.app/api/contact \
  -H "Content-Type: application/json" \
  -d '{"productType":"MVP","readinessStage":"Idea","platform":"Web","industry":"FinTech","name":"Test","projectName":"TestApp","email":"test@test.com","phone":"+998 90 123-45-67"}'
```

Expected: `{"ok":true}`, message in Telegram, row in Turso.
