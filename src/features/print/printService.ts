import { invoke, isTauri } from '@tauri-apps/api/core';
import type { LayoutScene, PageSettings } from '../layout/sceneTypes';
import { renderSceneToSvg } from '../export/svgRenderer';

const PRINT_STYLE_ID = 'place-card-print-style';

function cleanupPrintDom(): void {
  document.documentElement.classList.remove('print-mode');
  document.body.classList.remove('print-mode');
  document.getElementById(PRINT_STYLE_ID)?.remove();
  const root = document.getElementById('print-root');
  if (root) root.replaceChildren();
}

async function openPrintDialog(settings: PageSettings): Promise<void> {
  if (
    isTauri() &&
    (await invoke<boolean>('print_current_window', {
      widthMm: settings.widthMm,
      heightMm: settings.heightMm
    }))
  ) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const handleAfterPrint = () => {
      window.removeEventListener('afterprint', handleAfterPrint);
      resolve();
    };

    window.addEventListener('afterprint', handleAfterPrint, { once: true });

    try {
      window.print();
    } catch (error) {
      window.removeEventListener('afterprint', handleAfterPrint);
      reject(error);
    }
  });
}

export function printScenes(
  scenes: readonly LayoutScene[],
  settings: PageSettings
): Promise<void> {
  if (scenes.length === 0) {
    throw new Error('没有可打印的席卡。');
  }

  const root = document.getElementById('print-root');
  if (!root) {
    throw new Error('打印容器未初始化。');
  }

  cleanupPrintDom();
  const style = document.createElement('style');
  style.id = PRINT_STYLE_ID;
  style.textContent = `
    @page { size: ${settings.widthMm}mm ${settings.heightMm}mm; margin: 0; }
    html.print-mode,
    body.print-mode {
      width: auto !important;
      min-width: 0 !important;
      height: auto !important;
      min-height: 0 !important;
      overflow: visible !important;
      margin: 0 !important;
      padding: 0 !important;
      background: #fff !important;
    }
    body.print-mode > #root { display: none !important; }
    body.print-mode > #print-root {
      display: block !important;
      width: ${settings.widthMm}mm;
    }
    body.print-mode .print-page {
      width: ${settings.widthMm}mm;
      height: ${settings.heightMm}mm;
      margin: 0;
      padding: 0;
      overflow: hidden;
      break-after: page;
      page-break-after: always;
      print-color-adjust: exact;
      -webkit-print-color-adjust: exact;
    }
    body.print-mode .print-page:last-child { break-after: auto; page-break-after: auto; }
    body.print-mode .print-page svg { display: block; width: 100%; height: 100%; }
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      body > #root { display: none !important; }
      #print-root { display: block !important; }
    }
  `;
  document.head.append(style);

  const fragment = document.createDocumentFragment();
  scenes.forEach((scene, index) => {
    const page = document.createElement('section');
    page.className = 'print-page';
    page.setAttribute('aria-label', `席卡第 ${index + 1} 页`);
    page.innerHTML = renderSceneToSvg(scene, { title: `席卡第 ${index + 1} 页` });
    fragment.append(page);
  });
  root.append(fragment);
  document.documentElement.classList.add('print-mode');
  document.body.classList.add('print-mode');

  return openPrintDialog(settings).finally(cleanupPrintDom);
}
