import { AlignCenter, AlignJustify, AlignLeft, AlignRight, Palette, Type } from 'lucide-react';
import { Select } from '@arco-design/web-react';
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
    { value: 'justify', label: '分散对齐', icon: AlignJustify },
    { value: 'left', label: '左对齐', icon: AlignLeft },
    { value: 'center', label: '居中', icon: AlignCenter },
    { value: 'right', label: '右对齐', icon: AlignRight }
  ];

  return (
    <section className="settings-section">
      <div className="section-title">
        <Type size={17} />
        <h3>样式</h3>
      </div>

      <div className="field-group">
        <span className="field-label">字体</span>
        <Select
          showSearch
          value={style.fontFamily}
          onChange={(fontFamily) => update({ fontFamily: String(fontFamily) })}
          style={{ fontFamily: style.fontFamily }}
          placeholder="搜索系统字体"
        >
          {fonts.map((font) => (
            <Select.Option key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </Select.Option>
          ))}
        </Select>
      </div>

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
        <div className="field-group">
          <span className="field-label">字重</span>
          <Select
            aria-label="字重"
            value={style.fontWeight}
            onChange={(fontWeight) =>
              update({ fontWeight: fontWeight === 'bold' ? 'bold' : 'normal' })
            }
            options={[
              { value: 'normal', label: '常规' },
              { value: 'bold', label: '加粗' }
            ]}
            triggerProps={{ autoAlignPopupWidth: true }}
          />
        </div>
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
        <span className="field-label">文本框对齐</span>
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
        <div className="field-group">
          <span className="field-label">最多行数</span>
          <Select
            aria-label="最多行数"
            value={style.maxLines}
            disabled={!style.autoFit}
            onChange={(maxLines) => update({ maxLines: maxLines === 1 ? 1 : 2 })}
            options={[
              { value: 1, label: '1 行' },
              { value: 2, label: '2 行' }
            ]}
            triggerProps={{ autoAlignPopupWidth: true }}
          />
        </div>
      </div>
    </section>
  );
}
