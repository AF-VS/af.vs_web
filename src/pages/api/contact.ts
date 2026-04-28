import type { APIRoute } from 'astro';
import { checkBotId } from 'botid/server';
import { getDb } from '../../db/client';
import { submissions } from '../../db/schema';
import { contactSchema } from '../../lib/contactSchema';
import { checkRateLimit } from '../../lib/rateLimit';
import { SITE_URL } from '../../lib/site';
import { sendTelegramMessage, formatSubmissionMessage } from '../../lib/telegram';

export const prerender = false;

const SITE_ORIGIN = new URL(SITE_URL).origin;
const WWW_ORIGIN = SITE_ORIGIN.replace('://', '://www.');
const ALLOWED_ORIGINS = new Set([SITE_ORIGIN, WWW_ORIGIN]);

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

  // BotID classification — local dev always returns isBot:false; in prod the
  // client-side challenge attaches headers that this call validates.
  const verdict = await checkBotId();
  if (verdict.isBot) {
    return new Response(JSON.stringify({ error: 'Access denied' }), { status: 403, headers });
  }

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
  const email = data.email.toLowerCase();
  const phone = data.phone ? data.phone.replace(/\s+/g, ' ') : '';

  // Antibot: honeypot — если не пусто, бот
  if (data.website) {
    // Возвращаем 200 чтобы не палить логику боту
    return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
  }

  // Antibot: time-trap — слишком быстрая отправка.
  // Best-effort: startedAt is client-supplied; real abuse defence is checkRateLimit above.
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
      email,
      phone: phone || null,
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
      email,
      phone,
    }));
  } catch (err) {
    console.warn('[api/contact] Telegram failed:', err);
  }

  return new Response(JSON.stringify({ ok: true }), { status: 200, headers });
};
