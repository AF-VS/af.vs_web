import { getDict, type Locale } from '../../i18n';

export interface SatoriEl {
  type: string;
  props: {
    style?: Record<string, unknown>;
    children?: SatoriEl | (SatoriEl | string)[] | string;
  };
}

type Child = SatoriEl | string | (SatoriEl | string)[] | null | undefined;

function el(
  type: string,
  style: Record<string, unknown> = {},
  ...children: Child[]
): SatoriEl {
  const flat = children
    .flat()
    .filter((c): c is SatoriEl | string => c !== null && c !== undefined);
  return {
    type,
    props: {
      style,
      ...(flat.length === 0
        ? {}
        : { children: flat.length === 1 ? flat[0] : flat }),
    },
  };
}

const COLORS = {
  bg: '#101b2c',
  primary: '#6ab8ed',
  textPrimary: '#ffffff',
  textSubtle: 'rgba(255,255,255,0.8)',
  textSecondary: 'rgba(255,255,255,0.6)',
};

function tokenize(line: string, accents: readonly string[]): SatoriEl[] {
  const accentSet = new Set(accents.map((w) => w.toLowerCase()));
  // Split on word boundaries, keeping the words. Each word gets its trailing
  // whitespace appended so Satori (which collapses whitespace-only flex items)
  // still renders spaces between words. whiteSpace: 'pre' prevents Satori from
  // stripping the trailing space character inside each span.
  const words = line.split(/(\s+)/);
  const result: SatoriEl[] = [];
  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    if (/^\s+$/.test(word)) continue; // skip standalone whitespace tokens
    const trailing = words[i + 1] && /^\s+$/.test(words[i + 1]) ? words[i + 1] : '';
    if (trailing) i++; // consume the whitespace token
    const stripped = word.replace(/[.,;:!?<>—–-]/g, '').toLowerCase();
    const isAccent = stripped.length > 0 && accentSet.has(stripped);
    result.push(
      el(
        'span',
        {
          ...(isAccent ? { color: COLORS.primary } : {}),
          whiteSpace: 'pre',
        },
        word + trailing,
      ),
    );
  }
  return result;
}

export function buildOgTree(locale: Locale): SatoriEl {
  const dict = getDict(locale);
  const headlineLines = dict.hero.title.split(/<br\s*\/?>/i);
  const accents = dict.hero.accentWords;
  const description = dict.seo.homeOgDescription;

  return el(
    'div',
    {
      width: '100%',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      padding: '64px',
      backgroundColor: COLORS.bg,
      backgroundImage:
        'radial-gradient(ellipse at 80% 20%, rgba(106,184,237,0.25) 0%, rgba(106,184,237,0) 55%)',
      fontFamily: 'Inter',
      color: COLORS.textPrimary,
    },
    el(
      'div',
      {
        display: 'flex',
        fontFamily: 'Unbounded',
        fontSize: 36,
        fontWeight: 600,
        letterSpacing: '-0.02em',
        color: COLORS.textPrimary,
      },
      'AF.VS',
    ),
    el(
      'div',
      { display: 'flex', flexDirection: 'column', gap: '32px' },
      el(
        'div',
        {
          display: 'flex',
          flexDirection: 'column',
          fontFamily: 'Unbounded',
          fontSize: 78,
          fontWeight: 600,
          lineHeight: 1.08,
          letterSpacing: '-0.02em',
          color: COLORS.textPrimary,
        },
        ...headlineLines.map((line) =>
          el(
            'div',
            { display: 'flex', flexWrap: 'wrap' },
            ...tokenize(line, accents),
          ),
        ),
      ),
      el(
        'div',
        {
          display: 'flex',
          fontFamily: 'Inter',
          fontSize: 28,
          fontWeight: 400,
          lineHeight: 1.45,
          color: COLORS.textSubtle,
          maxWidth: 880,
        },
        description,
      ),
    ),
    el(
      'div',
      {
        display: 'flex',
        justifyContent: 'flex-end',
        fontFamily: 'Inter',
        fontSize: 22,
        fontWeight: 500,
        color: COLORS.textSecondary,
      },
      'afvs.dev',
    ),
  );
}
