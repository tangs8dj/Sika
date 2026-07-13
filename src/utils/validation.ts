import type { PageSettings, TextStyle } from '../features/layout/sceneTypes';

const HEX_COLOR = /^#[0-9a-f]{6}$/iu;

export function isValidHexColor(value: string): boolean {
  return HEX_COLOR.test(value.trim());
}

export function validateTextStyle(style: TextStyle): string[] {
  const errors: string[] = [];
  if (!isValidHexColor(style.color)) {
    errors.push('姓名颜色必须是 #RRGGBB 格式。');
  }
  if (!Number.isFinite(style.fontSizePt) || style.fontSizePt < 12 || style.fontSizePt > 160) {
    errors.push('字号必须在 12pt 至 160pt 之间。');
  }
  if (
    !Number.isFinite(style.minimumFontSizePt) ||
    style.minimumFontSizePt < 8 ||
    style.minimumFontSizePt > style.fontSizePt
  ) {
    errors.push('最小字号必须大于等于 8pt，且不能大于当前字号。');
  }
  if (
    !Number.isFinite(style.letterSpacingPt) ||
    style.letterSpacingPt < -2 ||
    style.letterSpacingPt > 20
  ) {
    errors.push('字间距必须在 -2pt 至 20pt 之间。');
  }
  return errors;
}

export function validatePageSettings(settings: PageSettings): string[] {
  const errors: string[] = [];
  if (settings.widthMm <= 0 || settings.heightMm <= 0) {
    errors.push('纸张宽度和高度必须大于 0。');
  }
  const horizontalMargins = settings.marginLeftMm + settings.marginRightMm;
  const verticalMargins = settings.marginTopMm + settings.marginBottomMm;
  if (horizontalMargins >= settings.widthMm) {
    errors.push('左右页边距之和必须小于纸张宽度。');
  }
  if (verticalMargins >= settings.heightMm) {
    errors.push('上下页边距之和必须小于纸张高度。');
  }
  if (settings.layoutMode === 'folded' && verticalMargins >= settings.heightMm / 2) {
    errors.push('折叠席卡的上下页边距过大，姓名区域没有可用高度。');
  }
  if (!isValidHexColor(settings.backgroundColor)) {
    errors.push('背景颜色必须是 #RRGGBB 格式。');
  }
  return errors;
}
