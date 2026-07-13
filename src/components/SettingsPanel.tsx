import { PageSettingsPanel } from './PageSettingsPanel';
import { StyleSettingsPanel } from './StyleSettingsPanel';

export function SettingsPanel() {
  return (
    <aside className="panel settings-panel" aria-label="席卡样式与页面设置">
      <div className="panel-heading sticky-heading">
        <div>
          <span className="eyebrow">步骤 3</span>
          <h2>排版设置</h2>
        </div>
      </div>
      <StyleSettingsPanel />
      <PageSettingsPanel />
    </aside>
  );
}
