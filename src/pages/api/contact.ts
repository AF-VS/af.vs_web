import type { APIRoute } from 'astro';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const prerender = false;

// --- Schema ---
const submissions = sqliteTable('submissions', {
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

// --- DB client (lazy init) ---
let _db: ReturnType<typeof drizzle> | null = null;

function getDb() {
  if (_db) return _db;
  const url = import.meta.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured');
  const turso = createClient({ url, authToken: import.meta.env.TURSO_AUTH_TOKEN });
  _db = drizzle(turso, { schema: { submissions } });
  return _db;
}

// --- Telegram ---
async function sendTelegramMessage(messageText: string): Promise<void> {
  const token = import.meta.env.TELEGRAM_BOT_TOKEN;
  const chatId = import.meta.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    console.warn('[telegram] TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not set, skipping');
    return;
  }

  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: chatId, parse_mode: 'HTML', text: messageText }),
  });

  if (!res.ok) {
    const body = (await res.json()) as { ok: boolean; description?: string };
    console.error('[telegram] sendMessage failed:', body.description);
  }
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// --- Types ---
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

function formatSubmissionMessage(data: ContactBody): string {
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

// --- Rate limiting (in-memory, per-instance) ---
const rateLimitMap = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX = 5;

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS });
    return false;
  }

  entry.count++;
  return entry.count > RATE_LIMIT_MAX;
}

// --- CORS ---
const ALLOWED_ORIGINS = [
  'https://afvs.studio',
  'https://www.afvs.studio',
];

function isOriginAllowed(origin: string | undefined): boolean {
  if (!origin) return false;
  if (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) return true;
  return ALLOWED_ORIGINS.includes(origin);
}

function corsHeaders(origin: string): Record<string, string> {
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };
}

// --- Validation ---
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_FIELD_LEN = 500;
const MAX_EMAIL_LEN = 254;
const MAX_PHONE_LEN = 20;

function truncate(val: unknown, max: number): string {
  const s = typeof val === 'string' ? val.trim() : '';
  return s.slice(0, max);
}

function validate(body: unknown): { ok: true; data: ContactBody } | { ok: false; error: string } {
  const b = body as Record<string, unknown>;

  const name = truncate(b.name, MAX_FIELD_LEN);
  const email = truncate(b.email, MAX_EMAIL_LEN);

  if (!name) return { ok: false, error: 'name is required' };
  if (!email || !EMAIL_RE.test(email)) return { ok: false, error: 'valid email is required' };

  return {
    ok: true,
    data: {
      productType: truncate(b.productType, MAX_FIELD_LEN),
      readinessStage: truncate(b.readinessStage, MAX_FIELD_LEN),
      platform: truncate(b.platform, MAX_FIELD_LEN),
      industry: truncate(b.industry, MAX_FIELD_LEN),
      name,
      projectName: truncate(b.projectName, MAX_FIELD_LEN),
      email,
      phone: truncate(b.phone, MAX_PHONE_LEN),
    },
  };
}

// --- CORS preflight ---
export const OPTIONS: APIRoute = ({ request }) => {
  const origin = request.headers.get('origin') ?? undefined;

  if (isOriginAllowed(origin)) {
    return new Response(null, { status: 204, headers: corsHeaders(origin!) });
  }

  return new Response(null, { status: 204 });
};

// --- POST handler ---
export const POST: APIRoute = async ({ request, clientAddress }) => {
  const origin = request.headers.get('origin') ?? undefined;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };

  if (isOriginAllowed(origin)) {
    headers['Access-Control-Allow-Origin'] = origin!;
  }

  // Rate limit
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || clientAddress || 'unknown';
  if (isRateLimited(ip)) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), { status: 429, headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), { status: 400, headers });
  }

  const result = validate(body);
  if (!result.ok) {
    return new Response(JSON.stringify({ error: result.error }), { status: 400, headers });
  }

  const { data } = result;

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

  // Telegram — fire and forget
  try {
    const message = formatSubmissionMessage(data);
    await sendTelegramMessage(message);
  } catch (err) {
    console.warn('[api/contact] Telegram failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
