import { isTauri } from '@tauri-apps/api/core';
import { save } from '@tauri-apps/plugin-dialog';
import { writeFile } from '@tauri-apps/plugin-fs';

export interface SaveBinaryOptions {
  defaultFileName: string;
  extension: 'docx' | 'pptx';
  mimeType: string;
}

function ensureExtension(path: string, extension: string): string {
  return path.toLowerCase().endsWith(`.${extension}`) ? path : `${path}.${extension}`;
}

function downloadInBrowser(data: Uint8Array, options: SaveBinaryOptions): string {
  const safeBuffer = new Uint8Array(data.byteLength);
  safeBuffer.set(data);
  const blob = new Blob([safeBuffer.buffer], { type: options.mimeType });
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement('a');
    link.href = url;
    link.download = options.defaultFileName;
    link.style.display = 'none';
    document.body.append(link);
    link.click();
    link.remove();
    return options.defaultFileName;
  } finally {
    setTimeout(() => URL.revokeObjectURL(url), 0);
  }
}

export async function saveBinaryFile(
  data: Uint8Array,
  options: SaveBinaryOptions
): Promise<string | null> {
  if (!isTauri()) {
    return downloadInBrowser(data, options);
  }

  const selectedPath = await save({
    title: `导出 ${options.extension.toUpperCase()} 文件`,
    defaultPath: options.defaultFileName,
    filters: [
      {
        name: options.extension === 'docx' ? 'Word 文档' : 'PowerPoint 演示文稿',
        extensions: [options.extension]
      }
    ]
  });

  if (!selectedPath) return null;
  const path = ensureExtension(selectedPath, options.extension);
  await writeFile(path, data);
  return path;
}
