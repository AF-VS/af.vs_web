# Form Submissions: Telegram + SQL

## Overview

Send BrefForm submissions to a Telegram group chat and persist them in a SQL database. The Astro site stays fully static — form handling runs as a standalone Vercel serverless function.

## Architecture

```
Browser (BrefForm)
    │
    ▼  POST /api/contact (JSON)
Vercel Serverless Function (api/contact.ts)
    │
    ├──▶ Turso (libSQL) — INSERT submission
    │
    └──▶ Telegram Bot API — send notification to group chat
    │
    ▼  200 OK / 500 error
Browser (success or error state)
```

### Key decisions

- **Astro stays `output: 'static'`** — no config changes, no hybrid mode.
- **Serverless function at `api/contact.ts`** (Vercel convention) — lighter cold starts than Astro API routes, decoupled from static build.
- **Telegram: raw `fetch`** — no bot library needed. Single POST to `sendMessage`.
- **Turso (libSQL/SQLite)** — edge-native, free tier (5 GB, 500 M reads/mo), no TCP overhead.
- **Drizzle ORM** — ~7 KB bundle, type-safe, fast cold starts.

## Database

### Provider: Turso

- Free tier: 5 GB storage, 500 M row reads/month, 100 databases.
- SDK: `@libsql/client` (HTTP-based, works in Vercel serverless).

### Schema (`submissions` table)

| Column          | Type                     | Constraints     |
|-----------------|--------------------------|-----------------|
| id              | INTEGER                  | PK AUTOINCREMENT |
| product_type    | TEXT                     | NOT NULL        |
| readiness_stage | TEXT                     | NOT NULL        |
| platform        | TEXT                     | NOT NULL        |
| industry        | TEXT                     | NOT NULL        |
| name            | TEXT                     | NOT NULL        |
| project_name    | TEXT                     |                 |
| email           | TEXT                     | NOT NULL        |
| phone           | TEXT                     |                 |
| created_at      | TEXT                     | NOT NULL (ISO 8601) |

### Drizzle schema file

Location: `src/db/schema.ts`

Drizzle config: `drizzle.config.ts` at project root.

## Telegram

### Bot setup (manual, one-time)

1. Create bot via @BotFather → get `BOT_TOKEN`.
2. Add bot to target group chat.
3. Get `CHAT_ID` (send a message in the group, then call `getUpdates`).

### Message format

```
POST https://api.telegram.org/bot${BOT_TOKEN}/sendMessage
Content-Type: application/json

{
  "chat_id": CHAT_ID,
  "parse_mode": "HTML",
  "text": "..."
}
```

Message template (HTML):

```html
<b>Новая заявка</b>

<b>Тип:</b> {product_type}
<b>Стадия:</b> {readiness_stage}
<b>Платформа:</b> {platform}
<b>Индустрия:</b> {industry}

<b>Имя:</b> {name}
<b>Проект:</b> {project_name}
<b>Email:</b> {email}
<b>Тел:</b> {phone}
```

## API Endpoint

### `POST /api/contact`

**Request body** (`application/json`):

```ts
{
  productType: string;
  readinessStage: string;
  platform: string;
  industry: string;
  name: string;
  projectName: string;
  email: string;
  phone: string;
}
```

**Response:**

- `200` — saved + notification sent (or saved + notification failed silently).
- `400` — validation error (missing name/email, bad email format).
- `500` — database error.

### Logic

1. Validate input (name not empty, email matches basic regex).
2. INSERT into Turso.
3. POST to Telegram (fire-and-forget: if Telegram fails, still return 200).
4. Return `{ ok: true }`.

## Frontend Changes

Update `src/lib/contact.ts`:

```ts
export async function sendContact(payload: BrefPayload): Promise<void> {
  const res = await fetch('/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
}
```

No other frontend changes needed — `BrefForm.astro` already calls `sendContact()` and handles success/error states.

## Error Handling

| Scenario | Behavior |
|----------|----------|
| Telegram API fails | Log warning, still save to DB, return 200 |
| Turso DB fails | Return 500, frontend shows error |
| Invalid input | Return 400 with error message |
| Unexpected error | Return 500, log error |

## Environment Variables

Set in Vercel dashboard (Settings → Environment Variables):

| Variable | Description |
|----------|-------------|
| `TURSO_DATABASE_URL` | `libsql://your-db.turso.io` |
| `TURSO_AUTH_TOKEN` | Auth token from Turso CLI |
| `TELEGRAM_BOT_TOKEN` | Bot token from @BotFather |
| `TELEGRAM_CHAT_ID` | Target group chat ID |

## Dependencies

**Production:**
- `@libsql/client` — Turso SDK
- `drizzle-orm` — ORM

**Dev:**
- `drizzle-kit` — migrations CLI

## File Structure

```
api/
  contact.ts          — Vercel serverless function
src/
  db/
    schema.ts         — Drizzle schema (submissions table)
    client.ts         — Turso client singleton
  lib/
    contact.ts        — updated sendContact()
    telegram.ts       — sendTelegramMessage() helper
drizzle.config.ts     — Drizzle Kit config
```
