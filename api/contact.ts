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
