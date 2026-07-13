import type { ExportScope } from '../layout/sceneTypes';
import type { Person } from '../names/nameTypes';

export function selectPeopleForOutput(people: readonly Person[], scope: ExportScope): Person[] {
  return [...people]
    .filter((person) => person.name.trim().length > 0)
    .filter((person) => scope === 'all' || person.enabled)
    .sort((a, b) => a.order - b.order);
}

export function assertPeopleForOutput(people: readonly Person[]): void {
  if (people.length === 0) {
    throw new Error('没有可打印或导出的姓名。请先输入姓名并检查导出范围。');
  }
}
