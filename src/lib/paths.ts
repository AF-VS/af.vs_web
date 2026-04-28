import type { Locale } from '../i18n';
export type { Locale };

export const locales: Locale[] = ['en', 'ru', 'uz'];

export const localeLabels: Record<Locale, string> = {
  en: 'En',
  ru: 'Ru',
  uz: "O'z",
};

const prefixedLocales: Locale[] = ['ru', 'uz'];

/**
 * Build the URL for a target locale, preserving the current path.
 * Strip any existing locale prefix, then prepend the target (unless 'en').
 */
export function switchLocaleUrl(currentPath: string, targetLocale: Locale): string {
  let path = currentPath.replace(/\/$/, '') || '/';

  // Strip existing locale prefix
  for (const loc of prefixedLocales) {
    if (path === `/${loc}` || path.startsWith(`/${loc}/`)) {
      path = path.slice(loc.length + 1) || '/';
      break;
    }
  }

  // Prepend target locale prefix
  if (targetLocale === 'en') {
    return path.endsWith('/') ? path : path + '/';
  }

  const base = path === '/' ? '' : path;
  return `/${targetLocale}${base}/`;
}

export function getLocaleUrl(url: URL, target: Locale): string {
  return switchLocaleUrl(url.pathname, target);
}
