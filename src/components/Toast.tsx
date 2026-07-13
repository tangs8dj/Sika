import { useEffect } from 'react';
import { CheckCircle2, Info, TriangleAlert, X } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';

export function Toast() {
  const toast = useProjectStore((state) => state.toast);
  const showToast = useProjectStore((state) => state.showToast);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => showToast(null), toast.kind === 'error' ? 6000 : 3600);
    return () => clearTimeout(timer);
  }, [showToast, toast]);

  if (!toast) return null;
  const Icon =
    toast.kind === 'success' ? CheckCircle2 : toast.kind === 'error' ? TriangleAlert : Info;
  return (
    <div className={`toast ${toast.kind}`} role={toast.kind === 'error' ? 'alert' : 'status'}>
      <Icon size={20} />
      <span>{toast.message}</span>
      <button type="button" onClick={() => showToast(null)} aria-label="关闭提示">
        <X size={16} />
      </button>
    </div>
  );
}
