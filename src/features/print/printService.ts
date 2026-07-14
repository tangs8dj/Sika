import type { LayoutScene, PageSettings } from '../layout/sceneTypes';
import { renderSceneToSvg } from '../export/svgRenderer';

const PRINT_STYLE_ID = 'place-card-print-style';

function cleanupPrintDom(): void {
  document.body.classList.remove('print-mode');
  document.getElementById(PRINT_STYLE_ID)?.remove();
  const root = document.getElementById('print-root');
  if (root) root.replaceChildren();
}

export function printScenes(
  scenes: readonly LayoutScene[],
  settings: PageSettings
): void {
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
    @media print {
      html, body { margin: 0 !important; padding: 0 !important; background: #fff !important; }
      body > #root { display: none !important; }
      #print-root { display: block !important; }
      .print-page {
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
      .print-page:last-child { break-after: auto; page-break-after: auto; }
      .print-page svg { display: block; width: 100%; height: 100%; }
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
  document.body.classList.add('print-mode');

  try {
    window.print();
  } finally {
    cleanupPrintDom();
  }
}
