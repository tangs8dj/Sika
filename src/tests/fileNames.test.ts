import { describe, expect, it } from 'vitest';
import { createExportFileName, formatTimestamp } from '../utils/fileNames';

describe('导出文件名', () => {
  it('按本地时间生成固定格式文件名', () => {
    const date = new Date(2026, 6, 13, 9, 5);
    expect(formatTimestamp(date)).toBe('20260713_0905');
    expect(createExportFileName('docx', date)).toBe('席卡_20260713_0905.docx');
    expect(createExportFileName('pptx', date)).toBe('席卡_20260713_0905.pptx');
  });
});
