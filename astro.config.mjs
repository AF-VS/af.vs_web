import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://afvs.studio',
  adapter: vercel(),
  output: 'static',
  integrations: [sitemap()],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uz'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
