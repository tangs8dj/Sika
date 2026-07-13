import { ptToMm, round } from '../../utils/units';
import type { LayoutScene, LineNode, RectangleNode, TextNode } from '../layout/sceneTypes';

export interface SvgRenderOptions {
  includeGuides?: boolean;
  title?: string;
}

export function escapeXml(value: string): string {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

function dashArrayValue(values?: readonly number[]): string {
  return values && values.length > 0 ? ` stroke-dasharray="${values.join(' ')}"` : '';
}

function renderRectangle(node: RectangleNode): string {
  const fill = node.fillColor ?? 'none';
  const stroke = node.strokeColor ?? 'none';
  const strokeWidth = node.strokeWidthMm ?? 0;
  return `<rect id="${escapeXml(node.id)}" x="${round(node.xMm)}" y="${round(node.yMm)}" width="${round(node.widthMm)}" height="${round(node.heightMm)}" fill="${escapeXml(fill)}" stroke="${escapeXml(stroke)}" stroke-width="${round(strokeWidth)}"${dashArrayValue(node.dashArray)} />`;
}

function renderLine(node: LineNode): string {
  return `<line id="${escapeXml(node.id)}" x1="${round(node.x1Mm)}" y1="${round(node.y1Mm)}" x2="${round(node.x2Mm)}" y2="${round(node.y2Mm)}" stroke="${escapeXml(node.strokeColor)}" stroke-width="${round(node.strokeWidthMm)}"${dashArrayValue(node.dashArray)} />`;
}

function renderText(node: TextNode): string {
  const centerX = node.xMm + node.widthMm / 2;
  const centerY = node.yMm + node.heightMm / 2;
  const anchor =
    node.textAlign === 'left' ? 'start' : node.textAlign === 'right' ? 'end' : 'middle';
  const x =
    node.textAlign === 'left'
      ? node.xMm
      : node.textAlign === 'right'
        ? node.xMm + node.widthMm
        : centerX;
  const lineHeightMm = ptToMm(node.fontSizePt) * node.lineHeight;
  const firstY = centerY - ((node.lines.length - 1) * lineHeightMm) / 2;
  const transform =
    node.rotationDeg === 0
      ? ''
      : ` transform="rotate(${node.rotationDeg} ${round(centerX)} ${round(centerY)})"`;
  const tspans = node.lines
    .map(
      (line, index) =>
        `<tspan x="${round(x)}" y="${round(firstY + index * lineHeightMm)}">${escapeXml(line)}</tspan>`
    )
    .join('');

  return `<text id="${escapeXml(node.id)}" text-anchor="${anchor}" dominant-baseline="central" font-family="${escapeXml(node.fontFamily)}" font-size="${round(ptToMm(node.fontSizePt))}" font-weight="${node.fontWeight === 'bold' ? '700' : '400'}" letter-spacing="${round(ptToMm(node.letterSpacingPt))}" fill="${escapeXml(node.color)}"${transform}>${tspans}</text>`;
}

export function renderSceneToSvg(scene: LayoutScene, options: SvgRenderOptions = {}): string {
  const includeGuides = options.includeGuides ?? false;
  const nodes = scene.nodes
    .filter((node) => includeGuides || node.printable)
    .map((node) => {
      switch (node.type) {
        case 'rectangle':
          return renderRectangle(node);
        case 'line':
          return renderLine(node);
        case 'text':
          return renderText(node);
      }
    })
    .join('');

  return `<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="${round(scene.pageWidthMm)}mm" height="${round(scene.pageHeightMm)}mm" viewBox="0 0 ${round(scene.pageWidthMm)} ${round(scene.pageHeightMm)}" role="img" aria-label="${escapeXml(options.title ?? '席卡')}"><title>${escapeXml(options.title ?? '席卡')}</title>${nodes}</svg>`;
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000;
  for (let offset = 0; offset < bytes.length; offset += chunkSize) {
    const chunk = bytes.subarray(offset, offset + chunkSize);
    binary += String.fromCharCode(...chunk);
  }
  return btoa(binary);
}

export function svgToDataUri(svg: string): string {
  return `data:image/svg+xml;base64,${bytesToBase64(new TextEncoder().encode(svg))}`;
}
