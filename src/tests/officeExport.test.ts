import JSZip from 'jszip';
import { describe, expect, it } from 'vitest';
import { createDocxBytes } from '../features/export/docxExporter';
import { createPptxBytes } from '../features/export/pptxExporter';
import { DEFAULT_PAGE_SETTINGS, DEFAULT_TEXT_STYLE } from '../features/layout/paperPresets';
import type { Person } from '../features/names/nameTypes';

const people: Person[] = [
  { id: '1', name: '张伟', enabled: true, order: 0 },
  { id: '2', name: '李娜', enabled: true, order: 1 }
];

function tinyPng(): Uint8Array {
  const base64 =
    'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wl2n0AAAAAASUVORK5CYII=';
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

describe('Office OOXML 导出', () => {
  it('生成包含对应 section 数量的 DOCX ZIP 包', async () => {
    const bytes = await createDocxBytes(people, DEFAULT_TEXT_STYLE, DEFAULT_PAGE_SETTINGS, {
      renderPng: () => Promise.resolve(tinyPng())
    });
    expect(bytes.byteLength).toBeGreaterThan(1000);
    const zip = await JSZip.loadAsync(bytes);
    const documentXml = await zip.file('word/document.xml')?.async('string');
    expect(documentXml).toBeTruthy();
    expect(documentXml?.match(/<w:sectPr/gmu)).toHaveLength(people.length);
    const media = Object.keys(zip.files).filter(
      (name) => name.startsWith('word/media/') && !name.endsWith('/')
    );
    const svgMedia = media.filter((name) => name.endsWith('.svg'));
    expect(svgMedia).toHaveLength(people.length);
    expect(media.some((name) => name.endsWith('.png'))).toBe(true);
    const firstSvg = svgMedia[0] ? await zip.file(svgMedia[0])?.async('string') : undefined;
    expect(firstSvg).toContain('<svg');
  });

  it('生成与姓名数量一致的 PPTX 幻灯片', async () => {
    const bytes = await createPptxBytes(people, DEFAULT_TEXT_STYLE, DEFAULT_PAGE_SETTINGS);
    expect(bytes.byteLength).toBeGreaterThan(1000);
    const zip = await JSZip.loadAsync(bytes);
    expect(zip.file('ppt/presentation.xml')).toBeTruthy();
    const slides = Object.keys(zip.files).filter((name) =>
      /^ppt\/slides\/slide\d+\.xml$/u.test(name)
    );
    expect(slides).toHaveLength(people.length);
  });
});
