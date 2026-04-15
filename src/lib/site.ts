// src/lib/site.ts
// Single source of truth for origin + brand constants used in server-only code
// (API routes) where `Astro.site` is not available. For templates, prefer
// `Astro.site` — it is populated from astro.config.mjs `site`.

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? 'https://afvs.dev') as string;
export const SITE_NAME = 'AF Venture Studio';
export const CONTACT_EMAIL = 'hello@afvs.dev';
