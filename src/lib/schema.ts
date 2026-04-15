// src/lib/schema.ts
import { SITE_NAME, CONTACT_EMAIL } from './site';
import type { Locale } from './paths';

export function organizationSchema(siteUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${siteUrl}/#organization`,
    name: SITE_NAME,
    alternateName: 'AFVS',
    url: `${siteUrl}/`,
    logo: {
      '@type': 'ImageObject',
      url: `${siteUrl}/favicon.svg`,
      width: 512,
      height: 512,
    },
    description:
      'Product design and development studio. We build MVPs, integrate AI into real workflows, and support products from launch through growth.',
    foundingDate: '2025',
    contactPoint: [
      {
        '@type': 'ContactPoint',
        email: CONTACT_EMAIL,
        contactType: 'sales',
        availableLanguage: ['en', 'ru', 'uz'],
      },
    ],
  } as const;
}

export function websiteSchema(siteUrl: string, locale: Locale) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${siteUrl}/#website`,
    url: `${siteUrl}/`,
    name: SITE_NAME,
    inLanguage: locale,
    publisher: { '@id': `${siteUrl}/#organization` },
  } as const;
}
