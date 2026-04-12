import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  adapter: vercel(),
  output: 'static',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'ru', 'uz'],
    routing: {
      prefixDefaultLocale: false,
    },
  },
});
