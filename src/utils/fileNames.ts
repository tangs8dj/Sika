function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function formatTimestamp(date = new Date()): string {
  return `${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}_${pad(date.getHours())}${pad(date.getMinutes())}`;
}

export function createExportFileName(extension: 'docx' | 'pptx', date = new Date()): string {
  return `席卡_${formatTimestamp(date)}.${extension}`;
}
