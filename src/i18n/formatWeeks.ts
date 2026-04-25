import type { Locale } from "./index";

export function formatWeeks(n: number, locale: Locale): string {
  if (locale === "ru") {
    const mod100 = n % 100;
    const mod10 = n % 10;
    if (mod100 >= 11 && mod100 <= 14) return `${n} недель`;
    if (mod10 === 1) return `${n} неделя`;
    if (mod10 >= 2 && mod10 <= 4) return `${n} недели`;
    return `${n} недель`;
  }
  if (locale === "uz") return `${n} hafta`;
  return `${n} ${n === 1 ? "week" : "weeks"}`;
}
