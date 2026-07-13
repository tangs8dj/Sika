export type FontWeight = 'normal' | 'bold';
export type HorizontalAlign = 'left' | 'center' | 'right';
export type Orientation = 'landscape' | 'portrait';
export type LayoutMode = 'folded' | 'flat';
export type PaperPreset = 'A4' | 'A3' | 'LETTER' | 'CUSTOM';
export type ExportScope = 'all' | 'enabled';

export interface TextStyle {
  fontFamily: string;
  fontSizePt: number;
  minimumFontSizePt: number;
  color: string;
  fontWeight: FontWeight;
  letterSpacingPt: number;
  horizontalAlign: HorizontalAlign;
  verticalCenter: boolean;
  autoFit: boolean;
  maxLines: 1 | 2;
}

export interface PageSettings {
  paperPreset: PaperPreset;
  widthMm: number;
  heightMm: number;
  orientation: Orientation;
  marginTopMm: number;
  marginRightMm: number;
  marginBottomMm: number;
  marginLeftMm: number;
  layoutMode: LayoutMode;
  showFoldLine: boolean;
  printFoldLine: boolean;
  showBorder: boolean;
  backgroundColor: string;
  previewZoom: number;
  showSafeArea: boolean;
}

interface BaseSceneNode {
  id: string;
  printable: boolean;
}

export interface TextNode extends BaseSceneNode {
  type: 'text';
  text: string;
  lines: string[];
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  rotationDeg: number;
  fontFamily: string;
  fontSizePt: number;
  color: string;
  fontWeight: FontWeight;
  letterSpacingPt: number;
  textAlign: HorizontalAlign;
  verticalAlign: 'middle';
  lineHeight: number;
  overflow: boolean;
}

export interface LineNode extends BaseSceneNode {
  type: 'line';
  x1Mm: number;
  y1Mm: number;
  x2Mm: number;
  y2Mm: number;
  strokeColor: string;
  strokeWidthMm: number;
  dashArray?: number[];
}

export interface RectangleNode extends BaseSceneNode {
  type: 'rectangle';
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
  fillColor?: string;
  strokeColor?: string;
  strokeWidthMm?: number;
  dashArray?: number[];
}

export type SceneNode = TextNode | LineNode | RectangleNode;

export interface LayoutScene {
  pageWidthMm: number;
  pageHeightMm: number;
  nodes: SceneNode[];
  warnings: string[];
}

export interface LayoutBox {
  xMm: number;
  yMm: number;
  widthMm: number;
  heightMm: number;
}
