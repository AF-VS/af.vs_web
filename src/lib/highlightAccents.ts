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
