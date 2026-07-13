import { ptToMm, ptToPx } from '../../utils/units';
import type { FontWeight, LayoutBox } from './sceneTypes';

export type TextMeasurer = (
  text: string,
  fontSizePt: number,
  fontFamily: string,
  fontWeight: FontWeight,
  letterSpacingPt: number
) => number;

export interface FitTextOptions {
  text: string;
  box: LayoutBox;
  fontFamily: string;
  fontWeight: FontWeight;
  desiredFontSizePt: number;
  minimumFontSizePt: number;
  letterSpacingPt: number;
  maxLines: 1 | 2;
  autoFit: boolean;
  lineHeight?: number;
  measurer?: TextMeasurer;
}

export interface FitTextResult {
  fontSizePt: number;
  lines: string[];
  lineHeight: number;
  overflow: boolean;
}

let measurementCanvas: HTMLCanvasElement | undefined;
let measurementContext: CanvasRenderingContext2D | null | undefined;

function getMeasurementContext(): CanvasRenderingContext2D | null {
  if (measurementContext !== undefined) {
    return measurementContext;
  }

  if (
    typeof document === 'undefined' ||
    (typeof navigator !== 'undefined' && /jsdom/iu.test(navigator.userAgent))
  ) {
    measurementContext = null;
    return measurementContext;
  }

  try {
    measurementCanvas = document.createElement('canvas');
    measurementContext = measurementCanvas.getContext('2d');
  } catch {
    measurementContext = null;
  }
  return measurementContext;
}

function estimatedGlyphWidthEm(character: string): number {
  if (/\s/u.test(character)) return 0.33;
  if (/\p{Script=Han}|\p{Script=Hiragana}|\p{Script=Katakana}|\p{Script=Hangul}/u.test(character)) {
    return 1;
  }
  if (/[A-Z]/u.test(character)) return 0.66;
  if (/[a-z]/u.test(character)) return 0.55;
  if (/[0-9]/u.test(character)) return 0.56;
  return 0.75;
}

export const defaultTextMeasurer: TextMeasurer = (
  text,
  fontSizePt,
  fontFamily,
  fontWeight,
  letterSpacingPt
) => {
  const characters = [...text];
  const context = getMeasurementContext();
  let widthMm: number;

  if (context) {
    context.font = `${fontWeight === 'bold' ? '700' : '400'} ${ptToPx(fontSizePt)}px "${fontFamily}"`;
    widthMm = (context.measureText(text).width / 96) * 25.4;
  } else {
    const widthEm = characters.reduce(
      (total, character) => total + estimatedGlyphWidthEm(character),
      0
    );
    widthMm = widthEm * ptToMm(fontSizePt);
  }

  if (characters.length > 1) {
    widthMm += (characters.length - 1) * ptToMm(letterSpacingPt);
  }
  return widthMm;
};

function textHeightMm(fontSizePt: number, lineCount: number, lineHeight: number): number {
  return ptToMm(fontSizePt) * lineHeight * lineCount;
}

function fits(
  lines: readonly string[],
  fontSizePt: number,
  options: FitTextOptions,
  lineHeight: number,
  measurer: TextMeasurer
): boolean {
  const fitsWidth = lines.every(
    (line) =>
      measurer(line, fontSizePt, options.fontFamily, options.fontWeight, options.letterSpacingPt) <=
      options.box.widthMm
  );
  const fitsHeight = textHeightMm(fontSizePt, lines.length, lineHeight) <= options.box.heightMm;
  return fitsWidth && fitsHeight;
}

function splitCandidates(text: string): string[][] {
  const characters = [...text];
  if (characters.length < 2) return [[text]];

  const candidates: string[][] = [];
  const whitespaceBreaks: number[] = [];
  for (let index = 1; index < characters.length; index += 1) {
    if (/\s/u.test(characters[index - 1] ?? '') || /\s/u.test(characters[index] ?? '')) {
      whitespaceBreaks.push(index);
    }
  }

  const breaks =
    whitespaceBreaks.length > 0
      ? whitespaceBreaks
      : Array.from({ length: characters.length - 1 }, (_, index) => index + 1);

  for (const breakIndex of breaks) {
    const first = characters.slice(0, breakIndex).join('').trim();
    const second = characters.slice(breakIndex).join('').trim();
    if (first && second) candidates.push([first, second]);
  }

  if (candidates.length === 0) {
    const middle = Math.ceil(characters.length / 2);
    candidates.push([
      characters.slice(0, middle).join('').trim(),
      characters.slice(middle).join('').trim()
    ]);
  }
  return candidates;
}

function findBestTwoLineSplit(
  text: string,
  fontSizePt: number,
  options: FitTextOptions,
  measurer: TextMeasurer
): string[] {
  const candidates = splitCandidates(text);
  let best = candidates[0] ?? [text];
  let bestScore = Number.POSITIVE_INFINITY;

  for (const candidate of candidates) {
    const widths = candidate.map((line) =>
      measurer(line, fontSizePt, options.fontFamily, options.fontWeight, options.letterSpacingPt)
    );
    const maxWidth = Math.max(...widths);
    const imbalance = Math.abs((widths[0] ?? 0) - (widths[1] ?? 0));
    const score = maxWidth + imbalance * 0.16;
    if (score < bestScore) {
      best = candidate;
      bestScore = score;
    }
  }
  return best;
}

function linesForSize(
  fontSizePt: number,
  options: FitTextOptions,
  lineHeight: number,
  measurer: TextMeasurer
): string[] {
  const oneLine = [options.text];
  if (fits(oneLine, fontSizePt, options, lineHeight, measurer) || options.maxLines === 1) {
    return oneLine;
  }
  return findBestTwoLineSplit(options.text, fontSizePt, options, measurer);
}

export function fitTextToBox(options: FitTextOptions): FitTextResult {
  const text = options.text.trim();
  const lineHeight = options.lineHeight ?? 1.16;
  const measurer = options.measurer ?? defaultTextMeasurer;
  const desired = Math.max(options.minimumFontSizePt, options.desiredFontSizePt);
  const minimum = Math.min(desired, options.minimumFontSizePt);

  if (!text) {
    return { fontSizePt: desired, lines: [''], lineHeight, overflow: false };
  }

  const desiredLines = linesForSize(desired, { ...options, text }, lineHeight, measurer);
  if (fits(desiredLines, desired, { ...options, text }, lineHeight, measurer)) {
    return { fontSizePt: desired, lines: desiredLines, lineHeight, overflow: false };
  }

  if (!options.autoFit) {
    return { fontSizePt: desired, lines: desiredLines, lineHeight, overflow: true };
  }

  const minimumLines = linesForSize(minimum, { ...options, text }, lineHeight, measurer);
  if (!fits(minimumLines, minimum, { ...options, text }, lineHeight, measurer)) {
    return { fontSizePt: minimum, lines: minimumLines, lineHeight, overflow: true };
  }

  let low = minimum;
  let high = desired;
  let bestSize = minimum;
  let bestLines = minimumLines;

  for (let iteration = 0; iteration < 18 && high - low > 0.1; iteration += 1) {
    const middle = (low + high) / 2;
    const lines = linesForSize(middle, { ...options, text }, lineHeight, measurer);
    if (fits(lines, middle, { ...options, text }, lineHeight, measurer)) {
      bestSize = middle;
      bestLines = lines;
      low = middle;
    } else {
      high = middle;
    }
  }

  return {
    fontSizePt: Math.floor(bestSize * 10) / 10,
    lines: bestLines,
    lineHeight,
    overflow: false
  };
}
