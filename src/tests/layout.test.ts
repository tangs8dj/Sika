import { describe, expect, it } from 'vitest';
import { fitTextToBox, type TextMeasurer } from '../features/layout/autoFitText';
import { createPlaceCardScene } from '../features/layout/layoutEngine';
import {
  DEFAULT_PAGE_SETTINGS,
  DEFAULT_TEXT_STYLE,
  getOrientedDimensions
} from '../features/layout/paperPresets';
import type { TextNode } from '../features/layout/sceneTypes';

const deterministicMeasurer: TextMeasurer = (text, size) => [...text].length * size * 0.15;

describe('纸张和席卡排版', () => {
  it('A4 横向尺寸为 297mm × 210mm', () => {
    expect(getOrientedDimensions('A4', 'landscape')).toEqual({ widthMm: 297, heightMm: 210 });
  });

  it('折叠双面生成上下两个姓名，上半部分旋转 180 度', () => {
    const scene = createPlaceCardScene('张伟', DEFAULT_TEXT_STYLE, DEFAULT_PAGE_SETTINGS, {
      measurer: deterministicMeasurer
    });
    const texts = scene.nodes.filter((node): node is TextNode => node.type === 'text');
    expect(texts).toHaveLength(2);
    expect(texts[0]?.rotationDeg).toBe(180);
    expect(texts[1]?.rotationDeg).toBe(0);
    const foldLine = scene.nodes.find((node) => node.id === 'fold-line');
    expect(foldLine?.printable).toBe(false);
  });

  it('平面单面模式只生成一个正常方向姓名', () => {
    const scene = createPlaceCardScene(
      '李娜',
      DEFAULT_TEXT_STYLE,
      { ...DEFAULT_PAGE_SETTINGS, layoutMode: 'flat' },
      { measurer: deterministicMeasurer }
    );
    const texts = scene.nodes.filter((node): node is TextNode => node.type === 'text');
    expect(texts).toHaveLength(1);
    expect(texts[0]?.rotationDeg).toBe(0);
  });
});

describe('长姓名自动适配', () => {
  it('文本超宽时通过二分查找缩小字号', () => {
    const result = fitTextToBox({
      text: 'AlexanderChristopherChen',
      box: { xMm: 0, yMm: 0, widthMm: 62, heightMm: 32 },
      fontFamily: 'Arial',
      fontWeight: 'normal',
      desiredFontSizePt: 72,
      minimumFontSizePt: 12,
      letterSpacingPt: 0,
      maxLines: 1,
      autoFit: true,
      measurer: deterministicMeasurer
    });
    expect(result.fontSizePt).toBeLessThan(72);
    expect(result.fontSizePt).toBeGreaterThanOrEqual(12);
    expect(result.overflow).toBe(false);
  });

  it('允许英文姓名按空格拆成两行', () => {
    const result = fitTextToBox({
      text: 'Alexander Christopher Chen',
      box: { xMm: 0, yMm: 0, widthMm: 54, heightMm: 55 },
      fontFamily: 'Arial',
      fontWeight: 'normal',
      desiredFontSizePt: 48,
      minimumFontSizePt: 20,
      letterSpacingPt: 0,
      maxLines: 2,
      autoFit: true,
      measurer: deterministicMeasurer
    });
    expect(result.lines).toHaveLength(2);
    expect(result.lines.join(' ')).toContain('Alexander');
    expect(result.overflow).toBe(false);
  });
});
