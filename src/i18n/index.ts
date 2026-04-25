import { en, type Dict } from "./en";
import { ru } from "./ru";
import { uz } from "./uz";

export type Locale = "en" | "ru" | "uz";
export const locales: Locale[] = ["en", "ru", "uz"];
export const defaultLocale: Locale = "en";

const dicts: Record<Locale, Dict> = { en, ru, uz };

export function getDict(locale: Locale): Dict {
  return dicts[locale] ?? en;
}

export function getLocaleFromUrl(url: URL): Locale {
  const seg = url.pathname.split("/").filter(Boolean)[0];
  return (locales as string[]).includes(seg ?? "")
    ? (seg as Locale)
    : defaultLocale;
}
