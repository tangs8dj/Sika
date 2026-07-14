import { describe, expect, it } from 'vitest';
import { DEFAULT_PAGE_SETTINGS, DEFAULT_TEXT_STYLE } from '../features/layout/paperPresets';
import {
  deserializeProjectState,
  PROJECT_VERSION,
  serializeProjectState,
  type PersistedProjectState
} from '../store/persistence';

const snapshot: PersistedProjectState = {
  version: PROJECT_VERSION,
  people: [{ id: '1', name: '张伟', enabled: true, order: 0 }],
  textStyle: DEFAULT_TEXT_STYLE,
  pageSettings: DEFAULT_PAGE_SETTINGS,
  selectedPersonId: '1',
  exportScope: 'enabled'
};

describe('项目状态序列化', () => {
  it('可以序列化并恢复项目状态', () => {
    expect(deserializeProjectState(serializeProjectState(snapshot))).toEqual(snapshot);
  });

  it('损坏数据和未知版本安全回退', () => {
    expect(deserializeProjectState('{broken')).toBeNull();
    expect(deserializeProjectState(JSON.stringify({ ...snapshot, version: 99 }))).toBeNull();
  });

  it('将旧项目的独立左右页边距迁移为统一页边距', () => {
    const legacyPageSettings: Record<string, unknown> = { ...DEFAULT_PAGE_SETTINGS };
    delete legacyPageSettings.marginHorizontalMm;
    const restored = deserializeProjectState(
      JSON.stringify({
        ...snapshot,
        pageSettings: {
          ...legacyPageSettings,
          marginLeftMm: 10,
          marginRightMm: 22
        }
      })
    );

    expect(restored?.pageSettings.marginHorizontalMm).toBe(16);
  });

  it('将缺少缩放模式的旧项目迁移为适应窗口', () => {
    const legacyPageSettings: Record<string, unknown> = { ...DEFAULT_PAGE_SETTINGS };
    delete legacyPageSettings.previewZoomMode;
    const restored = deserializeProjectState(
      JSON.stringify({ ...snapshot, pageSettings: legacyPageSettings })
    );

    expect(restored?.pageSettings.previewZoomMode).toBe('fit');
  });
});
