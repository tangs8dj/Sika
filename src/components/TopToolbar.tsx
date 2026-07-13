import { FilePlus2, FileText, Presentation, Printer, RotateCcw } from 'lucide-react';
import type { BusyTask } from '../store/useProjectStore';

interface TopToolbarProps {
  busyTask: BusyTask;
  onNew: () => void;
  onPrint: () => void;
  onExportDocx: () => void;
  onExportPptx: () => void;
  onRestoreDefaults: () => void;
}

export function TopToolbar({
  busyTask,
  onNew,
  onPrint,
  onExportDocx,
  onExportPptx,
  onRestoreDefaults
}: TopToolbarProps) {
  const busy = busyTask !== null;
  return (
    <header className="top-toolbar">
      <div className="brand-block">
        <div className="brand-mark">席</div>
        <div>
          <h1>批量席卡生成器</h1>
          <p>离线排版 · 一键打印 · Office 导出</p>
        </div>
      </div>
      <nav className="toolbar-actions" aria-label="文件与导出操作">
        <button type="button" className="button secondary" onClick={onNew} disabled={busy}>
          <FilePlus2 size={17} /> 新建
        </button>
        <button type="button" className="button primary" onClick={onPrint} disabled={busy}>
          <Printer size={17} /> {busyTask === 'print' ? '正在打印…' : '打印'}
        </button>
        <button type="button" className="button secondary" onClick={onExportDocx} disabled={busy}>
          <FileText size={17} /> {busyTask === 'docx' ? '正在导出…' : '导出 Word'}
        </button>
        <button type="button" className="button secondary" onClick={onExportPptx} disabled={busy}>
          <Presentation size={17} /> {busyTask === 'pptx' ? '正在导出…' : '导出 PPT'}
        </button>
        <button
          type="button"
          className="button ghost"
          onClick={onRestoreDefaults}
          disabled={busy}
          title="保留姓名并恢复默认样式和纸张"
        >
          <RotateCcw size={17} /> 恢复默认
        </button>
      </nav>
    </header>
  );
}
