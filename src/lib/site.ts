// Origin + brand constants for server-only code (API routes) where `Astro.site`
// is not available. Templates should use `Astro.site` instead.

export const SITE_URL = (import.meta.env.PUBLIC_SITE_URL ?? 'https://afvs.dev') as string;
export const SITE_NAME = 'AF Venture Studio';
export const CONTACT_EMAIL = 'hello@afvs.dev';
