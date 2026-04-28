// One-shot generator for the PWA manifest icons.
// Re-run after bumping the brand mark: `node scripts/generate-pwa-icons.mjs`.
import { Resvg } from '@resvg/resvg-js';
import { writeFileSync } from 'node:fs';

const BG = '#101b2c';        // --surface-bg
const FILL = '#68b6e5';      // brand accent (matches favicon.svg)
const SIZES = [192, 512];

// AF mark from public/favicon.svg, native viewBox 79 102 355 308 → centered
// at (256, 256) with effective extent ~352. We scale it to fill 55% of the
// canvas so the rounded plate has visible breathing room on both Android
// (maskable safe-zone is 80%) and iOS (no masking).
const POLYGON = '299.84 331.93 256 256 343.68 256 256 104.13 168.32 256 80.64 407.87 168.32 407.87 212.16 331.93 299.84 331.93 256 407.87 431.36 407.87 343.68 256 299.84 331.93';
const MARK_EXTENT = 352;
const MARK_FILL_RATIO = 0.55;

function svg(size) {
  const scale = (size * MARK_FILL_RATIO) / MARK_EXTENT;
  const radius = size * 0.18;
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${BG}"/>
  <g transform="translate(${size / 2} ${size / 2}) scale(${scale}) translate(-256 -256)">
    <polygon fill="${FILL}" fill-rule="evenodd" points="${POLYGON}"/>
  </g>
</svg>`;
}

for (const size of SIZES) {
  const png = new Resvg(svg(size), { fitTo: { mode: 'width', value: size } }).render().asPng();
  const path = `public/icon-${size}.png`;
  writeFileSync(path, png);
  console.log(`wrote ${path} (${png.length} bytes)`);
}
