import { describe, expect, it } from 'vitest';
import { namesToPeople, parseNameText, removeDuplicatePeople } from '../features/names/parseNames';

describe('姓名批量解析', () => {
  it('支持 Windows、Unix 换行并忽略空行', () => {
    expect(parseNameText(' 张伟\r\n\r\n李娜\n  王 强  \r')).toEqual(['张伟', '李娜', '王 强']);
  });

  it('读取 Excel 行中的第一个非空单元格', () => {
    expect(parseNameText('\t张伟\t研发部\n李娜\t销售部\n\t\t\n')).toEqual(['张伟', '李娜']);
  });

  it('默认保留重名，由主动去重操作移除', () => {
    let id = 0;
    const people = namesToPeople(['张伟', '张伟', '李娜'], 0, () => `id-${id++}`);
    expect(people).toHaveLength(3);
    const unique = removeDuplicatePeople(people);
    expect(unique.map((person) => person.name)).toEqual(['张伟', '李娜']);
    expect(unique.map((person) => person.order)).toEqual([0, 1]);
  });
});
