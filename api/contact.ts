import type { VercelRequest, VercelResponse } from '@vercel/node';
import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

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
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) throw new Error('TURSO_DATABASE_URL is not configured');
  const turso = createClient({ url, authToken: process.env.TURSO_AUTH_TOKEN });
  _db = drizzle(turso, { schema: { submissions } });
  return _db;
}

// --- Telegram ---
async function sendTelegramMessage(messageText: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

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

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const origin = req.headers.origin as string | undefined;

  // CORS preflight
  if (req.method === 'OPTIONS') {
    if (isOriginAllowed(origin)) {
      res.setHeader('Access-Control-Allow-Origin', origin!);
      res.setHeader('Access-Control-Allow-Methods', 'POST');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      res.setHeader('Access-Control-Max-Age', '86400');
    }
    return res.status(204).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // CORS
  if (isOriginAllowed(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin!);
  }

  // Rate limit
  const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const result = validate(req.body);
  if (!result.ok) {
    return res.status(400).json({ error: result.error });
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
