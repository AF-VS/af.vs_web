import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

function read(relPath: string): Buffer {
  return fs.readFileSync(fileURLToPath(new URL(relPath, import.meta.url)));
}

const interLatin400 = read('./fonts/inter-latin-400-normal.woff');
const interLatin500 = read('./fonts/inter-latin-500-normal.woff');
const interCyrillic400 = read('./fonts/inter-cyrillic-400-normal.woff');
const unboundedLatin600 = read('./fonts/unbounded-latin-600-normal.woff');

export interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600;
  style: 'normal';
}

export const OG_FONTS: OgFont[] = [
  { name: 'Inter', data: interLatin400, weight: 400, style: 'normal' },
  { name: 'Inter', data: interLatin500, weight: 500, style: 'normal' },
  { name: 'Inter', data: interCyrillic400, weight: 400, style: 'normal' },
  { name: 'Unbounded', data: unboundedLatin600, weight: 600, style: 'normal' },
];
