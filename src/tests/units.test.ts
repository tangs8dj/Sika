import { describe, expect, it } from 'vitest';
import {
  inchToMm,
  mmToInch,
  mmToPx,
  mmToTwip,
  ptToHalfPoint,
  ptToPx,
  pxToMm
} from '../utils/units';

describe('单位转换', () => {
  it('毫米和英寸可逆', () => {
    expect(mmToInch(25.4)).toBeCloseTo(1, 8);
    expect(inchToMm(1)).toBeCloseTo(25.4, 8);
  });

  it('毫米、像素和磅按 96 DPI 转换', () => {
    expect(mmToPx(25.4)).toBeCloseTo(96, 8);
    expect(pxToMm(96)).toBeCloseTo(25.4, 8);
    expect(ptToPx(72)).toBeCloseTo(96, 8);
  });

  it('支持 twip 和 half-point', () => {
    expect(mmToTwip(25.4)).toBe(1440);
    expect(ptToHalfPoint(12)).toBe(24);
  });
});
