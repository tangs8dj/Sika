import { mmToPx } from '../../utils/units';

export interface PngRenderOptions {
  dpi?: number;
}

export async function svgToPngBytes(
  svg: string,
  widthMm: number,
  heightMm: number,
  options: PngRenderOptions = {}
): Promise<Uint8Array> {
  if (typeof document === 'undefined' || typeof Image === 'undefined') {
    throw new Error('当前运行环境不支持 Canvas 图片渲染。');
  }

  const dpi = options.dpi ?? 180;
  const widthPx = Math.max(1, Math.round(mmToPx(widthMm, dpi)));
  const heightPx = Math.max(1, Math.round(mmToPx(heightMm, dpi)));
  const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
  const objectUrl = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const element = new Image();
      element.onload = () => resolve(element);
      element.onerror = () => reject(new Error('SVG 转换为图片失败。'));
      element.src = objectUrl;
    });

    const canvas = document.createElement('canvas');
    canvas.width = widthPx;
    canvas.height = heightPx;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('无法创建 Canvas 2D 上下文。');
    }
    context.drawImage(image, 0, 0, widthPx, heightPx);

    const pngBlob = await new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((result) => {
        if (result) resolve(result);
        else reject(new Error('Canvas 导出 PNG 失败。'));
      }, 'image/png');
    });

    canvas.width = 1;
    canvas.height = 1;
    return new Uint8Array(await pngBlob.arrayBuffer());
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
