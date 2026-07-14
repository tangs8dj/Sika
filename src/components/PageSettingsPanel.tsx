import { FileOutput, FoldHorizontal, LayoutTemplate } from 'lucide-react';
import { InputNumber, Select, Switch } from '@arco-design/web-react';
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
      <InputNumber
        className="number-field"
        min={min}
        max={max}
        step={step}
        value={value}
        suffix="mm"
        onChange={(nextValue) => onChange(numeric(String(nextValue), value))}
      />
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
          <div className="field-group">
            <span className="field-label">纸张</span>
            <Select
              aria-label="纸张"
              value={settings.paperPreset}
              onChange={(paperPreset) => setPaperPreset(paperPreset as PaperPreset)}
              options={[
                { value: 'A4', label: 'A4' },
                { value: 'A3', label: 'A3' },
                { value: 'LETTER', label: 'Letter' },
                { value: 'CUSTOM', label: '自定义' }
              ]}
              triggerProps={{ autoAlignPopupWidth: true }}
            />
          </div>
          <div className="field-group">
            <span className="field-label">方向</span>
            <Select
              aria-label="方向"
              value={settings.orientation}
              onChange={(orientation) => setOrientation(orientation as Orientation)}
              options={[
                { value: 'landscape', label: '横向' },
                { value: 'portrait', label: '纵向' }
              ]}
              triggerProps={{ autoAlignPopupWidth: true }}
            />
          </div>
        </div>

        {settings.paperPreset === 'CUSTOM' && (
          <div className="two-column-fields">
            <NumberField
              label="宽度"
              value={settings.widthMm}
              min={30}
              max={1000}
              step={0.1}
              onChange={(widthMm) => update({ widthMm, previewZoomMode: 'fit' })}
            />
            <NumberField
              label="高度"
              value={settings.heightMm}
              min={30}
              max={1000}
              step={0.1}
              onChange={(heightMm) => update({ heightMm, previewZoomMode: 'fit' })}
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
              step={1}
              onChange={(marginTopMm) => update({ marginTopMm })}
            />
            <NumberField
              label="左右"
              value={settings.marginHorizontalMm}
              max={100}
              step={1}
              onChange={(marginHorizontalMm) => update({ marginHorizontalMm })}
            />
            <NumberField
              label="下"
              value={settings.marginBottomMm}
              max={100}
              step={1}
              onChange={(marginBottomMm) => update({ marginBottomMm })}
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
              <Switch
                checked={settings.showFoldLine}
                onChange={(showFoldLine) => update({ showFoldLine })}
              />
            </label>
            <label className="switch-row">
              <span>
                <strong>实际打印折叠线</strong>
                <small>导出和打印浅灰色虚线</small>
              </span>
              <Switch
                checked={settings.printFoldLine}
                onChange={(printFoldLine) => update({ printFoldLine })}
              />
            </label>
          </>
        )}

        <label className="switch-row">
          <span>
            <strong>显示外边框</strong>
            <small>边框会进入打印和导出文件</small>
          </span>
          <Switch
            checked={settings.showBorder}
            onChange={(showBorder) => update({ showBorder })}
          />
        </label>
        <label className="switch-row">
          <span>
            <strong>显示安全区域</strong>
            <small>蓝色虚线只在预览中显示</small>
          </span>
          <Switch
            checked={settings.showSafeArea}
            onChange={(showSafeArea) => update({ showSafeArea })}
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
