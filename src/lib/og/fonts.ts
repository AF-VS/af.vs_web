import fs from 'node:fs';
import path from 'node:path';

function read(relPath: string): Buffer {
  return fs.readFileSync(path.join(process.cwd(), 'src/lib/og/fonts', relPath));
}

const interRegular = read('Inter-Regular.otf');
const interMedium = read('Inter-Medium.otf');
const interSemiBold = read('Inter-SemiBold.otf');
const unboundedSemiBold = read('Unbounded-SemiBold.ttf');

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
