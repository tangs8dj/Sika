import { Eraser, ListChecks, Sparkles, UsersRound } from 'lucide-react';
import { useProjectStore } from '../store/useProjectStore';
import { NameList } from './NameList';

export function NameInputPanel() {
  const inputText = useProjectStore((state) => state.inputText);
  const people = useProjectStore((state) => state.people);
  const selectedPersonId = useProjectStore((state) => state.selectedPersonId);
  const setInputText = useProjectStore((state) => state.setInputText);
  const applyInput = useProjectStore((state) => state.applyInput);
  const updatePersonName = useProjectStore((state) => state.updatePersonName);
  const removePerson = useProjectStore((state) => state.removePerson);
  const togglePerson = useProjectStore((state) => state.togglePerson);
  const setAllEnabled = useProjectStore((state) => state.setAllEnabled);
  const movePerson = useProjectStore((state) => state.movePerson);
  const selectPerson = useProjectStore((state) => state.selectPerson);
  const removeDuplicates = useProjectStore((state) => state.removeDuplicates);
  const clearPeople = useProjectStore((state) => state.clearPeople);
  const showToast = useProjectStore((state) => state.showToast);
  const enabledCount = people.filter((person) => person.enabled).length;
  const allEnabled = people.length > 0 && enabledCount === people.length;

  const handleApply = () => {
    const count = applyInput();
    showToast(
      count > 0
        ? { kind: 'success', message: `已生成 ${count} 个席卡姓名。` }
        : { kind: 'error', message: '没有识别到有效姓名。' }
    );
  };

  return (
    <aside className="panel name-panel" aria-label="姓名输入与名单">
      <div className="panel-heading">
        <div>
          <span className="eyebrow">步骤 1</span>
          <h2>批量输入姓名</h2>
        </div>
        <UsersRound size={20} />
      </div>
      <label className="field-label" htmlFor="bulk-names">
        每行一个姓名，也可直接粘贴 Excel 区域
      </label>
      <textarea
        id="bulk-names"
        className="bulk-input"
        value={inputText}
        onChange={(event) => setInputText(event.target.value)}
        placeholder={'张伟\n李娜\nAlexander Chen'}
        spellCheck={false}
      />
      <button type="button" className="button primary full" onClick={handleApply}>
        <Sparkles size={17} /> 生成名单
      </button>

      <div className="list-toolbar">
        <div>
          <strong>{people.length}</strong> 人 · 已选 <strong>{enabledCount}</strong>
        </div>
        <div className="compact-actions">
          <button
            type="button"
            className="text-button"
            onClick={() => setAllEnabled(!allEnabled)}
            disabled={people.length === 0}
          >
            <ListChecks size={14} /> {allEnabled ? '取消全选' : '全选'}
          </button>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              const removed = removeDuplicates();
              showToast({ kind: 'info', message: `已移除 ${removed} 个重复姓名。` });
            }}
            disabled={people.length === 0}
          >
            去重
          </button>
          <button
            type="button"
            className="text-button danger-text"
            onClick={clearPeople}
            disabled={people.length === 0}
          >
            <Eraser size={14} /> 清空
          </button>
        </div>
      </div>

      <NameList
        people={people}
        selectedPersonId={selectedPersonId}
        onSelect={selectPerson}
        onToggle={togglePerson}
        onRename={updatePersonName}
        onMove={movePerson}
        onRemove={removePerson}
      />
    </aside>
  );
}
