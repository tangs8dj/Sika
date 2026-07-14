import { FilePlus2, FileText, Presentation, Printer, RotateCcw } from 'lucide-react';
import { Button } from '@arco-design/web-react';
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
          <h1>Whyu</h1>
          <p>离线排版 · 一键打印 · Office 导出</p>
        </div>
      </div>
      <nav className="toolbar-actions" aria-label="文件与导出操作">
        <Button icon={<FilePlus2 size={17} />} onClick={onNew} disabled={busy}>
          新建
        </Button>
        <Button type="primary" icon={<Printer size={17} />} onClick={onPrint} disabled={busy}>
          {busyTask === 'print' ? '正在打印…' : '打印'}
        </Button>
        <Button icon={<FileText size={17} />} onClick={onExportDocx} disabled={busy}>
          {busyTask === 'docx' ? '正在导出…' : '导出 Word'}
        </Button>
        <Button icon={<Presentation size={17} />} onClick={onExportPptx} disabled={busy}>
          {busyTask === 'pptx' ? '正在导出…' : '导出 PPT'}
        </Button>
        <Button
          type="text"
          icon={<RotateCcw size={17} />}
          onClick={onRestoreDefaults}
          disabled={busy}
          title="保留姓名并恢复默认样式和纸张"
        >
          恢复默认
        </Button>
      </nav>
    </header>
  );
}
