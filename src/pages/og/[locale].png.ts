import type { APIRoute } from 'astro';
import { renderOg } from '../../lib/og/render';
import type { Locale } from '../../i18n';

export const prerender = false;

const VALID_LOCALES = new Set<Locale>(['en', 'ru', 'uz']);

function isLocale(value: unknown): value is Locale {
  return typeof value === 'string' && VALID_LOCALES.has(value as Locale);
}

export const GET: APIRoute = async ({ params }) => {
  if (!isLocale(params.locale)) {
    return new Response('Not found', { status: 404 });
  }
  const png = await renderOg(params.locale);
  return new Response(png as BodyInit, {
    status: 200,
    headers: {
      'content-type': 'image/png',
      'cache-control':
        'public, max-age=3600, s-maxage=86400, stale-while-revalidate=604800',
    },
  });
};
