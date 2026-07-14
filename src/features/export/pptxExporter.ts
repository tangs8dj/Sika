import PptxGenJS from 'pptxgenjs';
import { mmToInch } from '../../utils/units';
import type { PageSettings, TextStyle } from '../layout/sceneTypes';
import type { Person } from '../names/nameTypes';
import { createPlaceCardScene } from '../layout/layoutEngine';
import { renderSceneToSvg, svgToDataUri } from './svgRenderer';
import type { ExportProgressCallback } from './exportTypes';

export interface PptxExportOptions {
  onProgress?: ExportProgressCallback;
}

async function toUint8Array(value: string | ArrayBuffer | Blob | Uint8Array): Promise<Uint8Array> {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (value instanceof Blob) return new Uint8Array(await value.arrayBuffer());
  throw new Error('PowerPoint 生成器返回了不支持的数据格式。');
}

export async function createPptxBytes(
  people: readonly Person[],
  textStyle: TextStyle,
  pageSettings: PageSettings,
  options: PptxExportOptions = {}
): Promise<Uint8Array> {
  if (people.length === 0) {
    throw new Error('没有可导出的姓名。');
  }

  const pptx = new PptxGenJS();
  const layoutName = 'PLACE_CARD_PAGE';
  const widthIn = mmToInch(pageSettings.widthMm);
  const heightIn = mmToInch(pageSettings.heightMm);
  pptx.defineLayout({ name: layoutName, width: widthIn, height: heightIn });
  pptx.layout = layoutName;
  pptx.author = '席卡生成 - Whyu';
  pptx.company = 'Local Tools';
  pptx.subject = '批量席卡';
  pptx.title = '批量席卡';

  for (let index = 0; index < people.length; index += 1) {
    const person = people[index];
    if (!person) continue;
    options.onProgress?.({
      current: index,
      total: people.length,
      stage: 'rendering',
      message: `正在渲染 PowerPoint 幻灯片 ${index + 1}/${people.length}`
    });

    const scene = createPlaceCardScene(person.name, textStyle, pageSettings);
    const svg = renderSceneToSvg(scene, { title: `${person.name}席卡` });
    const slide = pptx.addSlide();
    slide.addImage({
      data: svgToDataUri(svg),
      x: 0,
      y: 0,
      w: widthIn,
      h: heightIn,
      altText: `${person.name}席卡`
    });
    slide.addNotes(`姓名：${person.name}`);
  }

  options.onProgress?.({
    current: people.length,
    total: people.length,
    stage: 'packing',
    message: '正在打包 PowerPoint 文件'
  });

  const output = await pptx.write({ outputType: 'uint8array', compression: true });
  return toUint8Array(output);
}
