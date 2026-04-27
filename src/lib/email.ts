import { Resend } from 'resend';
import { CONTACT_EMAIL } from './site';
import type { SubmissionPayload } from './telegram';

const FROM = 'AFVS Notifications <notifications@afvs.dev>';

function escape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function row(label: string, value: string): string {
  return `<tr><td style="padding:6px 12px 6px 0;color:#666;font-weight:600;white-space:nowrap;">${label}</td><td style="padding:6px 0;">${escape(value)}</td></tr>`;
}

function buildHtml(d: SubmissionPayload): string {
  const rows = [
    row('Тип', d.productType),
    row('Стадия', d.readinessStage),
    row('Платформа', d.platform),
    row('Индустрия', d.industry),
    row('Имя', d.name),
    row('Проект', d.projectName || '—'),
    row('Email', d.email),
    row('Тел', d.phone || '—'),
  ].join('');

  return `<!doctype html><html><body style="margin:0;font-family:-apple-system,Segoe UI,Roboto,sans-serif;color:#101b2c;background:#f5f7fa;padding:24px;">
  <div style="max-width:560px;margin:0 auto;background:#fff;border-radius:12px;padding:24px;border:1px solid #e3e7ef;">
    <h2 style="margin:0 0 12px;font-size:18px;">Новая заявка</h2>
    <p style="margin:0 0 16px;color:#666;font-size:13px;">Telegram-уведомление не доставлено — это резервная копия из Resend.</p>
    <table style="border-collapse:collapse;font-size:14px;">${rows}</table>
  </div>
</body></html>`;
}

function buildText(d: SubmissionPayload): string {
  return [
    'Новая заявка (Telegram fallback)',
    '',
    `Тип:        ${d.productType}`,
    `Стадия:     ${d.readinessStage}`,
    `Платформа:  ${d.platform}`,
    `Индустрия:  ${d.industry}`,
    '',
    `Имя:        ${d.name}`,
    `Проект:     ${d.projectName || '—'}`,
    `Email:      ${d.email}`,
    `Тел:        ${d.phone || '—'}`,
  ].join('\n');
}

export async function sendSubmissionEmail(data: SubmissionPayload): Promise<boolean> {
  const apiKey = import.meta.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn('[email] RESEND_API_KEY not set, skipping fallback');
    return false;
  }

  const resend = new Resend(apiKey);
  try {
    const { error } = await resend.emails.send({
      from: FROM,
      to: [CONTACT_EMAIL],
      subject: `Новая заявка — ${data.name}`,
      html: buildHtml(data),
      text: buildText(data),
    });
    if (error) {
      console.error('[email] resend rejected:', error);
      return false;
    }
    return true;
  } catch (err) {
    console.error('[email] threw:', err);
    return false;
  }
}
