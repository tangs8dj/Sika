import { FileOutput, FoldHorizontal, LayoutTemplate } from 'lucide-react';
import type { LayoutMode, Orientation, PaperPreset } from '../features/layout/sceneTypes';
import { useProjectStore } from '../store/useProjectStore';
import { isValidHexColor } from '../utils/validation';

function numeric(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

interface NumberFieldProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
}

function NumberField({ label, value, min = 0, max, step = 1, onChange }: NumberFieldProps) {
  return (
    <label className="field-group compact-field">
      <span className="field-label">{label}</span>
      <div className="number-with-unit">
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => onChange(numeric(event.target.value, value))}
        />
        <span>mm</span>
      </div>
    </label>
  );
}

export function PageSettingsPanel() {
  const settings = useProjectStore((state) => state.pageSettings);
  const exportScope = useProjectStore((state) => state.exportScope);
  const update = useProjectStore((state) => state.updatePageSettings);
  const setPaperPreset = useProjectStore((state) => state.setPaperPreset);
  const setOrientation = useProjectStore((state) => state.setOrientation);
  const setExportScope = useProjectStore((state) => state.setExportScope);
  const backgroundValid = isValidHexColor(settings.backgroundColor);

  return (
    <>
      <section className="settings-section">
        <div className="section-title">
          <LayoutTemplate size={17} />
          <h3>页面与布局</h3>
        </div>

        <div className="two-column-fields">
          <label className="field-group">
            <span className="field-label">纸张</span>
            <select
              value={settings.paperPreset}
              onChange={(event) => setPaperPreset(event.target.value as PaperPreset)}
            >
              <option value="A4">A4</option>
              <option value="A3">A3</option>
              <option value="LETTER">Letter</option>
              <option value="CUSTOM">自定义</option>
            </select>
          </label>
          <label className="field-group">
            <span className="field-label">方向</span>
            <select
              value={settings.orientation}
              onChange={(event) => setOrientation(event.target.value as Orientation)}
            >
              <option value="landscape">横向</option>
              <option value="portrait">纵向</option>
            </select>
          </label>
        </div>

        {settings.paperPreset === 'CUSTOM' && (
          <div className="two-column-fields">
            <NumberField
              label="宽度"
              value={settings.widthMm}
              min={30}
              max={1000}
              step={0.1}
              onChange={(widthMm) => update({ widthMm })}
            />
            <NumberField
              label="高度"
              value={settings.heightMm}
              min={30}
              max={1000}
              step={0.1}
              onChange={(heightMm) => update({ heightMm })}
            />
          </div>
        )}

        <div className="field-group">
          <span className="field-label">页边距</span>
          <div className="margin-grid">
            <NumberField
              label="上"
              value={settings.marginTopMm}
              max={100}
              step={0.5}
              onChange={(marginTopMm) => update({ marginTopMm })}
            />
            <NumberField
              label="右"
              value={settings.marginRightMm}
              max={100}
              step={0.5}
              onChange={(marginRightMm) => update({ marginRightMm })}
            />
            <NumberField
              label="下"
              value={settings.marginBottomMm}
              max={100}
              step={0.5}
              onChange={(marginBottomMm) => update({ marginBottomMm })}
            />
            <NumberField
              label="左"
              value={settings.marginLeftMm}
              max={100}
              step={0.5}
              onChange={(marginLeftMm) => update({ marginLeftMm })}
            />
          </div>
        </div>

        <div className="field-group">
          <span className="field-label">席卡模式</span>
          <div className="segmented-control two" role="group" aria-label="席卡布局模式">
            {(
              [
                ['folded', '折叠双面'],
                ['flat', '平面单面']
              ] as Array<[LayoutMode, string]>
            ).map(([value, label]) => (
              <button
                type="button"
                key={value}
                className={settings.layoutMode === value ? 'active' : ''}
                onClick={() => update({ layoutMode: value })}
              >
                {value === 'folded' ? <FoldHorizontal size={16} /> : <LayoutTemplate size={16} />}
                {label}
              </button>
            ))}
          </div>
        </div>

        {settings.layoutMode === 'folded' && (
          <>
            <label className="switch-row">
              <span>
                <strong>预览折叠线</strong>
                <small>仅作为排版辅助线</small>
              </span>
              <input
                type="checkbox"
                checked={settings.showFoldLine}
                onChange={(event) => update({ showFoldLine: event.target.checked })}
              />
            </label>
            <label className="switch-row">
              <span>
                <strong>实际打印折叠线</strong>
                <small>导出和打印浅灰色虚线</small>
              </span>
              <input
                type="checkbox"
                checked={settings.printFoldLine}
                disabled={!settings.showFoldLine}
                onChange={(event) => update({ printFoldLine: event.target.checked })}
              />
            </label>
          </>
        )}

        <label className="switch-row">
          <span>
            <strong>显示外边框</strong>
            <small>边框会进入打印和导出文件</small>
          </span>
          <input
            type="checkbox"
            checked={settings.showBorder}
            onChange={(event) => update({ showBorder: event.target.checked })}
          />
        </label>
        <label className="switch-row">
          <span>
            <strong>显示安全区域</strong>
            <small>蓝色虚线只在预览中显示</small>
          </span>
          <input
            type="checkbox"
            checked={settings.showSafeArea}
            onChange={(event) => update({ showSafeArea: event.target.checked })}
          />
        </label>

        <div className="field-group">
          <span className="field-label">背景色</span>
          <div className="color-row">
            <input
              type="color"
              value={backgroundValid ? settings.backgroundColor : '#ffffff'}
              onChange={(event) => update({ backgroundColor: event.target.value })}
              aria-label="选择席卡背景色"
            />
            <input
              value={settings.backgroundColor}
              className={backgroundValid ? '' : 'invalid'}
              onChange={(event) => update({ backgroundColor: event.target.value })}
              aria-label="席卡背景颜色十六进制值"
            />
          </div>
        </div>
      </section>

      <section className="settings-section output-settings">
        <div className="section-title">
          <FileOutput size={17} />
          <h3>输出范围</h3>
        </div>
        <div className="segmented-control two" role="group" aria-label="打印和导出范围">
          <button
            type="button"
            className={exportScope === 'all' ? 'active' : ''}
            onClick={() => setExportScope('all')}
          >
            全部人员
          </button>
          <button
            type="button"
            className={exportScope === 'enabled' ? 'active' : ''}
            onClick={() => setExportScope('enabled')}
          >
            已勾选人员
          </button>
        </div>
      </section>
    </>
  );
}
