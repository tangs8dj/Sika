import { LoaderCircle } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export function ExportProgressDialog() {
  const progress = useProjectStore((state) => state.progress);
  const busyTask = useProjectStore((state) => state.busyTask);
  if (!progress || (busyTask !== 'docx' && busyTask !== 'pptx')) return null;

  const percentage =
    progress.stage === 'packing' || progress.stage === 'saving'
      ? progress.stage === 'saving'
        ? 96
        : 88
      : Math.max(2, Math.round((progress.current / Math.max(1, progress.total)) * 82));

  return (
    <div className="dialog-backdrop" role="presentation">
      <section className="progress-dialog" role="dialog" aria-modal="true" aria-label="导出进度">
        <LoaderCircle className="spin" size={26} />
        <div className="progress-copy">
          <strong>{busyTask === 'docx' ? '正在导出 Word' : '正在导出 PowerPoint'}</strong>
          <span>{progress.message}</span>
        </div>
        <div className="progress-track" aria-label={`导出进度 ${percentage}%`}>
          <div style={{ width: `${percentage}%` }} />
        </div>
        <small>请勿重复点击导出按钮。</small>
      </section>
    </div>
  );
}
