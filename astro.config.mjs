import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://afvs.dev',
  adapter: vercel({
    imageService: true,
    webAnalytics: { enabled: true },
    maxDuration: 10,
  }),
  output: 'server',
  prefetch: { defaultStrategy: 'hover', prefetchAll: false },
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'en',
        locales: { en: 'en', ru: 'ru', uz: 'uz' },
      },
    }),
  ],
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uz'],
    routing: { prefixDefaultLocale: false },
  },
});
