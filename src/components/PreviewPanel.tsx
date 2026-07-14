import { useEffect, useMemo, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, Maximize2, ZoomIn, ZoomOut } from 'lucide-react';
import { createPlaceCardScene } from '../features/layout/layoutEngine';
import { ScenePreview } from '../features/preview/ScenePreview';
import { useProjectStore } from '../store/useProjectStore';
import { mmToPx } from '../utils/units';

const PREVIEW_CANVAS_PADDING_PX = 56;

export function PreviewPanel() {
  const people = useProjectStore((state) => state.people);
  const selectedPersonId = useProjectStore((state) => state.selectedPersonId);
  const textStyle = useProjectStore((state) => state.textStyle);
  const pageSettings = useProjectStore((state) => state.pageSettings);
  const selectPerson = useProjectStore((state) => state.selectPerson);
  const updatePageSettings = useProjectStore((state) => state.updatePageSettings);
  const canvasRef = useRef<HTMLDivElement>(null);
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 });

  const selectedIndex = Math.max(
    0,
    people.findIndex((person) => person.id === selectedPersonId)
  );
  const person = people[selectedIndex];
  const scene = useMemo(
    () => (person ? createPlaceCardScene(person.name, textStyle, pageSettings) : null),
    [pageSettings, person, textStyle]
  );
  const fittedZoom = useMemo(() => {
    const availableWidth = canvasSize.width - PREVIEW_CANVAS_PADDING_PX;
    const availableHeight = canvasSize.height - PREVIEW_CANVAS_PADDING_PX;
    if (availableWidth <= 0 || availableHeight <= 0) return pageSettings.previewZoom;
    return Math.min(
      availableWidth / mmToPx(pageSettings.widthMm),
      availableHeight / mmToPx(pageSettings.heightMm)
    );
  }, [canvasSize, pageSettings.heightMm, pageSettings.previewZoom, pageSettings.widthMm]);
  const previewZoom = pageSettings.previewZoomMode === 'fit' ? fittedZoom : pageSettings.previewZoom;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const updateCanvasSize = () => {
      setCanvasSize({ width: canvas.clientWidth, height: canvas.clientHeight });
    };

    updateCanvasSize();
    if (typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(updateCanvasSize);
    observer.observe(canvas);
    return () => observer.disconnect();
  }, []);

  const goTo = (index: number) => {
    const target = people[index];
    if (target) selectPerson(target.id);
  };

  const setZoom = (value: number) => {
    updatePageSettings({
      previewZoom: Math.min(2.4, Math.max(0.1, value)),
      previewZoomMode: 'manual'
    });
  };

  const fitToWindow = () => updatePageSettings({ previewZoomMode: 'fit' });

  return (
    <main className="preview-panel" aria-label="席卡实时预览">
      <div className="preview-heading">
        <div>
          <span className="eyebrow">步骤 2</span>
          <h2>实时预览</h2>
        </div>
        <div className="paper-chip">
          {pageSettings.paperPreset === 'CUSTOM' ? '自定义' : pageSettings.paperPreset} ·{' '}
          {pageSettings.orientation === 'landscape' ? '横向' : '纵向'} ·{' '}
          {pageSettings.layoutMode === 'folded' ? '双面折叠' : '单面'}
        </div>
      </div>

      <div className="preview-canvas" ref={canvasRef}>
        {scene && person ? (
          <>
            <ScenePreview
              scene={scene}
              zoom={previewZoom}
              title={`${person.name}席卡`}
            />
            {scene.warnings.length > 0 && (
              <div className="preview-warning" role="status">
                {scene.warnings[0]}
              </div>
            )}
          </>
        ) : (
          <div className="empty-preview">
            <div className="empty-card-icon">席</div>
            <strong>等待生成席卡</strong>
            <span>请在左侧输入至少一个姓名。</span>
          </div>
        )}
      </div>

      <div className="preview-controls">
        <div className="page-navigation">
          <button
            type="button"
            className="icon-button outlined"
            onClick={() => goTo(selectedIndex - 1)}
            disabled={selectedIndex <= 0 || people.length === 0}
            title="上一张"
          >
            <ChevronLeft size={18} />
          </button>
          <span>
            {people.length === 0 ? 0 : selectedIndex + 1} / {people.length}
          </span>
          <button
            type="button"
            className="icon-button outlined"
            onClick={() => goTo(selectedIndex + 1)}
            disabled={selectedIndex >= people.length - 1 || people.length === 0}
            title="下一张"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="zoom-controls">
          <button
            type="button"
            className="icon-button"
            onClick={() => setZoom(previewZoom - 0.1)}
            title="缩小"
          >
            <ZoomOut size={17} />
          </button>
          <input
            type="range"
            min="0.1"
            max="2.4"
            step="0.05"
            value={previewZoom}
            onChange={(event) => setZoom(Number(event.target.value))}
            aria-label="预览缩放比例"
          />
          <span>{Math.round(previewZoom * 100)}%</span>
          <button
            type="button"
            className="icon-button"
            onClick={() => setZoom(previewZoom + 0.1)}
            title="放大"
          >
            <ZoomIn size={17} />
          </button>
          <button
            type="button"
            className="text-button"
            onClick={fitToWindow}
            title="适应窗口"
          >
            <Maximize2 size={15} /> 适应窗口
          </button>
        </div>
      </div>
    </main>
  );
}
