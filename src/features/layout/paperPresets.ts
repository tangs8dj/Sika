import type { Orientation, PageSettings, PaperPreset, TextStyle } from './sceneTypes';

export interface PaperDimensions {
  widthMm: number;
  heightMm: number;
}

export const PAPER_PRESETS: Record<Exclude<PaperPreset, 'CUSTOM'>, PaperDimensions> = {
  A4: { widthMm: 210, heightMm: 297 },
  A3: { widthMm: 297, heightMm: 420 },
  LETTER: { widthMm: 215.9, heightMm: 279.4 }
};

export const FALLBACK_FONTS = [
  'Microsoft YaHei',
  'SimHei',
  'SimSun',
  'KaiTi',
  'FangSong',
  'Arial',
  'Calibri',
  'Times New Roman'
] as const;

export const DEFAULT_TEXT_STYLE: TextStyle = {
  fontFamily: 'Microsoft YaHei',
  fontSizePt: 72,
  minimumFontSizePt: 28,
  color: '#111827',
  fontWeight: 'bold',
  letterSpacingPt: 0,
  horizontalAlign: 'center',
  verticalCenter: true,
  autoFit: true,
  maxLines: 2
};

export const DEFAULT_PAGE_SETTINGS: PageSettings = {
  paperPreset: 'A4',
  widthMm: 297,
  heightMm: 210,
  orientation: 'landscape',
  marginTopMm: 12,
  marginRightMm: 16,
  marginBottomMm: 12,
  marginLeftMm: 16,
  layoutMode: 'folded',
  showFoldLine: true,
  printFoldLine: false,
  showBorder: false,
  backgroundColor: '#ffffff',
  previewZoom: 0.78,
  showSafeArea: false
};

export function getOrientedDimensions(
  preset: Exclude<PaperPreset, 'CUSTOM'>,
  orientation: Orientation
): PaperDimensions {
  const dimensions = PAPER_PRESETS[preset];
  return orientation === 'landscape'
    ? {
        widthMm: Math.max(dimensions.widthMm, dimensions.heightMm),
        heightMm: Math.min(dimensions.widthMm, dimensions.heightMm)
      }
    : {
        widthMm: Math.min(dimensions.widthMm, dimensions.heightMm),
        heightMm: Math.max(dimensions.widthMm, dimensions.heightMm)
      };
}

export function applyPaperPreset(
  settings: PageSettings,
  preset: Exclude<PaperPreset, 'CUSTOM'>
): PageSettings {
  const dimensions = getOrientedDimensions(preset, settings.orientation);
  return {
    ...settings,
    paperPreset: preset,
    ...dimensions
  };
}

export function applyOrientation(settings: PageSettings, orientation: Orientation): PageSettings {
  if (settings.orientation === orientation) {
    return settings;
  }

  return {
    ...settings,
    orientation,
    widthMm: settings.heightMm,
    heightMm: settings.widthMm
  };
}
