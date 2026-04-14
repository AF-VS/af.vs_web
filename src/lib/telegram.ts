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
