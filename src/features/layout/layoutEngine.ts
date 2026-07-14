import type { Person } from '../names/nameTypes';
import { fitTextToBox, type TextMeasurer } from './autoFitText';
import { ptToMm } from '../../utils/units';
import type {
  LayoutBox,
  LayoutScene,
  PageSettings,
  RectangleNode,
  TextNode,
  TextStyle
} from './sceneTypes';

export interface SceneBuildOptions {
  measurer?: TextMeasurer;
}

function createTextNode(
  id: string,
  name: string,
  box: LayoutBox,
  rotationDeg: number,
  style: TextStyle,
  measurer?: TextMeasurer
): TextNode {
  const fitted = fitTextToBox({
    text: name,
    box,
    fontFamily: style.fontFamily,
    fontWeight: style.fontWeight,
    desiredFontSizePt: style.fontSizePt,
    minimumFontSizePt: style.minimumFontSizePt,
    letterSpacingPt: style.letterSpacingPt,
    maxLines: style.maxLines,
    autoFit: style.autoFit,
    measurer
  });

  return {
    id,
    type: 'text',
    printable: true,
    text: name,
    lines: fitted.lines,
    xMm: box.xMm,
    yMm: box.yMm,
    widthMm: box.widthMm,
    heightMm: box.heightMm,
    rotationDeg,
    fontFamily: style.fontFamily,
    fontSizePt: fitted.fontSizePt,
    color: style.color,
    fontWeight: style.fontWeight,
    letterSpacingPt: style.letterSpacingPt,
    textAlign: style.horizontalAlign,
    verticalAlign: 'middle',
    lineHeight: fitted.lineHeight,
    overflow: fitted.overflow
  };
}

function alignTextToEdge(node: TextNode, edge: 'top' | 'bottom'): TextNode {
  const textHeightMm = ptToMm(node.fontSizePt) * node.lineHeight * node.lines.length;
  const yMm = edge === 'top' ? node.yMm : node.yMm + node.heightMm - textHeightMm;
  return { ...node, yMm, heightMm: textHeightMm };
}

function createSafeArea(id: string, box: LayoutBox): RectangleNode {
  return {
    id,
    type: 'rectangle',
    printable: false,
    xMm: box.xMm,
    yMm: box.yMm,
    widthMm: box.widthMm,
    heightMm: box.heightMm,
    strokeColor: '#60a5fa',
    strokeWidthMm: 0.25,
    dashArray: [2, 1]
  };
}

export function createPlaceCardScene(
  name: string,
  style: TextStyle,
  settings: PageSettings,
  options: SceneBuildOptions = {}
): LayoutScene {
  const nodes: LayoutScene['nodes'] = [
    {
      id: 'page-background',
      type: 'rectangle',
      printable: true,
      xMm: 0,
      yMm: 0,
      widthMm: settings.widthMm,
      heightMm: settings.heightMm,
      fillColor: settings.backgroundColor
    }
  ];
  const warnings: string[] = [];
  const contentWidth = Math.max(
    1,
    settings.widthMm - settings.marginHorizontalMm * 2
  );

  if (settings.showBorder) {
    nodes.push({
      id: 'page-border',
      type: 'rectangle',
      printable: true,
      xMm: 0.8,
      yMm: 0.8,
      widthMm: Math.max(0, settings.widthMm - 1.6),
      heightMm: Math.max(0, settings.heightMm - 1.6),
      strokeColor: '#6b7280',
      strokeWidthMm: 0.35
    });
  }

  if (settings.layoutMode === 'folded') {
    const foldY = settings.heightMm / 2;
    const foldPadding = 3;
    const topBox: LayoutBox = {
      xMm: settings.marginHorizontalMm,
      yMm: settings.marginTopMm,
      widthMm: contentWidth,
      heightMm: Math.max(1, foldY - settings.marginTopMm - foldPadding)
    };
    const bottomBox: LayoutBox = {
      xMm: settings.marginHorizontalMm,
      yMm: foldY + foldPadding,
      widthMm: contentWidth,
      heightMm: Math.max(1, foldY - settings.marginBottomMm - foldPadding)
    };

    const upper = alignTextToEdge(
      createTextNode('name-upper', name, topBox, 180, style, options.measurer),
      'top'
    );
    const lower = alignTextToEdge(
      createTextNode('name-lower', name, bottomBox, 0, style, options.measurer),
      'bottom'
    );
    nodes.push(upper, lower);

    if (upper.overflow || lower.overflow) {
      warnings.push(`“${name}”在最小字号下仍可能超出可用区域。`);
    }

    if (settings.showFoldLine || settings.printFoldLine) {
      nodes.push({
        id: 'fold-line',
        type: 'line',
        printable: settings.printFoldLine,
        previewable: settings.showFoldLine,
        x1Mm: 0,
        y1Mm: foldY,
        x2Mm: settings.widthMm,
        y2Mm: foldY,
        strokeColor: '#9ca3af',
        strokeWidthMm: 0.3,
        dashArray: [3, 2]
      });
    }

    if (settings.showSafeArea) {
      nodes.push(
        createSafeArea('safe-area-top', topBox),
        createSafeArea('safe-area-bottom', bottomBox)
      );
    }
  } else {
    const box: LayoutBox = {
      xMm: settings.marginHorizontalMm,
      yMm: settings.marginTopMm,
      widthMm: contentWidth,
      heightMm: Math.max(1, settings.heightMm - settings.marginTopMm - settings.marginBottomMm)
    };
    const textNode = createTextNode('name-flat', name, box, 0, style, options.measurer);
    nodes.push(textNode);
    if (textNode.overflow) {
      warnings.push(`“${name}”在最小字号下仍可能超出可用区域。`);
    }
    if (settings.showSafeArea) {
      nodes.push(createSafeArea('safe-area-flat', box));
    }
  }

  return {
    pageWidthMm: settings.widthMm,
    pageHeightMm: settings.heightMm,
    nodes,
    warnings
  };
}

export function createScenesForPeople(
  people: readonly Person[],
  style: TextStyle,
  settings: PageSettings,
  options: SceneBuildOptions = {}
): LayoutScene[] {
  return people.map((person) => createPlaceCardScene(person.name, style, settings, options));
}
