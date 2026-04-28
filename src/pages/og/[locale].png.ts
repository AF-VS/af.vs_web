import type { APIRoute, GetStaticPaths } from 'astro';
import { renderOg } from '../../lib/og/render';
import { locales, type Locale } from '../../i18n';

export const prerender = true;

export const getStaticPaths: GetStaticPaths = () =>
  locales.map((locale) => ({ params: { locale } }));

export const GET: APIRoute = async ({ params }) => {
  const png = await renderOg(params.locale as Locale);
  return new Response(png as BodyInit, {
    status: 200,
    headers: { 'content-type': 'image/png' },
  });
};
