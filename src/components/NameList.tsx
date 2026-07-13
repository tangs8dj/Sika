import { useMemo, useState } from 'react';
import { ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import type { Person } from '../features/names/nameTypes';

const ROW_HEIGHT = 48;
const VIEWPORT_HEIGHT = 286;
const OVERSCAN = 5;

interface NameListProps {
  people: Person[];
  selectedPersonId: string | null;
  onSelect: (id: string) => void;
  onToggle: (id: string) => void;
  onRename: (id: string, name: string) => void;
  onMove: (id: string, direction: -1 | 1) => void;
  onRemove: (id: string) => void;
}

export function NameList({
  people,
  selectedPersonId,
  onSelect,
  onToggle,
  onRename,
  onMove,
  onRemove
}: NameListProps) {
  const [scrollTop, setScrollTop] = useState(0);
  const range = useMemo(() => {
    const start = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
    const visibleCount = Math.ceil(VIEWPORT_HEIGHT / ROW_HEIGHT) + OVERSCAN * 2;
    return { start, end: Math.min(people.length, start + visibleCount) };
  }, [people.length, scrollTop]);
  const visiblePeople = people.slice(range.start, range.end);

  if (people.length === 0) {
    return (
      <div className="empty-list">
        <strong>还没有姓名</strong>
        <span>在上方粘贴名单，然后点击“生成名单”。</span>
      </div>
    );
  }

  return (
    <div
      className="virtual-list"
      style={{ height: VIEWPORT_HEIGHT }}
      onScroll={(event) => setScrollTop(event.currentTarget.scrollTop)}
    >
      <div className="virtual-list-spacer" style={{ height: people.length * ROW_HEIGHT }}>
        {visiblePeople.map((person, offset) => {
          const index = range.start + offset;
          return (
            <div
              key={person.id}
              className={`name-row ${selectedPersonId === person.id ? 'selected' : ''}`}
              style={{ transform: `translateY(${index * ROW_HEIGHT}px)` }}
              onClick={() => onSelect(person.id)}
            >
              <input
                type="checkbox"
                checked={person.enabled}
                onChange={() => onToggle(person.id)}
                aria-label={`选择${person.name}`}
                onClick={(event) => event.stopPropagation()}
              />
              <span className="name-index">{index + 1}</span>
              <input
                className="name-edit"
                value={person.name}
                onChange={(event) => onRename(person.id, event.target.value)}
                onFocus={() => onSelect(person.id)}
                onClick={(event) => event.stopPropagation()}
                aria-label={`编辑第${index + 1}个姓名`}
              />
              <div className="row-actions">
                <button
                  type="button"
                  className="icon-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMove(person.id, -1);
                  }}
                  disabled={index === 0}
                  title="上移"
                >
                  <ChevronUp size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button"
                  onClick={(event) => {
                    event.stopPropagation();
                    onMove(person.id, 1);
                  }}
                  disabled={index === people.length - 1}
                  title="下移"
                >
                  <ChevronDown size={15} />
                </button>
                <button
                  type="button"
                  className="icon-button danger"
                  onClick={(event) => {
                    event.stopPropagation();
                    onRemove(person.id);
                  }}
                  title="删除"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
