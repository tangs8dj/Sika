import { AlignCenter, AlignLeft, AlignRight, Palette, Type } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { isValidHexColor } from '../utils/validation';
import type { HorizontalAlign } from '../features/layout/sceneTypes';

function numberValue(value: string, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function StyleSettingsPanel() {
  const style = useProjectStore((state) => state.textStyle);
  const fonts = useProjectStore((state) => state.systemFonts);
  const update = useProjectStore((state) => state.updateTextStyle);
  const colorValid = isValidHexColor(style.color);

  const alignments: Array<{ value: HorizontalAlign; label: string; icon: typeof AlignLeft }> = [
    { value: 'left', label: '左对齐', icon: AlignLeft },
    { value: 'center', label: '居中', icon: AlignCenter },
    { value: 'right', label: '右对齐', icon: AlignRight }
  ];

  return (
    <section className="settings-section">
      <div className="section-title">
        <Type size={17} />
        <h3>姓名样式</h3>
      </div>

      <label className="field-group">
        <span className="field-label">字体</span>
        <select
          value={style.fontFamily}
          onChange={(event) => update({ fontFamily: event.target.value })}
          style={{ fontFamily: style.fontFamily }}
        >
          {fonts.map((font) => (
            <option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </option>
          ))}
        </select>
      </label>

      <div className="field-group">
        <span className="field-label">字号</span>
        <div className="range-row">
          <input
            type="range"
            min="12"
            max="160"
            step="1"
            value={style.fontSizePt}
            onChange={(event) => update({ fontSizePt: Number(event.target.value) })}
          />
          <div className="number-with-unit">
            <input
              type="number"
              min="12"
              max="160"
              value={style.fontSizePt}
              onChange={(event) =>
                update({ fontSizePt: numberValue(event.target.value, style.fontSizePt) })
              }
            />
            <span>pt</span>
          </div>
        </div>
      </div>

      <div className="field-group">
        <span className="field-label">
          <Palette size={14} /> 姓名颜色
        </span>
        <div className="color-row">
          <input
            type="color"
            value={colorValid ? style.color : '#111827'}
            onChange={(event) => update({ color: event.target.value })}
            aria-label="选择姓名颜色"
          />
          <input
            value={style.color}
            onChange={(event) => update({ color: event.target.value })}
            className={colorValid ? '' : 'invalid'}
            spellCheck={false}
            aria-label="姓名颜色十六进制值"
          />
        </div>
        {!colorValid && <span className="field-error">请输入 #RRGGBB 格式，例如 #111827。</span>}
      </div>

      <div className="two-column-fields">
        <label className="field-group">
          <span className="field-label">字重</span>
          <select
            value={style.fontWeight}
            onChange={(event) =>
              update({ fontWeight: event.target.value === 'bold' ? 'bold' : 'normal' })
            }
          >
            <option value="normal">常规</option>
            <option value="bold">加粗</option>
          </select>
        </label>
        <label className="field-group">
          <span className="field-label">字间距</span>
          <div className="number-with-unit">
            <input
              type="number"
              min="-2"
              max="20"
              step="0.5"
              value={style.letterSpacingPt}
              onChange={(event) =>
                update({
                  letterSpacingPt: numberValue(event.target.value, style.letterSpacingPt)
                })
              }
            />
            <span>pt</span>
          </div>
        </label>
      </div>

      <div className="field-group">
        <span className="field-label">水平对齐</span>
        <div className="segmented-control" role="group" aria-label="姓名水平对齐">
          {alignments.map(({ value, label, icon: Icon }) => (
            <button
              type="button"
              key={value}
              className={style.horizontalAlign === value ? 'active' : ''}
              onClick={() => update({ horizontalAlign: value })}
              title={label}
            >
              <Icon size={16} />
              {label}
            </button>
          ))}
        </div>
      </div>

      <label className="switch-row">
        <span>
          <strong>自动缩小字号</strong>
          <small>姓名超出时自动适应可用区域</small>
        </span>
        <input
          type="checkbox"
          checked={style.autoFit}
          onChange={(event) => update({ autoFit: event.target.checked })}
        />
      </label>

      <div className="two-column-fields">
        <label className="field-group">
          <span className="field-label">最小字号</span>
          <div className="number-with-unit">
            <input
              type="number"
              min="8"
              max={style.fontSizePt}
              value={style.minimumFontSizePt}
              disabled={!style.autoFit}
              onChange={(event) =>
                update({
                  minimumFontSizePt: numberValue(event.target.value, style.minimumFontSizePt)
                })
              }
            />
            <span>pt</span>
          </div>
        </label>
        <label className="field-group">
          <span className="field-label">最多行数</span>
          <select
            value={style.maxLines}
            disabled={!style.autoFit}
            onChange={(event) => update({ maxLines: event.target.value === '1' ? 1 : 2 })}
          >
            <option value="1">1 行</option>
            <option value="2">2 行</option>
          </select>
        </label>
      </div>
    </section>
  );
}
