import { describe, expect, it } from 'vitest';
import type { Person } from '../features/names/nameTypes';
import { assertPeopleForOutput, selectPeopleForOutput } from '../features/export/exportPeople';

const people: Person[] = [
  { id: 'b', name: '李娜', enabled: false, order: 1 },
  { id: 'a', name: '张伟', enabled: true, order: 0 },
  { id: 'c', name: '  ', enabled: true, order: 2 }
];

describe('输出人员筛选', () => {
  it('全部范围保留启用和停用人员并按 order 排序', () => {
    expect(selectPeopleForOutput(people, 'all').map((person) => person.name)).toEqual([
      '张伟',
      '李娜'
    ]);
  });

  it('已勾选范围只保留 enabled 人员', () => {
    expect(selectPeopleForOutput(people, 'enabled').map((person) => person.name)).toEqual(['张伟']);
  });

  it('空输出会给出明确错误', () => {
    expect(() => assertPeopleForOutput([])).toThrow(/没有可打印或导出的姓名/u);
  });
});
