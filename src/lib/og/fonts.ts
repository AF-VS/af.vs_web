import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

function read(relPath: string): Buffer {
  return fs.readFileSync(fileURLToPath(new URL(relPath, import.meta.url)));
}

const interRegular = read('./fonts/Inter-Regular.otf');
const interMedium = read('./fonts/Inter-Medium.otf');
const interSemiBold = read('./fonts/Inter-SemiBold.otf');
const unboundedSemiBold = read('./fonts/Unbounded-SemiBold.ttf');

export interface OgFont {
  name: string;
  data: Buffer;
  weight: 400 | 500 | 600;
  style: 'normal';
}

export const OG_FONTS: OgFont[] = [
  { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
  { name: 'Inter', data: interMedium, weight: 500, style: 'normal' },
  { name: 'Inter', data: interSemiBold, weight: 600, style: 'normal' },
  { name: 'Unbounded', data: unboundedSemiBold, weight: 600, style: 'normal' },
];
