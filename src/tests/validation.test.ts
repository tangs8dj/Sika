import { describe, expect, it } from 'vitest';
import { DEFAULT_PAGE_SETTINGS, DEFAULT_TEXT_STYLE } from '../features/layout/paperPresets';
import { isValidHexColor, validatePageSettings, validateTextStyle } from '../utils/validation';

describe('输入校验', () => {
  it('校验颜色格式', () => {
    expect(isValidHexColor('#112233')).toBe(true);
    expect(isValidHexColor('red')).toBe(false);
    expect(validateTextStyle({ ...DEFAULT_TEXT_STYLE, color: 'red' })).not.toHaveLength(0);
  });

  it('拒绝超过纸张尺寸的页边距', () => {
    const errors = validatePageSettings({
      ...DEFAULT_PAGE_SETTINGS,
      marginHorizontalMm: 160
    });
    expect(errors.some((error) => error.includes('左右页边距'))).toBe(true);
  });

  it('拒绝非正数自定义纸张', () => {
    expect(validatePageSettings({ ...DEFAULT_PAGE_SETTINGS, widthMm: 0 })).not.toHaveLength(0);
  });

  it('拒绝超过折叠半页高度的单侧页边距', () => {
    const errors = validatePageSettings({
      ...DEFAULT_PAGE_SETTINGS,
      marginTopMm: 105,
      marginBottomMm: 45
    });
    expect(errors.some((error) => error.includes('分别小于半页高度'))).toBe(true);
  });
});
