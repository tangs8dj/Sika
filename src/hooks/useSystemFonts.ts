import { useEffect } from 'react';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { FALLBACK_FONTS } from '../features/layout/paperPresets';
import { useProjectStore } from '../store/useProjectStore';

function normalizeFonts(fonts: readonly string[]): string[] {
  return [
    ...new Set([...FALLBACK_FONTS, ...fonts].map((font) => font.trim()).filter(Boolean))
  ].sort((a, b) => a.localeCompare(b, 'zh-CN'));
}

export function useSystemFonts(): void {
  const setSystemFonts = useProjectStore((state) => state.setSystemFonts);
  const updateTextStyle = useProjectStore((state) => state.updateTextStyle);
  const showToast = useProjectStore((state) => state.showToast);
  const fontFamily = useProjectStore((state) => state.textStyle.fontFamily);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const fonts = isTauri() ? await invoke<string[]>('list_system_fonts') : [...FALLBACK_FONTS];
        if (cancelled) return;
        const normalized = normalizeFonts(fonts);
        setSystemFonts(normalized);
        if (!normalized.includes(fontFamily)) {
          const fallback = normalized.includes('Microsoft YaHei') ? 'Microsoft YaHei' : 'Arial';
          updateTextStyle({ fontFamily: fallback });
          showToast({ kind: 'info', message: `未找到字体“${fontFamily}”，已回退为 ${fallback}。` });
        }
      } catch {
        if (cancelled) return;
        setSystemFonts(normalizeFonts(FALLBACK_FONTS));
        showToast({ kind: 'info', message: '系统字体读取失败，已使用内置字体列表。' });
      }
    };
    void load();
    return () => {
      cancelled = true;
    };
  }, [fontFamily, setSystemFonts, showToast, updateTextStyle]);
}
