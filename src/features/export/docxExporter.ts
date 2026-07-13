import {
  Document,
  HorizontalPositionRelativeFrom,
  ImageRun,
  Packer,
  PageOrientation,
  Paragraph,
  TextWrappingType,
  VerticalPositionRelativeFrom,
  type ISectionOptions
} from 'docx';
import { mmToPx, mmToTwip } from '../../utils/units';
import type { PageSettings, TextStyle } from '../layout/sceneTypes';
import type { Person } from '../names/nameTypes';
import { createPlaceCardScene } from '../layout/layoutEngine';
import { svgToPngBytes } from './pngRenderer';
import { renderSceneToSvg, svgToDataUri } from './svgRenderer';
import type { ExportProgressCallback } from './exportTypes';

export interface DocxExportOptions {
  onProgress?: ExportProgressCallback;
  renderPng?: typeof svgToPngBytes;
  pngDpi?: number;
}

function pageSizeForDocx(settings: PageSettings): {
  width: number;
  height: number;
  orientation: (typeof PageOrientation)[keyof typeof PageOrientation];
} {
  if (settings.orientation === 'landscape') {
    // docx swaps width/height when landscape is set, so provide portrait-order dimensions.
    return {
      width: mmToTwip(Math.min(settings.widthMm, settings.heightMm)),
      height: mmToTwip(Math.max(settings.widthMm, settings.heightMm)),
      orientation: PageOrientation.LANDSCAPE
    };
  }
  return {
    width: mmToTwip(Math.min(settings.widthMm, settings.heightMm)),
    height: mmToTwip(Math.max(settings.widthMm, settings.heightMm)),
    orientation: PageOrientation.PORTRAIT
  };
}

export async function createDocxBytes(
  people: readonly Person[],
  textStyle: TextStyle,
  pageSettings: PageSettings,
  options: DocxExportOptions = {}
): Promise<Uint8Array> {
  if (people.length === 0) {
    throw new Error('没有可导出的姓名。');
  }

  const renderPng = options.renderPng ?? svgToPngBytes;
  const sections: ISectionOptions[] = [];
  const pageSize = pageSizeForDocx(pageSettings);

  for (let index = 0; index < people.length; index += 1) {
    const person = people[index];
    if (!person) continue;
    options.onProgress?.({
      current: index,
      total: people.length,
      stage: 'rendering',
      message: `正在渲染 Word 页面 ${index + 1}/${people.length}`
    });

    const scene = createPlaceCardScene(person.name, textStyle, pageSettings);
    const svg = renderSceneToSvg(scene, { title: `${person.name}席卡` });
    const png = await renderPng(svg, scene.pageWidthMm, scene.pageHeightMm, {
      dpi: options.pngDpi ?? 180
    });

    const image = new ImageRun({
      type: 'svg',
      data: svgToDataUri(svg),
      fallback: {
        type: 'png',
        data: png
      },
      transformation: {
        width: mmToPx(scene.pageWidthMm),
        height: mmToPx(scene.pageHeightMm)
      },
      floating: {
        horizontalPosition: {
          relative: HorizontalPositionRelativeFrom.PAGE,
          offset: 0
        },
        verticalPosition: {
          relative: VerticalPositionRelativeFrom.PAGE,
          offset: 0
        },
        allowOverlap: true,
        behindDocument: false,
        layoutInCell: false,
        wrap: {
          type: TextWrappingType.NONE
        },
        margins: {
          top: 0,
          right: 0,
          bottom: 0,
          left: 0
        }
      },
      altText: {
        title: `${person.name}席卡`,
        description: `姓名为${person.name}的可打印席卡`,
        name: `place-card-${index + 1}`
      }
    });

    sections.push({
      properties: {
        page: {
          size: pageSize,
          margin: {
            top: mmToTwip(pageSettings.marginTopMm),
            right: mmToTwip(pageSettings.marginRightMm),
            bottom: mmToTwip(pageSettings.marginBottomMm),
            left: mmToTwip(pageSettings.marginLeftMm),
            header: 0,
            footer: 0,
            gutter: 0
          }
        }
      },
      children: [
        new Paragraph({
          children: [image],
          spacing: { before: 0, after: 0, line: 1 }
        })
      ]
    });
  }

  options.onProgress?.({
    current: people.length,
    total: people.length,
    stage: 'packing',
    message: '正在打包 Word 文档'
  });

  const document = new Document({
    creator: '批量席卡生成器',
    title: '批量席卡',
    description: '由批量席卡生成器创建的可打印席卡',
    sections
  });
  return new Uint8Array(await Packer.toArrayBuffer(document));
}
