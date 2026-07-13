export const CSS_DPI = 96;
export const MM_PER_INCH = 25.4;
export const PT_PER_INCH = 72;
export const TWIP_PER_INCH = 1440;

export function mmToInch(mm: number): number {
  return mm / MM_PER_INCH;
}

export function inchToMm(inch: number): number {
  return inch * MM_PER_INCH;
}

export function mmToPx(mm: number, dpi = CSS_DPI): number {
  return (mm / MM_PER_INCH) * dpi;
}

export function pxToMm(px: number, dpi = CSS_DPI): number {
  return (px / dpi) * MM_PER_INCH;
}

export function ptToPx(pt: number, dpi = CSS_DPI): number {
  return (pt / PT_PER_INCH) * dpi;
}

export function ptToMm(pt: number): number {
  return (pt / PT_PER_INCH) * MM_PER_INCH;
}

export function mmToTwip(mm: number): number {
  return Math.round(mmToInch(mm) * TWIP_PER_INCH);
}

export function ptToHalfPoint(pt: number): number {
  return Math.round(pt * 2);
}

export function round(value: number, precision = 3): number {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}
