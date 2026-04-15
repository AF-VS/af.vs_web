// src/lib/seoMeta.ts
import type { Dict } from '../i18n/en';
import type { Locale } from './paths';

export interface PageMeta {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
}

export function buildHomeMeta(dict: Dict, _locale: Locale): PageMeta {
  return {
    title: dict.seo.homeTitle,
    description: dict.seo.homeDescription,
    ogTitle: dict.seo.homeOgTitle,
    ogDescription: dict.seo.homeOgDescription,
  };
}
