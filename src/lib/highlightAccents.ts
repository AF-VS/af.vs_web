export type AccentToken = { text: string; accent: boolean };

// Matching is case-sensitive — accentWords must match the casing used in title.
// Recognises the literal marker "<br>" as a line-break token.
export function tokenizeTitle(title: string, accentWords: readonly string[]): AccentToken[] {
  // Empty strings would cause infinite zero-width regex matches; longest-first
  // sort ensures overlapping prefixes like ['idea','ideal'] match correctly.
  const nonEmpty = accentWords
    .filter((w) => w.length > 0)
    .slice()
    .sort((a, b) => b.length - a.length);
  if (nonEmpty.length === 0) return splitByBr(title).map((t) => ({ text: t, accent: false }));

  const escaped = nonEmpty.map((w) => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
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
