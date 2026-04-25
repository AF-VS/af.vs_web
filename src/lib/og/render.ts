import satori from 'satori';
import { Resvg } from '@resvg/resvg-js';
import type { Locale } from '../../i18n';
import { OG_FONTS } from './fonts';
import { buildOgTree } from './template';

const WIDTH = 1200;
const HEIGHT = 630;

export async function renderOg(locale: Locale): Promise<Uint8Array> {
  const tree = buildOgTree(locale);

  const svg = await satori(tree as Parameters<typeof satori>[0], {
    width: WIDTH,
    height: HEIGHT,
    fonts: OG_FONTS,
  });

  const resvg = new Resvg(svg, {
    fitTo: { mode: 'width', value: WIDTH },
  });
  return resvg.render().asPng();
}
