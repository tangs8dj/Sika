import { afterEach, describe, expect, it, vi } from 'vitest';
import { invoke, isTauri } from '@tauri-apps/api/core';
import { printScenes } from '../features/print/printService';
import type { LayoutScene, PageSettings } from '../features/layout/sceneTypes';

vi.mock('@tauri-apps/api/core', () => ({
  invoke: vi.fn(),
  isTauri: vi.fn(() => false)
}));

const scene: LayoutScene = {
  pageWidthMm: 210,
  pageHeightMm: 297,
  nodes: [
    {
      id: 'printed-name',
      type: 'text',
      printable: true,
      text: '张伟',
      lines: ['张伟'],
      xMm: 10,
      yMm: 10,
      widthMm: 190,
      heightMm: 100,
      rotationDeg: 0,
      fontFamily: 'Microsoft YaHei',
      fontSizePt: 40,
      color: '#111827',
      fontWeight: 'normal',
      letterSpacingPt: 0,
      textAlign: 'center',
      verticalAlign: 'middle',
      lineHeight: 1.2,
      overflow: false
    },
    {
      id: 'preview-safe-area',
      type: 'rectangle',
      printable: false,
      xMm: 10,
      yMm: 10,
      widthMm: 190,
      heightMm: 100,
      strokeColor: '#60a5fa',
      strokeWidthMm: 0.25
    }
  ],
  warnings: []
};

const settings: PageSettings = {
  paperPreset: 'A4',
  widthMm: 210,
  heightMm: 297,
  orientation: 'portrait',
  marginTopMm: 0,
  marginHorizontalMm: 0,
  marginBottomMm: 0,
  layoutMode: 'flat',
  showFoldLine: false,
  printFoldLine: false,
  showBorder: false,
  backgroundColor: '#ffffff',
  previewZoom: 1,
  previewZoomMode: 'manual',
  showSafeArea: false
};

describe('打印分页', () => {
  afterEach(() => {
    document.head.querySelector('#place-card-print-style')?.remove();
    document.getElementById('print-root')?.remove();
    document.documentElement.classList.remove('print-mode');
    document.body.classList.remove('print-mode');
    vi.restoreAllMocks();
    vi.mocked(isTauri).mockReturnValue(false);
  });

  it('在关闭打印预览前保留每张席卡的独立页面', async () => {
    const printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.append(printRoot);
    vi.spyOn(window, 'print').mockImplementation(() => undefined);

    const printPromise = printScenes([scene, scene], settings);

    expect(document.querySelectorAll('#print-root .print-page')).toHaveLength(2);
    expect(document.querySelectorAll('#print-root svg')).toHaveLength(2);
    expect(document.querySelectorAll('#print-root #printed-name')).toHaveLength(2);
    expect(document.getElementById('preview-safe-area')).toBeNull();
    expect(document.getElementById('place-card-print-style')?.textContent).toContain(
      'page-break-after: always'
    );
    expect(document.getElementById('place-card-print-style')?.textContent).toContain(
      'body.print-mode .print-page:last-child { break-after: auto; page-break-after: auto; }'
    );
    expect(document.getElementById('place-card-print-style')?.textContent).toContain(
      'overflow: visible !important'
    );

    window.dispatchEvent(new Event('afterprint'));
    await printPromise;

    expect(document.getElementById('print-root')?.childElementCount).toBe(0);
    expect(document.getElementById('place-card-print-style')).toBeNull();
    expect(document.body.classList.contains('print-mode')).toBe(false);
  });

  it('在 macOS 桌面端使用原生打印面板', async () => {
    const printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.append(printRoot);
    vi.mocked(isTauri).mockReturnValue(true);
    let finishNativePrint: ((value: boolean) => void) | undefined;
    vi.mocked(invoke).mockImplementation(
      () =>
        new Promise<boolean>((resolve) => {
          finishNativePrint = resolve;
        })
    );
    const browserPrint = vi.spyOn(window, 'print');

    const printPromise = printScenes([scene], settings);

    expect(invoke).toHaveBeenCalledWith('print_current_window', {
      widthMm: 210,
      heightMm: 297
    });
    expect(browserPrint).not.toHaveBeenCalled();
    expect(document.documentElement.classList.contains('print-mode')).toBe(true);
    expect(document.body.classList.contains('print-mode')).toBe(true);
    expect(document.getElementById('print-root')?.childElementCount).toBe(1);
    expect(document.getElementById('place-card-print-style')?.textContent).toContain(
      'body.print-mode > #root'
    );
    expect(document.getElementById('place-card-print-style')?.textContent).toContain(
      'body.print-mode .print-page'
    );

    finishNativePrint?.(true);
    await printPromise;

    expect(document.getElementById('print-root')?.childElementCount).toBe(0);
    expect(document.documentElement.classList.contains('print-mode')).toBe(false);
    expect(document.body.classList.contains('print-mode')).toBe(false);
  });

  it('在 Windows 桌面端继续使用 WebView 打印流程', async () => {
    const printRoot = document.createElement('div');
    printRoot.id = 'print-root';
    document.body.append(printRoot);
    vi.mocked(isTauri).mockReturnValue(true);
    vi.mocked(invoke).mockResolvedValue(false);
    const browserPrint = vi.spyOn(window, 'print').mockImplementation(() => undefined);

    const printPromise = printScenes([scene], settings);
    await Promise.resolve();

    expect(invoke).toHaveBeenCalledWith('print_current_window', {
      widthMm: 210,
      heightMm: 297
    });
    expect(browserPrint).toHaveBeenCalledOnce();

    window.dispatchEvent(new Event('afterprint'));
    await printPromise;
  });
});
